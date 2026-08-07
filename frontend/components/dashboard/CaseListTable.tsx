'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { listCases, listProperties, formatCurrency, type Property } from '@/lib/api'
import RiskBar from '@/components/ui/RiskBar'
import StatusBadge from '@/components/ui/StatusBadge'
import RiskBadge from '@/components/ui/RiskBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type Tab = 'all' | 'new' | 'in_progress' | 'closed'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',         label: 'All Cases' },
  { id: 'new',         label: 'New' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'closed',      label: 'Closed' },
]

function guessLeakageType(p: Property): string {
  if (p.declared_area_sq_m && p.gis_area_sq_m && Math.abs(p.declared_area_sq_m - p.gis_area_sq_m) / p.gis_area_sq_m > 0.1) return 'Area Mismatch'
  if (p.usage_type && p.declared_usage_type && p.usage_type !== p.declared_usage_type) return 'Usage Mismatch'
  if (p.is_exempt && !p.exemption_document_id) return 'Fake Exemption'
  return 'High Arrears'
}

const leakageColors: Record<string, string> = {
  'Usage Mismatch': '#6366f1',
  'Area Mismatch': '#f97316',
  'Fake Exemption': '#ef4444',
  'High Arrears': '#eab308',
  'Duplicate Record': '#8b5cf6',
  'High Risk': '#dc2626',
}

const PAGE_SIZE = 7

export default function CaseListTable() {
  const [tab, setTab] = useState<Tab>('all')
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  const statusMap: Record<Tab, string | undefined> = {
    all: undefined,
    new: 'new',
    in_progress: 'under_review',
    closed: 'closed',
  }

  const { data: propsData, isLoading } = useQuery({
    queryKey: ['case-list-props', tab, page],
    queryFn: () => listProperties({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    retry: false,
  })

  const total = propsData?.total || 0
  const properties = (propsData?.items || []).filter(p =>
    !search || p.property_uid.toLowerCase().includes(search.toLowerCase()) ||
    p.owner_name.toLowerCase().includes(search.toLowerCase())
  )

  const tabCounts = { all: total, new: 37, in_progress: 71, closed: 34 }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #f0f2f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Case List</span>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2 }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setPage(0) }}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                    background: tab === t.id ? 'white' : 'transparent',
                    color: tab === t.id ? '#111827' : '#9ca3af',
                    boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {t.label}
                  <span style={{
                    marginLeft: 5, fontSize: 11, fontWeight: 700,
                    color: tab === t.id ? '#6366f1' : '#d1d5db',
                  }}>{tabCounts[t.id]}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cases..."
                style={{
                  paddingLeft: 28, paddingRight: 10, paddingTop: 5, paddingBottom: 5,
                  border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12,
                  width: 160, background: '#f9fafb', color: '#374151',
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
            {/* Filter btn */}
            <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: 12, gap: 4 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Owner</th>
                <th>Ward</th>
                <th>Leakage Type</th>
                <th>Risk Score</th>
                <th>Est. Impact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => {
                const leakage = guessLeakageType(p)
                const leakageColor = leakageColors[leakage] || '#6366f1'
                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 12 }}>{p.property_uid}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: `hsl(${p.id * 47 % 360}, 65%, 55%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 10, fontWeight: 700,
                        }}>
                          {p.owner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13 }}>{p.owner_name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 12 }}>{p.ward_id ?? '—'}</span>
                    </td>
                    <td>
                      <span style={{ color: leakageColor, fontWeight: 600, fontSize: 12 }}>{leakage}</span>
                    </td>
                    <td style={{ minWidth: 110 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RiskBar score={p.risk_score} />
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 24, color: '#374151' }}>
                          {Math.round(p.risk_score ?? 0)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                        {formatCurrency(p.estimated_revenue_impact)}
                      </span>
                    </td>
                    <td>
                      <RiskBadge level={p.risk_level} />
                    </td>
                    <td>
                      <Link href={`/properties/${p.id}`} style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
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
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          Showing {properties.length} of {total} cases
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', minWidth: 30 }}
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          {Array.from({ length: Math.min(3, Math.ceil(total / PAGE_SIZE)) }, (_, i) => (
            <button
              key={i}
              className="btn"
              style={{
                padding: '4px 10px', minWidth: 30, fontSize: 12,
                background: page === i ? '#6366f1' : 'white',
                color: page === i ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
              }}
              onClick={() => setPage(i)}
            >{i + 1}</button>
          ))}
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', minWidth: 30 }}
            onClick={() => setPage(Math.min(Math.ceil(total / PAGE_SIZE) - 1, page + 1))}
            disabled={page >= Math.ceil(total / PAGE_SIZE) - 1}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
