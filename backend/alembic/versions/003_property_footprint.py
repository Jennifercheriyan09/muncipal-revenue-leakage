"""add property footprint polygon and gis_area_source

Revision ID: 003
Revises: a6f7b8c9d0e1
Create Date: 2026-07-27
"""
from typing import Sequence, Union

import geoalchemy2
import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "a6f7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "properties",
        sa.Column(
            "footprint",
            geoalchemy2.types.Geometry(geometry_type="POLYGON", srid=4326, spatial_index=False),
            nullable=True,
        ),
    )
    op.create_index(
        "idx_properties_footprint", "properties", ["footprint"], postgresql_using="gist"
    )
    op.add_column("properties", sa.Column("gis_area_source", sa.String(20), nullable=True))


def downgrade() -> None:
    op.drop_column("properties", "gis_area_source")
    op.drop_index("idx_properties_footprint", table_name="properties", postgresql_using="gist")
    op.drop_column("properties", "footprint")
