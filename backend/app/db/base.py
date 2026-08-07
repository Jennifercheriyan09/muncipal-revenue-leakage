from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemy declarative base shared by all ORM models.

    All models import and extend this class so Alembic can discover
    them via target_metadata = Base.metadata in alembic/env.py.
    """

