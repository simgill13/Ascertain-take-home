import enum
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum, String, Text, func, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UuidPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.patient_note import PatientNote


class PatientStatus(enum.StrEnum):
    ACTIVE = "active"
    PENDING = "pending"
    INACTIVE = "inactive"
    DISCHARGED = "discharged"


class BloodType(enum.StrEnum):
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"


def enum_values(enum_class: type[enum.StrEnum]) -> list[str]:
    return [member.value for member in enum_class]


patient_status_type = Enum(
    PatientStatus, name="patient_status", values_callable=enum_values, native_enum=True
)
blood_type_type = Enum(BloodType, name="blood_type", values_callable=enum_values, native_enum=True)


class Patient(UuidPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "patients"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)

    email: Mapped[str | None] = mapped_column(String(254))
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    address_line1: Mapped[str] = mapped_column(String(200), nullable=False)
    address_line2: Mapped[str | None] = mapped_column(String(200))
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)

    blood_type: Mapped[BloodType | None] = mapped_column(blood_type_type)
    status: Mapped[PatientStatus] = mapped_column(
        patient_status_type,
        nullable=False,
        server_default=PatientStatus.ACTIVE.value,
        index=True,
    )
    allergies: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default=text("'{}'::text[]")
    )
    conditions: Mapped[list[str]] = mapped_column(
        ARRAY(Text), nullable=False, server_default=text("'{}'::text[]")
    )
    last_visit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    notes: Mapped[list["PatientNote"]] = relationship(
        back_populates="patient",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="desc(PatientNote.noted_at)",
    )
