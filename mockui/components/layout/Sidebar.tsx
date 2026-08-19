'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const ACCENT = '#1d4ed8'  // hot magenta — exactly like Apex

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard', href: '/dashboard',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
      },
      {
        label: 'AI Assistant', href: '/ai-assistant',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
        </svg>,
      },
      {
        label: 'Reports', href: '/reports',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
      },
    ],
  },
  {
    label: 'Investigation',
    items: [
      {
        label: 'Cases', href: '/cases', badge: '34',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
      },
      {
        label: 'Properties', href: '/properties',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
      },
      {
        label: 'Map Analyzer', href: '/map',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Settings', href: '/settings',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      },
    ],
  },
]

export default function Sidebar({ onCollapse }: { onCollapse?: (c: boolean) => void }) {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    onCollapse?.(next)
  }

  return (
    <aside style={{
      width: collapsed ? 64 : 224,
      minHeight: 'calc(100vh - 20px)',
      background: '#0f1014',
      borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      position: 'fixed',
      left: 10,
      top: 10,
      bottom: 10,
      zIndex: 50,
      border: '1px solid rgba(255,255,255,0.04)',
      transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
      overflow: 'visible',
    }}>
      {/* Invisible overflow wrapper — lets collapse button peek outside without expanding page */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'visible' }}>

      {/* ── Logo row ──────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, position: 'relative' }}>
        {/* Magenta gradient icon — like Apex */}
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, #1e3a8a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${ACCENT}55` }}>
          <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: 14, letterSpacing: '0.01em', lineHeight: 1.2 }}>RevenueGuard</div>
            <div style={{ color: '#3a3a4a', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>DASHBOARD</div>
          </div>
        )}

        {/* Collapse toggle — floats on right edge of sidebar, half-outside */}
        <button
          onClick={() => toggle()}
          style={{
            position: 'absolute',
            right: -12,
            top: 26,
            width: 24, height: 24,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.12)',
            background: '#1a1a22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)',
            zIndex: 100,
            boxShadow: '2px 2px 8px rgba(0,0,0,0.4)',
            transition: 'border-color 0.15s, color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = ACCENT
            e.currentTarget.style.color = ACCENT
            e.currentTarget.style.background = '#22141c'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
            e.currentTarget.style.background = '#1a1a22'
          }}
        >
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {/* Group label */}
            {!collapsed && (
              <div style={{ padding: '10px 16px 5px', fontSize: 10, fontWeight: 700, color: '#3a3a4a', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{group.label}</span>
                <svg width="10" height="10" fill="none" stroke="#3a3a4a" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            )}

            {group.items.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '9px 0' : '9px 14px',
                    margin: '1px 8px',
                    borderRadius: 8,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive ? '#1e1e26' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                    position: 'relative',
                  }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Icon */}
                    <span style={{
                      color: isActive ? ACCENT : '#6b7080',
                      flexShrink: 0,
                      transition: 'color 150ms',
                      display: 'flex',
                    }}>
                      {item.icon}
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span style={{
                        fontSize: 13.5,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? ACCENT : '#b0b5c0',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        transition: 'color 150ms',
                      }}>
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {!collapsed && item.badge && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        background: 'rgba(233,30,140,0.18)',
                        color: ACCENT,
                        borderRadius: 9999,
                        padding: '1px 7px',
                        flexShrink: 0,
                      }}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active left-edge indicator */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: -8, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: '60%',
                        background: ACCENT,
                        borderRadius: '0 3px 3px 0',
                      }}/>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── AI status strip ───────────────────────────────────────────── */}
      {!collapsed && (
        <div style={{ margin: '0 10px 8px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7080', fontSize: 11, fontWeight: 600 }}>AI Pipeline</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#4ade80' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
              Active
            </span>
          </div>
          <div style={{ color: '#2e3040', fontSize: 10, marginTop: 2 }}>LangGraph · 10 agents</div>
        </div>
      )}

      {/* ── User footer ───────────────────────────────────────────────── */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        {/* Magenta avatar — Apex style */}
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11, flexShrink: 0, letterSpacing: '0.02em' }}>
          AD
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#d0d4e0', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>A. Deshmukh</div>
              <div style={{ color: '#3a3a4a', fontSize: 10.5, marginTop: 1 }}>Admin</div>
            </div>
            <Link href="/login" title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a3a4a', display: 'flex', padding: 4, borderRadius: 5, transition: 'color 0.14s', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6b7080')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3a3a4a')}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </Link>
          </>
        )}
      </div>
      </div>{/* end overflow wrapper */}
    </aside>
  )
}
