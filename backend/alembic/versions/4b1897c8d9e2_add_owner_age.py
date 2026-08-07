"""add owner_age

Revision ID: 4b1897c8d9e2
Revises: 3a2908f9024f
Create Date: 2026-06-23 11:15:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '4b1897c8d9e2'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('properties', sa.Column('owner_age', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('properties', 'owner_age')
