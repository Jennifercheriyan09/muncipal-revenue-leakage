// ─── Types ────────────────────────────────────────────────────────────────────
export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low'
export type CaseStatus = 'new' | 'under_review' | 'field_inspection' | 'reassessment' | 'disputed' | 'closed'
export type UserRole = 'admin' | 'officer' | 'field'

export interface Ward {
  id: number
  name: string
  code: string
  tax_rate_residential: number
  tax_rate_commercial: number
  total_cases: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  avg_risk_score: number
}

export interface Property {
  id: number
  property_uid: string
  owner_name: string
  owner_age: number
  address: string
  ward_id: number
  ward_name: string
  declared_area_sq_m: number
  gis_area_sq_m: number
  usage_type: string
  declared_usage_type: string
  is_exempt: boolean
  exemption_type: string | null
  risk_score: number
  risk_level: RiskLevel
  estimated_revenue_impact: number
  created_at: string
  updated_at: string
}

export interface FraudSignal {
  fraud_type: string
  category: string
  title: string
  score_contribution: number
  severity: 'low' | 'medium' | 'high'
  evidence: string
  impact_label: string
  departments_involved: string[]
}

export interface AnalysisRun {
  id: number
  property_id: number
  triggered_by: string
  risk_score: number
  risk_level: RiskLevel
  headline: string
  evidence_summary: string
  recommended_action: string
  revenue_impact_estimate: number
  fraud_signals: FraudSignal[]
  recommended_actions: string[]
  departments_involved: string[]
  next_step: string
  created_at: string
}

export interface StatusHistory {
  id: number
  old_status: string | null
  new_status: string
  officer_id: number
  officer_name: string
  remark: string
  changed_at: string
}

export interface InvestigationCase {
  id: number
  property_id: number
  property_uid: string
  owner_name: string
  ward_name: string
  analysis_run_id: number
  status: CaseStatus
  assigned_officer_id: number | null
  assigned_officer_name: string | null
  revenue_impact_estimate: number
  revenue_recovered: number
  risk_level: RiskLevel
  risk_score: number
  created_at: string
  updated_at: string
  status_history: StatusHistory[]
}

export interface Officer {
  id: number
  name: string
  email: string
  role: UserRole
  ward_id: number
  ward_name: string
  active_cases: number
  avatar_color: string
}

export interface DashboardStats {
  total_cases: number
  total_revenue_at_risk: number
  urgent_cases: number
  recovered_revenue: number
  cases_this_month: number
  avg_risk_score: number
  properties_analyzed: number
  wards_covered: number
}

// ─── Wards ────────────────────────────────────────────────────────────────────
export const WARDS: Ward[] = [
  { id: 1, name: 'Ward No. 1 – Kalyan East', code: 'W01', tax_rate_residential: 0.12, tax_rate_commercial: 0.18, total_cases: 24, critical_count: 6, high_count: 9, medium_count: 7, low_count: 2, avg_risk_score: 74 },
  { id: 2, name: 'Ward No. 2 – Dombivli North', code: 'W02', tax_rate_residential: 0.11, tax_rate_commercial: 0.17, total_cases: 18, critical_count: 4, high_count: 7, medium_count: 5, low_count: 2, avg_risk_score: 68 },
  { id: 3, name: 'Ward No. 3 – Ambivali', code: 'W03', tax_rate_residential: 0.10, tax_rate_commercial: 0.16, total_cases: 15, critical_count: 3, high_count: 5, medium_count: 6, low_count: 1, avg_risk_score: 61 },
  { id: 4, name: 'Ward No. 4 – Titwala', code: 'W04', tax_rate_residential: 0.09, tax_rate_commercial: 0.15, total_cases: 12, critical_count: 2, high_count: 4, medium_count: 4, low_count: 2, avg_risk_score: 55 },
  { id: 5, name: 'Ward No. 5 – Ulhasnagar', code: 'W05', tax_rate_residential: 0.13, tax_rate_commercial: 0.20, total_cases: 31, critical_count: 8, high_count: 12, medium_count: 8, low_count: 3, avg_risk_score: 79 },
  { id: 6, name: 'Ward No. 6 – Dombivli South', code: 'W06', tax_rate_residential: 0.11, tax_rate_commercial: 0.17, total_cases: 20, critical_count: 5, high_count: 8, medium_count: 5, low_count: 2, avg_risk_score: 71 },
  { id: 7, name: 'Ward No. 7 – Shahapur', code: 'W07', tax_rate_residential: 0.08, tax_rate_commercial: 0.14, total_cases: 9, critical_count: 1, high_count: 3, medium_count: 4, low_count: 1, avg_risk_score: 44 },
  { id: 8, name: 'Ward No. 8 – Badlapur', code: 'W08', tax_rate_residential: 0.09, tax_rate_commercial: 0.15, total_cases: 11, critical_count: 2, high_count: 4, medium_count: 3, low_count: 2, avg_risk_score: 52 },
  { id: 9, name: 'Ward No. 9 – Ambernath', code: 'W09', tax_rate_residential: 0.10, tax_rate_commercial: 0.16, total_cases: 16, critical_count: 3, high_count: 6, medium_count: 5, low_count: 2, avg_risk_score: 62 },
]

