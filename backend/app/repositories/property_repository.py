from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Property
from app.schemas.property import PropertyCreate


async def get_property_by_id(db: AsyncSession, property_id: int) -> Property | None:
    result = await db.execute(select(Property).where(Property.id == property_id))
    return result.scalar_one_or_none()


async def get_property_by_uid(db: AsyncSession, property_uid: str) -> Property | None:
    result = await db.execute(select(Property).where(Property.property_uid == property_uid))
    return result.scalar_one_or_none()


async def list_properties(
    db: AsyncSession,
    limit: int = 20,
    offset: int = 0,
    ward_id: int | None = None,
    risk_level: str | None = None,
    usage_type: str | None = None,
) -> tuple[list[Property], int]:
    query = select(Property)
    count_query = select(func.count()).select_from(Property)

    if ward_id is not None:
        query = query.where(Property.ward_id == ward_id)
        count_query = count_query.where(Property.ward_id == ward_id)
    if risk_level is not None:
        query = query.where(Property.risk_level == risk_level)
        count_query = count_query.where(Property.risk_level == risk_level)
    if usage_type is not None:
        query = query.where(Property.usage_type == usage_type)
        count_query = count_query.where(Property.usage_type == usage_type)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(Property.risk_score.desc().nullslast()).limit(limit).offset(offset)
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def create_property(db: AsyncSession, data: PropertyCreate) -> Property:
    prop = Property(**data.model_dump())
    db.add(prop)
    await db.commit()
    await db.refresh(prop)
    return prop


async def update_property_risk(
    db: AsyncSession,
    property_id: int,
    risk_score: float,
    risk_level: str,
    estimated_revenue_impact: float | None = None,
) -> Property | None:
    prop = await get_property_by_id(db, property_id)
    if prop is None:
        return None
    prop.risk_score = risk_score
    prop.risk_level = risk_level
    if estimated_revenue_impact is not None:
        prop.estimated_revenue_impact = estimated_revenue_impact
    await db.commit()
    await db.refresh(prop)
    return prop
