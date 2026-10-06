import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Patient, PatientNote
from app.seed.sample_patients import SAMPLE_PATIENTS, SeedPatient

logger = logging.getLogger(__name__)

# A chart exists before its first note or visit; new intakes were created days ago.
CHART_LEAD_TIME = timedelta(days=90)
NEW_INTAKE_AGE = timedelta(days=3)


def registration_date(seed_patient: SeedPatient, reference: datetime) -> datetime:
    history_days = [seed_note.days_before_reference for seed_note in seed_patient.notes]
    if seed_patient.last_visit_days_ago is not None:
        history_days.append(seed_patient.last_visit_days_ago)
    if not history_days:
        return reference - NEW_INTAKE_AGE
    return reference - timedelta(days=max(history_days)) - CHART_LEAD_TIME


def build_patient(seed_patient: SeedPatient, reference: datetime) -> Patient:
    last_visit_at = (
        reference - timedelta(days=seed_patient.last_visit_days_ago)
        if seed_patient.last_visit_days_ago is not None
        else None
    )
    registered_at = registration_date(seed_patient, reference)
    patient = Patient(
        created_at=registered_at,
        updated_at=registered_at,
        first_name=seed_patient.first_name,
        last_name=seed_patient.last_name,
        date_of_birth=seed_patient.date_of_birth,
        email=seed_patient.email,
        phone=seed_patient.phone,
        address_line1=seed_patient.address_line1,
        address_line2=seed_patient.address_line2,
        city=seed_patient.city,
        state=seed_patient.state,
        postal_code=seed_patient.postal_code,
        blood_type=seed_patient.blood_type,
        status=seed_patient.status,
        allergies=list(seed_patient.allergies),
        conditions=list(seed_patient.conditions),
        last_visit_at=last_visit_at,
    )
    patient.notes = [
        PatientNote(
            content=seed_note.content,
            noted_at=reference - timedelta(days=seed_note.days_before_reference),
        )
        for seed_note in seed_patient.notes
    ]
    return patient


async def seed_if_empty(session: AsyncSession) -> int:
    """Insert the sample cohort when the patients table is empty. Returns rows inserted."""
    existing_count = await session.scalar(select(func.count()).select_from(Patient))
    if existing_count:
        logger.info("Seed skipped: %s patients already present", existing_count)
        return 0

    reference = datetime.now(tz=UTC).replace(hour=9, minute=0, second=0, microsecond=0)
    session.add_all([build_patient(seed_patient, reference) for seed_patient in SAMPLE_PATIENTS])
    await session.commit()
    logger.info("Seeded %s patients", len(SAMPLE_PATIENTS))
    return len(SAMPLE_PATIENTS)
