import uuid
from datetime import UTC, datetime
from typing import Annotated

from pydantic import Field, field_validator

from app.schemas.common import ApiModel

MAX_NOTE_LENGTH = 5000


class NoteCreate(ApiModel):
    content: Annotated[str, Field(min_length=1, max_length=MAX_NOTE_LENGTH)]
    noted_at: datetime = Field(description="When the observation was made.")

    @field_validator("noted_at")
    @classmethod
    def noted_at_not_in_future(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        if value > datetime.now(tz=UTC):
            raise ValueError("Note time cannot be in the future.")
        return value


class NoteRead(ApiModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    content: str
    noted_at: datetime
    created_at: datetime


class NoteListResponse(ApiModel):
    items: list[NoteRead]
    total: int
