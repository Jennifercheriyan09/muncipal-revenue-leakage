'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

const API_BASE = '/api/v1'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('mrlis_token') || ''
}

const RISK_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#EAB308',
  Low: '#22C55E',
}

interface MapViewProps {
  embedded?: boolean
}

export default function MapView({ embedded = false }: MapViewProps) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const wardLayerRef = useRef<any>(null)
  const wardSummaryRef = useRef<any[]>([])
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [selectedWard, setSelectedWard] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return

    mapInstanceRef.current = 'initializing'

    const initMap = async () => {
      const L = (await import('leaflet')).default

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current).setView([19.2403, 73.1305], 13)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const token = getToken()
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const cacheBust = Date.now()

      try {
        const summaryRes = await fetch(`${API_BASE}/map/ward-summary?t=${cacheBust}`, { headers })
        if (summaryRes.ok) {
          wardSummaryRef.current = await summaryRes.json()
        }
      } catch {}

      try {
        const wardRes = await fetch(`${API_BASE}/map/wards?t=${cacheBust}`, { headers })
        if (wardRes.ok) {
          const wardData = await wardRes.json()
          wardLayerRef.current = L.geoJSON(wardData, {
            style: {
              color: '#3B82F6',
              weight: 2,
              fillOpacity: 0.05,
              fillColor: '#3B82F6',
            },
            onEachFeature: (feature, layer) => {
              layer.bindTooltip(feature.properties.name, {
                permanent: false,
                className: 'ward-label',
              })
              layer.on('click', (e) => {
                wardLayerRef.current.resetStyle()
                e.target.setStyle({ color: '#EF4444', weight: 3, fillOpacity: 0.15, fillColor: '#EF4444' })
                const summary = wardSummaryRef.current.find((w: any) => w.ward_code === feature.properties.code)
                setSelectedProperty(null)
                setSelectedWard(summary || {
                  ward_name: feature.properties.name,
                  ward_code: feature.properties.code,
                  total_cases: 0, critical_count: 0, high_count: 0, medium_count: 0, low_count: 0, avg_risk_score: 0,
                })
              })
            },
          }).addTo(map)
        }
      } catch {}

      try {
        const markerRes = await fetch(`${API_BASE}/map/properties?t=${cacheBust}`, { headers })
        if (markerRes.ok) {
          const markerData = await markerRes.json()
          markersLayerRef.current = L.geoJSON(markerData, {
            pointToLayer: (feature, latlng) => {
              const color = RISK_COLORS[feature.properties.risk_level] || '#6B7280'
              return L.circleMarker(latlng, { radius: 8, fillColor: color, color: '#ffffff', weight: 1.5, fillOpacity: 0.9 })
            },
            onEachFeature: (feature, layer) => {
              layer.on('click', () => { setSelectedWard(null); setSelectedProperty(feature.properties) })
            },
          }).addTo(map)
        }
      } catch {}

      try {
        const heatRes = await fetch(`${API_BASE}/map/heatmap?t=${cacheBust}`, { headers })
        if (heatRes.ok) {
          const heatData = await heatRes.json()
          const heatPoints = heatData.map((p: any) => [p.lat, p.lng, p.intensity])
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js'
          script.onload = () => {
            heatLayerRef.current = (L as any).heatLayer(heatPoints, { radius: 35, blur: 25, maxZoom: 14 })
          }
          document.head.appendChild(script)
        }
      } catch {}
    }

    initMap()
  }, [])

  const handleToggle = () => {
    const map = mapInstanceRef.current
    if (!map || map === 'initializing') return
    if (!showHeatmap) {
      if (markersLayerRef.current) map.removeLayer(markersLayerRef.current)
      if (heatLayerRef.current) heatLayerRef.current.addTo(map)
    } else {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current)
      if (markersLayerRef.current) markersLayerRef.current.addTo(map)
    }
    setShowHeatmap(!showHeatmap)
  }

  const height = embedded ? '100%' : '100vh'

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Heatmap toggle */}
      {!embedded && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
          <button onClick={handleToggle} style={{
            background: showHeatmap ? '#EF4444' : '#1D4ED8',
            color: 'white', border: 'none', borderRadius: 8,
            padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {showHeatmap ? '🔵 Show Markers' : '🔴 Show Heatmap'}
          </button>
        </div>
      )}

      {/* Risk legend */}
      <div style={{
        position: 'absolute', bottom: embedded ? 12 : 32, left: 12, zIndex: 1000,
        background: 'white', borderRadius: 8, padding: '10px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 12,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 11, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Level</div>
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ color: '#374151' }}>{level}</span>
          </div>
        ))}
      </div>

      {/* Property detail panel */}
      {selectedProperty && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000,
          background: 'white', borderRadius: 10, padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 260, fontSize: 13,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Property Details</div>
            <button onClick={() => setSelectedProperty(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div><b>ID:</b> <span style={{ color: '#6366f1' }}>{selectedProperty.property_id}</span></div>
            <div><b>Owner:</b> {selectedProperty.owner_name}</div>
            <div><b>Usage:</b> {selectedProperty.usage_type || '—'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <b>Risk:</b>
              <span style={{
                marginLeft: 4, padding: '2px 8px', borderRadius: 9999,
                background: RISK_COLORS[selectedProperty.risk_level] || '#6B7280',
                color: 'white', fontWeight: 600, fontSize: 11,
              }}>{selectedProperty.risk_level}</span>
              <span style={{ fontWeight: 700 }}>{selectedProperty.risk_score}</span>
            </div>
            {selectedProperty.declared_area_sq_m && <div><b>Declared:</b> {selectedProperty.declared_area_sq_m} m²</div>}
            {selectedProperty.gis_area_sq_m && <div><b>GIS:</b> {selectedProperty.gis_area_sq_m} m²</div>}
          </div>
        </div>
      )}

      {/* Ward panel */}
      {selectedWard && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000,
          background: 'white', borderRadius: 10, padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 260, fontSize: 13,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Ward Summary</div>
            <button onClick={() => setSelectedWard(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>×</button>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#6366f1', marginBottom: 2 }}>{selectedWard.ward_name}</div>
          <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 10 }}>Code: {selectedWard.ward_code}</div>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Cases by Risk</div>
            {[
              { label: 'Critical', count: selectedWard.critical_count, color: '#ef4444' },
              { label: 'High', count: selectedWard.high_count, color: '#f97316' },
              { label: 'Medium', count: selectedWard.medium_count, color: '#eab308' },
              { label: 'Low', count: selectedWard.low_count, color: '#22c55e' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: r.color, fontWeight: 600 }}>● {r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.count}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13 }}>
            <span>Total Cases</span><span>{selectedWard.total_cases}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13, color: '#6366f1', marginTop: 4 }}>
            <span>Avg Risk Score</span><span>{selectedWard.avg_risk_score}</span>
          </div>
        </div>
      )}
    </div>
  )
}