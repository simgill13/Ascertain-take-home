"""Per-client request budget.

The counter lives in process memory, so each worker enforces the limit independently.
For several API instances, move the counters to a shared store (Redis) with the same
window logic; the headers and response shape stay the same.
"""

import time
from collections import deque
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse

from app.errors import ErrorResponse

CallNext = Callable[[Request], Awaitable[Response]]

WINDOW_SECONDS = 60
EXEMPT_PATH_PREFIXES = ("/health",)
TOO_MANY_REQUESTS = 429


class SlidingWindowLimiter:
    def __init__(self, limit_per_minute: int) -> None:
        self.limit = limit_per_minute
        self.requests_by_client: dict[str, deque[float]] = {}

    def register(self, client_key: str, now: float) -> tuple[bool, int]:
        """Record one request. Returns (allowed, remaining)."""
        window_start = now - WINDOW_SECONDS
        timestamps = self.requests_by_client.setdefault(client_key, deque())
        while timestamps and timestamps[0] <= window_start:
            timestamps.popleft()
        if len(timestamps) >= self.limit:
            return False, 0
        timestamps.append(now)
        return True, self.limit - len(timestamps)

    def forget_idle_clients(self, now: float) -> None:
        window_start = now - WINDOW_SECONDS
        idle_clients = [
            client_key
            for client_key, timestamps in self.requests_by_client.items()
            if not timestamps or timestamps[-1] <= window_start
        ]
        for client_key in idle_clients:
            del self.requests_by_client[client_key]


def client_key_for(request: Request) -> str:
    # nginx sets X-Forwarded-For; the first hop is the browser.
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def build_rate_limit_middleware(
    limit_per_minute: int,
) -> Callable[[Request, CallNext], Awaitable[Response]]:
    limiter = SlidingWindowLimiter(limit_per_minute)
    request_count = 0

    async def enforce_rate_limit(request: Request, call_next: CallNext) -> Response:
        nonlocal request_count
        if limit_per_minute <= 0 or request.url.path.startswith(EXEMPT_PATH_PREFIXES):
            return await call_next(request)

        now = time.monotonic()
        request_count += 1
        if request_count % 1000 == 0:
            limiter.forget_idle_clients(now)

        allowed, remaining = limiter.register(client_key_for(request), now)
        if not allowed:
            body = ErrorResponse(detail="Too many requests. Slow down and try again in a minute.")
            response: Response = JSONResponse(
                status_code=TOO_MANY_REQUESTS, content=body.model_dump()
            )
            response.headers["Retry-After"] = str(WINDOW_SECONDS)
        else:
            response = await call_next(request)
        response.headers["RateLimit-Limit"] = str(limit_per_minute)
        response.headers["RateLimit-Remaining"] = str(remaining)
        return response

    return enforce_rate_limit
