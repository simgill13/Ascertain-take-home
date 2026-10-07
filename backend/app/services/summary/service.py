import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import Patient, PatientNote
from app.schemas.patient import calculate_age
from app.schemas.summary import PatientSummary, SummaryClinical, SummaryIdentifiers
from app.services.notes import list_notes
from app.services.patients import get_patient
from app.services.summary.providers import (
    MAX_NOTES_IN_PROMPT,
    SummaryProvider,
    TemplateSummaryProvider,
    select_provider,
)

logger = logging.getLogger(__name__)


async def generate_narrative(
    provider: SummaryProvider, patient: Patient, notes: list[PatientNote]
) -> tuple[str, str]:
    """Return the narrative and the provider that produced it, falling back to the template."""
    try:
        return await provider.narrative(patient, notes), provider.name
    except Exception:
        if isinstance(provider, TemplateSummaryProvider):
            raise
        logger.exception("Summary provider %s failed; using template", provider.name)
        fallback = TemplateSummaryProvider()
        return await fallback.narrative(patient, notes), f"{fallback.name} (fallback)"


async def build_patient_summary(session: AsyncSession, patient_id: uuid.UUID) -> PatientSummary:
    patient = await get_patient(session, patient_id)
    notes, note_count = await list_notes(session, patient_id, limit=MAX_NOTES_IN_PROMPT)
    # Release the pooled connection before a provider call that may take seconds.
    await session.commit()
    provider = select_provider(get_settings())
    narrative, generated_by = await generate_narrative(provider, patient, notes)

    return PatientSummary(
        patient_id=patient.id,
        identifiers=SummaryIdentifiers(
            full_name=f"{patient.first_name} {patient.last_name}",
            age=calculate_age(patient.date_of_birth),
            date_of_birth=patient.date_of_birth.isoformat(),
            blood_type=patient.blood_type,
            status=patient.status,
        ),
        clinical=SummaryClinical(
            conditions=patient.conditions,
            allergies=patient.allergies,
            last_visit_at=patient.last_visit_at,
            note_count=note_count,
        ),
        narrative=narrative,
        generated_by=generated_by,
        generated_at=datetime.now(tz=UTC),
    )
