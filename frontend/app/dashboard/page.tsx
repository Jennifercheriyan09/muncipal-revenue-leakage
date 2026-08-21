'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import KpiCard from '@/components/ui/KpiCard'
import RiskBadge from '@/components/ui/RiskBadge'
import RiskBar from '@/components/ui/RiskBar'
import Link from 'next/link'
import { DASHBOARD_STATS, formatCurrency } from '@/lib/mockData'
import { getDashboardStats, DashboardStats, listProperties, Property } from '@/lib/api'
import { mr } from '@/lib/mr'

export default function DashboardPage() {
  const [stats, setStats] = useState<Partial<DashboardStats>>(DASHBOARD_STATS)
  const [recentProperties, setRecentProperties] = useState<Property[]>([])

  useEffect(() => {
    getDashboardStats()
      .then(data => { if (data) setStats(prev => ({ ...prev, ...data })) })
      .catch(() => {})
    listProperties({ limit: 8 })
      .then(res => { if (res.items?.length) setRecentProperties(res.items) })
      .catch(() => {})
  }, [])
  return (
    <DashboardLayout
      title={mr.dashboard}
      subtitle="Ahmednagar Municipal Corporation — property records dashboard"
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
          value={String(stats.total_cases ?? DASHBOARD_STATS.total_cases)}
          label={mr.totalProperties}
          trend="+12.5%"
          trendUp
          accentColor="#db2777"
          sparkKey="cases"
        />
        <KpiCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          iconBg="#e0f2fe"
          iconColor="#0369a1"
          value={formatCurrency(stats.total_revenue_at_risk ?? DASHBOARD_STATS.total_revenue_at_risk)}
          label={mr.revenueAtRisk}
          trend="+8.2%"
          trendUp
          accentColor="#0ea5e9"
          sparkKey="risk"
        />
        <KpiCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          iconBg="#fef9c3"
          iconColor="#a16207"
          value={String(stats.urgent_cases ?? DASHBOARD_STATS.urgent_cases)}
          label={mr.urgentCases}
          trend="-3.1%"
          trendUp={false}
          accentColor="#ca8a04"
          sparkKey="urgent"
        />
        <KpiCard
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          iconBg="#fef3c7"
          iconColor="#b45309"
          value={formatCurrency(stats.recovered_revenue ?? DASHBOARD_STATS.recovered_revenue)}
          label={mr.recoveredRevenue}
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

        {/* Recent properties from Excel */}
        <div className="card" style={{ overflow: 'hidden', gridColumn: '1 / -1' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Recent Properties</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>Imported property records</div>
            </div>
            <Link href="/properties" className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}>View all</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>{mr.propertyUid}</th>
                <th>{mr.owner}</th>
                <th>{mr.usage}</th>
                <th>{mr.risk}</th>
                <th>{mr.riskScore}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentProperties.map(p => (
                <tr key={p.id}>
                  <td><span style={{ color: '#2c4ecf', fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>{p.property_uid}</span></td>
                  <td><span style={{ fontSize: 12 }}>{p.owner_name}</span></td>
                  <td><span style={{ fontSize: 12 }}>{p.usage_type || '—'}</span></td>
                  <td><RiskBadge level={p.risk_level}/></td>
                  <td style={{ minWidth: 90 }}><RiskBar score={p.risk_score ?? 0} showLabel/></td>
                  <td>
                    <Link href={`/properties/${p.id}`} style={{ color: '#8b92a5', display: 'flex' }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </Link>
                  </td>
                </tr>
              ))}
              {recentProperties.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#8b92a5' }}>{mr.noData}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
