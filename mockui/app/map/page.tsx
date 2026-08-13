import DashboardLayout from '@/components/layout/DashboardLayout'
import { WARDS, PROPERTIES } from '@/lib/mockData'

const criticalCount = PROPERTIES.filter(p => p.risk_level === 'Critical').length
const highCount     = PROPERTIES.filter(p => p.risk_level === 'High').length

export default function MapPage() {
  return (
    <DashboardLayout
      title="Map Analyzer"
      subtitle="Geographic leakage intelligence · Risk-scored properties across all wards"
      breadcrumb="Dashboard"
    >
      {/* Coming soon hero */}
      <div className="card" style={{ overflow: 'hidden', minHeight: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
        {/* Map placeholder area */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 480,
        }}>
          {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.12,
            backgroundImage: 'linear-gradient(rgba(233,30,140,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(233,30,140,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}/>

          {/* Fake ward outlines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
            <polygon points="100,80 280,60 320,180 200,240 80,200" fill="none" stroke="#1d4ed8" strokeWidth="2"/>
            <polygon points="280,60 440,40 480,160 320,180" fill="none" stroke="#1d4ed8" strokeWidth="2"/>
            <polygon points="440,40 600,80 580,200 480,160" fill="none" stroke="#1d4ed8" strokeWidth="2"/>
            <polygon points="80,200 200,240 220,360 100,380" fill="none" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.6"/>
            <polygon points="200,240 320,180 360,320 220,360" fill="none" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.6"/>
            <polygon points="320,180 480,160 500,300 360,320" fill="none" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.6"/>
            <polygon points="480,160 580,200 560,340 500,300" fill="none" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.6"/>
            {/* Fake risk dots */}
            {[
              [190,150,'#b91c1c'],[360,110,'#b91c1c'],[500,120,'#c2410c'],
              [150,300,'#c2410c'],[280,270,'#b91c1c'],[430,250,'#a16207'],
              [520,270,'#15803d'],[240,160,'#a16207'],[420,170,'#b91c1c'],
            ].map(([x,y,c], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="14" fill={String(c)} opacity="0.25"/>
                <circle cx={x} cy={y} r="6" fill={String(c)} opacity="0.85"/>
              </g>
            ))}
          </svg>

          {/* Center content */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, padding: '0 32px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="36" height="36" fill="none" stroke="#1d4ed8" strokeWidth="1.5" viewBox="0 0 24 24">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 8 }}>Google Maps Integration</div>
            <div style={{ fontSize: 14, color: '#94a3b8', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Interactive map with ward boundaries, risk-coloured property markers, heatmap overlay, and satellite view is coming soon. The team is integrating Google Maps API.
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.3)', borderRadius: 9999, color: '#1d4ed8', fontSize: 13, fontWeight: 600 }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d4ed8', display: 'inline-block' }}/>
              In Development
            </div>
          </div>

          {/* Risk legend overlay */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(15,17,23,0.85)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Risk Level</div>
            {[['Critical','#b91c1c'],['High','#c2410c'],['Medium','#a16207'],['Low','#15803d']].map(([l,c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: c }}/>
                <span style={{ fontSize: 11, color: '#e5e7eb' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Ward count overlay */}
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(15,17,23,0.85)', borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Coverage</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{WARDS.length} Wards</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{PROPERTIES.length} properties mapped</div>
          </div>
        </div>

        {/* Feature preview bar */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f2f6', background: '#f8f9fb', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { icon: <svg width="16" height="16" fill="none" stroke="#1d4ed8" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z"/></svg>, label: 'Property Markers', desc: 'Risk-colour coded pins for each property' },
            { icon: <svg width="16" height="16" fill="none" stroke="#c2410c" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><circle cx="12" cy="12" r="4" fill="#c2410c" fillOpacity="0.3"/></svg>, label: 'Heatmap Layer', desc: 'Risk intensity overlay across the city' },
            { icon: <svg width="16" height="16" fill="none" stroke="#2c4ecf" strokeWidth="1.75" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>, label: 'Ward Boundaries', desc: 'GeoJSON polygon overlays for all 9 wards' },
            { icon: <svg width="16" height="16" fill="none" stroke="#a16207" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, label: 'Satellite View', desc: 'Toggle between street and satellite maps' },
            { icon: <svg width="16" height="16" fill="none" stroke="#15803d" strokeWidth="1.75" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label: 'Property Search', desc: 'Click any marker to view property details' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: '1 1 160px' }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#141822' }}>{f.label}</div>
                <div style={{ fontSize: 11, color: '#8b92a5', marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ward summary cards */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Ward Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {WARDS.map(w => (
            <div key={w.id} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#141822' }}>{w.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '1px 6px', borderRadius: 5, marginTop: 3, display: 'inline-block' }}>{w.code}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#141822' }}>{w.total_cases}</div>
                  <div style={{ fontSize: 10, color: '#8b92a5' }}>total cases</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: 'C', count: w.critical_count, color: '#b91c1c' },
                  { label: 'H', count: w.high_count,     color: '#c2410c' },
                  { label: 'M', count: w.medium_count,   color: '#a16207' },
                  { label: 'L', count: w.low_count,      color: '#15803d' },
                ].map(r => (
                  <div key={r.label} style={{ flex: 1, textAlign: 'center', padding: '5px 4px', background: `${r.color}12`, borderRadius: 7 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: r.color }}>{r.count}</div>
                    <div style={{ fontSize: 9, color: r.color, fontWeight: 700 }}>{r.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Avg risk score</span>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{w.avg_risk_score}</span>
                </div>
                <div className="risk-bar-track">
                  <div className="risk-bar-fill" style={{ width: `${w.avg_risk_score}%`, background: w.avg_risk_score >= 75 ? '#b91c1c' : w.avg_risk_score >= 50 ? '#c2410c' : w.avg_risk_score >= 25 ? '#a16207' : '#15803d' }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
