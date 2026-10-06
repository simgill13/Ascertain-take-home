import uuid

from httpx import AsyncClient

from tests.factories import patient_payload


async def create_patient(client: AsyncClient, **overrides: object) -> str:
    response = await client.post("/patients", json=patient_payload(**overrides))
    assert response.status_code == 201, response.text
    return str(response.json()["id"])


async def add_note(
    client: AsyncClient, patient_id: str, content: str, noted_at: str
) -> dict[str, object]:
    response = await client.post(
        f"/patients/{patient_id}/notes", json={"content": content, "noted_at": noted_at}
    )
    assert response.status_code == 201, response.text
    return response.json()  # type: ignore[no-any-return]


async def test_notes_list_newest_first(client: AsyncClient) -> None:
    patient_id = await create_patient(client)
    await add_note(client, patient_id, "Older note.", "2026-01-05T09:00:00Z")
    await add_note(client, patient_id, "Newer note.", "2026-03-05T09:00:00Z")

    response = await client.get(f"/patients/{patient_id}/notes")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert [note["content"] for note in body["items"]] == ["Newer note.", "Older note."]


async def test_adding_a_newer_note_advances_last_visit(client: AsyncClient) -> None:
    patient_id = await create_patient(client, last_visit_at="2026-01-01T10:00:00Z")

    await add_note(client, patient_id, "Follow-up.", "2026-04-01T10:00:00Z")
    patient = (await client.get(f"/patients/{patient_id}")).json()

    assert patient["last_visit_at"].startswith("2026-04-01T10:00:00")


async def test_note_rejects_blank_content_and_future_time(client: AsyncClient) -> None:
    patient_id = await create_patient(client)

    response = await client.post(
        f"/patients/{patient_id}/notes", json={"content": "   ", "noted_at": "2999-01-01T00:00:00Z"}
    )

    assert response.status_code == 422
    failing_fields = {error["field"] for error in response.json()["errors"]}
    assert failing_fields == {"content", "noted_at"}


async def test_note_for_missing_patient_returns_404(client: AsyncClient) -> None:
    response = await client.post(
        f"/patients/{uuid.uuid4()}/notes",
        json={"content": "Hello", "noted_at": "2026-01-01T00:00:00Z"},
    )

    assert response.status_code == 404


async def test_delete_note_then_404(client: AsyncClient) -> None:
    patient_id = await create_patient(client)
    note = await add_note(client, patient_id, "Temporary.", "2026-02-01T09:00:00Z")

    delete_response = await client.delete(f"/patients/{patient_id}/notes/{note['id']}")
    second_delete = await client.delete(f"/patients/{patient_id}/notes/{note['id']}")

    assert delete_response.status_code == 204
    assert second_delete.status_code == 404


async def test_delete_note_belonging_to_other_patient_returns_404(client: AsyncClient) -> None:
    first_patient_id = await create_patient(client, last_name="First")
    second_patient_id = await create_patient(client, last_name="Second")
    note = await add_note(client, first_patient_id, "Belongs to first.", "2026-02-01T09:00:00Z")

    response = await client.delete(f"/patients/{second_patient_id}/notes/{note['id']}")

    assert response.status_code == 404


async def test_notes_of_deleted_patient_return_404(client: AsyncClient) -> None:
    patient_id = await create_patient(client)
    await add_note(client, patient_id, "Will be removed.", "2026-02-01T09:00:00Z")

    await client.delete(f"/patients/{patient_id}")
    response = await client.get(f"/patients/{patient_id}/notes")

    assert response.status_code == 404


async def test_summary_combines_profile_and_notes(client: AsyncClient) -> None:
    patient_id = await create_patient(
        client,
        first_name="Maria",
        last_name="Alvarez",
        blood_type="O+",
        conditions=["Type 2 diabetes", "Hypertension"],
        allergies=["Penicillin"],
    )
    await add_note(
        client, patient_id, "A1c down to 7.1. Continue metformin.", "2026-03-01T09:00:00Z"
    )
    await add_note(client, patient_id, "Blood pressure 142/88 at intake.", "2026-01-10T09:00:00Z")

    response = await client.get(f"/patients/{patient_id}/summary")

    assert response.status_code == 200
    body = response.json()
    assert body["identifiers"]["full_name"] == "Maria Alvarez"
    assert body["identifiers"]["blood_type"] == "O+"
    assert body["clinical"]["conditions"] == ["Type 2 diabetes", "Hypertension"]
    assert body["clinical"]["note_count"] == 2
    assert body["generated_by"] == "template"
    narrative = body["narrative"]
    assert "Type 2 diabetes and Hypertension" in narrative
    assert "Penicillin" in narrative
    assert "A1c down to 7.1" in narrative
    assert "blood pressure 142/88 at intake" in narrative


async def test_summary_without_notes_says_so(client: AsyncClient) -> None:
    patient_id = await create_patient(client, conditions=[], allergies=[])

    response = await client.get(f"/patients/{patient_id}/summary")

    narrative = response.json()["narrative"]
    assert "No chronic conditions are documented" in narrative
    assert "no clinical notes on file" in narrative
