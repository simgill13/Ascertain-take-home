import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PatientNote
from app.schemas.note import NoteCreate
from app.services.patients import get_patient


def note_not_found(note_id: uuid.UUID) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Note {note_id} was not found."
    )


async def list_notes(session: AsyncSession, patient_id: uuid.UUID) -> tuple[list[PatientNote], int]:
    await get_patient(session, patient_id)
    statement = (
        select(PatientNote)
        .where(PatientNote.patient_id == patient_id)
        .order_by(PatientNote.noted_at.desc(), PatientNote.created_at.desc())
    )
    notes = list(await session.scalars(statement))
    return notes, len(notes)


async def create_note(
    session: AsyncSession, patient_id: uuid.UUID, payload: NoteCreate
) -> PatientNote:
    patient = await get_patient(session, patient_id)
    note = PatientNote(patient_id=patient.id, content=payload.content, noted_at=payload.noted_at)
    session.add(note)
    # A note documents an encounter, so it advances the chart's last visit when newer.
    if patient.last_visit_at is None or payload.noted_at > patient.last_visit_at:
        patient.last_visit_at = payload.noted_at
    await session.commit()
    await session.refresh(note)
    return note


async def delete_note(session: AsyncSession, patient_id: uuid.UUID, note_id: uuid.UUID) -> None:
    await get_patient(session, patient_id)
    note = await session.scalar(
        select(PatientNote).where(PatientNote.id == note_id, PatientNote.patient_id == patient_id)
    )
    if note is None:
        raise note_not_found(note_id)
    await session.delete(note)
    await session.commit()


async def count_notes(session: AsyncSession, patient_id: uuid.UUID) -> int:
    return (
        await session.scalar(select(func.count()).where(PatientNote.patient_id == patient_id))
    ) or 0
