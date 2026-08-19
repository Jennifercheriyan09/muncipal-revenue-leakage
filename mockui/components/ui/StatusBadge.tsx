// Solid pill badges — Apex solid-fill style
const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  new:              { bg: '#dbeafe', color: '#1d4ed8', label: 'New' },
  under_review:     { bg: '#fef3c7', color: '#92400e', label: 'Under Review' },
  field_inspection: { bg: '#ffedd5', color: '#9a3412', label: 'Field Inspection' },
  reassessment:     { bg: '#ede9fe', color: '#5b21b6', label: 'Reassessment' },
  disputed:         { bg: '#fee2e2', color: '#991b1b', label: 'Disputed' },
  closed:           { bg: '#dcfce7', color: '#15803d', label: 'Closed' },
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS[status] || { bg: '#f1f3f6', color: '#50576a', label: status }
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: 11 }}>
      {cfg.label}
    </span>
  )
}
