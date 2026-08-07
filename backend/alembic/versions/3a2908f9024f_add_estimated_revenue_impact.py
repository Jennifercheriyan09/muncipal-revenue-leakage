"""add_estimated_revenue_impact

Revision ID: 3a2908f9024f
Revises: ec6719920bb3
Create Date: 2026-06-22 11:55:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '3a2908f9024f'
down_revision: Union[str, None] = 'ec6719920bb3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'properties',
        sa.Column('estimated_revenue_impact', sa.Float(), nullable=True, server_default='0.0')
    )


def downgrade() -> None:
    op.drop_column('properties', 'estimated_revenue_impact')
