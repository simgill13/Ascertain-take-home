import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.config import get_settings
from app.database import engine, session_factory
from app.errors import register_error_handlers
from app.middleware.etag import add_etag
from app.middleware.rate_limit import build_rate_limit_middleware
from app.middleware.request_id import attach_request_id
from app.middleware.request_logging import log_request
from app.routers import health, notes, patients
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    if settings.seed_on_startup:
        async with session_factory() as session:
            await seed_if_empty(session)
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Ascertain Patient Dashboard API",
        version="0.1.0",
        description="Patient management API for a medical practice.",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["ETag", "X-Request-ID", "RateLimit-Limit", "RateLimit-Remaining"],
    )
    # Middleware runs in reverse registration order on the way in:
    # request id -> logging -> rate limit -> etag -> gzip -> route.
    app.add_middleware(GZipMiddleware, minimum_size=settings.gzip_minimum_bytes)
    app.middleware("http")(add_etag)
    app.middleware("http")(build_rate_limit_middleware(settings.rate_limit_per_minute))
    app.middleware("http")(log_request)
    app.middleware("http")(attach_request_id)
    register_error_handlers(app)
    app.include_router(health.router)
    app.include_router(patients.router)
    app.include_router(notes.router)
    return app


app = create_app()
