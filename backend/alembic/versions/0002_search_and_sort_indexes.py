"""Search and sort indexes for a large patients table

ILIKE '%term%' cannot use a b-tree index, so name and email search get pg_trgm GIN indexes.
Each list sort gets a composite b-tree that includes the stable tiebreakers, so
ORDER BY ... LIMIT reads the index in order instead of sorting the table.

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-06

"""

from collections.abc import Sequence

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TRIGRAM_INDEXES = {
    "ix_patients_first_name_trgm": "first_name",
    "ix_patients_last_name_trgm": "last_name",
    "ix_patients_email_trgm": "email",
    # Matches the expression the search service uses for "first last" queries.
    "ix_patients_full_name_trgm": "(first_name || ' ' || last_name)",
}

SORT_INDEXES = {
    "ix_patients_sort_last_name": "(last_name, first_name, id)",
    "ix_patients_sort_first_name": "(first_name, last_name, id)",
    "ix_patients_sort_created_at": "(created_at DESC, last_name, first_name, id)",
    "ix_patients_sort_date_of_birth": "(date_of_birth, last_name, first_name, id)",
    "ix_patients_status_last_visit": "(status, last_visit_at DESC NULLS LAST)",
    "ix_patients_status_last_name": "(status, last_name, first_name, id)",
}


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    for index_name, expression in TRIGRAM_INDEXES.items():
        op.execute(f"CREATE INDEX {index_name} ON patients USING gin ({expression} gin_trgm_ops)")
    for index_name, columns in SORT_INDEXES.items():
        op.execute(f"CREATE INDEX {index_name} ON patients {columns}")


def downgrade() -> None:
    for index_name in [*SORT_INDEXES, *TRIGRAM_INDEXES]:
        op.execute(f"DROP INDEX IF EXISTS {index_name}")
    # The extension stays installed; other objects may depend on it.
