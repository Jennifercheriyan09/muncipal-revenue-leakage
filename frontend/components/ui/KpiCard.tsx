interface KpiCardProps {
  icon: React.ReactNode
  value: string
  label: string
  sub?: string
  trend?: string
  trendUp?: boolean
  badge?: string
  badgeColor?: string
  accentColor?: string
}

export default function KpiCard({
  icon, value, label, sub, trend, trendUp, badge, badgeColor, accentColor = '#6366f1',
}: KpiCardProps) {
  return (
    <div className="card animate-fade-in" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `${accentColor}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor, flexShrink: 0,
        }}>
          {icon}
        </div>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999,
            background: badgeColor ? `${badgeColor}18` : '#fef2f2',
            color: badgeColor || '#ef4444',
            border: `1px solid ${badgeColor ? `${badgeColor}30` : '#fecaca'}`,
          }}>{badge}</span>
        )}
        {trend && !badge && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 9999,
            background: trendUp ? '#f0fdf4' : '#fef2f2',
            color: trendUp ? '#16a34a' : '#dc2626',
          }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}
