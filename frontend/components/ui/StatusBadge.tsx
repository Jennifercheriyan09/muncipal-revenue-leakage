const LABEL_MAP: Record<string, string> = {
  new: 'New',
  under_review: 'Under Review',
  field_inspection: 'Field Inspection',
  reassessment: 'Reassessment',
  disputed: 'Disputed',
  closed: 'Closed',
}

export default function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>
  const label = LABEL_MAP[status] || status
  return <span className={`badge badge-${status}`}>{label}</span>
}
