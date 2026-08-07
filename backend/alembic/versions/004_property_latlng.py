"""add latitude and longitude to properties

Revision ID: 004
Revises: 003
Create Date: 2026-07-27

NOTE: No-op — latitude/longitude were already added in ec6719920bb3.
Kept so the revision chain 003 → 004 → 005 → … stays intact.
"""
from typing import Sequence, Union

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
