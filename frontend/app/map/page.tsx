'use client'

import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { WARDS, PROPERTIES } from '@/lib/mockData'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 180px)',
      background: '#f8f9fb',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#8b92a5',
      fontSize: 14,
      fontWeight: 500,
    }}>
      Loading interactive map intelligence…
    </div>
  ),
})

export default function MapPage() {
  return (
    <DashboardLayout
      title="Map Analyzer"
      subtitle="Geographic leakage intelligence · Risk-scored properties across all wards"
      breadcrumb="Dashboard"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Live Interactive Map */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <MapView />
        </div>

        {/* Ward Summary Grid */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#141822' }}>Ward Risk Intelligence Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {WARDS.map(w => (
              <div key={w.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#141822' }}>{w.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '1px 6px', borderRadius: 5, marginTop: 3, display: 'inline-block' }}>{w.code}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#141822' }}>{w.total_cases}</div>
                    <div style={{ fontSize: 10, color: '#8b92a5' }}>total cases</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { label: 'C', count: w.critical_count, color: '#b91c1c' },
                    { label: 'H', count: w.high_count,     color: '#c2410c' },
                    { label: 'M', count: w.medium_count,   color: '#a16207' },
                    { label: 'L', count: w.low_count,      color: '#15803d' },
                  ].map(r => (
                    <div key={r.label} style={{ flex: 1, textAlign: 'center', padding: '5px 4px', background: `${r.color}12`, borderRadius: 7 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: r.color }}>{r.count}</div>
                      <div style={{ fontSize: 9, color: r.color, fontWeight: 700 }}>{r.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: '#8b92a5' }}>Avg risk score</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#141822' }}>{w.avg_risk_score}</span>
                  </div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width: `${w.avg_risk_score}%`, background: w.avg_risk_score >= 75 ? '#b91c1c' : w.avg_risk_score >= 50 ? '#c2410c' : w.avg_risk_score >= 25 ? '#a16207' : '#15803d' }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
