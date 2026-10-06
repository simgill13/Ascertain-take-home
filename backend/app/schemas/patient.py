import re
import uuid
from datetime import UTC, date, datetime
from enum import StrEnum
from typing import Annotated, Literal, Self

from pydantic import EmailStr, Field, computed_field, field_validator

from app.models import BloodType, PatientStatus
from app.schemas.common import ApiModel

MAX_AGE_YEARS = 130
MAX_LIST_ITEMS = 50
PHONE_DIGITS = re.compile(r"\d")

NameField = Annotated[str, Field(min_length=1, max_length=100)]
Tag = Annotated[str, Field(min_length=1, max_length=120)]
TagList = Annotated[list[Tag], Field(max_length=MAX_LIST_ITEMS)]


def calculate_age(date_of_birth: date, today: date | None = None) -> int:
    today = today or datetime.now(tz=UTC).date()
    had_birthday_this_year = (today.month, today.day) >= (date_of_birth.month, date_of_birth.day)
    return today.year - date_of_birth.year - (0 if had_birthday_this_year else 1)


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
    phone: Annotated[str, Field(min_length=7, max_length=30)]
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
        if len(PHONE_DIGITS.findall(value)) < 7:
            raise ValueError("Phone number needs at least 7 digits.")
        return value

    @field_validator("address_line2", mode="before")
    @classmethod
    def blank_address_line2_is_none(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        return value

    @field_validator("email", mode="before")
    @classmethod
    def blank_email_is_none(cls, value: str | None) -> str | None:
        if value is None or not str(value).strip():
            return None
        return value

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
        if value is None or not str(value).strip():
            return None
        return value


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
        return -(-self.total // self.page_size)

    @classmethod
    def build(cls, items: list[PatientRead], query: PatientListQuery, total: int) -> Self:
        return cls(items=items, page=query.page, page_size=query.page_size, total=total)


class StatusCount(ApiModel):
    status: PatientStatus
    count: int


class PatientStats(ApiModel):
    total: int
    by_status: list[StatusCount]
    visits_last_30_days: int
    new_last_30_days: int
    without_recent_visit: int
