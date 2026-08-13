'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import KpiCard from '@/components/ui/KpiCard'
import RiskBadge from '@/components/ui/RiskBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import RiskBar from '@/components/ui/RiskBar'
import Link from 'next/link'
import { DASHBOARD_STATS, CASES, PROPERTIES, formatCurrency, formatDate } from '@/lib/mockData'

const urgentCases = CASES.filter(c => c.risk_level === 'Critical').slice(0, 5)
const recentCases = CASES.slice(0, 6)

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back, A. Deshmukh. Here's what's happening today."
      actions={
        <button className="btn btn-primary" style={{ fontSize: 12, marginLeft: 8 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Run Analysis
        </button>
      }
    >
      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <KpiCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          iconBg="#eff6ff"
          iconColor="#1d4ed8"
          value={String(DASHBOARD_STATS.total_cases)}
          label="Total Leakage Cases"
          trend="+12.5%"
          trendUp
          accentColor="#db2777"
          sparkKey="cases"
        />
        <KpiCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          iconBg="#e0f2fe"
          iconColor="#0369a1"
          value={formatCurrency(DASHBOARD_STATS.total_revenue_at_risk)}
          label="Revenue at Risk"
          trend="+8.2%"
          trendUp
          accentColor="#0ea5e9"
          sparkKey="risk"
        />
        <KpiCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          iconBg="#fef9c3"
          iconColor="#a16207"
          value={String(DASHBOARD_STATS.urgent_cases)}
          label="Urgent Actions"
          trend="-3.1%"
          trendUp={false}
          accentColor="#ca8a04"
          sparkKey="urgent"
        />
        <KpiCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          iconBg="#fef3c7"
          iconColor="#b45309"
          value={formatCurrency(DASHBOARD_STATS.recovered_revenue)}
          label="Revenue Recovered"
          trend="+24.7%"
          trendUp
          accentColor="#f59e0b"
          sparkKey="recovered"
        />
      </div>

      {/* ── Secondary stats ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          {
            label: 'Properties Analyzed',
            value: DASHBOARD_STATS.properties_analyzed.toLocaleString(),
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
            iconBg: '#eff6ff', iconColor: '#1d4ed8',
          },
          {
            label: 'Wards Covered',
            value: String(DASHBOARD_STATS.wards_covered),
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
            iconBg: '#e0f2fe', iconColor: '#0369a1',
          },
          {
            label: 'Avg Risk Score',
            value: String(DASHBOARD_STATS.avg_risk_score),
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
            iconBg: '#fef3c7', iconColor: '#b45309',
          },
          {
            label: 'Cases This Month',
            value: String(DASHBOARD_STATS.cases_this_month),
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
            iconBg: '#ede9fe', iconColor: '#6d28d9',
          },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#141822', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#8b92a5', marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Urgent queue + top properties ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14 }}>

        {/* Urgent queue */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Urgent Cases</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>Requires immediate action</div>
            </div>
            <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', fontSize: 10 }}>{urgentCases.length} critical</span>
          </div>
          <div>
            {urgentCases.map((c, i) => (
              <Link key={c.id} href={`/cases/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ padding: '11px 14px', borderBottom: i < urgentCases.length - 1 ? '1px solid #f0f2f6' : 'none', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f7f8fb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" fill="none" stroke="#b91c1c" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#141822', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.owner_name}</div>
                    <div style={{ fontSize: 10, color: '#8b92a5', marginTop: 1 }}>{c.property_uid} · {c.ward_name}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>{formatCurrency(c.revenue_impact_estimate)}</div>
                    <div style={{ fontSize: 10, color: '#8b92a5', marginTop: 1 }}>score {c.risk_score}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ padding: '9px 14px', borderTop: '1px solid #f0f2f6', background: '#f8f9fb' }}>
            <Link href="/cases" style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', textDecoration: 'none' }}>View all urgent cases →</Link>
          </div>
        </div>

        {/* Top risk properties */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Top Risk Properties</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>Highest estimated revenue impact</div>
            </div>
            <Link href="/properties" className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}>View all</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Owner</th>
                <th>Ward</th>
                <th>Risk</th>
                <th>Score</th>
                <th>Est. Impact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...PROPERTIES].sort((a, b) => b.estimated_revenue_impact - a.estimated_revenue_impact).slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td><span style={{ color: '#2c4ecf', fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>{p.property_uid}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8eaf2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#50576a', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
                        {p.owner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 12 }}>{p.owner_name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 11, color: '#50576a' }}>{p.ward_name}</span></td>
                  <td><RiskBadge level={p.risk_level}/></td>
                  <td style={{ minWidth: 90 }}><RiskBar score={p.risk_score} showLabel/></td>
                  <td><span style={{ fontWeight: 700 }}>{formatCurrency(p.estimated_revenue_impact)}</span></td>
                  <td>
                    <Link href={`/properties/${p.id}`} style={{ color: '#8b92a5', display: 'flex' }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent cases ─────────────────────────────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="section-header">
          <div>
            <div className="section-title">Recent Investigation Cases</div>
            <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>Latest activity</div>
          </div>
          <Link href="/cases" className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}>All cases</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Case</th><th>Property</th><th>Owner</th><th>Ward</th>
              <th>Status</th><th>Risk</th><th>Impact</th><th>Officer</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>
            {recentCases.map(c => (
              <tr key={c.id}>
                <td><span style={{ fontWeight: 700, color: '#141822' }}>#{c.id}</span></td>
                <td><span style={{ color: '#2c4ecf', fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>{c.property_uid}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8eaf2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#50576a', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
                      {c.owner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 12 }}>{c.owner_name}</span>
                  </div>
                </td>
                <td><span style={{ fontSize: 11, color: '#50576a' }}>{c.ward_name}</span></td>
                <td><StatusBadge status={c.status}/></td>
                <td><RiskBadge level={c.risk_level}/></td>
                <td><span style={{ fontWeight: 700 }}>{formatCurrency(c.revenue_impact_estimate)}</span></td>
                <td><span style={{ fontSize: 11, color: '#50576a' }}>{c.assigned_officer_name || '—'}</span></td>
                <td><span style={{ fontSize: 11, color: '#8b92a5' }}>{formatDate(c.created_at)}</span></td>
                <td>
                  <Link href={`/cases/${c.id}`} style={{ color: '#8b92a5', display: 'flex' }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
