from typing import Literal

from fastapi import APIRouter, Response, status
from pydantic import BaseModel

from app.database import database_is_reachable
from app.errors import ErrorResponse

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"]


class ReadinessResponse(BaseModel):
    status: Literal["ready"]
    database: Literal["ok"]


@router.get("/health", response_model=HealthResponse, summary="Liveness: the process is up")
async def read_health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    responses={503: {"model": ErrorResponse, "description": "Database unreachable"}},
    summary="Readiness: the database answers",
)
async def read_readiness(response: Response) -> ReadinessResponse | ErrorResponse:
    if await database_is_reachable():
        return ReadinessResponse(status="ready", database="ok")
    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return ErrorResponse(detail="Database is not reachable.")
