from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.state import RevenueLeakageState
from app.models.municipal import (
    BuildingPermission,
    Payment,
    TaxRecord,
    TradeLicense,
    UtilityRecord,
)
from app.models.property import Property
from app.models.ward import Ward


def _row_to_dict(obj: Any) -> dict[str, Any]:
    """Convert a SQLAlchemy model instance to a plain dict."""
    result = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        result[col.name] = str(val) if hasattr(val, "isoformat") else val
    return result


async def property_validation_agent(
    state: RevenueLeakageState, db: AsyncSession | None = None
) -> RevenueLeakageState:
    """Loads the full property record and all related data from the database into state.

    Also initializes fraud_signals = [] to reset/seed the accumulator for the parallel branches.
    When db is None (e.g. inside the LangGraph run where data is already loaded), acts as a pass-through.
    """
    state["fraud_signals"] = []

    if not state.get("property_id"):
        state["risk_score"] = 0.0
        state["risk_level"] = "Low"
        state["evidence_summary"] = "No property ID provided."
        state["officer_notes"] = "Cannot process without a valid property ID."
        state["notifications"] = []
        return state

    if db is None:
        state.setdefault("property_data", {})
        state.setdefault("tax_records", [])
        state.setdefault("payments", [])
        state.setdefault("trade_licenses", [])
        state.setdefault("building_permissions", [])
        state.setdefault("utility_records", [])
        state.setdefault("ward_tax_rate_residential", 0.0)
        state.setdefault("ward_tax_rate_commercial", 0.0)
        return state

    property_id = int(state["property_id"])

    prop_result = await db.execute(select(Property).where(Property.id == property_id))
    prop = prop_result.scalar_one_or_none()
    if prop is None:
        state["risk_score"] = 0.0
        state["risk_level"] = "Low"
        state["evidence_summary"] = f"Property ID {property_id} not found in database."
        state["officer_notes"] = "Verify the property ID is correct."
        state["notifications"] = []
        return state

    state["property_data"] = _row_to_dict(prop)

    tax_result = await db.execute(
        select(TaxRecord)
        .where(TaxRecord.property_id == property_id)
        .order_by(TaxRecord.assessment_year.desc())
    )
    state["tax_records"] = [_row_to_dict(r) for r in tax_result.scalars().all()]

    pay_result = await db.execute(
        select(Payment)
        .where(Payment.property_id == property_id)
        .order_by(Payment.payment_date.desc())
    )
    state["payments"] = [_row_to_dict(r) for r in pay_result.scalars().all()]

    tl_result = await db.execute(
        select(TradeLicense).where(TradeLicense.property_id == property_id)
    )
    state["trade_licenses"] = [_row_to_dict(r) for r in tl_result.scalars().all()]

    bp_result = await db.execute(
        select(BuildingPermission).where(BuildingPermission.property_id == property_id)
    )
    state["building_permissions"] = [_row_to_dict(r) for r in bp_result.scalars().all()]

    ur_result = await db.execute(
        select(UtilityRecord).where(UtilityRecord.property_id == property_id)
    )
    state["utility_records"] = [_row_to_dict(r) for r in ur_result.scalars().all()]

    if prop.ward_id:
        ward_result = await db.execute(select(Ward).where(Ward.id == prop.ward_id))
        ward = ward_result.scalar_one_or_none()
        if ward:
            state["ward_tax_rate_residential"] = ward.tax_rate_residential
            state["ward_tax_rate_commercial"] = ward.tax_rate_commercial
        else:
            state["ward_tax_rate_residential"] = 0.0
            state["ward_tax_rate_commercial"] = 0.0
    else:
        state["ward_tax_rate_residential"] = 0.0
        state["ward_tax_rate_commercial"] = 0.0

    return state
