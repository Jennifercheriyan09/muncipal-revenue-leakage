'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import PageTransition from './PageTransition'

interface DashboardLayoutProps {
  title: string
  subtitle?: string
  breadcrumb?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export default function DashboardLayout({ title, subtitle, breadcrumb, actions, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? 64 : 224

  return (
    <div style={{
      display: 'block',
      minHeight: '100vh',
      background: '#f1f3f6',
      width: '100%',
      // Clip the sidebar collapse button bleed
      overflowX: 'clip',
    }}>
      <Sidebar onCollapse={setCollapsed}/>

      {/* Content — offset by sidebar width + its left gap */}
      <div style={{
        marginLeft: sidebarW + 20,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 220ms cubic-bezier(0.4,0,0.2,1)',
      }}>
        <TopBar actions={actions}/>
        <PageTransition>
          <main className="page-content">
            {/* Page header — breadcrumb + title */}
            <div className="page-header" style={{ marginBottom: breadcrumb ? 4 : 8 }}>
              {breadcrumb && (
                <div className="breadcrumb">
                  <span>{breadcrumb}</span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  <span style={{ color: '#50576a' }}>{title}</span>
                </div>
              )}
              <h1 className="page-title">{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {children}
          </main>
        </PageTransition>
      </div>
    </div>
  )
}
