# Municipal Revenue Leakage Identification System (MRLIS) — Frontend Architecture & Technical Reference

> **Author**: Tejas Rawool  
> **Location**: `mockui/tejas.md`  
> **Last Updated**: August 13, 2026  
> **Status**: Production Audit Complete & Deployment Ready

---

## 1. Executive Summary & Overview

The **Municipal Revenue Leakage Identification System (MRLIS)** frontend is an AI-powered municipal intelligence platform designed for municipal corporations (e.g., KDMC — Kalyan Dombivli Municipal Corporation). It detects revenue leaks across property tax collections using AI agent analysis (LangGraph), satellite GIS comparison (OpenStreetMap/Leaflet), and automated risk scoring.

This document serves as the exhaustive technical reference manual covering architecture, component structures, state management, API integration, styling standards, and audit history.

---

## 2. Technology Stack & Dependencies

| Layer | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Server & Client Components, routing, SSR/SSG |
| **Core Library** | React 19 | UI component architecture and hooks |
| **Language** | TypeScript 5+ | End-to-end type safety |
| **Styling** | Vanilla CSS + Tailwind CSS | Global Navy design system, responsive utility classes |
| **Maps & GIS** | Leaflet 1.9 & `leaflet.heat` | Interactive GIS mapping, ward polygons, risk heatmaps |
| **Data Viz** | Recharts 2.15 | Executive charts, trend analysis, revenue impact graphs |
| **Async State** | TanStack Query (`@tanstack/react-query`) | Server state caching and re-fetching |
| **Icons** | Custom Inline SVG System | Lightweight, scalable vector icons without external overhead |

---

## 3. Directory & Folder Structure

```
mockui/ (or frontend/)
├── app/
│   ├── layout.tsx                 # Root layout & global CSS imports
│   ├── page.tsx                   # Root redirect / landing page
│   ├── login/
│   │   └── page.tsx               # Auth interface & demo credentials handler
│   ├── dashboard/
│   │   └── page.tsx               # Executive KPI overview & risk distribution
│   ├── map/
│   │   └── page.tsx               # GIS Map Analyzer (dynamically loads MapView)
│   ├── cases/
│   │   ├── page.tsx               # Investigation cases list & filtering
│   │   └── [id]/
│   │       └── page.tsx           # Case detail, AI evidence, status history
│   ├── properties/
│   │   ├── page.tsx               # Property registry & area mismatch table
│   │   └── [id]/
│   │       └── page.tsx           # Property detail & satellite comparison
│   ├── reports/
│   │   └── page.tsx               # Executive analytics, charts & exporter
│   ├── ai-assistant/
│   │   └── page.tsx               # LangGraph AI query assistant interface
│   ├── notifications/
│   │   └── page.tsx               # System alerts & activity feed
│   └── settings/
│       └── page.tsx               # AI pipeline config, user roles, security
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Left navigation bar with badge counts
│   │   ├── Header.tsx             # Top bar, search, notifications, profile
│   │   └── DashboardLayout.tsx    # Responsive grid layout wrapper
│   └── MapView.tsx                # Leaflet map component with markers & heatmap
├── lib/
│   ├── api.ts                     # Axios/Fetch API layer with auto 401 handling
│   └── mockData.ts                # Standalone mock dataset (WARDS, PROPERTIES, etc.)
└── public/                        # Static assets, logos, and marker images
```

---

## 4. Design System & Theme Guidelines

### 4.1 Primary Color Palette
The UI follows a standardized, authoritative Municipal Navy aesthetic:
* **Primary Accent**: `#1d4ed8` (Royal Navy Blue)
* **Dark Navy / Header Accent**: `#1e3a8a`
* **Background Surface**: `#f8f9fb`
* **Card Background**: `#ffffff`
* **Text Primary**: `#141822`
* **Text Muted**: `#8b92a5`
* **Border Color**: `#e3e6eb`

### 4.2 Risk Level Standard Tokens
Risk scores (0–100) and severity levels use unified color coding across all screens:
* 🔴 **Critical** (Score ≥ 75): `#b91c1c` / `#ef4444` (Background: `#fef2f2`)
* 🟠 **High** (Score 50–74): `#c2410c` / `#f97316` (Background: `#fff7ed`)
* 🟡 **Medium** (Score 25–49): `#a16207` / `#eab308` (Background: `#fefce8`)
* 🟢 **Low** (Score < 25): `#15803d` / `#22c55e` (Background: `#f0fdf4`)

### 4.3 Case Status Tokens
* `new`: `#1d4ed8` (New Detection)
* `under_review`: `#b45309` (Under Review)
* `field_inspection`: `#0284c7` (Field Verification)
* `reassessment`: `#5b21b6` (Reassessment Pending)
* `disputed`: `#b91c1c` (Owner Dispute)
* `closed`: `#15803d` (Case Closed / Revenue Recovered)

---

## 5. Screen-by-Screen Functional Specifications

