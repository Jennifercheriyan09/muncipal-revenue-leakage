'use client'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
}

export default function Pagination({ page, pageSize, total, onPage }: PaginationProps) {
  const start = page * pageSize + 1
  const end   = Math.min((page + 1) * pageSize, total)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div style={{ padding: '11px 16px', borderTop: '1px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
      <span style={{ fontSize: 12, color: '#8b92a5' }}>Showing {start}–{end} of {total}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 11px', fontSize: 12 }}
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
        >← Prev</button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i).map(i => (
          <button
            key={i}
            className="btn"
            style={{ padding: '4px 9px', fontSize: 12, minWidth: 30, background: page === i ? '#1e3a5f' : 'white', color: page === i ? 'white' : '#50576a', border: '1px solid #e3e6eb', borderRadius: 7 }}
            onClick={() => onPage(i)}
          >{i + 1}</button>
        ))}
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 11px', fontSize: 12 }}
          onClick={() => onPage(page + 1)}
          disabled={end >= total}
        >Next →</button>
      </div>
    </div>
  )
}
