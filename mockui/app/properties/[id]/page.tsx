'use client'

import { use } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBadge from '@/components/ui/RiskBadge'
import RiskBar from '@/components/ui/RiskBar'
import FraudSignalCard from '@/components/ui/FraudSignalCard'
import { PROPERTIES, ANALYSIS_RUNS, FRAUD_SIGNALS, CASES, formatCurrency, formatDate } from '@/lib/mockData'

// Muted risk colors — override the neon ones from mockData
const RISK_COLORS: Record<string, string> = {
  Critical: '#b91c1c',
  High:     '#c2410c',
  Medium:   '#a16207',
  Low:      '#15803d',
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const property = PROPERTIES.find(p => p.id === Number(id)) || PROPERTIES[0]
  const analysis = ANALYSIS_RUNS[property.id]
  const signals  = FRAUD_SIGNALS[property.id] || []
  const relCase  = CASES.find(c => c.property_id === property.id)
  const areaDiff = property.gis_area_sq_m - property.declared_area_sq_m
  const areaPct  = ((areaDiff / property.declared_area_sq_m) * 100).toFixed(1)
  const riskColor = RISK_COLORS[property.risk_level] || '#50576a'

  return (
    <DashboardLayout
      title="Property Detail"
      subtitle={`${property.property_uid} · ${property.owner_name}`}
      breadcrumb="Properties"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {relCase && <Link href={`/cases/${relCase.id}`} className="btn btn-secondary" style={{ fontSize: 12, textDecoration: 'none' }}>View Case #{relCase.id}</Link>}
          <button className="btn btn-primary" style={{ fontSize: 12 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Run AI Analysis
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Risk headline */}
          {analysis && (
            <div style={{ padding: '16px 20px', borderRadius: 12, background: `${riskColor}0d`, border: `1px solid ${riskColor}30`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${riskColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                {property.risk_level === 'Critical' ? '🔴' : property.risk_level === 'High' ? '🟠' : property.risk_level === 'Medium' ? '🟡' : '🟢'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: riskColor }}>{analysis.headline}</div>
                <div style={{ fontSize: 12, color: '#50576a', marginTop: 3 }}>Last analysed {formatDate(analysis.created_at)} · Triggered by {analysis.triggered_by}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: riskColor }}>{property.risk_score}</div>
                <div style={{ fontSize: 10, color: '#8b92a5', fontWeight: 600 }}>RISK SCORE</div>
              </div>
            </div>
          )}

          {/* Property info grid */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <div className="section-title">Property Information</div>
              <span style={{ fontSize: 11, color: '#8b92a5' }}>Updated {formatDate(property.updated_at)}</span>
            </div>
            <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Property UID',     value: property.property_uid,        color: '#2c4ecf' },
                { label: 'Owner Name',        value: property.owner_name },
                { label: 'Owner Age',         value: `${property.owner_age} years` },
                { label: 'Ward',              value: property.ward_name },
                { label: 'Usage Type',        value: property.usage_type,          color: property.usage_type !== property.declared_usage_type ? '#c2410c' : undefined },
                { label: 'Declared Usage',    value: property.declared_usage_type },
                { label: 'Declared Area',     value: `${property.declared_area_sq_m} m²` },
                { label: 'GIS Area',          value: `${property.gis_area_sq_m} m²`, color: Math.abs(areaDiff) / property.declared_area_sq_m > 0.2 ? '#b91c1c' : undefined },
                { label: 'Area Discrepancy',  value: areaDiff > 0 ? `+${areaDiff} m² (${areaPct}%)` : `${areaDiff} m²`, color: areaDiff > 0 ? '#b91c1c' : '#15803d' },
              ].map(item => (
                <div key={item.label}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 3 }}>{item.label}</label>
                  <span style={{ fontSize: 13, fontWeight: 600, color: item.color || '#141822' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f2f6', background: '#f8f9fb' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 3 }}>Address</label>
              <span style={{ fontSize: 13, color: '#50576a' }}>{property.address}</span>
            </div>
          </div>

          {/* Area comparison visual */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Area Comparison</div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
              {[
                { label: 'Declared Area', value: property.declared_area_sq_m, color: '#2c4ecf', max: Math.max(property.declared_area_sq_m, property.gis_area_sq_m) },
                { label: 'GIS Measured', value: property.gis_area_sq_m, color: areaDiff > 0 ? '#b91c1c' : '#15803d', max: Math.max(property.declared_area_sq_m, property.gis_area_sq_m) },
              ].map(bar => (
                <div key={bar.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 8 }}>
                    <div style={{ width: 48, background: bar.color, borderRadius: '6px 6px 0 0', height: `${(bar.value / bar.max) * 80}px`, opacity: 0.8, transition: 'height 0.4s' }}/>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: bar.color }}>{bar.value} m²</div>
                  <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>{bar.label}</div>
                </div>
              ))}
              <div style={{ flex: 1, textAlign: 'center', padding: '16px', background: areaDiff > 0 ? '#fef2f2' : '#edf7f1', borderRadius: 10, border: `1px solid ${areaDiff > 0 ? '#fccfcf' : '#a8d9ba'}` }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: areaDiff > 0 ? '#b91c1c' : '#15803d' }}>{areaDiff > 0 ? '+' : ''}{areaDiff} m²</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: areaDiff > 0 ? '#b91c1c' : '#15803d', marginTop: 2 }}>{areaDiff > 0 ? `${areaPct}% under-reported` : 'Within tolerance'}</div>
              </div>
            </div>
          </div>

          {/* Fraud signals */}
          {signals.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="section-header">
                <div>
                  <div className="section-title">Detected Fraud Signals</div>
                  <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>{signals.length} issue{signals.length > 1 ? 's' : ''} detected by AI pipeline</div>
                </div>
                <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', fontSize: 11 }}>{signals.length} signals</span>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {signals.map((s, i) => <FraudSignalCard key={i} signal={s}/>)}
              </div>
            </div>
          )}

          {/* Recommended actions */}
          {analysis && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="section-header">
                <div className="section-title">Recommended Actions</div>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis.recommended_actions.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#f8f9fb', borderRadius: 8, border: '1px solid #eef0f4' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#eef2fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#2c4ecf' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#50576a', lineHeight: 1.5 }}>{a}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 18px', background: '#fffbeb', borderTop: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                <span style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}><strong>Next Step:</strong> {analysis.next_step}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk score card */}
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Risk Assessment</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{property.risk_score}</div>
            <div style={{ margin: '10px 0 14px' }}><RiskBadge level={property.risk_level}/></div>
            <RiskBar score={property.risk_score} showLabel height={10}/>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f2f6' }}>
              <div style={{ fontSize: 11, color: '#8b92a5', marginBottom: 4 }}>Estimated Revenue Impact</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#b91c1c' }}>{formatCurrency(property.estimated_revenue_impact)}</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>per assessment year</div>
            </div>
          </div>

          {/* Exemption status */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Exemption Status</div>
            {property.is_exempt ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6', fontSize: 11 }}>EXEMPT</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{property.exemption_type}</span>
                </div>
                <div className="alert alert-warning" style={{ fontSize: 12 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                  Exemption document verification required
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontSize: 11 }}>NOT EXEMPT</span>
                <span style={{ fontSize: 12, color: '#8b92a5' }}>No exemption claimed</span>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          {signals.length > 0 && (
            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Score Contribution</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {signals.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#50576a', fontWeight: 500 }}>{s.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#141822' }}>+{s.score_contribution}</span>
                    </div>
                    <div className="risk-bar-track">
                      <div className="risk-bar-fill" style={{ width: `${s.score_contribution}%`, background: s.severity === 'high' ? '#b91c1c' : s.severity === 'medium' ? '#c2410c' : '#a16207' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments */}
          {analysis && (
            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Departments Involved</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analysis.departments_involved.map(d => (
                  <span key={d} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: '#eef2fb', color: '#1e3a5f', border: '1px solid #c3d0f0' }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Related case */}
          {relCase && (
            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Investigation Case</div>
              <Link href={`/cases/${relCase.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '12px', background: '#f8f9fb', borderRadius: 8, border: '1px solid #eef0f4', cursor: 'pointer', transition: 'background 0.12s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: '#2c4ecf' }}>Case #{relCase.id}</span>
                    <span className="badge" style={{ background: relCase.status === 'closed' ? '#dcfce7' : '#eef2fb', color: relCase.status === 'closed' ? '#15803d' : '#1d4ed8', fontSize: 10 }}>{relCase.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#50576a' }}>Officer: {relCase.assigned_officer_name || 'Unassigned'}</div>
                  <div style={{ fontSize: 11, color: '#50576a', marginTop: 2 }}>Impact: {formatCurrency(relCase.revenue_impact_estimate)}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#2c4ecf', fontWeight: 600 }}>View full case →</div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