// ─── Officers ─────────────────────────────────────────────────────────────────
export const OFFICERS: Officer[] = [
  { id: 1, name: 'Arjun Deshmukh',   email: 'a.deshmukh@kdmc.gov.in',  role: 'admin',   ward_id: 1, ward_name: 'Ward 01', active_cases: 12, avatar_color: '#6366f1' },
  { id: 2, name: 'Priya Sharma',     email: 'p.sharma@kdmc.gov.in',    role: 'officer', ward_id: 2, ward_name: 'Ward 02', active_cases: 8,  avatar_color: '#ec4899' },
  { id: 3, name: 'Rahul Patil',      email: 'r.patil@kdmc.gov.in',     role: 'officer', ward_id: 3, ward_name: 'Ward 03', active_cases: 6,  avatar_color: '#0ea5e9' },
  { id: 4, name: 'Sneha Kulkarni',   email: 's.kulkarni@kdmc.gov.in',  role: 'officer', ward_id: 5, ward_name: 'Ward 05', active_cases: 15, avatar_color: '#f97316' },
  { id: 5, name: 'Vikram Joshi',     email: 'v.joshi@kdmc.gov.in',     role: 'field',   ward_id: 6, ward_name: 'Ward 06', active_cases: 5,  avatar_color: '#22c55e' },
]

