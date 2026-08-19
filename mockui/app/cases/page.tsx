'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBadge from '@/components/ui/RiskBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import Pagination from '@/components/ui/Pagination'
import { CASES, WARDS, OFFICERS, formatCurrency, formatDate } from '@/lib/mockData'

const STATUSES = ['all', 'new', 'under_review', 'field_inspection', 'reassessment', 'disputed', 'closed']
const STATUS_LABELS: Record<string, string> = {
  new: 'New', under_review: 'Under Review', field_inspection: 'Field Inspection',
  reassessment: 'Reassessment', disputed: 'Disputed', closed: 'Closed',
}
const STATUS_COUNTS_BG: Record<string, string> = {
  new: '#dbeafe', under_review: '#fef3c7', field_inspection: '#ffedd5',
  reassessment: '#ede9fe', disputed: '#fee2e2', closed: '#dcfce7',
}
const STATUS_COUNTS_COLOR: Record<string, string> = {
  new: '#1d4ed8', under_review: '#92400e', field_inspection: '#9a3412',
  reassessment: '#5b21b6', disputed: '#991b1b', closed: '#15803d',
}

const PAGE_SIZE = 10
const AVATAR_COLORS = ['#1d4ed8','#2c4ecf','#0891b2','#15803d','#7c3aed','#b45309','#1d4ed8','#0369a1','#065f46','#6d28d9']
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]

const thStyle: React.CSSProperties = {
  padding: '11px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#8b92a5', borderBottom: '1px solid #e3e6eb', whiteSpace: 'nowrap',
  userSelect: 'none', letterSpacing: '0.01em',
}

