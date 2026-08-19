import type { FraudSignal } from '@/lib/mockData'

const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
  GIS:      { bg: '#eef2fb', color: '#1e3a5f', border: '#c3d0f0', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg> },
  Usage:    { bg: '#fef9ec', color: '#7c4f00', border: '#edd890', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/></svg> },
  Exemption:{ bg: '#f6f2fc', color: '#4a1f7c', border: '#d5b8f5', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  Payment:  { bg: '#fff7ed', color: '#7d3a00', border: '#f5d5b8', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  Duplicate:{ bg: '#edf7f1', color: '#155730', border: '#a8d9ba', icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> },
}

const SEVERITY_COLOR: Record<string, string> = {
  high:   '#b91c1c',
  medium: '#c2410c',
  low:    '#a16207',
}

interface FraudSignalCardProps { signal: FraudSignal }

export default function FraudSignalCard({ signal }: FraudSignalCardProps) {
  const cat = CATEGORY_COLORS[signal.category] || { bg: '#f1f3f6', color: '#50576a', border: '#e3e6eb', icon: null }
  const sevColor = SEVERITY_COLOR[signal.severity] || '#50576a'

  return (
    <div className="evidence-card">
      <div className="evidence-card-header" style={{ background: cat.bg, borderBottom: `1px solid ${cat.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: cat.color }}>{cat.icon}</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#141822' }}>{signal.title}</span>
          <span className="badge" style={{ background: `${sevColor}15`, color: sevColor, fontSize: 10 }}>
            {signal.severity}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#50576a', fontWeight: 600 }}>+{signal.score_contribution} pts</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: sevColor }}>{signal.impact_label}</span>
        </div>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 12, color: '#50576a', lineHeight: 1.65, marginBottom: 10 }}>{signal.evidence}</p>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {signal.departments_involved.map(d => (
            <span key={d} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: '#eef2fb', color: '#1e3a5f', border: '1px solid #c3d0f0' }}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
