from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

SummaryProviderName = Literal["template", "anthropic", "openai"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/healthcare"
    seed_on_startup: bool = True
    cors_origins: list[str] = Field(default=["http://localhost:5173", "http://localhost:8080"])

    # Connection pool per worker process. Total connections = workers * (pool_size + max_overflow).
    db_pool_size: int = 10
    db_max_overflow: int = 10
    db_pool_timeout_seconds: int = 10
    db_pool_recycle_seconds: int = 1800
    # A slow query gives up instead of holding a pooled connection.
    db_statement_timeout_ms: int = 5000
    # A transaction left open by a stuck request is closed rather than pinning a connection.
    db_idle_in_transaction_timeout_ms: int = 10000

    # Per-client request budget, enforced per worker process. 0 disables it.
    rate_limit_per_minute: int = 600
    # Dashboard aggregates are served from memory for this long before recomputing.
    stats_cache_ttl_seconds: int = 15
    # JSON responses larger than this are gzip compressed.
    gzip_minimum_bytes: int = 1024

    summary_provider: SummaryProviderName = "template"
    summary_model: str | None = None
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