// ─── Properties ───────────────────────────────────────────────────────────────
export const PROPERTIES: Property[] = [
  { id: 1,  property_uid: 'KDMC-2024-00142', owner_name: 'Ramesh Gupta',       owner_age: 58, address: '14B, Shivaji Nagar, Kalyan East', ward_id: 1, ward_name: 'Ward 01', declared_area_sq_m: 120,  gis_area_sq_m: 214,  usage_type: 'commercial', declared_usage_type: 'residential', is_exempt: false, exemption_type: null, risk_score: 91, risk_level: 'Critical', estimated_revenue_impact: 182000, created_at: '2024-03-15T10:00:00Z', updated_at: '2024-07-20T14:30:00Z' },
  { id: 2,  property_uid: 'KDMC-2024-00289', owner_name: 'Sunita Mehta',       owner_age: 45, address: '7, Ram Nagar, Dombivli North',   ward_id: 2, ward_name: 'Ward 02', declared_area_sq_m: 200,  gis_area_sq_m: 198,  usage_type: 'residential', declared_usage_type: 'residential', is_exempt: true,  exemption_type: 'Widow', risk_score: 83, risk_level: 'Critical', estimated_revenue_impact: 95000,  created_at: '2024-04-01T08:00:00Z', updated_at: '2024-07-18T11:00:00Z' },
  { id: 3,  property_uid: 'KDMC-2024-00371', owner_name: 'Manoj Tiwari',       owner_age: 62, address: '22, MG Road, Ulhasnagar',        ward_id: 5, ward_name: 'Ward 05', declared_area_sq_m: 450,  gis_area_sq_m: 780,  usage_type: 'industrial', declared_usage_type: 'commercial', is_exempt: false, exemption_type: null, risk_score: 88, risk_level: 'Critical', estimated_revenue_impact: 320000, created_at: '2024-02-10T09:00:00Z', updated_at: '2024-07-22T16:00:00Z' },
  { id: 4,  property_uid: 'KDMC-2024-00455', owner_name: 'Lata Desai',         owner_age: 71, address: '5, Anand Park, Ambivali',        ward_id: 3, ward_name: 'Ward 03', declared_area_sq_m: 90,   gis_area_sq_m: 91,   usage_type: 'residential', declared_usage_type: 'residential', is_exempt: true,  exemption_type: 'Senior Citizen', risk_score: 76, risk_level: 'High', estimated_revenue_impact: 58000,  created_at: '2024-05-12T11:00:00Z', updated_at: '2024-07-15T10:00:00Z' },
  { id: 5,  property_uid: 'KDMC-2024-00512', owner_name: 'Dinesh Shah',        owner_age: 49, address: '88, Industrial Estate, Ulhasnagar', ward_id: 5, ward_name: 'Ward 05', declared_area_sq_m: 310,  gis_area_sq_m: 420,  usage_type: 'commercial', declared_usage_type: 'commercial', is_exempt: false, exemption_type: null, risk_score: 79, risk_level: 'High', estimated_revenue_impact: 145000, created_at: '2024-03-28T14:00:00Z', updated_at: '2024-07-21T09:00:00Z' },
  { id: 6,  property_uid: 'KDMC-2024-00634', owner_name: 'Kavita Joshi',       owner_age: 38, address: '3B, Tilak Nagar, Dombivli South', ward_id: 6, ward_name: 'Ward 06', declared_area_sq_m: 150,  gis_area_sq_m: 148,  usage_type: 'residential', declared_usage_type: 'residential', is_exempt: false, exemption_type: null, risk_score: 62, risk_level: 'Medium', estimated_revenue_impact: 32000,  created_at: '2024-06-01T12:00:00Z', updated_at: '2024-07-10T08:00:00Z' },
  { id: 7,  property_uid: 'KDMC-2024-00701', owner_name: 'Prakash Nair',       owner_age: 55, address: '17, Station Road, Kalyan East',   ward_id: 1, ward_name: 'Ward 01', declared_area_sq_m: 500,  gis_area_sq_m: 502,  usage_type: 'commercial', declared_usage_type: 'commercial', is_exempt: false, exemption_type: null, risk_score: 71, risk_level: 'High', estimated_revenue_impact: 88000,  created_at: '2024-04-20T10:00:00Z', updated_at: '2024-07-19T13:00:00Z' },
  { id: 8,  property_uid: 'KDMC-2024-00823', owner_name: 'Meena Rao',          owner_age: 43, address: '9, Saraswati Colony, Ambernath',  ward_id: 9, ward_name: 'Ward 09', declared_area_sq_m: 180,  gis_area_sq_m: 179,  usage_type: 'residential', declared_usage_type: 'residential', is_exempt: false, exemption_type: null, risk_score: 45, risk_level: 'Medium', estimated_revenue_impact: 21000,  created_at: '2024-07-01T09:00:00Z', updated_at: '2024-07-14T11:00:00Z' },
  { id: 9,  property_uid: 'KDMC-2024-00944', owner_name: 'Suresh Pawar',       owner_age: 66, address: '2, New Colony, Badlapur',         ward_id: 8, ward_name: 'Ward 08', declared_area_sq_m: 75,   gis_area_sq_m: 76,   usage_type: 'residential', declared_usage_type: 'residential', is_exempt: true,  exemption_type: 'Ex-Serviceman', risk_score: 68, risk_level: 'High', estimated_revenue_impact: 44000,  created_at: '2024-05-05T13:00:00Z', updated_at: '2024-07-16T14:00:00Z' },
  { id: 10, property_uid: 'KDMC-2024-01012', owner_name: 'Anjali Verma',       owner_age: 34, address: '45, Green Park, Titwala',         ward_id: 4, ward_name: 'Ward 04', declared_area_sq_m: 220,  gis_area_sq_m: 218,  usage_type: 'residential', declared_usage_type: 'residential', is_exempt: false, exemption_type: null, risk_score: 28, risk_level: 'Low',    estimated_revenue_impact: 9000,   created_at: '2024-07-10T10:00:00Z', updated_at: '2024-07-13T09:00:00Z' },
  { id: 11, property_uid: 'KDMC-2024-01134', owner_name: 'Vikas Bhosale',      owner_age: 51, address: '67, Nagar Road, Ulhasnagar',      ward_id: 5, ward_name: 'Ward 05', declared_area_sq_m: 380,  gis_area_sq_m: 510,  usage_type: 'commercial', declared_usage_type: 'residential', is_exempt: false, exemption_type: null, risk_score: 85, risk_level: 'Critical', estimated_revenue_impact: 210000, created_at: '2024-03-01T08:00:00Z', updated_at: '2024-07-22T10:00:00Z' },
  { id: 12, property_uid: 'KDMC-2024-01278', owner_name: 'Rekha Patil',        owner_age: 47, address: '12, Shastri Nagar, Kalyan East',  ward_id: 1, ward_name: 'Ward 01', declared_area_sq_m: 160,  gis_area_sq_m: 162,  usage_type: 'residential', declared_usage_type: 'residential', is_exempt: false, exemption_type: null, risk_score: 38, risk_level: 'Low',    estimated_revenue_impact: 12000,  created_at: '2024-06-15T11:00:00Z', updated_at: '2024-07-12T08:00:00Z' },
]

