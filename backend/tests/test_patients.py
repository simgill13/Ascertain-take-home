import uuid

from httpx import AsyncClient

from tests.factories import patient_payload


async def create_patient(client: AsyncClient, **overrides: object) -> dict[str, object]:
    response = await client.post("/patients", json=patient_payload(**overrides))
    assert response.status_code == 201, response.text
    return response.json()  # type: ignore[no-any-return]


async def test_create_returns_patient_with_derived_fields(client: AsyncClient) -> None:
    created = await create_patient(client, first_name="Ada", last_name="Lovelace")

    assert created["full_name"] == "Ada Lovelace"
    assert isinstance(created["age"], int)
    assert created["allergies"] == ["Penicillin"]
    assert uuid.UUID(str(created["id"]))


async def test_create_rejects_invalid_fields_with_envelope(client: AsyncClient) -> None:
    response = await client.post(
        "/patients",
        json=patient_payload(first_name="", email="not-an-email", date_of_birth="2999-01-01"),
    )

    assert response.status_code == 422
    body = response.json()
    assert body["detail"] == "The request did not pass validation."
    failing_fields = {error["field"] for error in body["errors"]}
    assert failing_fields == {"first_name", "email", "date_of_birth"}
    date_message = next(
        error["message"] for error in body["errors"] if error["field"] == "date_of_birth"
    )
    assert date_message == "Date of birth cannot be in the future."


async def test_create_deduplicates_allergies_case_insensitively(client: AsyncClient) -> None:
    created = await create_patient(client, allergies=["Latex", "latex", " Shellfish "])

    assert created["allergies"] == ["Latex", "Shellfish"]


async def test_read_missing_patient_returns_404(client: AsyncClient) -> None:
    response = await client.get(f"/patients/{uuid.uuid4()}")

    assert response.status_code == 404
    assert response.json()["errors"] == []


async def test_read_with_malformed_id_returns_422(client: AsyncClient) -> None:
    response = await client.get("/patients/not-a-uuid")

    assert response.status_code == 422
    assert response.json()["errors"][0]["field"] == "path.patient_id"


async def test_update_replaces_fields(client: AsyncClient) -> None:
    created = await create_patient(client)

    response = await client.put(
        f"/patients/{created['id']}",
        json=patient_payload(last_name="Updated", status="inactive", conditions=[]),
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["last_name"] == "Updated"
    assert updated["status"] == "inactive"
    assert updated["conditions"] == []


async def test_delete_removes_patient(client: AsyncClient) -> None:
    created = await create_patient(client)

    delete_response = await client.delete(f"/patients/{created['id']}")
    read_response = await client.get(f"/patients/{created['id']}")

    assert delete_response.status_code == 204
    assert read_response.status_code == 404


async def test_list_paginates_and_reports_totals(client: AsyncClient) -> None:
    for index in range(7):
        await create_patient(client, last_name=f"Patient{index:02d}")

    first_page = await client.get("/patients", params={"page": 1, "page_size": 3})
    last_page = await client.get("/patients", params={"page": 3, "page_size": 3})

    assert first_page.status_code == 200
    first_body = first_page.json()
    assert first_body["total"] == 7
    assert first_body["total_pages"] == 3
    assert [item["last_name"] for item in first_body["items"]] == [
        "Patient00",
        "Patient01",
        "Patient02",
    ]
    assert [item["last_name"] for item in last_page.json()["items"]] == ["Patient06"]


async def test_list_searches_full_name_case_insensitively(client: AsyncClient) -> None:
    await create_patient(client, first_name="Maria", last_name="Alvarez")
    await create_patient(client, first_name="James", last_name="Okafor")

    response = await client.get("/patients", params={"search": "maria alv"})

    assert [item["last_name"] for item in response.json()["items"]] == ["Alvarez"]


async def test_list_filters_by_status_and_sorts_by_age(client: AsyncClient) -> None:
    await create_patient(client, last_name="Young", date_of_birth="2005-01-01", status="active")
    await create_patient(client, last_name="Old", date_of_birth="1950-01-01", status="active")
    await create_patient(client, last_name="Pending", date_of_birth="1970-01-01", status="pending")

    response = await client.get(
        "/patients", params={"status": "active", "sort": "age", "order": "desc"}
    )

    assert [item["last_name"] for item in response.json()["items"]] == ["Old", "Young"]


async def test_list_rejects_unknown_sort_field(client: AsyncClient) -> None:
    response = await client.get("/patients", params={"sort": "shoe_size"})

    assert response.status_code == 422
    assert response.json()["errors"][0]["field"] == "query.sort"


async def test_stats_counts_every_status(client: AsyncClient) -> None:
    await create_patient(client, status="active")
    await create_patient(client, status="pending", last_visit_at=None)

    response = await client.get("/patients/stats")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    counts = {entry["status"]: entry["count"] for entry in body["by_status"]}
    assert counts == {"active": 1, "pending": 1, "inactive": 0, "discharged": 0}
