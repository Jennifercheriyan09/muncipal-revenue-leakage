from fastapi import APIRouter, Depends
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.property import Property
from app.models.user import User
from app.models.ward import Ward
from app.schemas.map import (
    GeoJSONPoint,
    GeoJSONPolygon,
    HeatmapPoint,
    PropertyMarkerCollection,
    PropertyMarkerFeature,
    PropertyMarkerProperties,
    WardFeature,
    WardFeatureCollection,
    WardFeatureProperties,
    WardSummary,
)

router = APIRouter()


@router.get("/map/properties", response_model=PropertyMarkerCollection)
async def get_property_markers(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> PropertyMarkerCollection:
    """
    Returns all properties that have coordinates as a GeoJSON FeatureCollection.
    Each feature is a dot on the map coloured by risk level.
    """
    result = await db.execute(
        select(Property).where(Property.location.isnot(None))
    )
    properties = result.scalars().all()

    features = []
    for prop in properties:
        shape = to_shape(prop.location)
        features.append(
            PropertyMarkerFeature(
                geometry=GeoJSONPoint(coordinates=[shape.x, shape.y]),
                properties=PropertyMarkerProperties(
                    property_id=prop.property_uid,
                    owner_name=prop.owner_name,
                    ward_id=prop.ward_id,
                    risk_score=prop.risk_score,
                    risk_level=prop.risk_level,
                    usage_type=prop.usage_type,
                    declared_area_sq_m=prop.declared_area_sq_m,
                    gis_area_sq_m=prop.gis_area_sq_m,
                ),
            )
        )

    return PropertyMarkerCollection(features=features)


@router.get("/map/heatmap", response_model=list[HeatmapPoint])
async def get_heatmap_data(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[HeatmapPoint]:
    """
    Returns a flat list of lat, lng, intensity for the heatmap layer.
    Intensity is the property risk score normalised to 0-1.
    """
    result = await db.execute(
        select(Property).where(
            Property.location.isnot(None),
            Property.risk_score.isnot(None),
        )
    )
    properties = result.scalars().all()

    return [
        HeatmapPoint(
            lat=prop.latitude,
            lng=prop.longitude,
            intensity=round((prop.risk_score or 0) / 100, 2),
        )
        for prop in properties
    ]


@router.get("/map/wards", response_model=WardFeatureCollection)
async def get_ward_boundaries(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> WardFeatureCollection:
    """
    Returns all ward boundary polygons as a GeoJSON FeatureCollection.
    Used to draw ward outlines on the map.
    """
    result = await db.execute(select(Ward))
    wards = result.scalars().all()

    features = []
    for ward in wards:
        if ward.boundary is not None:
            shape = to_shape(ward.boundary)
            geometry = GeoJSONPolygon(**mapping(shape))
        else:
            geometry = None

        features.append(
            WardFeature(
                geometry=geometry,
                properties=WardFeatureProperties(
                    ward_id=ward.id,
                    name=ward.name,
                    code=ward.code,
                    tax_rate_residential=ward.tax_rate_residential,
                    tax_rate_commercial=ward.tax_rate_commercial,
                ),
            )
        )

    return WardFeatureCollection(features=features)


@router.get("/map/ward-summary", response_model=list[WardSummary])
async def get_ward_summary(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[WardSummary]:
    """
    Returns per-ward stats — case counts by risk level and average score.
    Used for the info panel on the map.
    """
    wards_result = await db.execute(select(Ward))
    wards = wards_result.scalars().all()

    summaries = []
    for ward in wards:
        props_result = await db.execute(
            select(Property).where(Property.ward_id == ward.id)
        )
        props = props_result.scalars().all()

        if not props:
            continue

        summaries.append(
            WardSummary(
                ward_id=ward.id,
                ward_name=ward.name,
                ward_code=ward.code,
                total_cases=len(props),
                critical_count=sum(1 for p in props if p.risk_level == "Critical"),
                high_count=sum(1 for p in props if p.risk_level == "High"),
                medium_count=sum(1 for p in props if p.risk_level == "Medium"),
                low_count=sum(1 for p in props if p.risk_level == "Low"),
                avg_risk_score=round(
                    sum(p.risk_score or 0 for p in props) / len(props), 2
                ),
            )
        )

    return summaries