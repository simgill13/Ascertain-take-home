import asyncio

from httpx import AsyncClient
from sqlalchemy import text

from app.database import session_factory
from app.middleware.rate_limit import SlidingWindowLimiter
from app.services.patients import stats_cache
from app.services.ttl_cache import TtlCache
from tests.factories import patient_payload


async def test_readiness_reports_database(client: AsyncClient) -> None:
    response = await client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready", "database": "ok"}


async def test_every_response_carries_a_request_id(client: AsyncClient) -> None:
    generated = await client.get("/health")
    forwarded = await client.get("/health", headers={"X-Request-ID": "trace-abc-123"})

    assert len(generated.headers["x-request-id"]) == 32
    assert forwarded.headers["x-request-id"] == "trace-abc-123"


async def test_unchanged_list_returns_304_with_etag(client: AsyncClient) -> None:
    await client.post("/patients", json=patient_payload())

    first = await client.get("/patients")
    etag = first.headers["etag"]
    second = await client.get("/patients", headers={"If-None-Match": etag})

    assert first.status_code == 200
    assert etag.startswith('W/"')
    assert first.headers["cache-control"] == "private, no-cache"
    assert second.status_code == 304
    assert second.content == b""
    assert second.headers["etag"] == etag


async def test_etag_changes_when_data_changes(client: AsyncClient) -> None:
    before = await client.get("/patients")
    await client.post("/patients", json=patient_payload())
    after = await client.get("/patients", headers={"If-None-Match": before.headers["etag"]})

    assert after.status_code == 200
    assert after.headers["etag"] != before.headers["etag"]


async def test_rate_limit_headers_are_present(client: AsyncClient) -> None:
    response = await client.get("/patients")

    assert response.headers["ratelimit-limit"] == "600"
    assert int(response.headers["ratelimit-remaining"]) < 600


def test_sliding_window_limiter_blocks_past_the_limit() -> None:
    limiter = SlidingWindowLimiter(limit_per_minute=3)

    results = [limiter.register("client", now=100.0 + step) for step in range(4)]
    allowed_after_window, remaining = limiter.register("client", now=200.0)

    assert [allowed for allowed, _remaining in results] == [True, True, True, False]
    assert allowed_after_window is True
    assert remaining == 2


def test_ttl_cache_expires() -> None:
    cache: TtlCache[str] = TtlCache(ttl_seconds=0.05)
    cache.set("value")

    assert cache.get() == "value"
    asyncio.run(asyncio.sleep(0.06))
    assert cache.get() is None


async def test_stats_cache_is_cleared_by_writes(client: AsyncClient) -> None:
    stats_cache.clear()
    before = (await client.get("/patients/stats")).json()
    await client.post("/patients", json=patient_payload(status="pending"))
    after = (await client.get("/patients/stats")).json()

    assert after["total"] == before["total"] + 1


async def test_search_uses_trigram_index() -> None:
    async with session_factory() as session:
        await session.execute(text("SET enable_seqscan = off"))
        plan_rows = await session.execute(
            text(
                "EXPLAIN (COSTS OFF) SELECT id FROM patients "
                "WHERE (first_name || ' ' || last_name) ILIKE '%alv%'"
            )
        )
        plan = "\n".join(row[0] for row in plan_rows.all())

    assert "ix_patients_full_name_trgm" in plan
