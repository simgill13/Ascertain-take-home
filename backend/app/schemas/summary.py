import uuid
from datetime import datetime

from app.models import BloodType, PatientStatus
from app.schemas.common import ApiModel


class SummaryIdentifiers(ApiModel):
    full_name: str
    age: int
    date_of_birth: str
    blood_type: BloodType | None
    status: PatientStatus


class SummaryClinical(ApiModel):
    conditions: list[str]
    allergies: list[str]
    last_visit_at: datetime | None
    note_count: int


class PatientSummary(ApiModel):
    patient_id: uuid.UUID
    identifiers: SummaryIdentifiers
    clinical: SummaryClinical
    narrative: str
    generated_by: str
    generated_at: datetime
