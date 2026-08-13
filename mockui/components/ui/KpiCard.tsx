'use client'

import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts'

// Each card gets a unique mini sparkline dataset
const SPARK_DATA: Record<string, { v: number }[]> = {
  cases:     [5,8,6,12,9,14,11,18,15,20,17,24].map(v=>({v})),
  risk:      [18,22,19,26,23,28,25,30,27,32,29,28].map(v=>({v})),
  urgent:    [3,5,4,7,6,8,7,9,8,10,9,7].map(v=>({v})),
  recovered: [1,2,2,3,3,4,5,5,6,7,8,10].map(v=>({v})),
}

interface KpiCardProps {
  icon: React.ReactNode
  iconBg?: string
  iconColor?: string
  value: string
  label: string
  trend?: string
  trendUp?: boolean
  accentColor?: string        // sparkline + trend color
  sparkKey?: keyof typeof SPARK_DATA
}

export default function KpiCard({
  icon,
  iconBg    = '#f1f3f6',
  iconColor = '#50576a',
  value,
  label,
  trend,
  trendUp   = true,
  accentColor = '#2c4ecf',
  sparkKey  = 'cases',
}: KpiCardProps) {
  const trendColor = trendUp ? '#15803d' : '#b91c1c'
  const data = SPARK_DATA[sparkKey] ?? SPARK_DATA.cases

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e3e6eb',
      borderRadius: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top section — label + icon */}
      <div style={{ padding: '18px 18px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          {/* Label */}
          <div style={{ fontSize: 12, fontWeight: 500, color: '#8b92a5', marginBottom: 6 }}>{label}</div>
          {/* Value */}
          <div style={{ fontSize: 28, fontWeight: 800, color: '#141822', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
          </div>
          {/* Trend */}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5">
                {trendUp
                  ? <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>
                  : <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>}
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: trendColor }}>{trend}</span>
            </div>
          )}
        </div>

        {/* Icon — soft circle, top-right */}
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: iconColor,
        }}>
          {icon}
        </div>
      </div>

      {/* Sparkline — bleeds to card edges, gradient fill */}
      <div style={{ marginTop: 'auto', height: 64, width: '100%' }}>
        <ResponsiveContainer width="100%" height={64}>
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`sg-${sparkKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={accentColor} stopOpacity={0.18}/>
                <stop offset="100%" stopColor={accentColor} stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <Tooltip
              content={() => null}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={accentColor}
              strokeWidth={2}
              fill={`url(#sg-${sparkKey})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
