// ─── API Base & Auth ─────────────────────────────────────────────────────────
const API_BASE = '/api/v1'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('mrlis_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('mrlis_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'API Error')
  }

  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_cases: number
  total_revenue_at_risk: number
  urgent_cases: number
  recovered_revenue: number
}

export interface Property {
  id: number
  property_uid: string
  owner_name: string
  address: string
  ward_id: number | null
  declared_area_sq_m: number | null
  gis_area_sq_m: number | null
  usage_type: string | null
  declared_usage_type: string | null
  is_exempt: boolean
  exemption_type: string | null
  exemption_document_id: string | null
  risk_score: number | null
  risk_level: string | null
  estimated_revenue_impact: number | null
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface InvestigationCase {
  id: number
  property_id: number
  analysis_run_id: number
  status: string
  assigned_officer_id: number | null
  revenue_impact_estimate: number
  revenue_recovered: number
  created_at: string
  updated_at: string
  status_history: StatusHistory[]
}

export interface StatusHistory {
  id: number
  old_status: string | null
  new_status: string
  officer_id: number | null
  remark: string
  changed_at: string
}

export interface CaseKPIs {
  total_cases: number
  critical_count: number
  high_count: number
  total_revenue_at_risk: number
}

export interface WardSummary {
  ward_id: number
  ward_name: string
  ward_code: string
  total_cases: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  avg_risk_score: number
}

export interface FraudSignal {
  fraud_type: string
  score_contribution: number
  evidence: string
}

export interface AgentRunResponse {
  property_id: string
  risk_score: number
  risk_level: string
  fraud_signals: FraudSignal[]
  estimated_revenue_impact: number
  revenue_impact_breakdown: Array<Record<string, unknown>>
  evidence_summary: string
  officer_notes: string
  notifications: Array<Record<string, unknown>>
}

export interface AnalysisRun {
  id: number
  property_id: number
  triggered_by: string
  risk_score: number
  risk_level: string
  evidence_summary: string | null
  officer_notes: string | null
  recommended_action: string | null
  revenue_impact_estimate: number
  created_at: string
}

export interface Ward {
  id: number
  name: string
  code: string
  tax_rate_residential: number
  tax_rate_commercial: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<{ access_token: string }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  return request('/dashboard/stats')
}

// ─── Properties ───────────────────────────────────────────────────────────────
export async function listProperties(params: {
  limit?: number
  offset?: number
  ward_id?: number
  risk_level?: string
  usage_type?: string
} = {}): Promise<PaginatedResponse<Property>> {
  const q = new URLSearchParams()
  if (params.limit !== undefined) q.set('limit', String(params.limit))
  if (params.offset !== undefined) q.set('offset', String(params.offset))
  if (params.ward_id !== undefined) q.set('ward_id', String(params.ward_id))
  if (params.risk_level) q.set('risk_level', params.risk_level)
  if (params.usage_type) q.set('usage_type', params.usage_type)
  return request(`/properties?${q}`)
}

export interface TaxRecord {
  id: number
  property_id: number
  assessment_year: number
  assessed_value: number
  tax_demand: number
  tax_paid: number
  arrears_amount: number
  last_payment_date: string | null
}

export interface PaymentRecord {
  id: number
  property_id: number
  amount: number
  payment_date: string
  gateway_reference: string | null
  payment_mode: string | null
  is_manual_adjustment: boolean
}

export async function getPropertyTaxRecords(propertyId: number): Promise<TaxRecord[]> {
  return request(`/municipal/properties/${propertyId}/tax-records`)
}

export async function getPropertyPayments(propertyId: number): Promise<PaymentRecord[]> {
  return request(`/municipal/properties/${propertyId}/payments`)
}

export async function getProperty(id: number): Promise<Property> {
  return request(`/properties/${id}`)
}

// ─── Investigations ───────────────────────────────────────────────────────────
export async function listCases(params: {
  limit?: number
  offset?: number
  status?: string
  ward_id?: number
} = {}): Promise<PaginatedResponse<InvestigationCase>> {
  const q = new URLSearchParams()
  if (params.limit !== undefined) q.set('limit', String(params.limit))
  if (params.offset !== undefined) q.set('offset', String(params.offset))
  if (params.status) q.set('status', params.status)
  if (params.ward_id !== undefined) q.set('ward_id', String(params.ward_id))
  return request(`/investigations/cases?${q}`)
}

export async function getCase(id: number): Promise<InvestigationCase> {
  return request(`/investigations/cases/${id}`)
}

export async function getCaseKPIs(): Promise<CaseKPIs> {
  return request('/investigations/cases/kpis')
}

export async function updateCaseStatus(
  id: number,
  new_status: string,
  remark: string
): Promise<InvestigationCase> {
  return request(`/investigations/cases/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ new_status, remark }),
  })
}

// ─── Fraud / Agents ───────────────────────────────────────────────────────────
export async function analyzeFraud(propertyId: number): Promise<AnalysisRun> {
  return request(`/fraud/properties/${propertyId}/analyze`, { method: 'POST' })
}

export async function runAgentPipeline(
  propertyId: string,
  propertyData: Record<string, unknown> = {}
): Promise<AgentRunResponse> {
  return request(`/agents/properties/${propertyId}/run`, {
    method: 'POST',
    body: JSON.stringify({ property_data: propertyData }),
  })
}

// ─── Map ──────────────────────────────────────────────────────────────────────
export async function getMapProperties() {
  return request('/map/properties')
}

export async function getMapHeatmap() {
  return request('/map/heatmap')
}

export async function getMapWards() {
  return request('/map/wards')
}

export async function getWardSummary(): Promise<WardSummary[]> {
  return request('/map/ward-summary')
}

// ─── Wards ────────────────────────────────────────────────────────────────────
export async function listWards(): Promise<Ward[]> {
  return request('/wards')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount.toFixed(0)}`
}

export function formatLakh(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `₹${(amount / 100000).toFixed(1)} Lakh`
}

