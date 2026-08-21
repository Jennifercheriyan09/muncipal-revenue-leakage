from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.municipal_repository import (
    create_building_permission,
    create_mutation_record,
    create_payment,
    create_trade_license,
    create_utility_record,
    get_payments_by_property,
    get_tax_records_by_property,
    upsert_tax_record,
)
from app.schemas.municipal import (
    BuildingPermissionCreate,
    BuildingPermissionRead,
    MutationRecordCreate,
    MutationRecordRead,
    PaymentCreate,
    PaymentRead,
    TaxRecordCreate,
    TaxRecordRead,
    TradeLicenseCreate,
    TradeLicenseRead,
    UtilityRecordCreate,
    UtilityRecordRead,
)

router = APIRouter()


@router.get(
    "/municipal/properties/{property_id}/tax-records",
    response_model=list[TaxRecordRead],
)
async def list_property_tax_records(
    property_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[TaxRecordRead]:
    records = await get_tax_records_by_property(db, property_id)
    return [TaxRecordRead.model_validate(r) for r in records]


@router.get(
    "/municipal/properties/{property_id}/payments",
    response_model=list[PaymentRead],
)
async def list_property_payments(
    property_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[PaymentRead]:
    payments = await get_payments_by_property(db, property_id)
    return [PaymentRead.model_validate(p) for p in payments]


@router.post(
    "/municipal/tax-records",
    response_model=TaxRecordRead,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_tax_record(
    data: TaxRecordCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> TaxRecordRead:
    """Upsert a tax record for a given property and assessment year."""
    record = await upsert_tax_record(db, data)
    return TaxRecordRead.model_validate(record)


@router.post(
    "/municipal/payments",
    response_model=PaymentRead,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_payment(
    data: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> PaymentRead:
    """Record a payment transaction for a property."""
    payment = await create_payment(db, data)
    return PaymentRead.model_validate(payment)


@router.post(
    "/municipal/utilities",
    response_model=UtilityRecordRead,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_utility_record(
    data: UtilityRecordCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> UtilityRecordRead:
    """Record a utility bill entry (electricity or water) for a property."""
    record = await create_utility_record(db, data)
    return UtilityRecordRead.model_validate(record)


@router.post(
    "/municipal/trade-licenses",
    response_model=TradeLicenseRead,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_trade_license(
    data: TradeLicenseCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> TradeLicenseRead:
    """Record a trade license linked to a property."""
    license_ = await create_trade_license(db, data)
    return TradeLicenseRead.model_validate(license_)


@router.post(
    "/municipal/building-permissions",
    response_model=BuildingPermissionRead,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_building_permission(
    data: BuildingPermissionCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> BuildingPermissionRead:
    """Record a building permission for a property."""
    permission = await create_building_permission(db, data)
    return BuildingPermissionRead.model_validate(permission)


@router.post(
    "/municipal/mutation-records",
    response_model=MutationRecordRead,
    status_code=status.HTTP_201_CREATED,
)
async def ingest_mutation_record(
    data: MutationRecordCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> MutationRecordRead:
    """Record an ownership mutation for a property."""
    record = await create_mutation_record(db, data)
    return MutationRecordRead.model_validate(record)
