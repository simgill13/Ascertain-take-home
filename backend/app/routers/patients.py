import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.errors import ErrorResponse
from app.schemas.patient import (
    PatientCreate,
    PatientListQuery,
    PatientListResponse,
    PatientRead,
    PatientStats,
    PatientUpdate,
)
from app.services import patients as patient_service

router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    responses={
        404: {"model": ErrorResponse, "description": "Patient not found"},
        422: {"model": ErrorResponse, "description": "Validation failed"},
    },
)

SessionDependency = Annotated[AsyncSession, Depends(get_session)]
ListQueryDependency = Annotated[PatientListQuery, Query()]


@router.get("", response_model=PatientListResponse, summary="List patients")
async def list_patients(
    session: SessionDependency, query: ListQueryDependency
) -> PatientListResponse:
    rows, total = await patient_service.list_patients(session, query)
    items = [PatientRead.model_validate(row) for row in rows]
    return PatientListResponse.build(items, query, total)


@router.get("/stats", response_model=PatientStats, summary="Patient counts for the dashboard")
async def read_patient_stats(session: SessionDependency) -> PatientStats:
    return await patient_service.patient_stats(session)


@router.get("/{patient_id}", response_model=PatientRead, summary="Get a patient")
async def read_patient(patient_id: uuid.UUID, session: SessionDependency) -> PatientRead:
    patient = await patient_service.get_patient(session, patient_id)
    return PatientRead.model_validate(patient)


@router.post(
    "",
    response_model=PatientRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a patient",
)
async def create_patient(payload: PatientCreate, session: SessionDependency) -> PatientRead:
    patient = await patient_service.create_patient(session, payload)
    return PatientRead.model_validate(patient)


@router.put("/{patient_id}", response_model=PatientRead, summary="Replace a patient")
async def update_patient(
    patient_id: uuid.UUID, payload: PatientUpdate, session: SessionDependency
) -> PatientRead:
    patient = await patient_service.update_patient(session, patient_id, payload)
    return PatientRead.model_validate(patient)


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a patient and their notes",
)
async def delete_patient(patient_id: uuid.UUID, session: SessionDependency) -> Response:
    await patient_service.delete_patient(session, patient_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