// ─── Fraud signals per property ───────────────────────────────────────────────
export const FRAUD_SIGNALS: Record<number, FraudSignal[]> = {
  1: [
    { fraud_type: 'area_mismatch', category: 'GIS', title: 'Area Under-Declaration', score_contribution: 35, severity: 'high', evidence: 'Declared 120 m² but GIS satellite measurement shows 214 m² — 78% discrepancy exceeding 20% threshold.', impact_label: '₹1.1L/yr', departments_involved: ['GIS Cell', 'Property Tax'] },
    { fraud_type: 'usage_mismatch', category: 'Usage', title: 'Commercial Use Declared Residential', score_contribution: 30, severity: 'high', evidence: 'Trade license active for "Ramesh Electronics" at this address. Declared as residential but utility consumption (3,200 kWh/month) matches commercial pattern.', impact_label: '₹62K/yr', departments_involved: ['Trade License', 'Property Tax'] },
    { fraud_type: 'high_arrears', category: 'Payment', title: 'Unpaid Arrears ₹26,000', score_contribution: 26, severity: 'medium', evidence: 'Tax demand ₹52,000 for FY 2023-24. Only ₹26,000 paid. Arrears outstanding since April 2024.', impact_label: '₹26K arrears', departments_involved: ['Revenue Collection'] },
  ],
  2: [
    { fraud_type: 'exemption_audit', category: 'Exemption', title: 'Unverified Widow Exemption', score_contribution: 45, severity: 'high', evidence: 'Widow exemption claimed but no supporting document ID on record. Utility consumption (1,800 kWh/month) and trade license for "Mehta Boutique" suggest active commercial activity.', impact_label: '₹48K/yr', departments_involved: ['Exemption Cell', 'Revenue'] },
    { fraud_type: 'duplicate_property', category: 'Duplicate', title: 'Potential Duplicate Record', score_contribution: 38, severity: 'high', evidence: 'Semantic similarity score 0.92 with property KDMC-2024-00291 at 8, Ram Nagar — same owner name, overlapping address.', impact_label: '₹47K/yr', departments_involved: ['Survey Dept', 'GIS Cell'] },
  ],
  3: [
    { fraud_type: 'area_mismatch', category: 'GIS', title: 'Massive Area Under-Declaration', score_contribution: 40, severity: 'high', evidence: 'Declared 450 m² vs 780 m² GIS measurement — 73% under-reporting. New construction wing visible in satellite imagery, not declared.', impact_label: '₹2.1L/yr', departments_involved: ['GIS Cell', 'Building Dept'] },
    { fraud_type: 'usage_mismatch', category: 'Usage', title: 'Industrial Use Declared Commercial', score_contribution: 28, severity: 'medium', evidence: 'Power meter data shows 3-phase industrial load. Declared as "commercial godown" but operational as manufacturing unit.', impact_label: '₹1.1L/yr', departments_involved: ['Electricity Dept', 'Trade License'] },
    { fraud_type: 'payment_manipulation', category: 'Payment', title: 'Suspicious Manual Adjustments', score_contribution: 20, severity: 'medium', evidence: '3 manual payment adjustments totaling ₹45,000 with reason "data correction" in the past 6 months. All processed by the same officer.', impact_label: '₹45K adj.', departments_involved: ['Revenue Collection', 'Audit'] },
  ],
  11: [
    { fraud_type: 'area_mismatch', category: 'GIS', title: 'Area Under-Declaration', score_contribution: 38, severity: 'high', evidence: 'Declared 380 m² vs GIS 510 m² — 34% discrepancy. Additional floor construction detected.', impact_label: '₹98K/yr', departments_involved: ['GIS Cell', 'Building Dept'] },
    { fraud_type: 'usage_mismatch', category: 'Usage', title: 'Commercial Use Declared Residential', score_contribution: 32, severity: 'high', evidence: '4 active trade licenses associated with this address. Electricity consumption 5× residential average.', impact_label: '₹1.12L/yr', departments_involved: ['Trade License', 'Property Tax'] },
    { fraud_type: 'high_arrears', category: 'Payment', title: 'Arrears ₹38,500', score_contribution: 15, severity: 'medium', evidence: 'Unpaid tax demand since FY 2022-23. Multiple payment notices sent, no response.', impact_label: '₹38.5K arrears', departments_involved: ['Revenue Collection'] },
  ],
}

