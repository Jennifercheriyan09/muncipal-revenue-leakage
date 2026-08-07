'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCase, updateCaseStatus, formatCurrency } from '@/lib/api'

const STATUSES = ['new', 'under_review', 'field_inspection', 'reassessment', 'disputed', 'closed']
const STATUS_LABELS: Record<string, string> = {
  new: 'New', under_review: 'Under Review', field_inspection: 'Field Inspection',
  reassessment: 'Reassessment', disputed: 'Disputed', closed: 'Closed',
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const caseId = parseInt(id)
  const qc = useQueryClient()

  const [newStatus, setNewStatus] = useState('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => getCase(caseId),
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: () => updateCaseStatus(caseId, newStatus, remark),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['case', caseId] })
      setNewStatus('')
      setRemark('')
      setError('')
    },
    onError: (e: Error) => setError(e.message),
  })

  if (isLoading) return (
    <DashboardLayout title="Case Detail">
      <LoadingSpinner />
    </DashboardLayout>
  )

  if (!caseData) return (
    <DashboardLayout title="Case Detail">
      <div className="card" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Case not found</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout title={`Case #${caseData.id}`} subtitle={`Investigation Case · Status: ${STATUS_LABELS[caseData.status] || caseData.status}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Investigation Case</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Case #{caseData.id}</h2>
              </div>
              <StatusBadge status={caseData.status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Property</div>
                <Link href={`/properties/${caseData.property_id}`} style={{ color: '#6366f1', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  #{caseData.property_id} →
                </Link>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Revenue Impact</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#ef4444' }}>{formatCurrency(caseData.revenue_impact_estimate)}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Revenue Recovered</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#22c55e' }}>{caseData.status === 'closed' ? formatCurrency(caseData.revenue_recovered) : '—'}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Assigned Officer</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{caseData.assigned_officer_id ? `Officer #${caseData.assigned_officer_id}` : '—'}</div>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Status Timeline</h3>
            {caseData.status_history.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No history yet</p>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: '#f3f4f6' }} />
                {caseData.status_history.map((h, i) => (
                  <div key={h.id} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: i === caseData.status_history.length - 1 ? '#6366f1' : '#e5e7eb',
                      border: '3px solid white', boxShadow: '0 0 0 2px #e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === caseData.status_history.length - 1 ? 'white' : '#9ca3af' }} />
                    </div>
                    <div style={{ paddingTop: 2, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <StatusBadge status={h.new_status} />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          {new Date(h.changed_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#374151' }}>{h.remark}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — Status Transition */}
        <div className="card" style={{ padding: 20, height: 'fit-content' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Update Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>New Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">Select status...</option>
                {STATUSES.filter(s => s !== caseData.status).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Remark <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea
                value={remark}
                onChange={e => setRemark(e.target.value)}
                placeholder="Add a remark about this status change..."
                rows={4}
                className="input"
                style={{ resize: 'vertical' }}
              />
            </div>
            {error && <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12 }}>{error}</div>}
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => mutation.mutate()}
              disabled={!newStatus || !remark.trim() || mutation.isPending}
            >
              {mutation.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
