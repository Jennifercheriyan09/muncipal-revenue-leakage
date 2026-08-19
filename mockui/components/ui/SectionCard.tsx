interface SectionCardProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  noPadding?: boolean
}

export default function SectionCard({ title, subtitle, actions, children, noPadding }: SectionCardProps) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="section-header">
        <div>
          <div className="section-title">{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
      </div>
      <div style={noPadding ? {} : { padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
