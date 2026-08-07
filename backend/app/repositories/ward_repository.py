from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ward import Ward
from app.schemas.ward import WardCreate


async def get_ward_by_id(db: AsyncSession, ward_id: int) -> Ward | None:
    result = await db.execute(select(Ward).where(Ward.id == ward_id))
    return result.scalar_one_or_none()


async def get_ward_by_code(db: AsyncSession, code: str) -> Ward | None:
    result = await db.execute(select(Ward).where(Ward.code == code))
    return result.scalar_one_or_none()


async def list_wards(db: AsyncSession) -> list[Ward]:
    result = await db.execute(select(Ward).order_by(Ward.code))
    return list(result.scalars().all())


async def create_ward(db: AsyncSession, data: WardCreate) -> Ward:
    ward = Ward(**data.model_dump())
    db.add(ward)
    await db.commit()
    await db.refresh(ward)
    return ward
