import logging
import time
from collections.abc import Awaitable, Callable

from fastapi import Request, Response

logger = logging.getLogger("app.request")

CallNext = Callable[[Request], Awaitable[Response]]


async def log_request(request: Request, call_next: CallNext) -> Response:
    """Log method, path, status, duration, and request id. Bodies and query strings stay out."""
    started_at = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - started_at) * 1000
    logger.info(
        "%s %s -> %s in %.1fms request_id=%s",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        getattr(request.state, "request_id", "-"),
    )
    return response
