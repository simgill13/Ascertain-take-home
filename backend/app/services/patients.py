import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import ColumnElement, Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute

from app.models import Patient, PatientStatus
from app.schemas.patient import (
    PatientCreate,
    PatientListQuery,
    PatientSortField,
    PatientStats,
    PatientUpdate,
    StatusCount,
)

RECENT_WINDOW = timedelta(days=30)
STALE_VISIT_WINDOW = timedelta(days=365)


def patient_not_found(patient_id: uuid.UUID) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient {patient_id} was not found."
    )


SORT_COLUMNS: dict[PatientSortField, InstrumentedAttribute[Any]] = {
    PatientSortField.LAST_NAME: Patient.last_name,
    PatientSortField.FIRST_NAME: Patient.first_name,
    PatientSortField.LAST_VISIT: Patient.last_visit_at,
    PatientSortField.STATUS: Patient.status,
    PatientSortField.CREATED_AT: Patient.created_at,
}


def apply_search(statement: Select[Patient], search: str) -> Select[Patient]:
    pattern = f"%{search.strip()}%"
    full_name = func.concat(Patient.first_name, " ", Patient.last_name)
    return statement.where(
        or_(
            Patient.first_name.ilike(pattern),
            Patient.last_name.ilike(pattern),
            full_name.ilike(pattern),
            Patient.email.ilike(pattern),
        )
    )


def primary_sort(sort: PatientSortField, order: str) -> ColumnElement[Any]:
    descending = order == "desc"
    # Older patients have earlier birth dates, so age sorts invert the column direction.
    if sort is PatientSortField.AGE:
        birth_date = Patient.date_of_birth
        return birth_date.asc() if descending else birth_date.desc()
    column = SORT_COLUMNS[sort]
    return column.desc().nulls_last() if descending else column.asc().nulls_last()


def order_by_clauses(sort: PatientSortField, order: str) -> list[ColumnElement[Any]]:
    # Stable tiebreakers so pagination never shows the same row twice.
    return [
        primary_sort(sort, order),
        Patient.last_name.asc(),
        Patient.first_name.asc(),
        Patient.id.asc(),
    ]


async def list_patients(
    session: AsyncSession, query: PatientListQuery
) -> tuple[list[Patient], int]:
    statement = select(Patient)
    if query.search:
        statement = apply_search(statement, query.search)
    if query.status:
        statement = statement.where(Patient.status == query.status)

    total = await session.scalar(select(func.count()).select_from(statement.subquery())) or 0
    offset = (query.page - 1) * query.page_size
    patients = await session.scalars(
        statement.order_by(*order_by_clauses(query.sort, query.order))
        .offset(offset)
        .limit(query.page_size)
    )
    return list(patients), total


async def get_patient(session: AsyncSession, patient_id: uuid.UUID) -> Patient:
    patient = await session.get(Patient, patient_id)
    if patient is None:
        raise patient_not_found(patient_id)
    return patient


async def create_patient(session: AsyncSession, payload: PatientCreate) -> Patient:
    patient = Patient(**payload.model_dump())
    session.add(patient)
    await session.commit()
    await session.refresh(patient)
    return patient


async def update_patient(
    session: AsyncSession, patient_id: uuid.UUID, payload: PatientUpdate
) -> Patient:
    patient = await get_patient(session, patient_id)
    for field_name, value in payload.model_dump().items():
        setattr(patient, field_name, value)
    await session.commit()
    await session.refresh(patient)
    return patient


async def delete_patient(session: AsyncSession, patient_id: uuid.UUID) -> None:
    patient = await get_patient(session, patient_id)
    await session.delete(patient)
    await session.commit()


async def patient_stats(session: AsyncSession) -> PatientStats:
    now = datetime.now(tz=UTC)
    status_rows = await session.execute(
        select(Patient.status, func.count()).group_by(Patient.status)
    )
    counts_by_status = {row_status: count for row_status, count in status_rows.all()}
    by_status = [
        StatusCount(status=patient_status, count=counts_by_status.get(patient_status, 0))
        for patient_status in PatientStatus
    ]

    visits_last_30_days = await session.scalar(
        select(func.count()).where(Patient.last_visit_at >= now - RECENT_WINDOW)
    )
    new_last_30_days = await session.scalar(
        select(func.count()).where(Patient.created_at >= now - RECENT_WINDOW)
    )
    without_recent_visit = await session.scalar(
        select(func.count()).where(
            Patient.status == PatientStatus.ACTIVE,
            or_(Patient.last_visit_at.is_(None), Patient.last_visit_at < now - STALE_VISIT_WINDOW),
        )
    )
    return PatientStats(
        total=sum(counts_by_status.values()),
        by_status=by_status,
        visits_last_30_days=visits_last_30_days or 0,
        new_last_30_days=new_last_30_days or 0,
        without_recent_visit=without_recent_visit or 0,
    )
