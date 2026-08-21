"""
Seed 5000 properties with realistic Marathi data that triggers every agent.

Distribution designed to produce a visible spread across all risk levels:
  ~30% area mismatch          (agent: area_mismatch_agent)
  ~25% usage mismatch         (agent: usage_verification_agent)
  ~20% high arrears           (agent: high_arrears_agent)
  ~12% fake exemptions        (agent: exemption_audit_agent)
  ~8%  duplicate properties   (agent: duplicate_property_agent)
  ~10% payment manipulation   (agent: payment_analysis_agent)

Property UID format: Z{zone}/{ward_code}/{sequence}  (matches ^Z[\\w/A-Za-z0-9]+$)

Run:
    docker compose exec api python seed_5000.py
    docker compose -p mrlis exec api python seed_5000.py
"""

import asyncio
import random
from datetime import date, timedelta

from geoalchemy2.shape import from_shape
from shapely.geometry import MultiPolygon, Point, Polygon
from sqlalchemy import text

from app.db.session import get_db
from app.models.analysis import AnalysisRun, FraudSignal
from app.models.investigation import CaseStatusHistory, InvestigationCase
from app.models.municipal import (
    BuildingPermission,
    MutationRecord,
    Payment,
    TaxRecord,
    TradeLicense,
    UtilityRecord,
)
from app.models.property import Property
from app.models.ward import Ward

TOTAL = 5000

WARDS = [
    {"name": "प्रभाग क्र. १ - कल्याण पूर्व",  "code": "KE-01", "res": 0.08, "com": 0.12, "bbox": (73.160, 19.230, 73.185, 19.260)},
    {"name": "प्रभाग क्र. २ - कल्याण पश्चिम", "code": "KW-02", "res": 0.08, "com": 0.12, "bbox": (73.120, 19.230, 73.160, 19.260)},
    {"name": "प्रभाग क्र. ३ - डोंबिवली पूर्व",  "code": "DE-03", "res": 0.07, "com": 0.11, "bbox": (73.085, 19.205, 73.120, 19.235)},
    {"name": "प्रभाग क्र. ४ - डोंबिवली पश्चिम", "code": "DW-04", "res": 0.07, "com": 0.11, "bbox": (73.055, 19.205, 73.085, 19.235)},
    {"name": "प्रभाग क्र. ५ - टिटवाळा",         "code": "TW-05", "res": 0.06, "com": 0.10, "bbox": (73.190, 19.280, 73.220, 19.310)},
    {"name": "प्रभाग क्र. ६ - अंबिवली",         "code": "AM-06", "res": 0.06, "com": 0.10, "bbox": (73.140, 19.265, 73.170, 19.295)},
    {"name": "प्रभाग क्र. ७ - भिवंडी",          "code": "BV-07", "res": 0.07, "com": 0.11, "bbox": (73.050, 19.290, 73.080, 19.320)},
    {"name": "प्रभाग क्र. ८ - उल्हासनगर",       "code": "UN-08", "res": 0.08, "com": 0.12, "bbox": (73.150, 19.210, 73.180, 19.240)},
    {"name": "प्रभाग क्र. ९ - बदलापूर",         "code": "BD-09", "res": 0.06, "com": 0.10, "bbox": (73.220, 19.150, 73.260, 19.180)},
    {"name": "प्रभाग क्र. १० - मुरबाड",         "code": "MB-10", "res": 0.05, "com": 0.09, "bbox": (73.290, 19.170, 73.330, 19.200)},
]

MARATHI_FIRST = [
    "राजेश", "सुरेश", "महेश", "रमेश", "विजय", "अनिल", "संतोष", "दिलीप", "नितीन", "प्रकाश",
    "गणेश", "सचिन", "अमित", "राहुल", "संजय", "मनोज", "विकास", "प्रशांत", "अशोक", "दीपक",
    "प्रिया", "सुनीता", "अनिता", "कविता", "पूजा", "मीना", "रेखा", "उषा", "लता", "सुषमा",
    "स्वाती", "माधुरी", "ज्योती", "रश्मी", "शुभांगी", "वैशाली", "मंगला", "सविता", "आशा", "कमल",
    "यशवंत", "बाळासाहेब", "शंकर", "तुकाराम", "पांडुरंग", "दत्तात्रय", "विठ्ठल", "नारायण", "हरिश्चंद्र", "भीमराव",
]

MARATHI_LAST = [
    "शर्मा", "पाटील", "कुलकर्णी", "देसाई", "जोशी", "मोरे", "नाईक", "शिंदे", "जाधव", "चव्हाण",
    "सावंत", "पवार", "गायकवाड", "देशपांडे", "माने", "भोसले", "ठाकूर", "राव", "मेहता", "घाटगे",
    "गोखले", "फडके", "कर्वे", "आपटे", "लेले", "दांडेकर", "भागवत", "केळकर", "वाघ", "कदम",
    "सोनवणे", "बोरसे", "ढोले", "गुप्ते", "धनगर", "बारसे", "ताम्हणे", "इंगळे", "लोखंडे", "निंबाळकर",
]

