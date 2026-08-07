from datetime import datetime
from typing import TYPE_CHECKING

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.user import User


class Ward(Base):
    __tablename__ = "wards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    tax_rate_residential: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    tax_rate_commercial: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # GIS column — the actual boundary shape of this ward on the map
    boundary = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    properties: Mapped[list["Property"]] = relationship(
        "Property", back_populates="ward", lazy="select"
    )
    users: Mapped[list["User"]] = relationship("User", back_populates="ward", lazy="select")