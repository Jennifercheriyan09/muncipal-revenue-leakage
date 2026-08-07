'use client'

import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getWardSummary, getDashboardStats, formatCurrency, type WardSummary } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const RISK_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
}

export default function ReportsPage() {
  const { data: wards, isLoading: wardsLoading } = useQuery({
    queryKey: ['ward-summary'],
    queryFn: getWardSummary,
    retry: false,
  })
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    retry: false,
  })

  const isLoading = wardsLoading || statsLoading

  // Chart data
  const topWardsData = (wards || [])
    .sort((a, b) => b.total_cases - a.total_cases)
    .slice(0, 8)
    .map(w => ({
      name: w.ward_name.replace('Ward No ', 'W').replace('Ward ', 'W'),
      Critical: w.critical_count,
      High: w.high_count,
      Medium: w.medium_count,
      Low: w.low_count,
      total: w.total_cases,
    }))

  const totalCritical = (wards || []).reduce((s, w) => s + w.critical_count, 0)
  const totalHigh = (wards || []).reduce((s, w) => s + w.high_count, 0)
  const totalMedium = (wards || []).reduce((s, w) => s + w.medium_count, 0)
  const totalLow = (wards || []).reduce((s, w) => s + w.low_count, 0)

  const pieData = [
    { name: 'Critical', value: totalCritical, color: '#ef4444' },
    { name: 'High', value: totalHigh, color: '#f97316' },
    { name: 'Medium', value: totalMedium, color: '#eab308' },
    { name: 'Low', value: totalLow, color: '#22c55e' },
  ].filter(d => d.value > 0)

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Revenue leakage intelligence across all wards · FY 2025-26">
      {isLoading ? <LoadingSpinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Total Wards Analyzed', value: (wards || []).length, color: '#6366f1' },
              { label: 'Critical Properties', value: totalCritical, color: '#ef4444' },
              { label: 'High Risk Properties', value: totalHigh, color: '#f97316' },
              { label: 'Revenue at Risk', value: formatCurrency(stats?.total_revenue_at_risk), color: '#22c55e' },
            ].map(k => (
              <div key={k.label} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{String(k.value)}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
            {/* Bar Chart */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Cases by Ward & Risk Level</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topWardsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Bar dataKey="Critical" stackId="a" fill="#ef4444" radius={[0,0,0,0]} />
                  <Bar dataKey="High" stackId="a" fill="#f97316" />
                  <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                  <Bar dataKey="Low" stackId="a" fill="#22c55e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ward Summary Table */}
          <div className="card">
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f2f5' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Ward-by-Ward Breakdown</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ward</th>
                    <th>Code</th>
                    <th style={{ color: '#ef4444' }}>Critical</th>
                    <th style={{ color: '#f97316' }}>High</th>
                    <th style={{ color: '#eab308' }}>Medium</th>
                    <th style={{ color: '#22c55e' }}>Low</th>
                    <th>Total Cases</th>
                    <th>Avg Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(wards || []).sort((a, b) => b.avg_risk_score - a.avg_risk_score).map(w => (
                    <tr key={w.ward_id}>
                      <td style={{ fontWeight: 600 }}>{w.ward_name}</td>
                      <td style={{ color: '#6b7280' }}>{w.ward_code}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#ef4444' }}>{w.critical_count}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#f97316' }}>{w.high_count}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#eab308' }}>{w.medium_count}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#22c55e' }}>{w.low_count}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{w.total_cases}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 9999, overflow: 'hidden', minWidth: 60 }}>
                            <div style={{
                              height: '100%', width: `${Math.min(w.avg_risk_score, 100)}%`,
                              background: w.avg_risk_score >= 75 ? '#ef4444' : w.avg_risk_score >= 50 ? '#f97316' : w.avg_risk_score >= 25 ? '#eab308' : '#22c55e',
                              borderRadius: 9999,
                            }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 32, textAlign: 'right' }}>{w.avg_risk_score}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
