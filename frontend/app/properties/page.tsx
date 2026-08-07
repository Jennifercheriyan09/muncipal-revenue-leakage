'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBadge from '@/components/ui/RiskBadge'
import RiskBar from '@/components/ui/RiskBar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { listProperties, formatCurrency } from '@/lib/api'

const RISK_LEVELS = ['', 'Critical', 'High', 'Medium', 'Low']
const PAGE_SIZE = 20

export default function PropertiesPage() {
  const [riskLevel, setRiskLevel] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['properties', riskLevel, page],
    queryFn: () => listProperties({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      risk_level: riskLevel || undefined,
    }),
    retry: false,
  })

  const properties = data?.items || []
  const total = data?.total || 0

  return (
    <DashboardLayout title="Properties" subtitle="All registered properties with risk scoring">
      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginRight: 4 }}>Risk Level:</span>
          {RISK_LEVELS.map(r => (
            <button
              key={r || 'all'}
              onClick={() => { setRiskLevel(r); setPage(0) }}
              style={{
                padding: '5px 12px', borderRadius: 7, border: '1px solid #e5e7eb',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: riskLevel === r ? '#6366f1' : 'white',
                color: riskLevel === r ? 'white' : '#6b7280',
              }}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Properties</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{total} total</span>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property ID</th>
                  <th>Owner</th>
                  <th>Address</th>
                  <th>Ward</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Est. Impact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ color: '#6366f1', fontWeight: 700 }}>{p.property_uid}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${p.id * 47 % 360}, 65%, 55%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 10, fontWeight: 700,
                        }}>
                          {p.owner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span>{p.owner_name}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{p.address}</span>
                    </td>
                    <td><span style={{ color: '#6366f1', fontWeight: 600 }}>{p.ward_id ?? '—'}</span></td>
                    <td><RiskBadge level={p.risk_level} /></td>
                    <td style={{ minWidth: 110 }}>
                      <RiskBar score={p.risk_score} showLabel />
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(p.estimated_revenue_impact)}</span>
                    </td>
                    <td>
                      <Link href={`/properties/${p.id}`} style={{ display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Showing {properties.length} of {total}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>← Prev</button>
            <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(page + 1)} disabled={(page + 1) * PAGE_SIZE >= total}>Next →</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
