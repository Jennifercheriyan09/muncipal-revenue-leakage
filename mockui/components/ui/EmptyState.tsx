interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#8b92a5' }}>
      {icon && <div style={{ marginBottom: 14, opacity: 0.4 }}>{icon}</div>}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#50576a', marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: 12 }}>{description}</div>}
    </div>
  )
}
