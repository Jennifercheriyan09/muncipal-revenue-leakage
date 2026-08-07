'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/properties?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header style={{
      height: 56,
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{subtitle}</p>}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search property ID, owner, ward..."
            style={{
              paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
              border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12,
              width: 240, outline: 'none', color: '#374151', background: '#f9fafb',
              fontFamily: 'inherit',
            }}
          />
          <span style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            fontSize: 10, color: '#9ca3af', background: '#f3f4f6',
            padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace',
          }}>⌘K</span>
        </form>

        {/* Critical alert badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
          background: '#fef2f2', borderRadius: 9999, border: '1px solid #fecaca',
          cursor: 'pointer',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626' }}>28 Critical</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>need action</span>
        </div>

        {/* Notification bell */}
        <button style={{
          width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb',
          background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', color: '#6b7280',
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 7, height: 7,
            background: '#ef4444', borderRadius: '50%', border: '1px solid white',
          }} />
        </button>
      </div>
    </header>
  )
}
