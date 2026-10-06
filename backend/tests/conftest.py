import os
import subprocess
from collections.abc import AsyncIterator, Iterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+asyncpg://postgres@localhost:5433/healthcare_test"
)
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SEED_ON_STARTUP"] = "false"
os.environ["APP_ENV"] = "test"

BACKEND_ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session", autouse=True)
def migrated_database() -> Iterator[None]:
    """Apply migrations once per session so tests exercise the real schema."""
    environment = {**os.environ, "DATABASE_URL": TEST_DATABASE_URL}
    subprocess.run(["alembic", "downgrade", "base"], cwd=BACKEND_ROOT, env=environment, check=True)
    subprocess.run(["alembic", "upgrade", "head"], cwd=BACKEND_ROOT, env=environment, check=True)
    yield


@pytest.fixture(autouse=True)
async def clean_tables() -> AsyncIterator[None]:
    from app.database import session_factory

    yield
    async with session_factory() as session:
        await session.execute(text("TRUNCATE TABLE patient_notes, patients"))
        await session.commit()


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client
