# Municipal Revenue Leakage Intelligence System

Production-oriented scaffold for detecting municipal property-tax leakage, under-assessment, unauthorized construction, fake exemptions, payment manipulation, occupancy mismatch, and revenue loss using FastAPI, PostGIS, Redis, Qdrant, GIS APIs, rule-based scoring, and LangGraph agents.

## Week Build Scope

- Day 1: Docker Compose, FastAPI, PostgreSQL + PostGIS, Redis, Qdrant, JWT auth, users/roles, property models, health checks, Alembic.
- Day 2: Municipal data models and APIs for tax records, payments, utility records, trade licenses, building permissions, investigations, audit/event tables.
- Day 3: GIS/map APIs for property markers, risk heatmap, ward summaries, spatial data storage, and officer endpoint scaffold.
- Day 4: Fraud detection engine for area mismatch, usage mismatch, unauthorized construction, fake exemptions, arrears manipulation, payment irregularities, duplicate-record review, and occupancy mismatch.
- Day 5: LangGraph workflow with eight agents for validation, analysis, scoring, evidence summary, and notifications.
- Day 6: GIS feature — added geometry columns (latitude, longitude, PostGIS point) to properties and ward boundary polygon to wards. Seeded 6 dummy wards with boundary coordinates and 100 dummy properties with real lat/lng and risk scores. Built 4 map API endpoints (property markers, heatmap, ward boundaries, ward summary). 
Built Leaflet map frontend with ward polygons, colour-coded risk markers, clickable property popups, and heatmap toggle.


## Run

```bash
cp .env.example .env
docker compose up --build
```

API docs:

```text
http://localhost:8000/docs
```

Nginx proxy:

```text
http://localhost:8080
```

## Key Endpoints

```text
GET  /api/v1/health
POST /api/v1/auth/login
POST /api/v1/users
GET  /api/v1/users/me
POST /api/v1/properties
GET  /api/v1/properties
POST /api/v1/municipal/tax-records
POST /api/v1/municipal/payments
POST /api/v1/municipal/utilities
POST /api/v1/municipal/trade-licenses
POST /api/v1/municipal/building-permissions
GET  /api/v1/map/properties
GET  /api/v1/map/heatmap
GET  /api/v1/map/wards
GET  /api/v1/map/officers
POST /api/v1/fraud/properties/{property_id}/analyze
POST /api/v1/agents/properties/{property_id}/run
POST /api/v1/investigations/cases
POST /api/v1/investigations/evidence
POST /api/v1/investigations/assignments
POST /api/v1/investigations/field-verifications
POST /api/v1/investigations/citizen-objections
POST /api/v1/investigations/notifications
```

## Notes

The AI provider integrations are configured as environment variables for Gemini, Groq, and Ollama fallback. The current workflow is deterministic and agent-ready; provider-specific LLM calls can be added behind the existing agent nodes.
