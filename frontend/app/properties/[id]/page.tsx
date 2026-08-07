'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBadge from '@/components/ui/RiskBadge'
import RiskBar from '@/components/ui/RiskBar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getProperty, analyzeFraud, formatCurrency, type AnalysisRun } from '@/lib/api'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const propId = parseInt(id)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisRun | null>(null)
  const [error, setError] = useState('')

  const { data: prop, isLoading } = useQuery({
    queryKey: ['property', propId],
    queryFn: () => getProperty(propId),
    retry: false,
  })

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError('')
    try {
      const res = await analyzeFraud(propId)
      setAnalysisResult(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  if (isLoading) return <DashboardLayout title="Property Detail"><LoadingSpinner /></DashboardLayout>
  if (!prop) return <DashboardLayout title="Property Detail"><div className="card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Property not found</div></DashboardLayout>

  const areaMismatch = prop.declared_area_sq_m && prop.gis_area_sq_m
    ? Math.abs(prop.declared_area_sq_m - prop.gis_area_sq_m) / prop.gis_area_sq_m
    : 0

  return (
    <DashboardLayout title={prop.property_uid} subtitle={`${prop.owner_name} · Ward ${prop.ward_id ?? '—'}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Property header */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Property</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>{prop.property_uid}</h2>
                <p style={{ fontSize: 14, color: '#374151', marginTop: 2 }}>{prop.owner_name}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{prop.address}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <RiskBadge level={prop.risk_level} />
                <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginTop: 6 }}>{Math.round(prop.risk_score ?? 0)}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Risk Score</div>
              </div>
            </div>

            {/* Risk Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Risk Score</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{Math.round(prop.risk_score ?? 0)}/100</span>
              </div>
              <RiskBar score={prop.risk_score} />
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Ward', value: prop.ward_id ?? '—' },
                { label: 'Usage Type', value: prop.usage_type || '—' },
                { label: 'Declared Usage', value: prop.declared_usage_type || '—' },
                { label: 'Declared Area', value: prop.declared_area_sq_m ? `${prop.declared_area_sq_m} m²` : '—' },
                { label: 'GIS Area', value: prop.gis_area_sq_m ? `${prop.gis_area_sq_m} m²` : '—' },
                { label: 'Est. Revenue Impact', value: formatCurrency(prop.estimated_revenue_impact) },
              ].map(f => (
                <div key={f.label} style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{String(f.value)}</div>
                </div>
              ))}
            </div>

            {areaMismatch > 0.05 && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
                <span style={{ color: '#ea580c', fontWeight: 600, fontSize: 12 }}>
                  ⚠ Area Mismatch: {(areaMismatch * 100).toFixed(1)}% difference between declared and GIS areas
                </span>
              </div>
            )}
          </div>

          {/* Exemption */}
          {prop.is_exempt && (
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Exemption Details</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: '#f9fafb', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Type</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{prop.exemption_type || '—'}</div>
                </div>
                <div style={{ flex: 1, background: prop.exemption_document_id ? '#f0fdf4' : '#fef2f2', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Document ID</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: prop.exemption_document_id ? '#16a34a' : '#dc2626' }}>
                    {prop.exemption_document_id || '⚠ Missing — Possible Fake Exemption'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <div className="card animate-fade-in" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#6366f1' }}>
                ✓ Analysis Complete
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>New Risk Score</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{analysisResult.risk_score.toFixed(0)}</div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Revenue Impact</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(analysisResult.revenue_impact_estimate)}</div>
                </div>
              </div>
              {analysisResult.evidence_summary && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#0284c7', marginBottom: 4 }}>Evidence Summary</div>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{analysisResult.evidence_summary}</p>
                </div>
              )}
              {analysisResult.recommended_action && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#ea580c', marginBottom: 4 }}>Recommended Action</div>
                  <p style={{ fontSize: 12, color: '#374151' }}>{analysisResult.recommended_action}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Run Analysis */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Fraud Analysis</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, lineHeight: 1.5 }}>
              Run the full AI agent pipeline to detect revenue leakage patterns for this property.
            </p>
            {error && (
              <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12, marginBottom: 10 }}>
                {error}
              </div>
            )}
            <button className="btn-pipeline" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? (
                <>
                  <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run Fraud Analysis
                </>
              )}
            </button>
          </div>

          {/* Metadata */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Record Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>Created</span>
                <span style={{ fontWeight: 500 }}>{new Date(prop.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>Last Updated</span>
                <span style={{ fontWeight: 500 }}>{new Date(prop.updated_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#9ca3af' }}>Is Exempt</span>
                <span style={{ fontWeight: 600, color: prop.is_exempt ? '#ef4444' : '#22c55e' }}>
                  {prop.is_exempt ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
