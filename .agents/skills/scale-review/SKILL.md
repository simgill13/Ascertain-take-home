---
name: scale-review
description: Checklist for judging whether the healthcare dashboard can serve 100k to 1M users, and the techniques to apply on the API and in the browser. Use when reviewing scalability or before documenting scale claims.
---

# Scale review

Target: 100k registered users, 1M monthly visitors, bursts of a few thousand concurrent sessions, patient table in the hundreds of thousands of rows. Judge each item, name the file, rate the risk, and name the fix.

## API

- Connection pool: `pool_size`, `max_overflow`, `pool_timeout`, `pool_recycle` set from environment; `statement_timeout` on the connection so one slow query cannot hold the pool.
- Workers: more than one uvicorn worker (`WEB_CONCURRENCY`), and nothing in process memory that must be shared between workers.
- Queries: one query per request for reads, two for paginated lists (rows and count). No N+1 on relationships.
- Indexes: every filter and sort column has an index. `ILIKE '%term%'` needs a trigram (`pg_trgm`) GIN index; a b-tree does not help.
- Pagination: `page_size` capped; offset pagination documented as fine to roughly 100k rows, keyset pagination noted as the next step.
- Compression: gzip for JSON responses above about 1 KB.
- HTTP caching: ETag on GET responses so unchanged payloads return 304.
- Hot reads: short TTL cache for aggregate endpoints (`/patients/stats`), invalidated or expired within seconds.
- Rate limiting: per-client limit with standard headers; in-process limiter is per worker, a shared store is the multi-instance path.
- Health: liveness (`/health`) separate from readiness (`/health/ready`, checks the database).
- Observability: request ID on every request and response, structured log line per request.

## Browser

- Initial bundle under about 150 KB gzipped; routes split; heavy features (landing, motion) in their own chunks.
- Long lists virtualized; rows memoized.
- Searches debounced and superseded requests cancelled with `AbortSignal`.
- Query cache: `staleTime` and `gcTime` tuned; prefetch on intent.
- Static assets hashed and served `immutable`; `index.html` `no-cache`; fonts self-hosted and subset where possible.
- Core Web Vitals measured: LCP under 2.5 s, CLS under 0.1, INP under 200 ms.

## Honest limits

Say what a single-node compose deployment does not provide: read replicas, a shared cache (Redis) for rate limits and hot reads, a CDN in front of nginx, autoscaling, and connection pooling in front of PostgreSQL (PgBouncer). Record them in `docs/SCALABILITY.md` as next steps.
