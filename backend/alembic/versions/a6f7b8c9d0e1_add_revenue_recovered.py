"""add revenue_recovered

Revision ID: a6f7b8c9d0e1
Revises: 4b1897c8d9e2
Create Date: 2026-06-23 11:25:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a6f7b8c9d0e1'
down_revision: Union[str, None] = '4b1897c8d9e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('investigation_cases', sa.Column('revenue_recovered', sa.Float(), nullable=False, server_default='0.0'))


def downgrade() -> None:
    op.drop_column('investigation_cases', 'revenue_recovered')
