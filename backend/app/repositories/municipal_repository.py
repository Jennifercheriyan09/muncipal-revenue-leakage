from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.municipal import (
    BuildingPermission,
    MutationRecord,
    Payment,
    TaxRecord,
    TradeLicense,
    UtilityRecord,
)
from app.schemas.municipal import (
    BuildingPermissionCreate,
    MutationRecordCreate,
    PaymentCreate,
    TaxRecordCreate,
    TradeLicenseCreate,
    UtilityRecordCreate,
)


async def upsert_tax_record(db: AsyncSession, data: TaxRecordCreate) -> TaxRecord:
    result = await db.execute(
        select(TaxRecord).where(
            TaxRecord.property_id == data.property_id,
            TaxRecord.assessment_year == data.assessment_year,
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        record = TaxRecord(**data.model_dump())
        db.add(record)
    else:
        for field, value in data.model_dump(exclude={"property_id", "assessment_year"}).items():
            setattr(record, field, value)
    await db.commit()
    await db.refresh(record)
    return record


async def create_payment(db: AsyncSession, data: PaymentCreate) -> Payment:
    payment = Payment(**data.model_dump())
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment


async def create_utility_record(db: AsyncSession, data: UtilityRecordCreate) -> UtilityRecord:
    record = UtilityRecord(**data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def create_trade_license(db: AsyncSession, data: TradeLicenseCreate) -> TradeLicense:
    license_ = TradeLicense(**data.model_dump())
    db.add(license_)
    await db.commit()
    await db.refresh(license_)
    return license_


async def create_building_permission(
    db: AsyncSession, data: BuildingPermissionCreate
) -> BuildingPermission:
    permission = BuildingPermission(**data.model_dump())
    db.add(permission)
    await db.commit()
    await db.refresh(permission)
    return permission


async def create_mutation_record(db: AsyncSession, data: MutationRecordCreate) -> MutationRecord:
    record = MutationRecord(**data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def get_tax_records_by_property(
    db: AsyncSession, property_id: int
) -> list[TaxRecord]:
    result = await db.execute(
        select(TaxRecord)
        .where(TaxRecord.property_id == property_id)
        .order_by(TaxRecord.assessment_year.desc())
    )
    return list(result.scalars().all())


async def get_payments_by_property(db: AsyncSession, property_id: int) -> list[Payment]:
    result = await db.execute(
        select(Payment)
        .where(Payment.property_id == property_id)
        .order_by(Payment.payment_date.desc())
    )
    return list(result.scalars().all())


async def get_trade_licenses_by_property(
    db: AsyncSession, property_id: int
) -> list[TradeLicense]:
    result = await db.execute(
        select(TradeLicense).where(TradeLicense.property_id == property_id)
    )
    return list(result.scalars().all())


async def get_building_permissions_by_property(
    db: AsyncSession, property_id: int
) -> list[BuildingPermission]:
    result = await db.execute(
        select(BuildingPermission).where(BuildingPermission.property_id == property_id)
    )
    return list(result.scalars().all())
