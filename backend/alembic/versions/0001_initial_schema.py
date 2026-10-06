"""Initial schema: patients and patient_notes

Revision ID: 0001
Revises:
Create Date: 2026-10-06

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

PATIENT_STATUS_VALUES = ("active", "pending", "inactive", "discharged")
BLOOD_TYPE_VALUES = ("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")

patient_status = postgresql.ENUM(*PATIENT_STATUS_VALUES, name="patient_status", create_type=False)
blood_type = postgresql.ENUM(*BLOOD_TYPE_VALUES, name="blood_type", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    patient_status.create(bind, checkfirst=True)
    blood_type.create(bind, checkfirst=True)

    op.create_table(
        "patients",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=True),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("address_line1", sa.String(length=200), nullable=False),
        sa.Column("address_line2", sa.String(length=200), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=50), nullable=False),
        sa.Column("postal_code", sa.String(length=20), nullable=False),
        sa.Column("blood_type", blood_type, nullable=True),
        sa.Column("status", patient_status, nullable=False, server_default="active"),
        sa.Column(
            "allergies",
            postgresql.ARRAY(sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::text[]"),
        ),
        sa.Column(
            "conditions",
            postgresql.ARRAY(sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::text[]"),
        ),
        sa.Column("last_visit_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_patients_last_name", "patients", ["last_name"])
    op.create_index("ix_patients_status", "patients", ["status"])
    op.create_index("ix_patients_last_visit_at", "patients", ["last_visit_at"])

    op.create_table(
        "patient_notes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "patient_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("patients.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("noted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index(
        "ix_patient_notes_patient_id_noted_at",
        "patient_notes",
        ["patient_id", sa.text("noted_at DESC")],
    )


def downgrade() -> None:
    op.drop_index("ix_patient_notes_patient_id_noted_at", table_name="patient_notes")
    op.drop_table("patient_notes")
    op.drop_index("ix_patients_last_visit_at", table_name="patients")
    op.drop_index("ix_patients_status", table_name="patients")
    op.drop_index("ix_patients_last_name", table_name="patients")
    op.drop_table("patients")
    bind = op.get_bind()
    blood_type.drop(bind, checkfirst=True)
    patient_status.drop(bind, checkfirst=True)
