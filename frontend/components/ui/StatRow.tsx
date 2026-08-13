interface StatItem { label: string; value: string; color?: string }

export default function StatRow({ items }: { items: StatItem[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 1, background: '#eef0f4', borderRadius: 10, overflow: 'hidden', border: '1px solid #e3e6eb' }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: 'white', padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: item.color || '#141822' }}>{item.value}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>{item.label}</div>
        </div>
      ))}
    </div>
  )
}