// ─── Analysis runs ────────────────────────────────────────────────────────────
export const ANALYSIS_RUNS: Record<number, AnalysisRun> = {
  1: {
    id: 101, property_id: 1, triggered_by: 'api', risk_score: 91, risk_level: 'Critical',
    headline: '🔴 Critical Risk · 3 fraud signals detected',
    evidence_summary: '• Area 78% under-declared (120→214 m²)\n• Commercial use declared as residential\n• Arrears ₹26,000 outstanding since April 2024',
    recommended_action: 'Immediate field inspection and reassessment notice',
    revenue_impact_estimate: 182000,
    fraud_signals: FRAUD_SIGNALS[1],
    recommended_actions: ['Issue reassessment notice within 7 days', 'Schedule field inspection with GIS officer', 'Recover outstanding arrears ₹26,000', 'Verify trade license status'],
    departments_involved: ['GIS Cell', 'Property Tax', 'Trade License', 'Revenue Collection'],
    next_step: 'Issue formal reassessment notice — use Form PT-14 with GIS evidence attached',
    created_at: '2024-07-20T14:30:00Z',
  },
  2: {
    id: 102, property_id: 2, triggered_by: 'api', risk_score: 83, risk_level: 'Critical',
    headline: '🔴 Critical Risk · 2 fraud signals detected',
    evidence_summary: '• Widow exemption unverified — no document ID on record\n• Possible duplicate record with KDMC-2024-00291',
    recommended_action: 'Verify exemption documents and merge duplicate records',
    revenue_impact_estimate: 95000,
    fraud_signals: FRAUD_SIGNALS[2],
    recommended_actions: ['Demand exemption documents within 15 days', 'Investigate duplicate property KDMC-2024-00291', 'Cross-check with trade license database'],
    departments_involved: ['Exemption Cell', 'Revenue', 'Survey Dept', 'GIS Cell'],
    next_step: 'Send notice for exemption document submission — Form EX-7',
    created_at: '2024-07-18T11:00:00Z',
  },
  3: {
    id: 103, property_id: 3, triggered_by: 'api', risk_score: 88, risk_level: 'Critical',
    headline: '🔴 Critical Risk · 3 fraud signals detected',
    evidence_summary: '• Area 73% under-declared (450→780 m²)\n• Industrial use declared commercial\n• 3 suspicious manual payment adjustments',
    recommended_action: 'Emergency field inspection, payment audit, and industrial usage verification',
    revenue_impact_estimate: 320000,
    fraud_signals: FRAUD_SIGNALS[3],
    recommended_actions: ['Emergency field inspection within 48 hours', 'Audit all manual payment adjustments', 'Verify industrial vs commercial classification', 'Escalate to municipal commissioner'],
    departments_involved: ['GIS Cell', 'Building Dept', 'Electricity Dept', 'Revenue Collection', 'Audit'],
    next_step: 'Escalate to ward officer for emergency field inspection — use Form FI-2',
    created_at: '2024-07-22T16:00:00Z',
  },
}

