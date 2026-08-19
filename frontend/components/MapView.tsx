'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { WARDS, PROPERTIES } from '@/lib/mockData'

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

// Fallback ward polygon coordinates around Kalyan-Dombivli
const MOCK_WARD_FEATURES = WARDS.map((w, idx) => {
  const baseLat = 19.235 + (idx % 3) * 0.02
  const baseLng = 73.115 + Math.floor(idx / 3) * 0.02
  return {
    type: 'Feature',
    properties: { code: w.code, name: w.name },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [baseLng, baseLat],
        [baseLng + 0.018, baseLat],
        [baseLng + 0.018, baseLat + 0.018],
        [baseLng, baseLat + 0.018],
        [baseLng, baseLat],
      ]],
    },
  }
})

const MOCK_PROPERTY_FEATURES = PROPERTIES.map((p, idx) => {
  const lat = 19.230 + (idx * 0.0025)
  const lng = 73.120 + ((idx % 4) * 0.0035)
  return {
    type: 'Feature',
    properties: {
      property_id: p.property_uid,
      owner_name: p.owner_name,
      usage_type: p.usage_type,
      risk_level: p.risk_level,
      risk_score: p.risk_score,
      declared_area_sq_m: p.declared_area_sq_m,
      gis_area_sq_m: p.gis_area_sq_m,
    },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
  }
})

interface MapViewProps {
  embedded?: boolean
}

