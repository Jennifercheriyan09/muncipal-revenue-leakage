'use client'

interface TopBarProps {
  actions?: React.ReactNode
}

export default function TopBar({ actions }: TopBarProps) {
  return (
    <div className="topbar">
      {/* Global search */}
      <div style={{ position: 'relative', flex: '0 1 280px' }}>
        <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#8b92a5' }} width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input className="input" placeholder="Search anything…" style={{ paddingLeft: 28, width: '100%', fontSize: 12, background: '#f5f6f9', border: '1px solid #e3e6eb' }} readOnly/>
        <kbd style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#8b92a5', background: '#eef0f4', border: '1px solid #e3e6eb', borderRadius: 4, padding: '1px 5px', fontFamily: 'inherit' }}>⌘K</kbd>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Right icon cluster */}
      <button className="btn btn-ghost" style={{ padding: '5px 7px' }} title="Toggle theme">
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
      <button className="btn btn-ghost" style={{ padding: '5px 7px' }} title="Help">
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </button>
      <a href="/notifications" style={{ textDecoration: 'none' }}>
        <button className="btn btn-ghost" style={{ padding: '5px 7px', position: 'relative' }} title="Notifications">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, background: '#b91c1c', borderRadius: '50%', border: '1.5px solid #fff' }}/>
        </button>
      </a>

      <div style={{ width: 1, height: 22, background: '#e3e6eb', margin: '0 4px' }}/>

      {/* User avatar — matches sidebar magenta style */}
      <a href="/settings" style={{ textDecoration: 'none' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 10, cursor: 'pointer', border: '2px solid #eff6ff' }}>
          AD
        </div>
      </a>

      {/* Page-level actions */}
      {actions}
    </div>
  )
}
