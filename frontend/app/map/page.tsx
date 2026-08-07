'use client'

import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/layout/DashboardLayout'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapPage() {
  return (
    <DashboardLayout title="Map Analyzer" subtitle="Geographic leakage intelligence · Risk-scored properties across all wards">
      <div className="card" style={{ overflow: 'hidden', height: 'calc(100vh - 130px)' }}>
        <MapView />
      </div>
    </DashboardLayout>
  )
}