STREETS = [
    "शिवाजी नगर", "गणेश पेठ", "राम नगर", "लक्ष्मी रोड", "महात्मा गांधी रोड",
    "स्टेशन रोड", "बाजार गल्ली", "गांधी चौक", "नेहरू मार्ग", "टिळक पथ",
    "आंबेडकर रोड", "सरदार पटेल मार्ग", "स्वामी विवेकानंद मार्ग", "शाहू महाराज रोड",
    "छत्रपती शिवाजी मार्ग", "संत तुकाराम नगर", "ज्योतिबा फुले रोड", "दादासाहेब फाळके मार्ग",
    "विठ्ठल रुक्मिणी मंदिर रोड", "महालक्ष्मी मंदिर मार्ग",
]

USAGE_MARATHI = {
    "residential": "निवासी",
    "commercial": "अनिवासी",
    "industrial": "औद्योगिक",
    "mixed": "मिश्र",
    "open_land": "मोकळी जागा",
}

EXEMPTION_TYPES = ["senior_citizen", "vacancy", "religious_trust", "government"]

BUSINESS_NAMES = [
    "श्री गणेश ट्रेडर्स", "जय भवानी इंटरप्रायझेस", "महालक्ष्मी स्टोअर्स",
    "ओम साई एजन्सी", "शिवशक्ती मार्ट", "संजय कम्प्यूटर्स", "प्रतिभा फॅशन्स",
    "राजमाता किराणा", "सह्याद्री हार्डवेअर", "भारत इलेक्ट्रॉनिक्स",
    "पूनम मेडिकल्स", "अक्षय ऑटो पार्ट्स", "दीपज्योती बेकर्स",
    "गोदावरी रेस्टॉरंट", "तुळशी टेक्सटाईल्स",
]


def _bbox_polygon(bbox):
    x0, y0, x1, y1 = bbox
    return MultiPolygon([Polygon([(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)])])


def _rand_point(bbox):
    return random.uniform(bbox[1], bbox[3]), random.uniform(bbox[0], bbox[2])


def _uid(ward_code, seq):
    zone = ward_code.split("-")[0]
    return f"Z{zone}/{ward_code}/{seq:05d}"


