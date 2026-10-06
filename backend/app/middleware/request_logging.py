import logging
import time
from collections.abc import Awaitable, Callable

from fastapi import Request, Response

logger = logging.getLogger("app.request")

CallNext = Callable[[Request], Awaitable[Response]]


async def log_request(request: Request, call_next: CallNext) -> Response:
    """Log method, path, status, and duration. Query strings and bodies are never logged."""
    started_at = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - started_at) * 1000
    logger.info(
        "%s %s -> %s in %.1fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response
