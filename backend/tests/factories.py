from typing import Any

VALID_PATIENT: dict[str, Any] = {
    "first_name": "Test",
    "last_name": "Patient",
    "date_of_birth": "1990-05-04",
    "email": "test.patient@example.com",
    "phone": "(503) 555-0100",
    "address_line1": "1 Test Street",
    "address_line2": None,
    "city": "Portland",
    "state": "OR",
    "postal_code": "97201",
    "blood_type": "O+",
    "status": "active",
    "allergies": ["Penicillin"],
    "conditions": ["Asthma"],
    "last_visit_at": "2026-09-01T10:00:00Z",
}


def patient_payload(**overrides: Any) -> dict[str, Any]:
    return {**VALID_PATIENT, **overrides}
