'use client'

import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/layout/DashboardLayout'
import KpiCard from '@/components/ui/KpiCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import UrgentCasesQueue from '@/components/dashboard/UrgentCasesQueue'
import CaseListTable from '@/components/dashboard/CaseListTable'
import { getDashboardStats, formatCurrency, formatLakh } from '@/lib/api'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    retry: false,
  })

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Municipal Revenue Leakage Intelligence · FY 2025-26"
    >
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <KpiCard
          icon={
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          value={isLoading ? '—' : String(stats?.total_cases ?? 0)}
          label="Suspected Leakage Cases"
          sub="+15 new this month"
          trend="12%"
          trendUp
          accentColor="#6366f1"
        />
        <KpiCard
          icon={
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          value={isLoading ? '—' : formatLakh(stats?.total_revenue_at_risk)}
          label="Total Revenue at Risk"
          sub={isLoading ? '' : `${formatCurrency(stats?.total_revenue_at_risk)} across ${stats?.total_cases} cases`}
          badge="at risk"
          badgeColor="#f97316"
          accentColor="#f97316"
        />
        <KpiCard
          icon={
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
          value={isLoading ? '—' : String(stats?.urgent_cases ?? 0)}
          label="Urgent Action Cases"
          sub="Critical & high-risk properties"
          badge="URGENT"
          badgeColor="#ef4444"
          accentColor="#ef4444"
        />
        <KpiCard
          icon={
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          value={isLoading ? '—' : formatLakh(stats?.recovered_revenue)}
          label="Recovered Revenue"
          sub="34 cases closed & recovered"
          trend="8%"
          trendUp
          accentColor="#22c55e"
        />
      </div>

      {/* Map + Urgent Queue Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 0 }}>
        {/* Map Card */}
        <div className="card" style={{ overflow: 'hidden', minHeight: 380 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Geographic Leakage Map</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                  background: '#dcfce7', color: '#16a34a',
                }}>LIVE</span>
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Risk-scored properties · 9 wards</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>Heatmap</button>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>Satellite</button>
            </div>
          </div>
          <div style={{ height: 340 }}>
            <MapView embedded />
          </div>
        </div>

        {/* Urgent Queue */}
        <UrgentCasesQueue />
      </div>

      {/* Case List */}
      <CaseListTable />
    </DashboardLayout>
  )
}
