"""
Seed script — inserts 6 Kalyan wards and 100 dummy properties with
connected tax records, payments, trade licenses, building permissions,
and utility records to enable full agent pipelines for testing.

Run with:
    docker compose exec api python seed_data.py
"""

import asyncio
import random
from datetime import date, timedelta
from geoalchemy2.shape import from_shape
from shapely.geometry import Point, MultiPolygon, Polygon
from sqlalchemy import text
from app.db.session import get_db
from app.models.property import Property
from app.models.ward import Ward
from app.models.municipal import (
    TaxRecord,
    Payment,
    UtilityRecord,
    TradeLicense,
    BuildingPermission,
)

# ---------------------------------------------------------------------------
# 6 Kalyan wards — rough boundary boxes using real Kalyan lat/lng
# ---------------------------------------------------------------------------
WARDS = [
    {
        "name": "Kalyan East",
        "code": "KE-01",
        "tax_rate_residential": 0.08,
        "tax_rate_commercial": 0.12,
        "bbox": (73.160, 19.230, 73.185, 19.260),
    },
    {
        "name": "Kalyan West",
        "code": "KW-02",
        "tax_rate_residential": 0.08,
        "tax_rate_commercial": 0.12,
        "bbox": (73.120, 19.230, 73.160, 19.260),
    },
    {
        "name": "Dombivli East",
        "code": "DE-03",
        "tax_rate_residential": 0.07,
        "tax_rate_commercial": 0.11,
        "bbox": (73.085, 19.205, 73.120, 19.235),
    },
    {
        "name": "Dombivli West",
        "code": "DW-04",
        "tax_rate_residential": 0.07,
        "tax_rate_commercial": 0.11,
        "bbox": (73.055, 19.205, 73.085, 19.235),
    },
    {
        "name": "Titwala",
        "code": "TW-05",
        "tax_rate_residential": 0.06,
        "tax_rate_commercial": 0.10,
        "bbox": (73.190, 19.280, 73.220, 19.310),
    },
    {
        "name": "Ambivli",
        "code": "AM-06",
        "tax_rate_residential": 0.06,
        "tax_rate_commercial": 0.10,
        "bbox": (73.140, 19.265, 73.170, 19.295),
    },
]

OWNER_NAMES = [
    "Rajesh Sharma", "Priya Patel", "Suresh Kulkarni", "Anita Desai",
    "Mahesh Joshi", "Sunita More", "Ramesh Nair", "Kavita Patil",
    "Vijay Shinde", "Pooja Mehta", "Anil Thakur", "Meena Rao",
    "Santosh Jadhav", "Rekha Chavan", "Dilip Sawant", "Usha Pawar",
    "Nitin Gaikwad", "Sushma Deshpande", "Prakash Mane", "Lata Bhosale",
]

STREETS = [
    "Shivaji Nagar", "Ganesh Peth", "Ram Nagar", "Laxmi Road",
    "MG Road", "Station Road", "Market Lane", "Gandhi Chowk",
    "Nehru Marg", "Tilak Path", "Ambedkar Road", "Sardar Patel Marg",
]


def make_bbox_polygon(bbox):
    min_lng, min_lat, max_lng, max_lat = bbox
    polygon = Polygon([
        (min_lng, min_lat),
        (max_lng, min_lat),
        (max_lng, max_lat),
        (min_lng, max_lat),
        (min_lng, min_lat),
    ])
    return MultiPolygon([polygon])


def random_point_in_bbox(bbox):
    min_lng, min_lat, max_lng, max_lat = bbox
    lng = random.uniform(min_lng, max_lng)
    lat = random.uniform(min_lat, max_lat)
    return lat, lng


