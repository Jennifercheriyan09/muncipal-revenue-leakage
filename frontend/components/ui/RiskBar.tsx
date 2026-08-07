function riskColor(score: number): string {
  if (score >= 75) return '#ef4444'
  if (score >= 50) return '#f97316'
  if (score >= 25) return '#eab308'
  return '#22c55e'
}

interface RiskBarProps {
  score: number | null | undefined
  showLabel?: boolean
}

export default function RiskBar({ score, showLabel = false }: RiskBarProps) {
  const s = score ?? 0
  const color = riskColor(s)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="risk-bar-track" style={{ flex: 1 }}>
        <div className="risk-bar-fill" style={{ width: `${Math.min(s, 100)}%`, background: color }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 24, textAlign: 'right' }}>{s}</span>
      )}
    </div>
  )
}