// ─── Investigation cases ───────────────────────────────────────────────────────
export const CASES: InvestigationCase[] = [
  {
    id: 1, property_id: 1, property_uid: 'KDMC-2024-00142', owner_name: 'Ramesh Gupta', ward_name: 'Ward 01',
    analysis_run_id: 101, status: 'field_inspection', assigned_officer_id: 2, assigned_officer_name: 'Priya Sharma',
    revenue_impact_estimate: 182000, revenue_recovered: 0, risk_level: 'Critical', risk_score: 91,
    created_at: '2024-07-20T14:30:00Z', updated_at: '2024-07-23T09:00:00Z',
    status_history: [
      { id: 1, old_status: null, new_status: 'new', officer_id: 1, officer_name: 'Arjun Deshmukh', remark: 'Case opened by AI pipeline — Critical risk detected', changed_at: '2024-07-20T14:30:00Z' },
      { id: 2, old_status: 'new', new_status: 'under_review', officer_id: 1, officer_name: 'Arjun Deshmukh', remark: 'Reviewed GIS evidence. Area mismatch confirmed. Assigning to Ward 01 officer.', changed_at: '2024-07-21T10:15:00Z' },
      { id: 3, old_status: 'under_review', new_status: 'field_inspection', officer_id: 2, officer_name: 'Priya Sharma', remark: 'Field inspection scheduled for 25 July. Trade license cross-check initiated.', changed_at: '2024-07-23T09:00:00Z' },
    ],
  },
  {
    id: 2, property_id: 2, property_uid: 'KDMC-2024-00289', owner_name: 'Sunita Mehta', ward_name: 'Ward 02',
    analysis_run_id: 102, status: 'under_review', assigned_officer_id: 2, assigned_officer_name: 'Priya Sharma',
    revenue_impact_estimate: 95000, revenue_recovered: 0, risk_level: 'Critical', risk_score: 83,
    created_at: '2024-07-18T11:00:00Z', updated_at: '2024-07-22T14:00:00Z',
    status_history: [
      { id: 4, old_status: null, new_status: 'new', officer_id: 1, officer_name: 'Arjun Deshmukh', remark: 'Case opened — unverified widow exemption flagged', changed_at: '2024-07-18T11:00:00Z' },
      { id: 5, old_status: 'new', new_status: 'under_review', officer_id: 2, officer_name: 'Priya Sharma', remark: 'Duplicate record investigation started. Exemption cell notified.', changed_at: '2024-07-22T14:00:00Z' },
    ],
  },
  {
    id: 3, property_id: 3, property_uid: 'KDMC-2024-00371', owner_name: 'Manoj Tiwari', ward_name: 'Ward 05',
    analysis_run_id: 103, status: 'reassessment', assigned_officer_id: 4, assigned_officer_name: 'Sneha Kulkarni',
    revenue_impact_estimate: 320000, revenue_recovered: 45000, risk_level: 'Critical', risk_score: 88,
    created_at: '2024-07-22T16:00:00Z', updated_at: '2024-07-24T11:00:00Z',
    status_history: [
      { id: 6, old_status: null, new_status: 'new', officer_id: 1, officer_name: 'Arjun Deshmukh', remark: 'Case opened — largest revenue impact this month', changed_at: '2024-07-22T16:00:00Z' },
      { id: 7, old_status: 'new', new_status: 'under_review', officer_id: 4, officer_name: 'Sneha Kulkarni', remark: 'Industrial usage confirmed via electricity dept records.', changed_at: '2024-07-23T08:30:00Z' },
      { id: 8, old_status: 'under_review', new_status: 'field_inspection', officer_id: 4, officer_name: 'Sneha Kulkarni', remark: 'Field inspection completed. New construction wing measured at 330 m².', changed_at: '2024-07-23T17:00:00Z' },
      { id: 9, old_status: 'field_inspection', new_status: 'reassessment', officer_id: 4, officer_name: 'Sneha Kulkarni', remark: 'Reassessment notice issued. Manual payment adjustments referred to audit cell.', changed_at: '2024-07-24T11:00:00Z' },
    ],
  },
  {
    id: 4, property_id: 4, property_uid: 'KDMC-2024-00455', owner_name: 'Lata Desai', ward_name: 'Ward 03',
    analysis_run_id: 104, status: 'new', assigned_officer_id: null, assigned_officer_name: null,
    revenue_impact_estimate: 58000, revenue_recovered: 0, risk_level: 'High', risk_score: 76,
    created_at: '2024-07-24T09:00:00Z', updated_at: '2024-07-24T09:00:00Z',
    status_history: [
      { id: 10, old_status: null, new_status: 'new', officer_id: 1, officer_name: 'Arjun Deshmukh', remark: 'Case opened — senior citizen exemption requires verification', changed_at: '2024-07-24T09:00:00Z' },
    ],
  },
  {
    id: 5, property_id: 5, property_uid: 'KDMC-2024-00512', owner_name: 'Dinesh Shah', ward_name: 'Ward 05',
    analysis_run_id: 105, status: 'closed', assigned_officer_id: 4, assigned_officer_name: 'Sneha Kulkarni',
    revenue_impact_estimate: 145000, revenue_recovered: 145000, risk_level: 'High', risk_score: 79,
    created_at: '2024-06-10T10:00:00Z', updated_at: '2024-07-15T16:00:00Z',
    status_history: [
      { id: 11, old_status: null, new_status: 'new', officer_id: 1, officer_name: 'Arjun Deshmukh', remark: 'Case opened', changed_at: '2024-06-10T10:00:00Z' },
      { id: 12, old_status: 'new', new_status: 'under_review', officer_id: 4, officer_name: 'Sneha Kulkarni', remark: 'Area mismatch verified against building plan', changed_at: '2024-06-18T11:00:00Z' },
      { id: 13, old_status: 'under_review', new_status: 'reassessment', officer_id: 4, officer_name: 'Sneha Kulkarni', remark: 'Reassessment notice accepted. Property owner agreed to revised assessment.', changed_at: '2024-07-05T10:00:00Z' },
      { id: 14, old_status: 'reassessment', new_status: 'closed', officer_id: 4, officer_name: 'Sneha Kulkarni', remark: 'Full payment received ₹1,45,000. Case closed.', changed_at: '2024-07-15T16:00:00Z' },
    ],
  },
  {
    id: 6, property_id: 11, property_uid: 'KDMC-2024-01134', owner_name: 'Vikas Bhosale', ward_name: 'Ward 05',
    analysis_run_id: 111, status: 'under_review', assigned_officer_id: 4, assigned_officer_name: 'Sneha Kulkarni',
    revenue_impact_estimate: 210000, revenue_recovered: 0, risk_level: 'Critical', risk_score: 85,
    created_at: '2024-07-22T10:00:00Z', updated_at: '2024-07-23T14:00:00Z',
    status_history: [
      { id: 15, old_status: null, new_status: 'new', officer_id: 1, officer_name: 'Arjun Deshmukh', remark: 'Case opened — multiple fraud signals', changed_at: '2024-07-22T10:00:00Z' },
      { id: 16, old_status: 'new', new_status: 'under_review', officer_id: 4, officer_name: 'Sneha Kulkarni', remark: 'Area and usage discrepancy under investigation', changed_at: '2024-07-23T14:00:00Z' },
    ],
  },
]

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export const DASHBOARD_STATS: DashboardStats = {
  total_cases: 156,
  total_revenue_at_risk: 28400000,
  urgent_cases: 34,
  recovered_revenue: 4750000,
  cases_this_month: 15,
  avg_risk_score: 67,
  properties_analyzed: 1247,
  wards_covered: 9,
}