async def seed():
    async for db in get_db():
        print("Clearing all tables...")
        await db.execute(text(
            "TRUNCATE TABLE case_status_history, investigation_cases, "
            "fraud_signals, analysis_runs, mutation_records, building_permissions, "
            "trade_licenses, utility_records, payments, tax_records, "
            "properties, wards, users RESTART IDENTITY CASCADE"
        ))
        await db.commit()

        # --- Users ---
        from app.core.security import get_password_hash
        from app.models.user import User, UserRole

        users = [
            User(email="admin@mrlis.gov.in", hashed_password=get_password_hash("officer123"), role=UserRole.admin, is_active=True),
            User(email="officer@mrlis.gov.in", hashed_password=get_password_hash("officer123"), role=UserRole.officer, is_active=True),
            User(email="officer2@mrlis.gov.in", hashed_password=get_password_hash("officer123"), role=UserRole.officer, is_active=True),
        ]
        for u in users:
            db.add(u)
        await db.flush()
        officer_ids = [u.id for u in users if u.role == UserRole.officer]
        print(f"  Created {len(users)} users")

        # --- Wards ---
        ward_map = {}
        for w in WARDS:
            ward = Ward(
                name=w["name"], code=w["code"],
                tax_rate_residential=w["res"], tax_rate_commercial=w["com"],
                boundary=from_shape(_bbox_polygon(w["bbox"]), srid=4326),
            )
            db.add(ward)
            await db.flush()
            ward_map[w["code"]] = ward.id
        await db.commit()
        print(f"  Created {len(WARDS)} wards")

        # --- 5000 Properties ---
        print(f"Seeding {TOTAL} properties with sub-records...")
        batch_size = 500
        prop_count = 0

        # Track owners for duplicate detection
        duplicate_owners = {}

        for i in range(1, TOTAL + 1):
            w = random.choice(WARDS)
            wid = ward_map[w["code"]]
            lat, lng = _rand_point(w["bbox"])

            first = random.choice(MARATHI_FIRST)
            last = random.choice(MARATHI_LAST)
            owner = f"{first} {last}"
            street = random.choice(STREETS)
            house_no = random.randint(1, 999)
            address = f"{house_no}, {street}, {w['name']}"
            uid = _uid(w["code"], i)

            declared_area = round(random.uniform(40.0, 500.0), 2)

            # --- AREA MISMATCH (30%) ---
            is_area_mismatch = random.random() < 0.30
            if is_area_mismatch:
                severity = random.choice(["minor", "significant", "severe"])
                if severity == "minor":
                    gis_area = round(declared_area * random.uniform(1.10, 1.25), 2)
                elif severity == "significant":
                    gis_area = round(declared_area * random.uniform(1.25, 1.50), 2)
                else:
                    gis_area = round(declared_area * random.uniform(1.50, 2.00), 2)
            else:
                gis_area = round(declared_area * random.uniform(0.98, 1.05), 2)

            # --- USAGE MISMATCH (25%) ---
            base_usage = random.choices(
                ["residential", "commercial", "industrial", "mixed", "open_land"],
                weights=[55, 20, 10, 10, 5], k=1
            )[0]
            declared_usage = base_usage

            is_usage_mismatch = random.random() < 0.25
            if is_usage_mismatch and base_usage == "residential":
                actual_usage = "commercial"
            elif is_usage_mismatch and base_usage == "open_land":
                actual_usage = "residential"
            else:
                actual_usage = declared_usage
                is_usage_mismatch = (actual_usage != declared_usage)

            # --- EXEMPTION (12%) ---
            is_exempt = random.random() < 0.12
            exemption_type = random.choice(EXEMPTION_TYPES) if is_exempt else None
            has_exemption_doc = False

            if exemption_type == "senior_citizen":
                is_fake_age = random.random() < 0.40
                owner_age = random.randint(28, 55) if is_fake_age else random.randint(62, 88)
                has_exemption_doc = not is_fake_age and random.random() < 0.50
            elif exemption_type == "vacancy":
                owner_age = random.randint(25, 70)
                has_exemption_doc = random.random() < 0.30
            elif is_exempt:
                owner_age = random.randint(25, 70)
                has_exemption_doc = random.random() < 0.40
            else:
                owner_age = random.randint(22, 75)

            exemption_doc_id = f"EXM/{w['code']}/{random.randint(10000,99999)}" if has_exemption_doc else None

            # --- DUPLICATE (8%) ---
            is_duplicate = random.random() < 0.08
            if is_duplicate and i > 50:
                dup_key = random.choice(list(duplicate_owners.keys())) if duplicate_owners else None
                if dup_key:
                    owner = dup_key
                    if random.random() < 0.5:
                        address = duplicate_owners[dup_key]

            if owner not in duplicate_owners or random.random() < 0.05:
                duplicate_owners[owner] = address

            prop = Property(
                property_uid=uid,
                owner_name=owner,
                owner_age=owner_age,
                address=address,
                ward_id=wid,
                declared_area_sq_m=declared_area,
                gis_area_sq_m=gis_area,
                usage_type=actual_usage,
                declared_usage_type=declared_usage,
                is_exempt=is_exempt,
                exemption_type=exemption_type,
                exemption_document_id=exemption_doc_id,
                risk_score=0.0,
                risk_level="low",
                estimated_revenue_impact=0.0,
                latitude=lat, longitude=lng,
                location=from_shape(Point(lng, lat), srid=4326),
            )
            db.add(prop)
            await db.flush()

            rate = w["res"] if declared_usage == "residential" else w["com"]
            tax_factor = 1000.0

            # --- HIGH ARREARS (20%) ---
            is_high_arrears = random.random() < 0.20
            years = random.choice([
                [2021, 2022, 2023, 2024, 2025, 2026],
                [2023, 2024, 2025, 2026],
                [2025, 2026],
            ])

            for yr in years:
                demand = round(declared_area * rate * tax_factor * random.uniform(0.9, 1.1), 2)
                assessed_val = round(declared_area * random.uniform(8000, 15000), 2)

                if is_high_arrears:
                    partial = random.random()
                    if partial < 0.3:
                        paid = 0.0
                        arrears = demand
                    else:
                        paid = round(demand * random.uniform(0.05, 0.30), 2)
                        arrears = round(demand - paid, 2)
                else:
                    paid = demand
                    arrears = 0.0

                pay_date = date(yr, random.randint(4, 12), random.randint(1, 28)) if paid > 0 else None

                db.add(TaxRecord(
                    property_id=prop.id, assessment_year=yr,
                    assessed_value=assessed_val, tax_demand=demand,
                    tax_paid=paid, arrears_amount=arrears,
                    last_payment_date=pay_date,
                ))

                # --- PAYMENTS ---
                if paid > 0:
                    is_payment_manip = random.random() < 0.10 and is_high_arrears
                    pmode = "Cash" if random.random() < 0.4 else "Online"
                    gw_ref = None if (pmode == "Cash" or is_payment_manip) else str(random.randint(10**9, 10**10 - 1))
                    is_manual = is_payment_manip
                    adj_reason = None if is_manual else None

                    db.add(Payment(
                        property_id=prop.id, amount=paid,
                        payment_date=pay_date,
                        gateway_reference=gw_ref,
                        payment_mode=pmode if not is_manual else "cash_adjustment",
                        is_manual_adjustment=is_manual,
                        adjustment_reason=adj_reason,
                    ))

            # --- TRADE LICENSE (for usage mismatch trigger) ---
            if actual_usage in ("commercial", "industrial", "mixed") or (
                is_usage_mismatch and declared_usage == "residential"
            ):
                db.add(TradeLicense(
                    property_id=prop.id,
                    license_number=f"TL/{w['code']}/{i:05d}",
                    business_name=random.choice(BUSINESS_NAMES),
                    business_type=random.choice(["किरकोळ विक्री", "सेवा", "उत्पादन", "हॉटेल/खानावळ", "वैद्यकीय"]),
                    issue_date=date(random.randint(2019, 2024), random.randint(1, 12), 1),
                    expiry_date=date(2027, 3, 31),
                    is_active=True,
                ))

            # --- BUILDING PERMISSION ---
            db.add(BuildingPermission(
                property_id=prop.id,
                permission_number=f"BP/{w['code']}/{i:05d}",
                approved_area_sq_m=declared_area,
                approved_floors=random.choice([1, 1, 2, 2, 3, 4]),
                approved_usage=USAGE_MARATHI.get(declared_usage, declared_usage),
                approval_date=date(random.randint(2015, 2023), random.randint(1, 12), random.randint(1, 28)),
                status="approved",
            ))

            # --- UTILITY RECORDS (vacancy contradiction) ---
            is_occupied_vacant = exemption_type == "vacancy" and random.random() < 0.70
            for month_offset in range(6):
                m = 6 - month_offset
                bill_month = f"2026-{m:02d}"
                if is_occupied_vacant:
                    units = round(random.uniform(120.0, 400.0), 1)
                elif is_exempt and exemption_type == "vacancy":
                    units = 0.0
                else:
                    units = round(random.uniform(5.0, 100.0), 1)

                db.add(UtilityRecord(
                    property_id=prop.id,
                    utility_type=random.choice(["water", "electricity"]),
                    bill_month=bill_month,
                    consumption_units=units,
                    amount=round(units * random.uniform(8.0, 18.0), 2),
                    meter_number=f"MTR-{w['code'][-2:]}-{i:05d}",
                ))

            # --- MUTATION RECORDS (some properties) ---
            if random.random() < 0.15:
                old_owner = f"{random.choice(MARATHI_FIRST)} {random.choice(MARATHI_LAST)}"
                db.add(MutationRecord(
                    property_id=prop.id,
                    old_owner=old_owner, new_owner=owner,
                    mutation_date=date(random.randint(2020, 2025), random.randint(1, 12), random.randint(1, 28)),
                    mutation_type=random.choice(["sale", "inheritance", "gift"]),
                ))

            prop_count += 1
            if prop_count % batch_size == 0:
                await db.commit()
                print(f"  {prop_count}/{TOTAL} properties committed...")

        await db.commit()
        print(f"  {prop_count}/{TOTAL} properties committed... done.\n")

        # --- Run fraud analysis pipeline ---
        print("Running batch fraud scoring for all properties...")
        from app.services.fraud_analysis_service import run_fraud_analysis

        result = await db.execute(text("SELECT id FROM properties ORDER BY id"))
        all_ids = [r[0] for r in result.fetchall()]

        ok = 0
        fail = 0
        for idx, pid in enumerate(all_ids, 1):
            try:
                await run_fraud_analysis(db=db, property_id=pid, triggered_by="system_seed")
                ok += 1
            except Exception:
                fail += 1
            if idx % 500 == 0:
                print(f"  Scored {idx}/{len(all_ids)} (ok={ok}, fail={fail})")

        print(f"\nFraud scoring complete: {ok} scored, {fail} failed out of {len(all_ids)}.")

        # --- Summary ---
        for row in (await db.execute(text(
            "SELECT risk_level, COUNT(*), ROUND(AVG(risk_score)::numeric, 1), "
            "ROUND(SUM(estimated_revenue_impact)::numeric, 0) "
            "FROM properties GROUP BY risk_level ORDER BY MIN(risk_score)"
        ))).fetchall():
            print(f"  {row[0]:10s}: {row[1]:5d} properties, avg score {row[2]}, total impact ₹{row[3]:,.0f}")

        total_impact = (await db.execute(text(
            "SELECT COALESCE(SUM(estimated_revenue_impact), 0) FROM properties"
        ))).scalar()
        print(f"\n  Total estimated revenue leakage: ₹{total_impact:,.0f}")
        print("\nSeed complete!")
        break


if __name__ == "__main__":
    asyncio.run(seed())
