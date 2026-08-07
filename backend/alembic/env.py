from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.db.base import Base
from app.models import analysis, investigation, municipal, property, user, ward  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# These are PostGIS internal tables — Alembic should never touch them
POSTGIS_TABLES_TO_IGNORE = {
    "spatial_ref_sys", "topology", "layer",
    "geocode_settings", "geocode_settings_default",
    "pagc_gaz", "pagc_lex", "pagc_rules",
    "loader_platform", "loader_variables", "loader_lookuptables",
    "state_lookup", "county_lookup", "countysub_lookup",
    "place_lookup", "zip_lookup", "zip_lookup_all", "zip_lookup_base",
    "zip_state", "zip_state_loc", "direction_lookup",
    "secondary_unit_lookup", "street_type_lookup",
    "state", "county", "cousub", "edges", "addrfeat",
    "faces", "featnames", "addr", "place", "tract",
    "tabblock", "tabblock20", "bg", "zcta5",
}


def include_object(object, name, type_, reflected, compare_to):
    """Tell Alembic to ignore PostGIS internal tables."""
    if type_ == "table" and name in POSTGIS_TABLES_TO_IGNORE:
        return False
    return True


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_async_migrations())