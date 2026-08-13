'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBar from '@/components/ui/RiskBar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { WARDS, DASHBOARD_STATS, MONTHLY_TREND, formatCurrency } from '@/lib/mockData'

// ── Consistent theme colors ────────────────────────────────────────────────
const ACCENT   = '#1d4ed8'
const R_COLORS = { Critical: '#b91c1c', High: '#c2410c', Medium: '#a16207', Low: '#15803d' }
const TOOLTIP_STYLE = { borderRadius: 8, border: '1px solid #e3e6eb', fontSize: 12, background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

// ── Chart data ─────────────────────────────────────────────────────────────
const wardBarData = WARDS.map(w => ({
  name: w.code, fullName: w.name,
  Critical: w.critical_count, High: w.high_count, Medium: w.medium_count, Low: w.low_count,
}))

const recoveryTrend = MONTHLY_TREND.map(m => ({
  ...m, target: Math.round(m.recovered * 1.2),
}))

const totalCritical = WARDS.reduce((s, w) => s + w.critical_count, 0)
const totalHigh     = WARDS.reduce((s, w) => s + w.high_count, 0)
const totalMedium   = WARDS.reduce((s, w) => s + w.medium_count, 0)
const totalLow      = WARDS.reduce((s, w) => s + w.low_count, 0)

const pieData = [
  { name: 'Critical', value: totalCritical, color: R_COLORS.Critical },
  { name: 'High',     value: totalHigh,     color: R_COLORS.High },
  { name: 'Medium',   value: totalMedium,   color: R_COLORS.Medium },
  { name: 'Low',      value: totalLow,      color: R_COLORS.Low },
]

const fraudTypeData = [
  { type: 'Area Mismatch',       count: 42, impact: 8200000, color: R_COLORS.Critical },
  { type: 'Usage Mismatch',      count: 31, impact: 5600000, color: R_COLORS.High },
  { type: 'Fake Exemption',      count: 24, impact: 4100000, color: '#5b21b6' },
  { type: 'High Arrears',        count: 38, impact: 3800000, color: R_COLORS.Medium },
  { type: 'Payment Manipulation',count: 14, impact: 2900000, color: '#1e3a5f' },
  { type: 'Duplicate Record',    count: 7,  impact: 1800000, color: R_COLORS.Low },
]

// ── Custom tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, currency }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; currency?: boolean }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid #e3e6eb', borderRadius: 9, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 140 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: '#8b92a5', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }}/>
          <span style={{ color: '#50576a' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: '#141822', marginLeft: 'auto' }}>
            {currency ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [wardFilter, setWardFilter] = useState('')
  const filteredWards = wardFilter ? WARDS.filter(w => w.id === Number(wardFilter)) : WARDS

  return (
    <DashboardLayout
      title="Reports & Analytics"
      subtitle="Revenue leakage intelligence across all wards · FY 2025–26"
      breadcrumb="Dashboard"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="select" value={wardFilter} onChange={e => setWardFilter(e.target.value)}>
            <option value="">All Wards</option>
            {WARDS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <button className="btn btn-secondary" style={{ fontSize: 12, gap: 5 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
        </div>
      }
    >
      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {[
          { label: 'Wards Analyzed',  value: String(WARDS.length),   icon: <svg width="18" height="18" fill="none" stroke={ACCENT} strokeWidth="1.75" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>, bg: '#eff6ff', color: ACCENT },
          { label: 'Critical Cases',  value: String(totalCritical),  icon: <svg width="18" height="18" fill="none" stroke={R_COLORS.Critical} strokeWidth="1.75" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>, bg: '#fee2e2', color: R_COLORS.Critical },
          { label: 'High Risk Cases', value: String(totalHigh),      icon: <svg width="18" height="18" fill="none" stroke={R_COLORS.High} strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, bg: '#fff7ed', color: R_COLORS.High },
          { label: 'Revenue at Risk', value: formatCurrency(DASHBOARD_STATS.total_revenue_at_risk), icon: <svg width="18" height="18" fill="none" stroke={R_COLORS.Critical} strokeWidth="1.75" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, bg: '#fee2e2', color: R_COLORS.Critical },
          { label: 'Revenue Recovered', value: formatCurrency(DASHBOARD_STATS.recovered_revenue), icon: <svg width="18" height="18" fill="none" stroke={R_COLORS.Low} strokeWidth="1.75" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>, bg: '#dcfce7', color: R_COLORS.Low },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {k.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-0.01em' }}>{k.value}</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 3, fontWeight: 500 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Stacked bar + Pie + Fraud breakdown ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px 260px', gap: 16 }}>

        {/* Cases by ward */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Cases by Ward & Risk Level</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>Stacked severity · all {WARDS.length} wards</div>
            </div>
          </div>
          <div style={{ padding: '16px 16px 12px' }}>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={wardBarData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f6" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8b92a5' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#8b92a5' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }}/>
                <Bar dataKey="Critical" stackId="a" fill={R_COLORS.Critical}/>
                <Bar dataKey="High"     stackId="a" fill={R_COLORS.High}/>
                <Bar dataKey="Medium"   stackId="a" fill={R_COLORS.Medium}/>
                <Bar dataKey="Low"      stackId="a" fill={R_COLORS.Low} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk distribution pie */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            <div className="section-title">Risk Distribution</div>
          </div>
          <div style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={32} paddingAngle={2} strokeWidth={0}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                </Pie>
                <Tooltip content={<ChartTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }}/>
                    <span style={{ color: '#50576a' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fraud type breakdown */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            <div className="section-title">Fraud Type Breakdown</div>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {fraudTypeData.map((f, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11.5, color: '#50576a', fontWeight: 500 }}>{f.type}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#141822' }}>{f.count}</span>
                </div>
                <div className="risk-bar-track">
                  <div className="risk-bar-fill" style={{ width: `${(f.count / 42) * 100}%`, background: f.color }}/>
                </div>
                <div style={{ fontSize: 10, color: '#8b92a5', marginTop: 2 }}>{formatCurrency(f.impact)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Recovery trend + Monthly cases ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Recovery vs Target */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Recovery vs Target</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>Actual recovery vs monthly target · last 6 months</div>
            </div>
          </div>
          <div style={{ padding: '16px 16px 12px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={recoveryTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f6" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8b92a5' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: '#8b92a5' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                <Tooltip content={<ChartTooltip currency/>}/>
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }}/>
                <Line type="monotone" dataKey="recovered" name="Actual"  stroke={R_COLORS.Low} strokeWidth={2.5} dot={{ r: 4, fill: R_COLORS.Low, strokeWidth: 0 }} activeDot={{ r: 5 }}/>
                <Line type="monotone" dataKey="target"    name="Target"  stroke={ACCENT}       strokeWidth={1.75} strokeDasharray="5 4" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly cases trend */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="section-header">
            <div>
              <div className="section-title">Monthly Cases Opened</div>
              <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>New cases detected · last 6 months</div>
            </div>
          </div>
          <div style={{ padding: '16px 16px 12px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MONTHLY_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={ACCENT} stopOpacity={0.18}/>
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f6" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8b92a5' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: '#8b92a5' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Area type="monotone" dataKey="cases" name="Cases" stroke={ACCENT} strokeWidth={2.5} fill="url(#casesGrad)" dot={{ r: 4, fill: ACCENT, strokeWidth: 0 }} activeDot={{ r: 5 }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Ward breakdown table ───────────────────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="section-header">
          <div>
            <div className="section-title">Ward-by-Ward Breakdown</div>
            <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>Sorted by average risk score</div>
          </div>
          <span style={{ fontSize: 12, color: '#8b92a5' }}>{filteredWards.length} wards</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ward</th>
                <th>Code</th>
                <th style={{ color: R_COLORS.Critical }}>Critical</th>
                <th style={{ color: R_COLORS.High }}>High</th>
                <th style={{ color: R_COLORS.Medium }}>Medium</th>
                <th style={{ color: R_COLORS.Low }}>Low</th>
                <th>Total</th>
                <th>Res. Tax</th>
                <th>Com. Tax</th>
                <th>Avg Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredWards].sort((a, b) => b.avg_risk_score - a.avg_risk_score).map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{w.name}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: '#eff6ff', padding: '2px 8px', borderRadius: 9999, whiteSpace: 'nowrap' }}>
                      {w.code}
                    </span>
                  </td>
                  <td><span style={{ fontWeight: 700, color: R_COLORS.Critical }}>{w.critical_count}</span></td>
                  <td><span style={{ fontWeight: 700, color: R_COLORS.High }}>{w.high_count}</span></td>
                  <td><span style={{ fontWeight: 700, color: R_COLORS.Medium }}>{w.medium_count}</span></td>
                  <td><span style={{ fontWeight: 700, color: R_COLORS.Low }}>{w.low_count}</span></td>
                  <td style={{ fontWeight: 700 }}>{w.total_cases}</td>
                  <td style={{ fontSize: 12.5, color: '#50576a' }}>{(w.tax_rate_residential * 100).toFixed(0)}%</td>
                  <td style={{ fontSize: 12.5, color: '#50576a' }}>{(w.tax_rate_commercial * 100).toFixed(0)}%</td>
                  <td style={{ minWidth: 140 }}><RiskBar score={w.avg_risk_score} showLabel/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
