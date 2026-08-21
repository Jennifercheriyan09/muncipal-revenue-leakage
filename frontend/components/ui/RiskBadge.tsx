import { riskLevelMr } from '@/lib/mr'

// Fully-rounded pill badges — Apex style
const RISK: Record<string, { color: string; bg: string }> = {
  Critical: { color: '#fff', bg: '#b91c1c' },
  High:     { color: '#fff', bg: '#c2410c' },
  Medium:   { color: '#7c5200', bg: '#fef3c7' },
  Low:      { color: '#15803d', bg: '#dcfce7' },
  critical: { color: '#fff', bg: '#b91c1c' },
  high:     { color: '#fff', bg: '#c2410c' },
  medium:   { color: '#7c5200', bg: '#fef3c7' },
  low:      { color: '#15803d', bg: '#dcfce7' },
}

export default function RiskBadge({ level }: { level: string | null | undefined }) {
  if (!level) return <span style={{ color: '#8b92a5', fontSize: 12 }}>—</span>
  const cfg = RISK[level] || { color: '#50576a', bg: '#eef0f4' }
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: 11 }}>
      {riskLevelMr(level)}
    </span>
  )
}
