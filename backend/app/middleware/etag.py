import hashlib
from collections.abc import Awaitable, Callable

from fastapi import Request, Response

CallNext = Callable[[Request], Awaitable[Response]]

CACHEABLE_METHODS = {"GET", "HEAD"}
NOT_MODIFIED = 304
# Headers a 304 must carry so caches keep the right metadata.
HEADERS_KEPT_ON_304 = ("cache-control", "etag", "vary", "x-request-id")


def weak_etag(body: bytes) -> str:
    return f'W/"{hashlib.sha256(body).hexdigest()[:32]}"'


def etag_matches(if_none_match: str, etag: str) -> bool:
    candidates = [candidate.strip() for candidate in if_none_match.split(",")]
    return "*" in candidates or etag in candidates


def as_bytes(chunk: bytes | str | memoryview) -> bytes:
    if isinstance(chunk, str):
        return chunk.encode()
    return bytes(chunk)


async def collect_body(response: Response) -> bytes:
    # `call_next` hands back Starlette's private streaming wrapper, so duck-type on the iterator.
    body_iterator = getattr(response, "body_iterator", None)
    if body_iterator is not None:
        return b"".join([as_bytes(chunk) async for chunk in body_iterator])
    return bytes(response.body)


async def add_etag(request: Request, call_next: CallNext) -> Response:
    """Hash successful GET bodies so unchanged payloads return 304 instead of being resent."""
    response = await call_next(request)
    if request.method not in CACHEABLE_METHODS or response.status_code != 200:
        return response

    body = await collect_body(response)
    etag = weak_etag(body)
    headers = dict(response.headers)
    headers["etag"] = etag
    headers.setdefault("cache-control", "private, no-cache")
    headers.pop("content-length", None)

    if etag_matches(request.headers.get("if-none-match", ""), etag):
        kept = {name: value for name, value in headers.items() if name in HEADERS_KEPT_ON_304}
        return Response(status_code=NOT_MODIFIED, headers=kept)

    return Response(
        content=body,
        status_code=response.status_code,
        headers=headers,
        media_type=response.media_type,
    )
