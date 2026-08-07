"""add_gis_geometry_columns

Revision ID: ec6719920bb3
Revises: 001
Create Date: 2026-06-17 07:02:39.007306

"""
from typing import Sequence, Union

import geoalchemy2
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'ec6719920bb3'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add latitude and longitude plain number columns to properties
    op.add_column('properties', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('properties', sa.Column('longitude', sa.Float(), nullable=True))

    # Add PostGIS geometry point column to properties
    op.add_column('properties', sa.Column(
        'location',
        geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, spatial_index=False),
        nullable=True
    ))

    # Add spatial index on properties.location for fast map queries
    op.create_index(
        'idx_properties_location',
        'properties',
        ['location'],
        unique=False,
        postgresql_using='gist'
    )

    # Add PostGIS boundary polygon column to wards
    op.add_column('wards', sa.Column(
        'boundary',
        geoalchemy2.types.Geometry(geometry_type='MULTIPOLYGON', srid=4326, spatial_index=False),
        nullable=True
    ))

    # Add spatial index on wards.boundary for fast ward queries
    op.create_index(
        'idx_wards_boundary',
        'wards',
        ['boundary'],
        unique=False,
        postgresql_using='gist'
    )


def downgrade() -> None:
    op.drop_index('idx_wards_boundary', table_name='wards', postgresql_using='gist')
    op.drop_column('wards', 'boundary')
    op.drop_index('idx_properties_location', table_name='properties', postgresql_using='gist')
    op.drop_column('properties', 'location')
    op.drop_column('properties', 'longitude')
    op.drop_column('properties', 'latitude')