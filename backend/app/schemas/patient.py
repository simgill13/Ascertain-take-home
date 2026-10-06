import math
import uuid
from datetime import UTC, date, datetime
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import EmailStr, Field, computed_field, field_validator

from app.models import BloodType, PatientStatus
from app.schemas.common import ApiModel

MAX_AGE_YEARS = 130
MAX_TAGS = 50
MIN_PHONE_DIGITS = 7

NameField = Annotated[str, Field(min_length=1, max_length=100)]
Tag = Annotated[str, Field(min_length=1, max_length=120)]
TagList = Annotated[list[Tag], Field(max_length=MAX_TAGS)]


def calculate_age(date_of_birth: date, today: date | None = None) -> int:
    today = today or datetime.now(tz=UTC).date()
    had_birthday_this_year = (today.month, today.day) >= (date_of_birth.month, date_of_birth.day)
    return today.year - date_of_birth.year - (0 if had_birthday_this_year else 1)


def blank_to_none(value: str | None) -> str | None:
    """Treat empty or whitespace-only input as an absent value."""
    if value is None or not str(value).strip():
        return None
    return value


def deduplicate_preserving_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    unique_values: list[str] = []
    for value in values:
        normalized = value.strip()
        if normalized and normalized.casefold() not in seen:
            seen.add(normalized.casefold())
            unique_values.append(normalized)
    return unique_values


class PatientInput(ApiModel):
    first_name: NameField
    last_name: NameField
    date_of_birth: date
    email: EmailStr | None = None
    phone: Annotated[str, Field(min_length=MIN_PHONE_DIGITS, max_length=30)]
    address_line1: Annotated[str, Field(min_length=1, max_length=200)]
    address_line2: Annotated[str, Field(max_length=200)] | None = None
    city: Annotated[str, Field(min_length=1, max_length=100)]
    state: Annotated[str, Field(min_length=2, max_length=50)]
    postal_code: Annotated[str, Field(min_length=3, max_length=20)]
    blood_type: BloodType | None = None
    status: PatientStatus = PatientStatus.ACTIVE
    allergies: TagList = []
    conditions: TagList = []
    last_visit_at: datetime | None = None

    @field_validator("date_of_birth")
    @classmethod
    def date_of_birth_must_be_plausible(cls, value: date) -> date:
        today = datetime.now(tz=UTC).date()
        if value > today:
            raise ValueError("Date of birth cannot be in the future.")
        if calculate_age(value, today) > MAX_AGE_YEARS:
            raise ValueError(f"Date of birth implies an age over {MAX_AGE_YEARS}.")
        return value

    @field_validator("phone")
    @classmethod
    def phone_must_contain_digits(cls, value: str) -> str:
        digit_count = sum(character.isdigit() for character in value)
        if digit_count < MIN_PHONE_DIGITS:
            raise ValueError(f"Phone number needs at least {MIN_PHONE_DIGITS} digits.")
        return value

    @field_validator("email", "address_line2", mode="before")
    @classmethod
    def blank_optional_text_is_none(cls, value: str | None) -> str | None:
        return blank_to_none(value)

    @field_validator("allergies", "conditions")
    @classmethod
    def tags_are_unique(cls, values: list[str]) -> list[str]:
        return deduplicate_preserving_order(values)

    @field_validator("last_visit_at")
    @classmethod
    def last_visit_not_in_future(cls, value: datetime | None) -> datetime | None:
        if value is not None and value > datetime.now(tz=UTC):
            raise ValueError("Last visit cannot be in the future.")
        return value


# Separate names give the OpenAPI document distinct schemas for create and replace.
class PatientCreate(PatientInput):
    pass


class PatientUpdate(PatientInput):
    pass


class PatientRead(ApiModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    date_of_birth: date
    email: str | None
    phone: str
    address_line1: str
    address_line2: str | None
    city: str
    state: str
    postal_code: str
    blood_type: BloodType | None
    status: PatientStatus
    allergies: list[str]
    conditions: list[str]
    last_visit_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @computed_field  # type: ignore[prop-decorator]
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def age(self) -> int:
        return calculate_age(self.date_of_birth)


class PatientSortField(StrEnum):
    LAST_NAME = "last_name"
    FIRST_NAME = "first_name"
    AGE = "age"
    LAST_VISIT = "last_visit"
    STATUS = "status"
    CREATED_AT = "created_at"


SortOrder = Literal["asc", "desc"]


class PatientListQuery(ApiModel):
    search: Annotated[str, Field(max_length=100)] | None = None
    status: PatientStatus | None = None
    sort: PatientSortField = PatientSortField.LAST_NAME
    order: SortOrder = "asc"
    page: Annotated[int, Field(ge=1)] = 1
    page_size: Annotated[int, Field(ge=1, le=100)] = 25

    @field_validator("search", mode="before")
    @classmethod
    def blank_search_is_none(cls, value: str | None) -> str | None:
        return blank_to_none(value)


class PatientListResponse(ApiModel):
    items: list[PatientRead]
    page: int
    page_size: int
    total: int

    @computed_field  # type: ignore[prop-decorator]
    @property
    def total_pages(self) -> int:
        if self.total == 0:
            return 1
        return math.ceil(self.total / self.page_size)


class StatusCount(ApiModel):
    status: PatientStatus
    count: int


class PatientStats(ApiModel):
    total: int
    by_status: list[StatusCount]
    visits_last_30_days: int
    new_last_30_days: int
    without_recent_visit: int
