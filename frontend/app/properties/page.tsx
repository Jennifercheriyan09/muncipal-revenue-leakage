'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBadge from '@/components/ui/RiskBadge'
import Pagination from '@/components/ui/Pagination'
import { PROPERTIES as MOCK_PROPERTIES, formatCurrency } from '@/lib/mockData'
import { listProperties, listWards, Ward } from '@/lib/api'
import { mr, riskLevelMr } from '@/lib/mr'

const RISK_TABS = ['all', 'Critical', 'High', 'Medium', 'Low'] as const
const RISK_TAB_LABEL: Record<string, string> = {
  all: mr.allProperties,
  Critical: 'Critical',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
}
const PAGE_SIZE = 10

// Unique avatar color per owner — deterministic
const AVATAR_COLORS = ['#1d4ed8','#2c4ecf','#0891b2','#15803d','#7c3aed','#b45309','#1d4ed8','#0369a1','#065f46','#6d28d9']
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }

// Tiny inline sparkline SVG — 6-point squiggly line
function MiniSparkline({ up = true, color = '#15803d' }: { up?: boolean; color?: string }) {
  const pts = up
    ? '0,10 8,7 16,9 24,5 32,7 40,3'
    : '0,3  8,6 16,4 24,8 32,6 40,10'
  return (
    <svg width="40" height="14" viewBox="0 0 40 14" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

export default function PropertiesPage() {
  const [propertiesList, setPropertiesList] = useState<any[]>([])
  const [wardsList, setWardsList] = useState<Ward[]>([])
  const [loading, setLoading] = useState(true)
  const [riskTab, setRiskTab] = useState('all')
  const [usage, setUsage]     = useState('')
  const [wardId, setWardId]   = useState('')
  const [exempt, setExempt]   = useState('')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(0)
  const [sortBy, setSortBy]   = useState<'risk_score' | 'estimated_revenue_impact' | 'owner_name'>('owner_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    Promise.all([
      listWards().catch(() => [] as Ward[]),
      listProperties({ limit: 1000 }).catch(() => ({ items: [], total: 0, limit: 0, offset: 0 })),
    ]).then(([wards, res]) => {
      setWardsList(wards)
      const wardMap = Object.fromEntries(wards.map(w => [w.id, w.name]))
      const items = (res.items?.length ? res.items : MOCK_PROPERTIES).map((p: any) => ({
        ...p,
        ward_name: p.ward_name || (p.ward_id ? wardMap[p.ward_id] : null) || '—',
      }))
      setPropertiesList(items)
    }).finally(() => setLoading(false))
  }, [])

  const usageOptions = useMemo(() => {
    const set = new Set<string>()
    propertiesList.forEach(p => { if (p.usage_type) set.add(p.usage_type) })
    return Array.from(set).sort()
  }, [propertiesList])

  const filtered = useMemo(() => {
    let list = [...propertiesList]
    if (riskTab !== 'all') list = list.filter(p => p.risk_level === riskTab)
    if (usage)   list = list.filter(p => p.usage_type === usage)
    if (wardId)  list = list.filter(p => p.ward_id === Number(wardId))
    if (exempt === 'yes') list = list.filter(p => p.is_exempt)
    if (exempt === 'no')  list = list.filter(p => !p.is_exempt)
    if (search)  list = list.filter(p =>
      (p.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.property_uid || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.address || '').toLowerCase().includes(search.toLowerCase()))
    list.sort((a, b) => {
      const av = a[sortBy] as number | string
      const bv = b[sortBy] as number | string
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return list
  }, [propertiesList, riskTab, usage, wardId, exempt, search, sortBy, sortDir])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: 3, opacity: sortBy === col ? 1 : 0.35 }}>
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points={sortBy === col && sortDir === 'asc' ? '6 11 12 5 18 11' : '6 14 12 19 18 14'}/>
    </svg>
  )

  return (
    <DashboardLayout
      title={mr.properties}
      subtitle="Ahmednagar Municipal Corporation — property records"
      breadcrumb={mr.dashboard}
      actions={
        <button className="btn btn-primary" style={{ fontSize: 12, marginLeft: 8 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Property
        </button>
      }
    >
      <div className="card" style={{ overflow: 'hidden' }}>

        {/* Underline tabs */}
        <div style={{ padding: '0 20px', borderBottom: '1px solid #e3e6eb' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {RISK_TABS.map(t => {
              const count = t === 'all' ? propertiesList.length : propertiesList.filter(p => p.risk_level === t).length
              const active = riskTab === t
              return (
                <button key={t} onClick={() => { setRiskTab(t); setPage(0) }} style={{
                  padding: '13px 16px', fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', border: 'none', background: 'transparent',
                  color: active ? '#141822' : '#8b92a5',
                  borderBottom: `2px solid ${active ? '#1d4ed8' : 'transparent'}`,
                  marginBottom: -1, transition: 'all 0.14s', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {RISK_TAB_LABEL[t] ?? t}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 9999, background: active ? '#eff6ff' : '#f1f3f6', color: active ? '#1d4ed8' : '#8b92a5' }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f0f2f6' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
            <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#8b92a5' }} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="input" style={{ paddingLeft: 28, width: '100%', fontSize: 12.5 }} placeholder={mr.searchProperties} value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}/>
          </div>
          <select className="select" style={{ fontSize: 12.5 }} value={usage} onChange={e => { setUsage(e.target.value); setPage(0) }}>
            <option value="">{mr.allUsageTypes}</option>
            {usageOptions.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select className="select" style={{ fontSize: 12.5 }} value={wardId} onChange={e => { setWardId(e.target.value); setPage(0) }}>
            <option value="">{mr.allWards}</option>
            {wardsList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select className="select" style={{ fontSize: 12.5 }} value={exempt} onChange={e => { setExempt(e.target.value); setPage(0) }}>
            <option value="">{mr.exemptionAll}</option>
            <option value="yes">{mr.exempted}</option>
            <option value="no">{mr.notExempted}</option>
          </select>
          {(search || usage || wardId || exempt) && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setSearch(''); setUsage(''); setWardId(''); setExempt(''); setPage(0) }}>{mr.clear}</button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12, gap: 5 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Columns
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 12, gap: 5 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8f9fb' }}>
                {/* Checkbox */}
                <th style={{ width: 44, padding: '11px 8px 11px 16px' }}>
                  <input type="checkbox" style={{ width: 15, height: 15, accentColor: '#1d4ed8', cursor: 'pointer' }}/>
                </th>
                <th style={thStyle} onClick={() => toggleSort('owner_name')} className="sortable-th">
                  <span style={{ display:'flex', alignItems:'center' }}>{mr.owner} / {mr.propertyUid} <SortIcon col="owner_name"/></span>
                </th>
                <th style={thStyle}>{mr.address}</th>
                <th style={thStyle}>{mr.ward}</th>
                <th style={thStyle}>{mr.usage}</th>
                <th style={thStyle}>{mr.area}</th>
                <th style={thStyle} onClick={() => toggleSort('risk_score')}>
                  <span style={{ display:'flex', alignItems:'center' }}>{mr.riskScore} <SortIcon col="risk_score"/></span>
                </th>
                <th style={thStyle}>{mr.risk}</th>
                <th style={thStyle} onClick={() => toggleSort('estimated_revenue_impact')}>
                  <span style={{ display:'flex', alignItems:'center' }}>{mr.impact} <SortIcon col="estimated_revenue_impact"/></span>
                </th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p, i) => {
                const decl = p.declared_area_sq_m || 0
                const gis = p.gis_area_sq_m || 0
                const mismatch = decl > 0 && Math.abs(gis - decl) / decl > 0.2
                const isSelected = selected.has(p.id)
                const up = p.risk_score < 60
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f2f6', background: isSelected ? '#fdf5fb' : 'white', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8f9fc' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}>

                    {/* Checkbox */}
                    <td style={{ padding: '0 8px 0 16px', width: 44 }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} style={{ width: 15, height: 15, accentColor: '#1d4ed8', cursor: 'pointer' }}/>
                    </td>

                    {/* Property + Owner */}
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColor(p.id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: '0.03em' }}>
                          {(p.owner_name || '').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#141822', lineHeight: 1.3 }}>{p.owner_name}</div>
                          <div style={{ fontSize: 12, color: '#8b92a5', marginTop: 2, fontFamily: 'monospace', letterSpacing: '0.02em' }}>{p.property_uid}</div>
                        </div>
                      </div>
                    </td>

                    {/* Address */}
                    <td style={{ padding: '14px 14px', maxWidth: 170 }}>
                      <div style={{ fontSize: 13, color: '#50576a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</div>
                    </td>

                    {/* Ward */}
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontSize: 13, color: '#50576a' }}>{p.ward_name}</span>
                    </td>

                    {/* Usage */}
                    <td style={{ padding: '14px 14px' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#141822' }}>{p.usage_type || '—'}</span>
                        {p.declared_usage_type && p.usage_type !== p.declared_usage_type && (
                          <div style={{ fontSize: 11, color: '#c2410c', marginTop: 2 }}>{mr.declaredUsage}: {p.declared_usage_type}</div>
                        )}
                      </div>
                    </td>

                    {/* Area */}
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ fontWeight: 500, color: '#141822' }}>{decl || '—'}</span>
                        <span style={{ color: '#c5cad4', margin: '0 3px' }}>/</span>
                        <span style={{ fontWeight: 600, color: mismatch ? '#b91c1c' : '#141822' }}>{gis || '—'}</span>
                        <span style={{ color: '#8b92a5', fontSize: 11 }}> {mr.sqm}</span>
                      </div>
                      {mismatch && <div style={{ fontSize: 10, fontWeight: 700, color: '#b91c1c', marginTop: 2 }}>{mr.mismatch}</div>}
                    </td>

                    {/* Risk score bar */}
                    <td style={{ padding: '14px 14px', minWidth: 110 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ flex: 1, height: 5, background: '#eaecf2', borderRadius: 9999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p.risk_score}%`, borderRadius: 9999, background: p.risk_score >= 75 ? '#b91c1c' : p.risk_score >= 50 ? '#c2410c' : p.risk_score >= 25 ? '#a16207' : '#15803d' }}/>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: p.risk_score >= 75 ? '#b91c1c' : p.risk_score >= 50 ? '#c2410c' : p.risk_score >= 25 ? '#a16207' : '#15803d', minWidth: 24, textAlign: 'right' }}>{p.risk_score}</span>
                      </div>
                    </td>

                    {/* Risk badge */}
                    <td style={{ padding: '14px 14px' }}><RiskBadge level={p.risk_level}/></td>

                    {/* Impact */}
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#141822' }}>{formatCurrency(p.estimated_revenue_impact)}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 12px 14px 4px' }}>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Link href={`/properties/${p.id}`} style={{ textDecoration: 'none' }}>
                          <button style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#8b92a5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s, color 0.12s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f3f6'; e.currentTarget.style.color = '#141822' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b92a5' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </Link>
                        <button style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#8b92a5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s, color 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f1f3f6'; e.currentTarget.style.color = '#141822' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b92a5' }}>
                          <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paged.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 56, color: '#8b92a5', fontSize: 14 }}>No properties match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={p => setPage(p)}/>
      </div>
    </DashboardLayout>
  )
}

const thStyle: React.CSSProperties = {
  padding: '11px 14px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#8b92a5',
  borderBottom: '1px solid #e3e6eb',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  userSelect: 'none',
  letterSpacing: '0.01em',
}
