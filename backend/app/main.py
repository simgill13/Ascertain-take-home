import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, session_factory
from app.errors import register_error_handlers
from app.middleware.request_logging import log_request
from app.routers import health
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
        title="Healthcare Dashboard API",
        version="0.1.0",
        description="Patient management API for a medical practice.",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.middleware("http")(log_request)
    register_error_handlers(app)
    app.include_router(health.router)
    return app


app = create_app()
