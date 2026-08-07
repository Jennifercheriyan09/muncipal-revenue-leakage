const RISK_MAP: Record<string, { label: string; cls: string }> = {
  Critical: { label: 'Critical', cls: 'badge badge-critical' },
  High:     { label: 'High',     cls: 'badge badge-high' },
  Medium:   { label: 'Medium',   cls: 'badge badge-medium' },
  Low:      { label: 'Low',      cls: 'badge badge-low' },
}

export default function RiskBadge({ level }: { level: string | null | undefined }) {
  if (!level) return <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>
  const m = RISK_MAP[level] || { label: level, cls: 'badge' }
  return <span className={m.cls}>{m.label}</span>
}
