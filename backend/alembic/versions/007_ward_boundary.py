"""add boundary multipolygon to wards

Revision ID: 007
Revises: 006
Create Date: 2026-07-27

NOTE: No-op — wards.boundary + idx were already added in ec6719920bb3.
"""
from typing import Sequence, Union

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
