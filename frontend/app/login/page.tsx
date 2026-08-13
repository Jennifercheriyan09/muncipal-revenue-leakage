'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ACCENT = '#1d4ed8'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('admin@mrlis.gov.in')
  const [password, setPassword] = useState('officer123')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPw, setShowPw]     = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter both email and password.'); return }
    setLoading(true)
    setTimeout(() => {
      if (
        (email === 'admin@mrlis.gov.in'   && password === 'officer123') ||
        (email === 'officer@mrlis.gov.in' && password === 'officer123')
      ) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mrlis_token', 'demo-token-123')
        }
        router.push('/dashboard')
      } else {
        setError('Invalid credentials. Use the demo accounts below.')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f3f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo + brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `linear-gradient(135deg, ${ACCENT}, #1e3a8a)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: `0 6px 20px ${ACCENT}40`,
          }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#141822', letterSpacing: '-0.02em', marginBottom: 4 }}>
            RevenueGuard
          </h1>
          <p style={{ fontSize: 13, color: '#8b92a5', fontWeight: 400 }}>
            Municipal Revenue Leakage Intelligence System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          border: '1px solid #e3e6eb',
          borderRadius: 14,
          padding: '28px 28px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#141822', marginBottom: 4 }}>Sign in to your account</h2>
            <p style={{ fontSize: 12.5, color: '#8b92a5' }}>Enter your KDMC officer credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8b92a5' }}
                  width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@kdmc.gov.in"
                  className="input"
                  style={{ paddingLeft: 34, width: '100%', height: 40, boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e3e6eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#50576a', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8b92a5' }}
                  width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input"
                  style={{ paddingLeft: 34, paddingRight: 40, width: '100%', height: 40, boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e3e6eb'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8b92a5', display: 'flex', padding: 2 }}
                >
                  {showPw
                    ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fccfcf', borderRadius: 8, fontSize: 12.5, color: '#b91c1c' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 42, borderRadius: 9,
                background: loading ? `${ACCENT}88` : ACCENT,
                color: 'white', fontWeight: 700, fontSize: 14,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : `0 3px 12px ${ACCENT}40`,
                transition: 'all 0.18s', fontFamily: 'inherit',
                width: '100%',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1e3a8a' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = ACCENT }}
            >
              {loading ? (
                <>
                  <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"
                    style={{ animation: 'spin 0.9s linear infinite' }}>
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: 16,
          background: 'white',
          border: '1px solid #e3e6eb',
          borderRadius: 12,
          padding: '14px 16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Demo Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { role: 'Admin',   email: 'admin@mrlis.gov.in',   roleColor: '#1e40af', roleBg: '#dbeafe' },
              { role: 'Officer', email: 'officer@mrlis.gov.in', roleColor: '#5b21b6', roleBg: '#ede9fe' },
            ].map(c => (
              <button
                key={c.role}
                onClick={() => { setEmail(c.email); setPassword('officer123') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: '#f8f9fb',
                  border: '1px solid #eef0f4',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${ACCENT}44`; e.currentTarget.style.background = `${ACCENT}06` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eef0f4'; e.currentTarget.style.background = '#f8f9fb' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 800 }}>
                    {c.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#141822' }}>{c.email}</div>
                    <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 1 }}>Password: officer123</div>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: c.roleBg, color: c.roleColor }}>
                  {c.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: '#8b92a5' }}>
          KDMC · RevenueGuard v0.2.0 · FY 2025–26
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
