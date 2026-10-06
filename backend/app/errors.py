from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException

REQUEST_BODY_PREFIXES = ("body",)


class FieldError(BaseModel):
    field: str
    message: str


class ErrorResponse(BaseModel):
    detail: str
    errors: list[FieldError] = []


def field_name_from_location(location: tuple[int | str, ...]) -> str:
    parts = [str(part) for part in location if part not in REQUEST_BODY_PREFIXES]
    return ".".join(parts) if parts else "request"


def field_errors_from_validation(validation_error: RequestValidationError) -> list[FieldError]:
    return [
        FieldError(
            field=field_name_from_location(tuple(error["loc"])),
            message=str(error["msg"]).removeprefix("Value error, "),
        )
        for error in validation_error.errors()
    ]


def error_json(
    status_code: int, detail: str, errors: list[FieldError] | None = None
) -> JSONResponse:
    body = ErrorResponse(detail=detail, errors=errors or [])
    return JSONResponse(status_code=status_code, content=body.model_dump())


async def handle_validation_error(
    request: Request, validation_error: RequestValidationError
) -> JSONResponse:
    return error_json(
        422,
        "The request did not pass validation.",
        field_errors_from_validation(validation_error),
    )


async def handle_http_exception(request: Request, http_exception: HTTPException) -> JSONResponse:
    detail: Any = http_exception.detail
    return error_json(http_exception.status_code, str(detail))


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, handle_validation_error)  # type: ignore[arg-type]
    app.add_exception_handler(HTTPException, handle_http_exception)  # type: ignore[arg-type]
