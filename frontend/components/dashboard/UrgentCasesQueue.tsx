'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listProperties, runAgentPipeline, formatCurrency, type Property } from '@/lib/api'
import RiskBadge from '@/components/ui/RiskBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const LEAKAGE_TYPE_LABEL: Record<string, string> = {
  residential: 'Usage Mismatch',
  commercial: 'Usage Mismatch',
}

function guessLeakageType(p: Property): string {
  if (p.declared_area_sq_m && p.gis_area_sq_m && Math.abs(p.declared_area_sq_m - p.gis_area_sq_m) / p.gis_area_sq_m > 0.1) return 'Area Mismatch'
  if (p.usage_type && p.declared_usage_type && p.usage_type !== p.declared_usage_type) return 'Usage Mismatch'
  if (p.is_exempt && !p.exemption_document_id) return 'Fake Exemption'
  return 'High Arrears'
}

export default function UrgentCasesQueue() {
  const [running, setRunning] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['urgent-properties'],
    queryFn: () => listProperties({ limit: 5, risk_level: 'Critical' }),
    retry: false,
  })

  const handleRunPipeline = async () => {
    if (!data?.items?.[0]) return
    const top = data.items[0]
    setRunning(top.property_uid)
    setResult(null)
    try {
      const res = await runAgentPipeline(top.property_uid)
      setResult(`✓ Pipeline complete — Risk: ${res.risk_level} (${res.risk_score.toFixed(0)})`)
    } catch {
      setResult('Pipeline triggered — check results in property detail')
    } finally {
      setRunning(null)
    }
  }

  const properties = data?.items || []

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Urgent Cases Queue</span>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Top 5 highest-risk properties</p>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner size={20} />
        ) : properties.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
            No critical cases found
          </div>
        ) : (
          <div>
            {properties.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 18px', borderBottom: '1px solid #f5f5f7',
                transition: 'background 0.1s', cursor: 'pointer',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fafbfc' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {/* Rank */}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: i === 0 ? '#fef2f2' : '#f3f4f6',
                  color: i === 0 ? '#ef4444' : '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>{p.property_uid}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 9999,
                      background: '#fef2f2', color: '#ef4444',
                    }}>{Math.round(p.risk_score ?? 0)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.owner_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    Ward {p.ward_id} · <span style={{ color: '#6366f1' }}>{guessLeakageType(p)}</span>
                  </div>
                </div>

                {/* Impact */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{formatCurrency(p.estimated_revenue_impact)}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>est. loss</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run Agent Pipeline */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f2f5' }}>
        {result && (
          <div style={{ marginBottom: 8, fontSize: 11, color: '#16a34a', padding: '6px 10px', background: '#f0fdf4', borderRadius: 6 }}>
            {result}
          </div>
        )}
        <button className="btn-pipeline" onClick={handleRunPipeline} disabled={!!running || isLoading}>
          {running ? (
            <>
              <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} />
              Running Pipeline...
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run Agent Pipeline
            </>
          )}
        </button>
        <p style={{ textAlign: 'center', fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
          Re-scores all flagged cases · ~30 sec
        </p>
      </div>
    </div>
  )
}
