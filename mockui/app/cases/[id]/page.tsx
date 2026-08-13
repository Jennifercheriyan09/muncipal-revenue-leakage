'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBadge from '@/components/ui/RiskBadge'
import RiskBar from '@/components/ui/RiskBar'
import StatusBadge from '@/components/ui/StatusBadge'
import FraudSignalCard from '@/components/ui/FraudSignalCard'
import { CASES, PROPERTIES, FRAUD_SIGNALS, ANALYSIS_RUNS, OFFICERS, formatCurrency, formatDateTime, formatDate } from '@/lib/mockData'

const ACCENT = '#1d4ed8'

// Muted risk colors
const RISK_COLORS: Record<string, string> = {
  Critical: '#b91c1c', High: '#c2410c', Medium: '#a16207', Low: '#15803d',
}

const STATUS_COLORS: Record<string, { color: string; label: string }> = {
  new:              { color: '#1d4ed8', label: 'New' },
  under_review:     { color: '#92400e', label: 'Under Review' },
  field_inspection: { color: '#9a3412', label: 'Field Inspection' },
  reassessment:     { color: '#5b21b6', label: 'Reassessment' },
  disputed:         { color: '#991b1b', label: 'Disputed' },
  closed:           { color: '#15803d', label: 'Closed' },
}

const STATUS_FLOW = ['new', 'under_review', 'field_inspection', 'reassessment', 'closed']

