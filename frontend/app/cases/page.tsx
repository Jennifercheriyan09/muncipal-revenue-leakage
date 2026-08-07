'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatusBadge from '@/components/ui/StatusBadge'
import RiskBar from '@/components/ui/RiskBar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { listCases, formatCurrency } from '@/lib/api'

const STATUSES = ['all', 'new', 'under_review', 'field_inspection', 'reassessment', 'disputed', 'closed']
const STATUS_LABELS: Record<string, string> = {
  all: 'All', new: 'New', under_review: 'Under Review', field_inspection: 'Field Inspection',
  reassessment: 'Reassessment', disputed: 'Disputed', closed: 'Closed',
}

const PAGE_SIZE = 20

export default function CasesPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['cases', statusFilter, page],
    queryFn: () => listCases({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
    retry: false,
  })

  const cases = data?.items || []
  const total = data?.total || 0

  return (
    <DashboardLayout title="Investigation Cases" subtitle="All active and historical investigation cases">
      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginRight: 4 }}>Status:</span>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid #e5e7eb',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: statusFilter === s ? '#6366f1' : 'white',
                color: statusFilter === s ? 'white' : '#6b7280',
              }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Cases</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{total} total</span>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Property ID</th>
                  <th>Status</th>
                  <th>Revenue Impact</th>
                  <th>Officer</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ fontWeight: 700, color: '#111827' }}>#{c.id}</span></td>
                    <td><span style={{ color: '#6366f1', fontWeight: 600 }}>Prop #{c.property_id}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><span style={{ fontWeight: 700 }}>{formatCurrency(c.revenue_impact_estimate)}</span></td>
                    <td>
                      {c.assigned_officer_id
                        ? <span style={{ fontSize: 12 }}>Officer #{c.assigned_officer_id}</span>
                        : <span style={{ color: '#9ca3af', fontSize: 12 }}>Unassigned</span>}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <Link href={`/cases/${c.id}`} style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                      No cases found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Showing {cases.length} of {total}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>← Prev</button>
            <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(page + 1)} disabled={(page + 1) * PAGE_SIZE >= total}>Next →</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
