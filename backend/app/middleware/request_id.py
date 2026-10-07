import uuid
from collections.abc import Awaitable, Callable

from fastapi import Request, Response

REQUEST_ID_HEADER = "X-Request-ID"
MAX_REQUEST_ID_LENGTH = 128

CallNext = Callable[[Request], Awaitable[Response]]


def incoming_request_id(request: Request) -> str | None:
    candidate = request.headers.get(REQUEST_ID_HEADER, "").strip()
    if candidate and len(candidate) <= MAX_REQUEST_ID_LENGTH:
        return candidate
    return None


async def attach_request_id(request: Request, call_next: CallNext) -> Response:
    """Reuse the caller's request id when present so logs correlate across services."""
    request_id = incoming_request_id(request) or uuid.uuid4().hex
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers[REQUEST_ID_HEADER] = request_id
    return response
