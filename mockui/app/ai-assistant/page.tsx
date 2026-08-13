'use client'

import { useState, useRef, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const ACCENT = '#1d4ed8'

const SUGGESTIONS = [
  'What are the top fraud patterns this month?',
  'Which ward has the most critical cases?',
  'Summarise Case #3 for me',
  'How much revenue has been recovered this FY?',
]

const PRESETS: Record<string, React.ReactNode> = {
  'What are the top fraud patterns this month?': (
    <div>
      <p style={{ marginBottom: 10 }}>Three fraud patterns are dominating this month, accounting for <strong>78% of total revenue at risk</strong>:</p>
      <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <li><strong>Area Under-Declaration</strong> — 42 cases, avg mismatch 34%. GIS satellite confirms unreported construction wings. Estimated impact: <strong style={{ color: ACCENT }}>₹8.2 Cr</strong>.</li>
        <li><strong>Usage Type Mismatch</strong> — 31 cases. Properties declared residential operating as commercial with active trade licenses. Impact: <strong style={{ color: ACCENT }}>₹5.6 Cr</strong>.</li>
        <li><strong>Unverified Exemptions</strong> — 24 cases. Widow, senior citizen, and ex-serviceman claims with no supporting document ID. Impact: <strong style={{ color: ACCENT }}>₹4.1 Cr</strong>.</li>
      </ol>
      <p style={{ marginTop: 10, fontSize: 12, color: '#8b92a5' }}>Sources: <span style={{ color: ACCENT }}>analysis_runs</span> · <span style={{ color: ACCENT }}>fraud_signals</span></p>
    </div>
  ),
  'Which ward has the most critical cases?': (
    <div>
      <p style={{ marginBottom: 10 }}><strong>Ward No. 5 – Ulhasnagar</strong> leads with <strong>8 Critical cases</strong> and an average risk score of <strong style={{ color: '#b91c1c' }}>79</strong> — the highest across all 9 wards.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 10 }}>
        <thead><tr style={{ background: '#f8f9fb' }}>
          {['Ward','Critical','High','Avg Score'].map(h => <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#8b92a5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e3e6eb' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {[['W05 – Ulhasnagar','8','12','79'],['W01 – Kalyan East','6','9','74'],['W06 – Dombivli South','5','8','71']].map((r,i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f2f6' }}>
              {r.map((c,j) => <td key={j} style={{ padding: '7px 10px', color: j===1 ? '#b91c1c' : '#50576a', fontWeight: j===1 ? 700 : 400 }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: '#8b92a5' }}>Sources: <span style={{ color: ACCENT }}>wards</span> · <span style={{ color: ACCENT }}>properties.risk_level</span></p>
    </div>
  ),
  'Summarise Case #3 for me': (
    <div>
      <p style={{ marginBottom: 8 }}><strong>Case #3</strong> — <code style={{ background: '#f1f3f6', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>KDMC-2024-00371</code>, owner <strong>Manoj Tiwari</strong>, Ward 05. This is the <strong style={{ color: '#b91c1c' }}>highest-impact case this month</strong> at ₹3.2 L.</p>
      <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        <li>Area mismatch: declared 450 m², GIS shows 780 m² — 73% under-reported.</li>
        <li>Usage mismatch: declared commercial godown, operating as industrial manufacturing.</li>
        <li>3 suspicious manual payment adjustments totalling ₹45,000.</li>
      </ul>
      <p style={{ fontSize: 13, color: '#50576a' }}>Status: <span style={{ background: '#ede9fe', color: '#5b21b6', padding: '1px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>Reassessment</span> · Officer: Sneha Kulkarni · ₹45K recovered so far.</p>
      <p style={{ marginTop: 8, fontSize: 12, color: '#8b92a5' }}>Sources: <span style={{ color: ACCENT }}>investigation_cases</span> · <span style={{ color: ACCENT }}>fraud_signals</span></p>
    </div>
  ),
  'How much revenue has been recovered this FY?': (
    <div>
      <p style={{ marginBottom: 10 }}>Total recovered in <strong>FY 2025–26</strong>: <strong style={{ fontSize: 18, color: '#15803d' }}>₹47.5 Lakh</strong> across 34 closed cases. Recovery rate against total at-risk (₹2.84 Cr) is <strong>16.7%</strong>.</p>
      <p style={{ fontSize: 13, color: '#50576a', marginBottom: 8 }}>July alone contributed ₹11 Lakh — up 20% from June. Largest single recovery: ₹1.45 L (Case #5, Dinesh Shah).</p>
      <p style={{ fontSize: 12, color: '#8b92a5' }}>Sources: <span style={{ color: ACCENT }}>investigation_cases.revenue_recovered</span></p>
    </div>
  ),
}

interface Message {
  role: 'user' | 'assistant'
  content: string | React.ReactNode
  time: string
}

function timestamp() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const hasChat                 = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setMessages(prev => [...prev, { role: 'user', content: q, time: timestamp() }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: PRESETS[q] ?? <p style={{ color: '#50576a', lineHeight: 1.7 }}>I don't have a scripted answer for that yet. In the live version this would query the LangGraph pipeline with your question: <em>"{q}"</em></p>,
        time: timestamp(),
      }])
      setLoading(false)
    }, 800)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <DashboardLayout title="AI Assistant" subtitle="Ask about your dashboard data." breadcrumb="Dashboard">

      {/* Main chat card */}
      <div className="card" style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 520,
        height: 'calc(100vh - 240px)',
      }}>

        {/* ── Empty state ────────────────────────────────────────────── */}
        {!hasChat && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 0 }}>
            {/* Icon */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${ACCENT}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="28" height="28" fill="none" stroke={ACCENT} strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                <circle cx="12" cy="12" r="2" fill={ACCENT} stroke="none"/>
              </svg>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#141822', marginBottom: 8 }}>What would you like to know?</h2>
            <p style={{ fontSize: 13, color: '#8b92a5', textAlign: 'center', maxWidth: 420, lineHeight: 1.6, marginBottom: 28 }}>
              This assistant answers from the data in this dashboard. It is a scripted demo — no API key ships and nothing you type leaves the browser.
            </p>

            {/* 2×2 suggestion cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 520 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  style={{
                    textAlign: 'left', fontSize: 13, lineHeight: 1.5,
                    padding: '14px 16px', borderRadius: 10,
                    border: '1px solid #e3e6eb', background: '#fff',
                    color: '#141822', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.14s, background 0.14s, color 0.14s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${ACCENT}55`; e.currentTarget.style.background = `${ACCENT}06`; e.currentTarget.style.color = ACCENT }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e3e6eb'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#141822' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Chat messages ──────────────────────────────────────────── */}
        {hasChat && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 12, alignItems: 'flex-start' }}>
                {/* Avatar */}
                {msg.role === 'assistant'
                  ? <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT}, #1e3a8a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="2" fill="white" stroke="none"/></svg>
                    </div>
                  : <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8ab4ff', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>AD</div>
                }
                {/* Bubble */}
                <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{
                    padding: '11px 16px',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: msg.role === 'user' ? ACCENT : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#141822',
                    border: msg.role === 'user' ? 'none' : '1px solid #e3e6eb',
                    fontSize: 13.5, lineHeight: 1.65,
                    boxShadow: msg.role === 'user' ? `0 2px 10px ${ACCENT}33` : '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
                      {[
                        { label: 'Copy', icon: <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> },
                        { label: 'Regenerate', icon: <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
                      ].map(btn => (
                        <button key={btn.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8b92a5', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 5, fontFamily: 'inherit', transition: 'color 0.12s, background 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#141822'; e.currentTarget.style.background = '#f1f3f6' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#8b92a5'; e.currentTarget.style.background = 'none' }}>
                          {btn.icon} {btn.label}
                        </button>
                      ))}
                      <span style={{ fontSize: 11, color: '#c5cad4', marginLeft: 2 }}>{msg.time}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing dots */}
            {loading && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${ACCENT},#1e3a8a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="2" fill="white" stroke="none"/></svg>
                </div>
                <div style={{ padding: '12px 16px', background: '#fff', border: '1px solid #e3e6eb', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: `typingBounce 1.2s ${i*0.2}s infinite ease-in-out` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        )}

        {/* ── Input bar ──────────────────────────────────────────────── */}
        <div style={{ padding: '12px 20px', borderTop: hasChat ? '1px solid #f0f2f6' : 'none' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f8f9fb', border: '1px solid #e3e6eb', borderRadius: 12, padding: '6px 6px 6px 16px', transition: 'border-color 0.14s, box-shadow 0.14s' }}
            onFocusCapture={e => { const el = e.currentTarget; el.style.borderColor = ACCENT; el.style.boxShadow = `0 0 0 3px ${ACCENT}18` }}
            onBlurCapture={e => { const el = e.currentTarget; el.style.borderColor = '#e3e6eb'; el.style.boxShadow = 'none' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask about revenue, fraud patterns, ward data…"
              style={{ flex: 1, resize: 'none', border: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit', color: '#141822', outline: 'none', lineHeight: 1.5, padding: '4px 0' }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              style={{ width: 36, height: 36, borderRadius: 8, border: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', background: input.trim() && !loading ? ACCENT : '#e3e6eb', color: 'white', transition: 'background 0.15s', boxShadow: input.trim() && !loading ? `0 2px 8px ${ACCENT}44` : 'none' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
          <div style={{ marginTop: 7, fontSize: 11, color: '#8b92a5', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 2 }}>
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Scripted demo responses. Connect LangGraph pipeline to enable live data queries.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </DashboardLayout>
  )
}
