'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const TABS = ['Profile', 'AI Pipeline', 'Notifications', 'Users & Roles', 'Database', 'Security']

export default function SettingsPage() {
  const [tab, setTab]     = useState('Profile')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account, system configuration, and preferences."
      breadcrumb="Dashboard"
    >
      {/* Underline tab bar */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0 20px', background: '#fff', borderBottom: '1px solid #e3e6eb' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '12px 16px', fontSize: 13, fontWeight: tab === t ? 600 : 500, cursor: 'pointer', border: 'none', background: 'transparent', color: tab === t ? '#141822' : '#8b92a5', borderBottom: `2px solid ${tab === t ? '#1d4ed8' : 'transparent'}`, marginBottom: -1, transition: 'all 0.14s', fontFamily: 'inherit' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Profile ─────────────────────────────────────────────────── */}
          {tab === 'Profile' && (
            <>
              {/* Cover banner + avatar card */}
              <div className="card" style={{ overflow: 'hidden', marginBottom: 4 }}>
                {/* Cover gradient banner */}
                <div style={{ height: 120, background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 50%, #880e4f 100%)' }}/>

                {/* Avatar row */}
                <div style={{ padding: '0 24px 18px', position: 'relative' }}>
                  {/* Avatar — overlaps the banner */}
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 24, border: '3px solid white', position: 'relative', top: -36, marginBottom: -20, boxShadow: '0 4px 12px rgba(233,30,140,0.35)' }}>
                    AD
                  </div>

                  {/* Name + role row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#141822' }}>Arjun Deshmukh</div>
                      <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: 11 }}>Admin</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" style={{ fontSize: 12, gap: 5 }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  {/* Department */}
                  <div style={{ fontSize: 13, color: '#8b92a5', marginTop: 2 }}>Investigation &amp; Fraud Detection · KDMC</div>

                  {/* Info strip */}
                  <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f2f6', flexWrap: 'wrap' }}>
                    {[
                      { icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text: 'a.deshmukh@kdmc.gov.in' },
                      { icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, text: 'Kalyan, Maharashtra' },
                      { icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 15.46v1.46"/></svg>, text: '+91 98765 43210' },
                      { icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, text: 'Joined April 2023' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#50576a', fontSize: 12 }}>
                        <span style={{ color: '#8b92a5' }}>{item.icon}</span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { label: 'First name',    value: 'Arjun' },
                  { label: 'Last name',     value: 'Deshmukh' },
                  { label: 'Email',         value: 'a.deshmukh@kdmc.gov.in' },
                  { label: 'Designation',   value: 'Investigation Officer' },
                  { label: 'Municipal Body',value: 'KDMC – Kalyan Dombivli' },
                  { label: 'Ward',          value: 'Ward No. 1 – Kalyan East' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input className="input" defaultValue={f.value} style={{ width: '100%' }}/>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea className="input" style={{ width: '100%', height: 80, resize: 'vertical', paddingTop: 8 }} defaultValue="Investigation Officer at KDMC. Responsible for revenue leakage detection and field verification."/>
              </div>
            </>
          )}

          {/* ── AI Pipeline ─────────────────────────────────────────────── */}
          {tab === 'AI Pipeline' && (
            <>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>AI Pipeline Configuration</div>
                <div style={{ fontSize: 12, color: '#8b92a5' }}>LLM providers and fraud detection thresholds</div>
              </div>
              <div style={{ paddingBottom: 20, borderBottom: '1px solid #f0f2f6' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>LLM Provider</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Groq API Key',      type: 'password', value: '', hint: 'Get key at console.groq.com/keys' },
                    { label: 'Groq Model',         type: 'text',     value: 'llama-3.3-70b-versatile' },
                    { label: 'Ollama Base URL',    type: 'text',     value: 'http://ollama:11434' },
                    { label: 'Ollama Chat Model',  type: 'text',     value: 'llama3.2' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input className="input" type={f.type} defaultValue={f.value} placeholder={f.type === 'password' ? '••••••••••••••' : undefined} style={{ width: '100%' }}/>
                      {f.hint && <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 4 }}>{f.hint}</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Fraud Detection Thresholds</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Area Mismatch Threshold (%)', value: '20' },
                    { label: 'Arrears Threshold (₹)',        value: '10000' },
                    { label: 'Duplicate Similarity Score',   value: '0.80' },
                    { label: 'Manual Adjustment Limit',      value: '3' },
                    { label: 'Critical Score Cutoff',        value: '75' },
                    { label: 'High Score Cutoff',            value: '50' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input className="input" defaultValue={f.value} style={{ width: '100%' }}/>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Agent Pipeline Status</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {['property_validation','area_mismatch','usage_verification','exemption_audit','payment_analysis','high_arrears','duplicate_property','fraud_scoring','revenue_impact','evidence_summary','notification'].map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: '#f8f9fb', borderRadius: 7, border: '1px solid #eef0f4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803d', display: 'inline-block' }}/>
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#50576a' }}>{a}</span>
                      </div>
                      <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontSize: 9, padding: '1px 6px' }}>Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Notifications ────────────────────────────────────────────── */}
          {tab === 'Notifications' && (
            <>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Notification Preferences</div>
                <div style={{ fontSize: 12, color: '#8b92a5' }}>Choose which events trigger alerts</div>
              </div>
              {[
                { label: 'New Critical Case Detected',   desc: 'Alert when a property scores Critical risk', on: true },
                { label: 'Unassigned Case Reminder',     desc: 'Daily reminder for cases without an officer', on: true },
                { label: 'Exemption Verification Due',   desc: 'Alert when exemption docs are overdue', on: true },
                { label: 'Revenue Recovery Milestone',   desc: 'Notify when recovery target is reached', on: false },
                { label: 'Agent Pipeline Failure',       desc: 'Alert if LangGraph pipeline throws an error', on: true },
                { label: 'Weekly Summary Report',        desc: 'Email summary every Monday at 9:00 AM', on: false },
              ].map((n, i, arr) => (
                <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f2f6' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                    <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <div style={{ width: 40, height: 22, borderRadius: 11, background: n.on ? '#1d4ed8' : '#e3e6eb', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', marginLeft: n.on ? 18 : 0, transition: 'margin 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}/>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Users & Roles ─────────────────────────────────────────────── */}
          {tab === 'Users & Roles' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Users & Roles</div>
                  <div style={{ fontSize: 12, color: '#8b92a5' }}>Manage officers, roles, and access levels</div>
                </div>
                <button className="btn btn-primary" style={{ fontSize: 12 }}>+ Add User</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                {['All','Active','Inactive','Suspended'].map(s => (
                  <button key={s} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e3e6eb', background: s === 'All' ? '#1d4ed8' : 'white', color: s === 'All' ? 'white' : '#50576a', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
                ))}
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8b92a5' }} width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input className="input" style={{ paddingLeft: 26, fontSize: 12 }} placeholder="Search users…" readOnly/>
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Name ↕</th><th>Role ↕</th><th>Ward</th><th>Status ↕</th><th>Last Active ↕</th><th></th></tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Arjun Deshmukh',  email: 'a.deshmukh@kdmc.gov.in',  role: 'Admin',   ward: 'Ward 01', active: true,  last: '2 min ago' },
                    { name: 'Priya Sharma',    email: 'p.sharma@kdmc.gov.in',    role: 'Officer', ward: 'Ward 02', active: true,  last: '30 min ago' },
                    { name: 'Rahul Patil',     email: 'r.patil@kdmc.gov.in',     role: 'Officer', ward: 'Ward 03', active: true,  last: '1 hour ago' },
                    { name: 'Sneha Kulkarni',  email: 's.kulkarni@kdmc.gov.in',  role: 'Officer', ward: 'Ward 05', active: true,  last: '3 hours ago' },
                    { name: 'Vikram Joshi',    email: 'v.joshi@kdmc.gov.in',     role: 'Field',   ward: 'Ward 06', active: false, last: '2 weeks ago' },
                  ].map(u => (
                    <tr key={u.email}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8ab4ff', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                            {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: '#8b92a5' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: u.role==='Admin' ? '#dbeafe' : u.role==='Officer' ? '#ede9fe' : '#f0fdf4', color: u.role==='Admin' ? '#1e40af' : u.role==='Officer' ? '#5b21b6' : '#15803d', fontSize: 11 }}>{u.role}</span>
                      </td>
                      <td style={{ fontSize: 12, color: '#50576a' }}>{u.ward}</td>
                      <td>
                        <span className="badge" style={{ background: u.active ? '#dcfce7' : '#f1f3f6', color: u.active ? '#15803d' : '#8b92a5', fontSize: 11 }}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#8b92a5' }}>{u.last}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="kebab-btn" title="Edit">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="kebab-btn" title="Delete" style={{ color: '#b91c1c' }}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ── Database ─────────────────────────────────────────────────── */}
          {tab === 'Database' && (
            <>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Database Configuration</div>
                <div style={{ fontSize: 12, color: '#8b92a5' }}>Connection strings and data store settings</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Database URL',     value: 'postgresql+asyncpg://municipal:••••••@postgres:5432/municipal_revenue' },
                  { label: 'PostgreSQL User',   value: 'municipal' },
                  { label: 'Database Name',     value: 'municipal_revenue' },
                  { label: 'Redis URL',         value: 'redis://redis:6379/0' },
                  { label: 'Qdrant URL',        value: 'http://qdrant:6333' },
                  { label: 'Qdrant Collection', value: 'properties' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input className="input" defaultValue={f.value} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}/>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ fontSize: 12 }}>Test Connection</button>
                <button className="btn btn-secondary" style={{ fontSize: 12 }}>Run Migrations</button>
                <button className="btn btn-secondary" style={{ fontSize: 12 }}>Reindex Embeddings</button>
              </div>
            </>
          )}

          {/* ── Security ─────────────────────────────────────────────────── */}
          {tab === 'Security' && (
            <>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Security Settings</div>
                <div style={{ fontSize: 12, color: '#8b92a5' }}>JWT, rate limiting, and access control</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'JWT Algorithm',             value: 'HS256' },
                  { label: 'Access Token Expiry (min)', value: '60' },
                  { label: 'Rate Limit (req/min)',       value: '100' },
                  { label: 'Max Login Attempts',         value: '5' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input className="input" defaultValue={f.value} style={{ width: '100%' }}/>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>Secret Key</label>
                <input className="input" type="password" placeholder="••••••••••••••••••••••••••••••••" style={{ width: '100%' }}/>
                <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 5 }}>
                  Generate: <code style={{ fontFamily: 'monospace', background: '#f1f3f6', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>python -c "import secrets; print(secrets.token_hex(64))"</code>
                </div>
              </div>
              <div className="alert alert-warning" style={{ fontSize: 12 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                Changing the secret key will invalidate all existing sessions.
              </div>
            </>
          )}

          {/* Save bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid #f0f2f6' }}>
            <button className="btn btn-secondary" style={{ fontSize: 13 }}>Cancel</button>
            <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={handleSave}>
              {saved
                ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
                : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