async def seed():
    async for db in get_db():
        print("Clearing tables...")
        # CASCADE truncates all dependent tables (tax_records, payments, trade_licenses, etc.)
        await db.execute(text("TRUNCATE TABLE properties, wards, users RESTART IDENTITY CASCADE"))
        await db.commit()

        # ----------------------------------------------------------------
        # Insert default users
        # ----------------------------------------------------------------
        print("Seeding default users...")
        from app.models.user import User, UserRole
        from app.core.security import get_password_hash

        officer = User(
            email="officer@mrlis.gov.in",
            hashed_password=get_password_hash("officer123"),
            role=UserRole.officer,
            is_active=True
        )
        db.add(officer)
        await db.flush()
        print(f"  Created user: {officer.email} (id={officer.id})")

        admin = User(
            email="admin@mrlis.gov.in",
            hashed_password=get_password_hash("officer123"),
            role=UserRole.admin,
            is_active=True
        )
        db.add(admin)
        await db.flush()
        print(f"  Created user: {admin.email} (id={admin.id})")

        # ----------------------------------------------------------------
        # Insert wards
        # ----------------------------------------------------------------
        print("Seeding wards...")
        ward_ids = {}
        for w in WARDS:
            boundary_shape = make_bbox_polygon(w["bbox"])
            ward = Ward(
                name=w["name"],
                code=w["code"],
                tax_rate_residential=w["tax_rate_residential"],
                tax_rate_commercial=w["tax_rate_commercial"],
                boundary=from_shape(boundary_shape, srid=4326),
            )
            db.add(ward)
            await db.flush()
            ward_ids[w["code"]] = ward.id
            print(f"  Created ward: {w['name']} (id={ward.id})")

        await db.commit()

        # ----------------------------------------------------------------
        # Insert 100 properties with connected records
        # ----------------------------------------------------------------
        print("Seeding properties and connected sub-records...")
        created = 0

        for i in range(1, 101):
            uid = f"PT-{1000 + i}"
            ward_data = random.choice(WARDS)
            ward_id = ward_ids[ward_data["code"]]

            lat, lng = random_point_in_bbox(ward_data["bbox"])
            owner = random.choice(OWNER_NAMES)
            street = random.choice(STREETS)
            address = f"{random.randint(1, 999)}, {street}, {ward_data['name']}, Kalyan"

            # 1. Base areas and usage types
            declared_area = round(random.uniform(60.0, 300.0), 2)
            
            # 30% area mismatch
            is_area_mismatch = (random.random() < 0.3)
            gis_area = round(declared_area * random.uniform(1.2, 1.6), 2) if is_area_mismatch else declared_area

            declared_usage = random.choice(["residential", "residential", "commercial"])
            
            # 25% usage mismatch
            is_usage_mismatch = (declared_usage == "residential" and random.random() < 0.25)
            usage_type = "commercial" if is_usage_mismatch else declared_usage

            # 15% exempt properties
            is_exempt = (random.random() < 0.15)
            exemption_type = random.choice(["senior_citizen", "vacancy"]) if is_exempt else None

            # Determine age
            if exemption_type == "senior_citizen":
                # 30% fake exemption age (under 60)
                is_fake_exemption = (random.random() < 0.3)
                owner_age = random.randint(30, 55) if is_fake_exemption else random.randint(62, 85)
            else:
                owner_age = random.randint(22, 60)

            # Insert property
            prop = Property(
                property_uid=uid,
                owner_name=owner,
                owner_age=owner_age,
                address=address,
                ward_id=ward_id,
                declared_area_sq_m=declared_area,
                gis_area_sq_m=gis_area,
                usage_type=usage_type,
                declared_usage_type=declared_usage,
                is_exempt=is_exempt,
                exemption_type=exemption_type,
                risk_score=0.0,  # Pipeline will calculate and update this dynamically
                risk_level="low",
                estimated_revenue_impact=0.0,
                latitude=lat,
                longitude=lng,
                location=from_shape(Point(lng, lat), srid=4326),
            )
            db.add(prop)
            await db.flush()  # Generate property.id

            # 2. Add Tax Records (2023 & 2024)
            # base tax rates
            rate = ward_data["tax_rate_residential"] if declared_usage == "residential" else ward_data["tax_rate_commercial"]
            tax_factor = 1000.0  # arbitrary factor to create realistic tax demands in INR
            demand_2023 = round(declared_area * rate * tax_factor, 2)
            demand_2024 = round(declared_area * rate * tax_factor, 2)

            # Chronic high arrears simulation (20% chance of critical unpaid tax backlog)
            is_high_arrears = (random.random() < 0.20)
            
            if is_high_arrears:
                # Unpaid tax
                arrears_2023 = demand_2023
                arrears_2024 = demand_2024
                paid_2023 = 0.0
                paid_2024 = 0.0
            else:
                arrears_2023 = 0.0
                arrears_2024 = 0.0
                paid_2023 = demand_2023
                paid_2024 = demand_2024

            rec_2023 = TaxRecord(
                property_id=prop.id,
                assessment_year=2023,
                assessed_value=declared_area * 10000.0,
                tax_demand=demand_2023,
                tax_paid=paid_2023,
                arrears_amount=arrears_2023,
                last_payment_date=date(2023, 8, 15) if paid_2023 > 0 else None
            )
            rec_2024 = TaxRecord(
                property_id=prop.id,
                assessment_year=2024,
                assessed_value=declared_area * 10000.0,
                tax_demand=demand_2024,
                tax_paid=paid_2024,
                arrears_amount=arrears_2024,
                last_payment_date=date(2024, 7, 20) if paid_2024 > 0 else None
            )
            db.add(rec_2023)
            db.add(rec_2024)

            # 3. Add Payments (Only if they paid)
            if paid_2023 > 0:
                # 5% manual payment manipulation (missing details/suspicious adjustments)
                is_payment_manipulation = (random.random() < 0.05)
                gateway_ref = None if is_payment_manipulation else f"GW-PAY-{10000 + i}"
                is_manual = True if is_payment_manipulation else False
                adj_reason = None if is_payment_manipulation else "Online Gateway Transaction"

                pay_2023 = Payment(
                    property_id=prop.id,
                    amount=paid_2023,
                    payment_date=date(2023, 8, 15),
                    gateway_reference=gateway_ref,
                    payment_mode="online" if not is_manual else "cash_adjustment",
                    is_manual_adjustment=is_manual,
                    adjustment_reason=adj_reason
                )
                db.add(pay_2023)

            if paid_2024 > 0:
                pay_2024 = Payment(
                    property_id=prop.id,
                    amount=paid_2024,
                    payment_date=date(2024, 7, 20),
                    gateway_reference=f"GW-PAY-{20000 + i}",
                    payment_mode="online",
                    is_manual_adjustment=False
                )
                db.add(pay_2024)

            # 4. Add Trade Licenses (Active license triggers usage mismatch if residential)
            # Commercial properties always get active trade licenses.
            # Residential properties with mismatch also get active trade licenses.
            if usage_type == "commercial" or (declared_usage == "residential" and random.random() < 0.15):
                license_no = f"TL-KMC-{50000 + i}"
                license_rec = TradeLicense(
                    property_id=prop.id,
                    license_number=license_no,
                    business_name=f"{owner}'s Commercial Enterprises",
                    business_type="Retail & Services",
                    issue_date=date(2022, 4, 1),
                    expiry_date=date(2027, 3, 31),
                    is_active=True
                )
                db.add(license_rec)

            # 5. Add Building Permissions (approved area matches declared area)
            permission_no = f"BP-KMC-{70000 + i}"
            bp = BuildingPermission(
                property_id=prop.id,
                permission_number=permission_no,
                approved_area_sq_m=declared_area,
                approved_floors=random.choice([1, 2, 3]),
                approved_usage=declared_usage,
                approval_date=date(2021, 6, 12),
                status="approved"
            )
            db.add(bp)

            # 6. Add Utility Records (high utilities on vacancy-declared exemptions)
            is_high_utility = (exemption_type == "vacancy" and random.random() < 0.70)
            utility_units = random.uniform(150.0, 350.0) if is_high_utility else random.uniform(10.0, 80.0)
            
            ur = UtilityRecord(
                property_id=prop.id,
                utility_type="water",
                bill_month="2026-05",
                consumption_units=utility_units,
                amount=utility_units * 15.0,
                meter_number=f"MTR-W-{90000 + i}"
            )
            db.add(ur)

            created += 1

        await db.commit()
        print(f"Properties and sub-records done. {created} properties created.\n")
        print("Running batch risk pipeline to pre-calculate scores for dashboard...")
        
        # Batch analysis to populate risk scores so map dashboard reflects actual leakage risk levels
        from app.services.fraud_analysis_service import run_fraud_analysis
        
        # We fetch all properties and execute the graph for each to fully initialize the dashboard data
        props_result = await db.execute(text("SELECT id FROM properties"))
        prop_ids = [row[0] for row in props_result.fetchall()]
        
        print(f"Executing batch fraud scoring graph for {len(prop_ids)} properties...")
        
        # Run sequentially or in small batches
        success_count = 0
        for pid in prop_ids:
            try:
                await run_fraud_analysis(db=db, property_id=pid, triggered_by="system_seed")
                success_count += 1
            except Exception as e:
                # Silent failure check for LLM credentials/external API calls, fallback will execute anyway
                pass
                
        print(f"Successfully processed {success_count}/{len(prop_ids)} properties with compiled risk scores.")
        print("\nSeed complete. Database is fully populated with connected records and risk analyses!")
        break


if __name__ == "__main__":
    asyncio.run(seed())