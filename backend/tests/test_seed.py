from sqlalchemy import func, select

from app.database import session_factory
from app.models import Patient, PatientNote
from app.seed import seed_if_empty
from app.seed.sample_patients import SAMPLE_PATIENTS


async def test_seed_inserts_cohort_once() -> None:
    async with session_factory() as session:
        first_run_inserted = await seed_if_empty(session)
        second_run_inserted = await seed_if_empty(session)
        patient_count = await session.scalar(select(func.count()).select_from(Patient))
        note_count = await session.scalar(select(func.count()).select_from(PatientNote))

    assert first_run_inserted == len(SAMPLE_PATIENTS) >= 20
    assert second_run_inserted == 0
    assert patient_count == len(SAMPLE_PATIENTS)
    assert note_count == sum(len(seed_patient.notes) for seed_patient in SAMPLE_PATIENTS)
