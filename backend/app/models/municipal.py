from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.property import Property


class TaxRecord(Base):
    __tablename__ = "tax_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assessment_year: Mapped[int] = mapped_column(Integer, nullable=False)
    assessed_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    tax_demand: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    tax_paid: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    arrears_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    last_payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="tax_records")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    gateway_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    payment_mode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_manual_adjustment: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    adjustment_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    received_by_officer_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="payments")


class UtilityRecord(Base):
    __tablename__ = "utility_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    utility_type: Mapped[str] = mapped_column(String(50), nullable=False)
    bill_month: Mapped[str] = mapped_column(String(7), nullable=False)
    consumption_units: Mapped[float | None] = mapped_column(Float, nullable=True)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    meter_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="utility_records")


class TradeLicense(Base):
    __tablename__ = "trade_licenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    license_number: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="trade_licenses")


class BuildingPermission(Base):
    __tablename__ = "building_permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    permission_number: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    approved_area_sq_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    approved_floors: Mapped[int | None] = mapped_column(Integer, nullable=True)
    approved_usage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    approval_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="approved")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="building_permissions")


class MutationRecord(Base):
    __tablename__ = "mutation_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    old_owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    new_owner: Mapped[str] = mapped_column(String(255), nullable=False)
    mutation_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    mutation_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    processed_by_officer_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="mutation_records")
