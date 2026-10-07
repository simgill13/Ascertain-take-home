import time


class TtlCache[Value]:
    """Single-value cache for hot aggregate reads. Lives in one worker process."""

    def __init__(self, ttl_seconds: float) -> None:
        self.ttl_seconds = ttl_seconds
        self.value: Value | None = None
        self.expires_at = 0.0

    def get(self) -> Value | None:
        if self.value is None or time.monotonic() >= self.expires_at:
            return None
        return self.value

    def set(self, value: Value) -> None:
        self.value = value
        self.expires_at = time.monotonic() + self.ttl_seconds

    def clear(self) -> None:
        self.value = None
        self.expires_at = 0.0