const STATUS_ICONS: Record<string, React.ReactNode> = {
  new:              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  under_review:     <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  field_inspection: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  reassessment:     <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  disputed:         <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>,
  closed:           <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }      = use(params)
  const caseData    = CASES.find(c => c.id === Number(id)) || CASES[0]
  const property    = PROPERTIES.find(p => p.id === caseData.property_id)
  const signals     = FRAUD_SIGNALS[caseData.property_id] || []
  const analysis    = ANALYSIS_RUNS[caseData.property_id]
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'history'>('overview')

  const riskColor   = RISK_COLORS[caseData.risk_level] || '#50576a'
  const statusCfg   = STATUS_COLORS[caseData.status]
  const currentStep = STATUS_FLOW.indexOf(caseData.status)
  const recoveryPct = caseData.revenue_impact_estimate > 0
    ? Math.round((caseData.revenue_recovered / caseData.revenue_impact_estimate) * 100) : 0

  return (
    <DashboardLayout
      title={`Case #${caseData.id}`}
      subtitle={`${caseData.property_uid} · ${caseData.owner_name}`}
      breadcrumb="Cases"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/cases" className="btn btn-secondary" style={{ fontSize: 12, textDecoration: 'none' }}>← All Cases</Link>
          <Link href={`/properties/${caseData.property_id}`} className="btn btn-secondary" style={{ fontSize: 12, textDecoration: 'none' }}>View Property</Link>
          <button className="btn btn-primary" style={{ fontSize: 12 }}>Update Status</button>
        </div>
      }
    >
      {/* ── Progress stepper ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STATUS_FLOW.map((s, i) => {
            const done   = i < currentStep
            const active = i === currentStep
            const cfg    = STATUS_COLORS[s]
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_FLOW.length - 1 ? '1' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? '#15803d' : active ? cfg?.color || '#1e3a5f' : '#f1f3f6',
                    color: done || active ? 'white' : '#8b92a5',
                    border: active ? `2px solid ${cfg?.color || '#1e3a5f'}` : 'none',
                    boxShadow: active ? `0 0 0 4px ${cfg?.color || '#1e3a5f'}20` : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {done
                      ? <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      : STATUS_ICONS[s]}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap', color: active ? cfg?.color || '#1e3a5f' : done ? '#15803d' : '#8b92a5' }}>
                    {cfg?.label || s}
                  </span>
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? '#15803d' : '#eef0f4', margin: '0 4px', marginBottom: 22, borderRadius: 9999, transition: 'background 0.3s' }}/>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 20, alignItems: 'start' }}>

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 0, background: '#eef0f4', padding: 3, borderRadius: 9, width: 'fit-content' }}>
            {(['overview', 'signals', 'history'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{
                  padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: activeTab === t ? 600 : 400,
                  cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                  background: activeTab === t ? 'white' : 'transparent',
                  color: activeTab === t ? '#141822' : '#8b92a5',
                  boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.14s',
                }}>
                {t === 'signals' ? `Fraud Signals (${signals.length})` : t === 'history' ? `History (${caseData.status_history.length})` : 'Overview'}
              </button>
            ))}
          </div>

          {/* ── Overview tab ─────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Property info */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="section-header">
                  <div className="section-title">Property Information</div>
                  <Link href={`/properties/${caseData.property_id}`} style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>View full details →</Link>
                </div>
                <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Property UID',  value: caseData.property_uid, mono: true },
                    { label: 'Owner',          value: caseData.owner_name },
                    { label: 'Ward',           value: caseData.ward_name },
                    { label: 'Declared Area',  value: property ? `${property.declared_area_sq_m} m²` : '—' },
                    { label: 'GIS Area',       value: property ? `${property.gis_area_sq_m} m²` : '—',
                      color: property && Math.abs(property.gis_area_sq_m - property.declared_area_sq_m) / property.declared_area_sq_m > 0.2 ? '#b91c1c' : undefined },
                    { label: 'Usage Type',     value: property?.usage_type || '—' },
                  ].map(item => (
                    <div key={item.label}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 3 }}>{item.label}</label>
                      <span style={{ fontSize: 13, fontWeight: 600, color: item.color || '#141822', fontFamily: item.mono ? 'monospace' : 'inherit' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Evidence */}
              {analysis && (
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div className="section-header">
                    <div className="section-title">AI Evidence Summary</div>
                    <span className="badge" style={{ background: '#f5e6f5', color: ACCENT, fontSize: 10 }}>LangGraph Pipeline</span>
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ padding: '14px 16px', background: `${riskColor}08`, border: `1px solid ${riskColor}25`, borderRadius: 10, marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: riskColor, marginBottom: 4 }}>{analysis.headline}</div>
                      <pre style={{ fontSize: 12, color: '#50576a', lineHeight: 1.7, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{analysis.evidence_summary}</pre>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {analysis.recommended_actions.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < analysis.recommended_actions.length - 1 ? '1px solid #f0f2f6' : 'none' }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: ACCENT }}>{i + 1}</span>
                          </div>
                          <span style={{ fontSize: 12, color: '#50576a', lineHeight: 1.5 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14, padding: '11px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                      <span style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}><strong>Next Step:</strong> {analysis.next_step}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Signals tab ──────────────────────────────────────────── */}
          {activeTab === 'signals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {signals.length === 0
                ? <div className="card" style={{ padding: 48, textAlign: 'center', color: '#8b92a5' }}>No fraud signals detected for this property</div>
                : signals.map((s, i) => <FraudSignalCard key={i} signal={s}/>)}
            </div>
          )}

          {/* ── History tab ──────────────────────────────────────────── */}
          {activeTab === 'history' && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ position: 'relative' }}>
                {caseData.status_history.map((h, i) => {
                  const cfg    = STATUS_COLORS[h.new_status]
                  const isLast = i === caseData.status_history.length - 1
                  return (
                    <div key={h.id} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 22, position: 'relative' }}>
                      {!isLast && <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 2, background: '#f0f2f6' }}/>}
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${cfg?.color || '#8b92a5'}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, color: cfg?.color || '#8b92a5' }}>
                        {STATUS_ICONS[h.new_status]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <StatusBadge status={h.new_status}/>
                          {h.old_status && <span style={{ fontSize: 11, color: '#8b92a5' }}>from <StatusBadge status={h.old_status}/></span>}
                          <span style={{ fontSize: 11, color: '#8b92a5', marginLeft: 'auto' }}>{formatDateTime(h.changed_at)}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: '#50576a', lineHeight: 1.55, marginBottom: 5 }}>{h.remark}</div>
                        <div style={{ fontSize: 11, color: '#8b92a5', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 7, fontWeight: 800, flexShrink: 0 }}>
                            {h.officer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          {h.officer_name}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Status */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Case Status</div>
            <StatusBadge status={caseData.status}/>
            <div style={{ marginTop: 10, fontSize: 11, color: '#8b92a5' }}>Last updated {formatDate(caseData.updated_at)}</div>
          </div>

          {/* Revenue */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Revenue Impact</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#50576a' }}>Total at Risk</span>
              <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: 13 }}>{formatCurrency(caseData.revenue_impact_estimate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#50576a' }}>Recovered</span>
              <span style={{ fontWeight: 700, color: '#15803d', fontSize: 13 }}>{formatCurrency(caseData.revenue_recovered)}</span>
            </div>
            <div style={{ height: 7, background: '#eef0f4', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${recoveryPct}%`, background: '#15803d', borderRadius: 9999 }}/>
            </div>
            <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 4, textAlign: 'right' }}>{recoveryPct}% recovered</div>
          </div>

          {/* Risk score */}
          <div className="card" style={{ padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Risk Assessment</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{caseData.risk_score}</div>
            <div style={{ margin: '8px 0' }}><RiskBadge level={caseData.risk_level}/></div>
            <RiskBar score={caseData.risk_score} height={8}/>
          </div>

          {/* Assigned officer */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Assigned Officer</div>
            {caseData.assigned_officer_name ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                  {caseData.assigned_officer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{caseData.assigned_officer_name}</div>
                  <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 1 }}>{caseData.ward_name}</div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#b91c1c', marginBottom: 10 }}>Not yet assigned</div>
                <select className="select" style={{ width: '100%' }}>
                  <option value="">Select officer…</option>
                  {OFFICERS.map(o => <option key={o.id} value={o.id}>{o.name} ({o.active_cases} cases)</option>)}
                </select>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 8, fontSize: 12, justifyContent: 'center' }}>Assign Officer</button>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { label: 'Mark Field Inspection Done', color: '#2c4ecf' },
                { label: 'Issue Reassessment Notice',  color: '#5b21b6' },
                { label: 'Record Payment Received',    color: '#15803d' },
                { label: 'Escalate to Commissioner',   color: '#c2410c' },
                { label: 'Close Case',                 color: '#50576a' },
              ].map(a => (
                <button key={a.label} className="btn btn-secondary" style={{ fontSize: 11, justifyContent: 'flex-start', color: a.color, borderColor: `${a.color}33` }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
