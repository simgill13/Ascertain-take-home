import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.errors import ErrorResponse
from app.schemas.note import NoteCreate, NoteListResponse, NoteRead
from app.schemas.summary import PatientSummary
from app.services import notes as note_service
from app.services.summary import build_patient_summary

router = APIRouter(
    prefix="/patients/{patient_id}",
    tags=["notes"],
    responses={
        404: {"model": ErrorResponse, "description": "Patient or note not found"},
        422: {"model": ErrorResponse, "description": "Validation failed"},
    },
)

SessionDependency = Annotated[AsyncSession, Depends(get_session)]


@router.get("/notes", response_model=NoteListResponse, summary="List a patient's notes")
async def list_notes(patient_id: uuid.UUID, session: SessionDependency) -> NoteListResponse:
    notes, total = await note_service.list_notes(session, patient_id)
    return NoteListResponse(items=[NoteRead.model_validate(note) for note in notes], total=total)


@router.post(
    "/notes",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a clinical note",
)
async def create_note(
    patient_id: uuid.UUID, payload: NoteCreate, session: SessionDependency
) -> NoteRead:
    note = await note_service.create_note(session, patient_id, payload)
    return NoteRead.model_validate(note)


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a note")
async def delete_note(
    patient_id: uuid.UUID, note_id: uuid.UUID, session: SessionDependency
) -> Response:
    await note_service.delete_note(session, patient_id, note_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/summary",
    response_model=PatientSummary,
    summary="Human-readable summary of the profile and notes",
)
async def read_summary(patient_id: uuid.UUID, session: SessionDependency) -> PatientSummary:
    return await build_patient_summary(session, patient_id)
