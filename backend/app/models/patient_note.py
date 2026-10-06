import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UuidPrimaryKeyMixin
from app.models.patient import Patient


class PatientNote(UuidPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "patient_notes"
    __table_args__ = (
        Index("ix_patient_notes_patient_id_noted_at", "patient_id", text("noted_at DESC")),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    noted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    patient: Mapped[Patient] = relationship(back_populates="notes")