export default function MapView({ embedded = false }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const wardLayerRef = useRef<any>(null)
  const wardSummaryRef = useRef<any[]>(WARDS)

  const [showHeatmap, setShowHeatmap] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [selectedWard, setSelectedWard] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapRef.current || mapInstanceRef.current) return

    let isMounted = true

    const initMap = async () => {
      const L = (await import('leaflet')).default

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView([19.2403, 73.1305], 13)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const token = getToken()
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const cacheBust = Date.now()

      // 1. Fetch / Fallback Ward Summary
      try {
        const summaryRes = await fetch(`${API_BASE}/map/ward-summary?t=${cacheBust}`, { headers })
        if (summaryRes.ok) {
          wardSummaryRef.current = await summaryRes.json()
        }
      } catch {
        wardSummaryRef.current = WARDS.map(w => ({
          ward_name: w.name,
          ward_code: w.code,
          total_cases: w.total_cases,
          critical_count: w.critical_count,
          high_count: w.high_count,
          medium_count: w.medium_count,
          low_count: w.low_count,
          avg_risk_score: w.avg_risk_score,
        }))
      }

      // 2. Fetch / Fallback Ward GeoJSON
      let wardGeoJson: any = { type: 'FeatureCollection', features: MOCK_WARD_FEATURES }
      try {
        const wardRes = await fetch(`${API_BASE}/map/wards?t=${cacheBust}`, { headers })
        if (wardRes.ok) {
          wardGeoJson = await wardRes.json()
        }
      } catch {}

      if (isMounted && mapInstanceRef.current) {
        wardLayerRef.current = L.geoJSON(wardGeoJson, {
          style: {
            color: '#1d4ed8',
            weight: 2,
            fillOpacity: 0.08,
            fillColor: '#1d4ed8',
          },
          onEachFeature: (feature, layer) => {
            layer.bindTooltip(feature.properties.name, { permanent: false, className: 'ward-label' })
            layer.on('click', (e) => {
              if (wardLayerRef.current) wardLayerRef.current.resetStyle()
              e.target.setStyle({ color: '#EF4444', weight: 3, fillOpacity: 0.2, fillColor: '#EF4444' })
              const summary = wardSummaryRef.current.find((w: any) => w.ward_code === feature.properties.code || w.ward_name === feature.properties.name)
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

      // 3. Fetch / Fallback Properties GeoJSON
      let markerGeoJson: any = { type: 'FeatureCollection', features: MOCK_PROPERTY_FEATURES }
      try {
        const markerRes = await fetch(`${API_BASE}/map/properties?t=${cacheBust}`, { headers })
        if (markerRes.ok) {
          markerGeoJson = await markerRes.json()
        }
      } catch {}

      if (isMounted && mapInstanceRef.current) {
        markersLayerRef.current = L.geoJSON(markerGeoJson, {
          pointToLayer: (feature, latlng) => {
            const color = RISK_COLORS[feature.properties.risk_level] || '#6B7280'
            return L.circleMarker(latlng, { radius: 8, fillColor: color, color: '#ffffff', weight: 1.5, fillOpacity: 0.9 })
          },
          onEachFeature: (feature, layer) => {
            layer.on('click', () => { setSelectedWard(null); setSelectedProperty(feature.properties) })
          },
        }).addTo(map)
      }

      // 4. Heatmap script initialization cleanly without duplication
      try {
        let heatPoints = MOCK_PROPERTY_FEATURES.map(f => [
          f.geometry.coordinates[1],
          f.geometry.coordinates[0],
          f.properties.risk_score / 100,
        ])

        const heatRes = await fetch(`${API_BASE}/map/heatmap?t=${cacheBust}`, { headers })
        if (heatRes.ok) {
          const heatData = await heatRes.json()
          if (Array.isArray(heatData) && heatData.length > 0) {
            heatPoints = heatData.map((p: any) => [p.lat, p.lng, p.intensity])
          }
        }

        const existingScript = document.querySelector('script[src*="leaflet-heat"]')
        const attachHeatLayer = () => {
          if ((L as any).heatLayer && mapInstanceRef.current) {
            heatLayerRef.current = (L as any).heatLayer(heatPoints, { radius: 35, blur: 25, maxZoom: 14 })
          }
        }

        if ((L as any).heatLayer) {
          attachHeatLayer()
        } else if (!existingScript) {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js'
          script.onload = attachHeatLayer
          document.head.appendChild(script)
        } else {
          existingScript.addEventListener('load', attachHeatLayer)
        }
      } catch {}
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current && typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
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

  const height = embedded ? '100%' : 'calc(100vh - 180px)'

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Heatmap toggle */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
        <button onClick={handleToggle} style={{
          background: showHeatmap ? '#EF4444' : '#1D4ED8',
          color: 'white', border: 'none', borderRadius: 8,
          padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)', transition: 'background 0.15s',
        }}>
          {showHeatmap ? '🔵 Show Markers' : '🔴 Show Heatmap'}
        </button>
      </div>

      {/* Risk legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
        background: 'white', borderRadius: 8, padding: '10px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 12,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 11, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Level</div>
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ color: '#374151', fontWeight: 500 }}>{level}</span>
          </div>
        ))}
      </div>

      {/* Property detail panel */}
      {selectedProperty && (
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 1000,
          background: 'white', borderRadius: 10, padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 260, fontSize: 13,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#141822' }}>Property Details</div>
            <button onClick={() => setSelectedProperty(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div><b>UID:</b> <span style={{ color: '#1d4ed8', fontWeight: 600 }}>{selectedProperty.property_id}</span></div>
            <div><b>Owner:</b> {selectedProperty.owner_name}</div>
            <div><b>Usage:</b> {selectedProperty.usage_type || '—'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <b>Risk:</b>
              <span style={{
                padding: '2px 8px', borderRadius: 9999,
                background: RISK_COLORS[selectedProperty.risk_level] || '#6B7280',
                color: 'white', fontWeight: 600, fontSize: 11,
              }}>{selectedProperty.risk_level}</span>
              <span style={{ fontWeight: 700, color: '#141822' }}>Score: {selectedProperty.risk_score}</span>
            </div>
            {selectedProperty.declared_area_sq_m && <div><b>Declared:</b> {selectedProperty.declared_area_sq_m} m²</div>}
            {selectedProperty.gis_area_sq_m && <div><b>GIS Area:</b> {selectedProperty.gis_area_sq_m} m²</div>}
          </div>
        </div>
      )}

      {/* Ward panel */}
      {selectedWard && (
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 1000,
          background: 'white', borderRadius: 10, padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 260, fontSize: 13,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#141822' }}>Ward Intelligence</div>
            <button onClick={() => setSelectedWard(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>×</button>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1d4ed8', marginBottom: 2 }}>{selectedWard.ward_name}</div>
          <div style={{ color: '#8b92a5', fontSize: 11, marginBottom: 10 }}>Code: {selectedWard.ward_code}</div>
          <div style={{ background: '#f8f9fb', borderRadius: 8, padding: 10, marginBottom: 8, border: '1px solid #e3e6eb' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b92a5' }}>Cases Breakdown</div>
            {[
              { label: 'Critical', count: selectedWard.critical_count, color: '#ef4444' },
              { label: 'High', count: selectedWard.high_count, color: '#f97316' },
              { label: 'Medium', count: selectedWard.medium_count, color: '#eab308' },
              { label: 'Low', count: selectedWard.low_count, color: '#22c55e' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: r.color, fontWeight: 600 }}>● {r.label}</span>
                <span style={{ fontWeight: 600, color: '#141822' }}>{r.count}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13, color: '#141822' }}>
            <span>Total Cases</span><span>{selectedWard.total_cases}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13, color: '#1d4ed8', marginTop: 4 }}>
            <span>Avg Risk Score</span><span>{selectedWard.avg_risk_score}</span>
          </div>
        </div>
      )}
    </div>
  )
}