export default function CasesPage() {
  const [status, setStatus]       = useState('all')
  const [risk, setRisk]           = useState('')
  const [wardId, setWardId]       = useState('')
  const [officerId, setOfficerId] = useState('')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(0)
  const [selected, setSelected]   = useState<Set<number>>(new Set())

  const filtered = useMemo(() => {
    let list = [...CASES]
    if (status !== 'all') list = list.filter(c => c.status === status)
    if (risk)      list = list.filter(c => c.risk_level === risk)
    if (wardId)    list = list.filter(c => { const w = WARDS.find(x => x.id === Number(wardId)); return w ? c.ward_name === w.name : true })
    if (officerId) list = list.filter(c => c.assigned_officer_id === Number(officerId))
    if (search)    list = list.filter(c =>
      c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      c.property_uid.toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).includes(search))
    return list
  }, [status, risk, wardId, officerId, search])

  const paged      = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalRecov = CASES.reduce((s, c) => s + c.revenue_recovered, 0)

  const toggleSelect = (id: number) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <DashboardLayout
      title="Investigation Cases"
      subtitle="Manage and track all revenue leakage investigation cases."
      breadcrumb="Dashboard"
      actions={
        <button className="btn btn-primary" style={{ fontSize: 12, marginLeft: 8 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Case
        </button>
      }
    >
      {/* ── KPI strip ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {/* Count-style cards */}
        {[
          { label: 'Total Cases',      value: String(CASES.length),                                      bg: '#eef2fb', color: '#1e3a5f' },
          { label: 'New / Unassigned', value: String(CASES.filter(c=>c.status==='new').length),           bg: '#fff7ed', color: '#9a3412' },
          { label: 'Critical Risk',    value: String(CASES.filter(c=>c.risk_level==='Critical').length),  bg: '#fee2e2', color: '#991b1b' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: k.color }}>{k.value}</span>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: '#50576a' }}>{k.label}</span>
          </div>
        ))}

        {/* Revenue Recovered — currency value needs its own layout */}
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" fill="none" stroke="#15803d" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d', lineHeight: 1.1 }}>{formatCurrency(totalRecov)}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#50576a', marginTop: 2 }}>Revenue Recovered</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>

        {/* ── Status tabs ────────────────────────────────────────────────── */}
        <div style={{ padding: '0 20px', borderBottom: '1px solid #e3e6eb' }}>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {STATUSES.map(s => {
              const count  = s === 'all' ? CASES.length : CASES.filter(c => c.status === s).length
              const active = status === s
              const bg     = s !== 'all' ? STATUS_COUNTS_BG[s]    : '#f1f3f6'
              const clr    = s !== 'all' ? STATUS_COUNTS_COLOR[s] : '#8b92a5'
              return (
                <button key={s} onClick={() => { setStatus(s); setPage(0) }} style={{
                  padding: '13px 16px', fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', border: 'none', background: 'transparent',
                  color: active ? '#141822' : '#8b92a5',
                  borderBottom: `2px solid ${active ? '#1d4ed8' : 'transparent'}`,
                  marginBottom: -1, transition: 'all 0.14s', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}>
                  {s === 'all' ? 'All Cases' : STATUS_LABELS[s]}
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 9999, background: active ? bg : '#f1f3f6', color: active ? clr : '#8b92a5' }}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f0f2f6' }}>
          <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 260 }}>
            <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#8b92a5' }} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="input" style={{ paddingLeft: 28, width: '100%', fontSize: 12.5 }} placeholder="Search cases…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}/>
          </div>
          <select className="select" style={{ fontSize: 12.5 }} value={risk} onChange={e => { setRisk(e.target.value); setPage(0) }}>
            <option value="">All Risk Levels</option>
            {['Critical','High','Medium','Low'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="select" style={{ fontSize: 12.5 }} value={wardId} onChange={e => { setWardId(e.target.value); setPage(0) }}>
            <option value="">All Wards</option>
            {WARDS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select className="select" style={{ fontSize: 12.5 }} value={officerId} onChange={e => { setOfficerId(e.target.value); setPage(0) }}>
            <option value="">All Officers</option>
            {OFFICERS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          {(search || risk || wardId || officerId) && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setSearch(''); setRisk(''); setWardId(''); setOfficerId(''); setPage(0) }}>Clear</button>
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

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8f9fb' }}>
                <th style={{ width: 44, padding: '11px 8px 11px 16px' }}>
                  <input type="checkbox" style={{ width: 15, height: 15, accentColor: '#1d4ed8', cursor: 'pointer' }}/>
                </th>
                <th style={thStyle}>Case</th>
                <th style={thStyle}>Owner / Property</th>
                <th style={thStyle}>Ward</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Risk</th>
                <th style={thStyle}>Revenue Impact</th>
                <th style={thStyle}>Recovered</th>
                <th style={thStyle}>Officer</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => {
                const isSelected = selected.has(c.id)
                return (
                  <tr key={c.id}
                    style={{ borderBottom: '1px solid #f0f2f6', background: isSelected ? '#fdf5fb' : 'white', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8f9fc' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}>

                    <td style={{ padding: '0 8px 0 16px', width: 44 }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(c.id)} style={{ width: 15, height: 15, accentColor: '#1d4ed8', cursor: 'pointer' }}/>
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontWeight: 700, color: '#141822', fontSize: 14 }}>#{c.id}</span>
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColor(c.property_id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {c.owner_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#141822', lineHeight: 1.3 }}>{c.owner_name}</div>
                          <div style={{ fontSize: 12, color: '#8b92a5', marginTop: 2, fontFamily: 'monospace' }}>{c.property_uid}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontSize: 13, color: '#50576a' }}>{c.ward_name}</span>
                    </td>

                    <td style={{ padding: '14px 14px' }}><StatusBadge status={c.status}/></td>

                    <td style={{ padding: '14px 14px' }}><RiskBadge level={c.risk_level}/></td>

                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#141822' }}>{formatCurrency(c.revenue_impact_estimate)}</span>
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      {c.revenue_recovered > 0
                        ? <span style={{ fontWeight: 600, color: '#15803d', fontSize: 13 }}>{formatCurrency(c.revenue_recovered)}</span>
                        : <span style={{ color: '#c5cad4', fontSize: 13 }}>—</span>}
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      {c.assigned_officer_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: avatarColor(c.assigned_officer_id || 0), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                            {c.assigned_officer_name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                          </div>
                          <span style={{ fontSize: 13, color: '#50576a' }}>{c.assigned_officer_name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: 9999 }}>Unassigned</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontSize: 13, color: '#8b92a5', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</span>
                    </td>

                    <td style={{ padding: '14px 12px 14px 4px' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <Link href={`/cases/${c.id}`} style={{ textDecoration: 'none' }}>
                          <button style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#8b92a5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f3f6'; e.currentTarget.style.color = '#141822' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b92a5' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </Link>
                        <button style={{ width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#8b92a5', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}
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
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 56, color: '#8b92a5', fontSize: 14 }}>No cases match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={p => setPage(p)}/>
      </div>
    </DashboardLayout>
  )
}
