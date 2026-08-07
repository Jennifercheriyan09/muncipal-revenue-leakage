from datetime import datetime
from typing import TYPE_CHECKING

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.ward import Ward


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_uid: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    owner_name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    ward_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("wards.id", ondelete="SET NULL"), nullable=True, index=True
    )
    declared_area_sq_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    gis_area_sq_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    usage_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    declared_usage_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_exempt: Mapped[bool] = mapped_column(nullable=False, default=False)
    exemption_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    exemption_document_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True, index=True)
    risk_level: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    estimated_revenue_impact: Mapped[float | None] = mapped_column(Float, nullable=True, default=0.0)

    # GIS columns — latitude and longitude stored as plain floats
    # and as a PostGIS geometry point for spatial queries
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    location = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    ward: Mapped["Ward"] = relationship("Ward", back_populates="properties", lazy="select")
    tax_records: Mapped[list["TaxRecord"]] = relationship(  # noqa: F821
        "TaxRecord", back_populates="property", lazy="select"
    )
    payments: Mapped[list["Payment"]] = relationship(  # noqa: F821
        "Payment", back_populates="property", lazy="select"
    )
    utility_records: Mapped[list["UtilityRecord"]] = relationship(  # noqa: F821
        "UtilityRecord", back_populates="property", lazy="select"
    )
    trade_licenses: Mapped[list["TradeLicense"]] = relationship(  # noqa: F821
        "TradeLicense", back_populates="property", lazy="select"
    )
    building_permissions: Mapped[list["BuildingPermission"]] = relationship(  # noqa: F821
        "BuildingPermission", back_populates="property", lazy="select"
    )
    mutation_records: Mapped[list["MutationRecord"]] = relationship(  # noqa: F821
        "MutationRecord", back_populates="property", lazy="select"
    )