// ─── Monthly trend data (for charts) ─────────────────────────────────────────
export const MONTHLY_TREND = [
  { month: 'Feb', cases: 18, recovered: 320000 },
  { month: 'Mar', cases: 24, recovered: 510000 },
  { month: 'Apr', cases: 19, recovered: 420000 },
  { month: 'May', cases: 28, recovered: 680000 },
  { month: 'Jun', cases: 32, recovered: 920000 },
  { month: 'Jul', cases: 35, recovered: 1100000 },
]

export const RISK_TREND = [
  { month: 'Feb', critical: 5, high: 7, medium: 4, low: 2 },
  { month: 'Mar', critical: 7, high: 9, medium: 6, low: 2 },
  { month: 'Apr', critical: 6, high: 7, medium: 4, low: 2 },
  { month: 'May', critical: 8, high: 11, medium: 7, low: 2 },
  { month: 'Jun', critical: 9, high: 13, medium: 8, low: 2 },
  { month: 'Jul', critical: 11, high: 14, medium: 8, low: 2 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000)  return `₹${(amount / 100000).toFixed(1)} L`
  if (amount >= 1000)    return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount.toFixed(0)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

export const RISK_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
}

export const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  new:             { bg: '#eff6ff', color: '#1d4ed8', label: 'New' },
  under_review:    { bg: '#fef9c3', color: '#92400e', label: 'Under Review' },
  field_inspection:{ bg: '#fff7ed', color: '#c2410c', label: 'Field Inspection' },
  reassessment:    { bg: '#f3e8ff', color: '#6b21a8', label: 'Reassessment' },
  disputed:        { bg: '#fef2f2', color: '#991b1b', label: 'Disputed' },
  closed:          { bg: '#f0fdf4', color: '#166534', label: 'Closed' },
}
