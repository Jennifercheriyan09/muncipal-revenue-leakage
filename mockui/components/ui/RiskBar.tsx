// Muted risk colors — consistent with government palette
const RISK_COLORS: Record<string, string> = {
  Critical: '#b91c1c',
  High:     '#c2410c',
  Medium:   '#a16207',
  Low:      '#15803d',
}

interface RiskBarProps {
  score: number | null | undefined
  showLabel?: boolean
  height?: number
}

function riskColor(score: number) {
  if (score >= 75) return RISK_COLORS.Critical
  if (score >= 50) return RISK_COLORS.High
  if (score >= 25) return RISK_COLORS.Medium
  return RISK_COLORS.Low
}

export default function RiskBar({ score, showLabel = false, height = 5 }: RiskBarProps) {
  const val = score ?? 0
  const color = riskColor(val)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 80 }}>
      <div className="risk-bar-track" style={{ flex: 1, height }}>
        <div className="risk-bar-fill" style={{ width: `${Math.min(val, 100)}%`, background: color, height: '100%' }}/>
      </div>
      {showLabel && <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 24, textAlign: 'right' }}>{val}</span>}
    </div>
  )
}
