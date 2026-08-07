"""
Reads the real KDMC ward boundaries from kdmc_wards.kml and imports
them into the PostGIS wards table, replacing the dummy rectangular wards.

Run with:
    docker compose exec api python import_wards.py
"""

import asyncio
import xml.etree.ElementTree as ET
from geoalchemy2.shape import from_shape
from shapely.geometry import MultiPolygon, Polygon
from sqlalchemy import text
from app.db.session import get_db

KML_FILE = "/app/kdmc_wards.kml"
KML_NS = "http://www.opengis.net/kml/2.2"


def parse_coordinates(coord_text):
    """Convert KML coordinate string into a Shapely Polygon."""
    points = []
    for triplet in coord_text.strip().split():
        parts = triplet.split(",")
        lng = float(parts[0])
        lat = float(parts[1])
        points.append((lng, lat))
    return points


def parse_kml(filepath):
    """Parse KML file and return list of ward dicts with geometry."""
    tree = ET.parse(filepath)
    root = tree.getroot()
    wards = []

    placemarks = root.findall(f".//{{{KML_NS}}}Placemark")

    for placemark in placemarks:
        # Get ward name and code from ExtendedData
        ward_name = None
        ward_code = None

        schema_data = placemark.find(f".//{{{KML_NS}}}SchemaData")
        if schema_data is not None:
            for simple_data in schema_data.findall(f"{{{KML_NS}}}SimpleData"):
                if simple_data.get("name") == "ward_lgd_name":
                    ward_name = simple_data.text
                if simple_data.get("name") == "sourcewardcode":
                    ward_code = simple_data.text

        if not ward_name or not ward_code:
            continue

        # Get all polygons for this ward
        polygons = []
        for polygon_elem in placemark.findall(f".//{{{KML_NS}}}Polygon"):
            outer = polygon_elem.find(
                f".//{{{KML_NS}}}outerBoundaryIs/"
                f"{{{KML_NS}}}LinearRing/"
                f"{{{KML_NS}}}coordinates"
            )
            if outer is not None and outer.text:
                points = parse_coordinates(outer.text)
                if len(points) >= 3:
                    polygons.append(Polygon(points))

        if not polygons:
            continue

        # Combine into MultiPolygon
        if len(polygons) == 1:
            geometry = MultiPolygon([polygons[0]])
        else:
            geometry = MultiPolygon(polygons)

        wards.append({
            "name": ward_name,
            "code": f"KDMC-{ward_code}",
            "geometry": geometry,
        })

    return wards


async def import_wards():
    async for db in get_db():
        print("Parsing KML file...")
        wards = parse_kml(KML_FILE)
        print(f"Found {len(wards)} wards in KML file.")

        # Delete existing dummy properties first (they link to old wards)
        print("Removing dummy properties...")
        await db.execute(text("DELETE FROM properties"))
        await db.commit()

        # Delete existing dummy wards
        print("Removing dummy wards...")
        await db.execute(text("DELETE FROM wards"))
        await db.commit()

        # Insert real wards
        print("Inserting real KDMC wards...")
        from app.models.ward import Ward

        for w in wards:
            ward = Ward(
                name=w["name"],
                code=w["code"],
                tax_rate_residential=0.08,
                tax_rate_commercial=0.12,
                boundary=from_shape(w["geometry"], srid=4326),
            )
            db.add(ward)

        await db.commit()
        print(f"Inserted {len(wards)} real wards.")

        # Re-seed properties spread across real wards
        print("Re-seeding 200 properties across real wards...")
        import random
        from geoalchemy2.shape import from_shape as fs
        from shapely.geometry import Point
        from app.models.property import Property

        # Get all inserted wards
        result = await db.execute(text("SELECT id, ST_AsText(boundary) FROM wards"))
        rows = result.fetchall()

        OWNER_NAMES = [
            "Rajesh Sharma", "Priya Patel", "Suresh Kulkarni", "Anita Desai",
            "Mahesh Joshi", "Sunita More", "Ramesh Nair", "Kavita Patil",
            "Vijay Shinde", "Pooja Mehta", "Anil Thakur", "Meena Rao",
            "Santosh Jadhav", "Rekha Chavan", "Dilip Sawant", "Usha Pawar",
        ]
        STREETS = [
            "Shivaji Nagar", "Ganesh Peth", "Ram Nagar", "Laxmi Road",
            "MG Road", "Station Road", "Market Lane", "Gandhi Chowk",
        ]

        created = 0
        for i in range(1, 201):
            # Pick random ward
            ward_row = random.choice(rows)
            ward_id = ward_row[0]

            # Get bounding box of this ward and pick random point inside
            bbox_result = await db.execute(
                text(f"SELECT ST_XMin(boundary), ST_YMin(boundary), ST_XMax(boundary), ST_YMax(boundary) FROM wards WHERE id = {ward_id}")
            )
            bbox = bbox_result.fetchone()
            if not bbox:
                continue

            min_lng, min_lat, max_lng, max_lat = bbox
            lat = random.uniform(min_lat, max_lat)
            lng = random.uniform(min_lng, max_lng)

            declared_area = round(random.uniform(50, 500), 2)
            gis_area = round(declared_area * random.uniform(1.0, 1.4), 2) \
                if random.random() < 0.3 else round(declared_area * random.uniform(0.9, 1.1), 2)

            declared_usage = random.choice(["residential", "residential", "commercial"])
            usage_type = "commercial" \
                if (declared_usage == "residential" and random.random() < 0.25) \
                else declared_usage

            is_exempt = random.random() < 0.15
            exemption_type = random.choice(["senior_citizen", "vacancy"]) if is_exempt else None

            # Generate owner age
            if exemption_type == "senior_citizen":
                # 30% chance of being ineligible (under 60) for testing
                owner_age = random.randint(30, 55) if random.random() < 0.3 else random.randint(60, 85)
            else:
                owner_age = random.randint(18, 80)

            score = 0
            if gis_area > declared_area * 1.15:
                score += 30
            if declared_usage == "residential" and usage_type == "commercial":
                score += 30
            if is_exempt and usage_type == "commercial":
                score += 10
            score += random.randint(0, 30)
            score = min(score, 100)

            if score <= 40:
                level = "Low"
            elif score <= 60:
                level = "Medium"
            elif score <= 80:
                level = "High"
            else:
                level = "Critical"

            prop = Property(
                property_uid=f"PT-{2000 + i}",
                owner_name=random.choice(OWNER_NAMES),
                owner_age=owner_age,
                address=f"{random.randint(1, 999)}, {random.choice(STREETS)}, Kalyan-Dombivli",
                ward_id=ward_id,
                declared_area_sq_m=declared_area,
                gis_area_sq_m=gis_area,
                usage_type=usage_type,
                declared_usage_type=declared_usage,
                is_exempt=is_exempt,
                exemption_type=exemption_type,
                risk_score=round(float(score), 2),
                risk_level=level,
                latitude=lat,
                longitude=lng,
                location=fs(Point(lng, lat), srid=4326),
            )
            db.add(prop)
            created += 1

        await db.commit()
        print(f"Created {created} properties.")
        print("Import complete. Real KDMC ward boundaries are now in the database.")
        break


if __name__ == "__main__":
    asyncio.run(import_wards())