### 5.1 Dashboard (`/dashboard`)
* **KPI Metrics Bar**: Displays Total Risk at Risk (₹), Active Cases, Pending Reassessments, and Revenue Recovered.
* **Risk Score Distribution**: Recharts bar chart showing property count per risk tier.
* **Ward Risk Table**: Aggregated risk scores and revenue impact across all 9 municipal wards.
* **Recent Critical Cases**: Quick access list for high-priority property anomalies.

### 5.2 GIS Map Analyzer (`/map`)
* **Interactive Map**: Centered on Kalyan-Dombivli (`[19.2403, 73.1305]`).
* **Ward Polygons**: Interactive GeoJSON polygons highlighting ward boundaries. Clicking a ward opens a summary drawer.
* **Property Pins**: Circle markers color-coded by risk level. Clicking a pin loads owner details, declared vs. GIS area, and risk score.
* **Heatmap Toggle**: Dynamic switch to Leaflet Heatmap overlay demonstrating leakage density across the city.
* **SSR Safety**: Loaded via `next/dynamic` with `ssr: false` to ensure server rendering compatibility.

### 5.3 Case Management (`/cases` & `/cases/[id]`)
* **Filter & Search Bar**: Filter by Ward, Risk Level, Case Status, or Officer.
* **Tabbed Detail View**:
  * **Overview**: Property UID, owner details, declared vs. GIS area comparison.
  * **AI Evidence**: LangGraph pipeline headline, detailed breakdown, recommended actions, and next steps.
  * **Fraud Signals**: Visual breakdown of individual signals (Area Mismatch, Usage Mismatch, Unverified Exemption, Unexplained Adjustments).
  * **History**: Audit trail of status transitions with officer timestamps and remarks.

### 5.4 Property Registry (`/properties` & `/properties/[id]`)
* **Area Mismatch Calculator**: Calculates percentage discrepancy: `((GIS_Area - Declared_Area) / Declared_Area) * 100`.
* **Satellite vs. Declared Comparison**: Visual card highlighting under-reported constructed areas.
* **Exemption Audit**: Checks widow/senior citizen exemption status against verification requirements.

### 5.5 Analytics & Reports (`/reports`)
* **Revenue Leakage Breakdown**: Pie chart of leakages by category (Area Under-Declaration, Commercial Misclassification, Invalid Exemptions).
* **Ward Recovery Comparison**: Grouped bar charts showing identified vs. recovered revenue per ward.
* **Export Actions**: Export report data in PDF or CSV format.

### 5.6 AI Assistant (`/ai-assistant`)
* **LangGraph Chat Interface**: Interactive assistant allowing officers to query revenue data.
* **Preset Queries**: Quick-launch buttons for top fraud patterns, ward risk rankings, and case summaries.

### 5.7 Notifications & Settings (`/notifications` & `/settings`)
* **Notifications**: Filterable alert log (Alerts, Payments, Cases, System Updates).
* **Settings Tabs**: Profile management, LLM pipeline config (Groq / Ollama keys), fraud detection thresholds, user roles table, database connection strings, and security secret key management.

---

## 6. Data & API Layer Architecture

### 6.1 Authentication Token Flow
Authentication uses JWT tokens (`mrlis_token`):
1. User logs in via `/login`.
2. `mrlis_token` is stored in `localStorage`.
3. `lib/api.ts` attaches `Authorization: Bearer <token>` to all HTTP requests sent to `/api/v1`.
4. If an API returns `401 Unauthorized`, `lib/api.ts` automatically clears `localStorage` and redirects the user to `/login`.

### 6.2 Resilient Offline & Demo Fallback Strategy
To guarantee uninterrupted operation during frontend evaluation or backend downtime, every page and component contains a robust fallback pattern:
```typescript
try {
  const data = await apiFetch('/cases')
  setCases(data)
} catch (err) {
  console.warn('API unavailable, loading local fallback mock data')
  setCases(INVESTIGATION_CASES) // Imported from lib/mockData.ts
}
```

---

## 7. Audit & Stability Fixes History

During the frontend technical audit, the following key issues were resolved:

1. **Leaflet Heatmap Script Cleanup**:
   * **Problem**: Injected script tags repeatedly into `document.head` on re-renders.
   * **Fix**: Added script existence checks (`document.querySelector('script[src*="leaflet-heat"]')`) and unmount cleanup logic in `MapView.tsx`.
2. **Map Page Integration**:
   * **Problem**: `app/map/page.tsx` previously contained a static SVG placeholder.
   * **Fix**: Replaced with functional `MapView` component loaded via Next.js dynamic import (`ssr: false`).
3. **Login Token Storage**:
   * **Problem**: Demo login bypassed `localStorage` token storage.
   * **Fix**: Added `localStorage.setItem('mrlis_token', 'demo-token-123')` before routing to `/dashboard`.
4. **String Safety**:
   * **Problem**: Officer name splitting broke if names were unassigned or empty.
   * **Fix**: Added null-safe guards across case detail headers and tables.

---

## 8. Build & Deployment Commands

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Execute Next.js production build verification
npm run build

# Start production server
npm run start
```

---

*This document is maintained as part of the MRLIS core documentation package.*
