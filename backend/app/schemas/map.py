from typing import Any

from pydantic import BaseModel


class GeoJSONPoint(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [longitude, latitude]


class PropertyMarkerProperties(BaseModel):
    property_id: str
    owner_name: str
    ward_id: int | None
    risk_score: float | None
    risk_level: str | None
    usage_type: str | None
    declared_area_sq_m: float | None
    gis_area_sq_m: float | None


class PropertyMarkerFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONPoint
    properties: PropertyMarkerProperties


class PropertyMarkerCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[PropertyMarkerFeature]


class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    intensity: float


class WardSummary(BaseModel):
    ward_id: int
    ward_name: str
    ward_code: str
    total_cases: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    avg_risk_score: float


class GeoJSONPolygon(BaseModel):
    type: str
    coordinates: list[Any]


class WardFeatureProperties(BaseModel):
    ward_id: int
    name: str
    code: str
    tax_rate_residential: float
    tax_rate_commercial: float


class WardFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONPolygon | None
    properties: WardFeatureProperties


class WardFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[WardFeature]