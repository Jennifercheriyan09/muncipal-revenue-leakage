'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const ACCENT = '#1d4ed8'

type NotifType = 'alert' | 'payment' | 'case' | 'system' | 'assignment'

interface Notification {
  id: number
  type: NotifType
  title: string
  desc: string
  time: string
  read: boolean
}

const ALL_NOTIFICATIONS: Notification[] = [
  { id: 1,  type: 'alert',      title: 'Critical Case Detected',       desc: 'Property KDMC-2024-00371 (Manoj Tiwari) scored 88 — Critical risk. Immediate action required.',                     time: '2 min ago',   read: false },
  { id: 2,  type: 'payment',    title: 'Revenue Recovered',            desc: 'Case #5 closed — ₹1,45,000 recovered from Dinesh Shah, Ward 05.',                                                    time: '15 min ago',  read: false },
  { id: 3,  type: 'case',       title: 'Case Assigned to You',         desc: 'Case #1 (Ramesh Gupta, KDMC-2024-00142) has been assigned to you by Arjun Deshmukh.',                                time: '1 hour ago',  read: false },
  { id: 4,  type: 'alert',      title: 'Exemption Verification Due',   desc: 'Widow exemption for Sunita Mehta (KDMC-2024-00289) has no document on file. 15-day deadline approaching.',          time: '2 hours ago', read: false },
  { id: 5,  type: 'case',       title: 'Field Inspection Completed',   desc: 'Case #3 moved to Reassessment by Sneha Kulkarni. New construction wing measured at 330 m².',                        time: '3 hours ago', read: true  },
  { id: 6,  type: 'system',     title: 'AI Pipeline Run Complete',     desc: '1,247 properties analysed. 15 new cases created. 4 Critical, 9 High, 2 Medium risk detections.',                   time: '5 hours ago', read: true  },
  { id: 7,  type: 'payment',    title: 'Arrears Notice Issued',        desc: 'Formal notice sent to Vikas Bhosale (KDMC-2024-01134) for ₹38,500 outstanding arrears.',                           time: '1 day ago',   read: true  },
  { id: 8,  type: 'assignment', title: 'Officer Assigned',             desc: 'Case #4 (Lata Desai, Ward 03) assigned to Rahul Patil for exemption verification.',                                 time: '1 day ago',   read: true  },
  { id: 9,  type: 'system',     title: 'System Update',                desc: 'RevenueGuard v0.2.0 deployed successfully. New features: AI Pipeline improvements, GIS area comparison.',           time: '2 days ago',  read: true  },
  { id: 10, type: 'alert',      title: 'Duplicate Record Detected',    desc: 'Property KDMC-2024-00289 may be a duplicate of KDMC-2024-00291. Similarity score: 0.92.',                          time: '3 days ago',  read: true  },
]

const TYPE_CONFIG: Record<NotifType, { bg: string; color: string; icon: React.ReactNode }> = {
  alert: {
    bg: '#fef2f2', color: '#b91c1c',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  payment: {
    bg: '#f0fdf4', color: '#15803d',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  case: {
    bg: '#eff6ff', color: ACCENT,
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>,
  },
  system: {
    bg: '#fef3c7', color: '#b45309',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  assignment: {
    bg: '#eef2fb', color: '#2c4ecf',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [notifs, setNotifs] = useState<Notification[]>(ALL_NOTIFICATIONS)

  const unreadCount = notifs.filter(n => !n.read).length

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read')   return n.read
    return true
  })

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  function markRead(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Stay up to date with your latest alerts and messages."
      breadcrumb="Dashboard"
      actions={
        <button className="btn btn-secondary" style={{ fontSize: 12, marginLeft: 8, gap: 5 }} onClick={markAllRead}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          Mark all as read
        </button>
      }
    >
      <div className="card" style={{ overflow: 'hidden' }}>

        {/* Header row */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e3e6eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#141822' }}>All Notifications</span>
            {unreadCount > 0 && (
              <span className="badge" style={{ background: ACCENT, color: 'white', fontSize: 11 }}>{unreadCount} unread</span>
            )}
          </div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 3, background: '#f1f3f6', padding: 3, borderRadius: 8 }}>
            {(['all', 'unread', 'read'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: filter === f ? 600 : 400, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: filter === f ? 'white' : 'transparent', color: filter === f ? '#141822' : '#8b92a5', boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.13s', textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notification list */}
        <div>
          {filtered.length === 0 && (
            <div style={{ padding: 56, textAlign: 'center', color: '#8b92a5', fontSize: 14 }}>
              No {filter === 'all' ? '' : filter} notifications
            </div>
          )}
          {filtered.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type]
            const isLast = i === filtered.length - 1
            return (
              <div key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', gap: 14, padding: '16px 20px',
                  borderBottom: isLast ? 'none' : '1px solid #f0f2f6',
                  background: n.read ? 'white' : '#fdf5fb',
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fc')}
                onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'white' : '#fdf5fb')}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13.5, color: '#141822', lineHeight: 1.3 }}>
                      {n.title}
                      {!n.read && (
                        <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: ACCENT, marginLeft: 7, verticalAlign: 'middle', flexShrink: 0 }}/>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#50576a', marginTop: 3, lineHeight: 1.5 }}>{n.desc}</div>
                  <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 5 }}>{n.time}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f2f6', textAlign: 'center' }}>
            <button style={{ fontSize: 13, fontWeight: 600, color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              View all notifications
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
