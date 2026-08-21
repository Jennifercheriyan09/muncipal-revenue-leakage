'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskBadge from '@/components/ui/RiskBadge'
import RiskBar from '@/components/ui/RiskBar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  getProperty,
  getPropertyTaxRecords,
  getPropertyPayments,
  listWards,
  Property,
  TaxRecord,
  PaymentRecord,
  formatCurrency,
} from '@/lib/api'
import { mr } from '@/lib/mr'

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [property, setProperty] = useState<Property | null>(null)
  const [wardName, setWardName] = useState<string>('—')
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const pid = Number(id)
    if (!pid) return
    setLoading(true)
    Promise.all([
      getProperty(pid),
      getPropertyTaxRecords(pid).catch(() => []),
      getPropertyPayments(pid).catch(() => []),
      listWards().catch(() => []),
    ])
      .then(([prop, tax, pay, wards]) => {
        setProperty(prop)
        setTaxRecords(tax)
        setPayments(pay)
        const w = wards.find(x => x.id === prop.ward_id)
        setWardName(w?.name || '—')
      })
      .catch(() => setError('Could not load property'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <DashboardLayout title={mr.propertyDetail} breadcrumb={mr.properties}>
        <LoadingSpinner />
        <p style={{ textAlign: 'center', color: '#8b92a5', marginTop: 12 }}>{mr.loading}</p>
      </DashboardLayout>
    )
  }

  if (!property || error) {
    return (
      <DashboardLayout title={mr.propertyDetail} breadcrumb={mr.properties}>
        <p style={{ color: '#b91c1c' }}>{error || mr.noData}</p>
      </DashboardLayout>
    )
  }

  const decl = property.declared_area_sq_m || 0
  const gis = property.gis_area_sq_m || 0
  const areaDiff = gis - decl
  const areaPct = decl > 0 ? ((areaDiff / decl) * 100).toFixed(1) : '—'
  const tax = taxRecords[0]

  return (
    <DashboardLayout
      title={mr.propertyDetail}
      subtitle={`${property.property_uid} · ${property.owner_name}`}
      breadcrumb={mr.properties}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="section-header">
              <div className="section-title">Property Information</div>
            </div>
            <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: mr.propertyUid, value: property.property_uid, color: '#2c4ecf' },
                { label: mr.owner, value: property.owner_name },
                { label: mr.ward, value: wardName },
                { label: mr.address, value: property.address },
                { label: mr.usage, value: property.usage_type || '—' },
                { label: mr.declaredUsage, value: property.declared_usage_type || '—' },
                { label: mr.declaredArea, value: decl ? `${decl} ${mr.sqm}` : '—' },
                { label: mr.gisArea, value: gis ? `${gis} ${mr.sqm}` : '—' },
                { label: 'Difference %', value: areaPct !== '—' ? `${areaPct}%` : '—' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#8b92a5', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: color || '#141822' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {tax && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="section-header">
                <div className="section-title">Tax Information ({tax.assessment_year})</div>
              </div>
              <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: mr.taxDemand, value: formatCurrency(tax.tax_demand) },
                  { label: mr.taxPaid, value: formatCurrency(tax.tax_paid) },
                  { label: mr.arrears, value: formatCurrency(tax.arrears_amount) },
                  { label: mr.outstanding, value: formatCurrency(Math.max(tax.tax_demand - tax.tax_paid, 0)) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: '#8b92a5', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {payments.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="section-header">
                <div className="section-title">{mr.payments} ({payments.length})</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8f9fb' }}>
                      <th style={{ padding: 10, textAlign: 'left' }}>{mr.paymentDate}</th>
                      <th style={{ padding: 10, textAlign: 'left' }}>Amount</th>
                      <th style={{ padding: 10, textAlign: 'left' }}>{mr.paymentMode}</th>
                      <th style={{ padding: 10, textAlign: 'left' }}>Reference No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 20).map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f0f2f6' }}>
                        <td style={{ padding: 10 }}>{p.payment_date}</td>
                        <td style={{ padding: 10 }}>{formatCurrency(p.amount)}</td>
                        <td style={{ padding: 10 }}>{p.payment_mode || '—'}</td>
                        <td style={{ padding: 10, fontFamily: 'monospace', fontSize: 12 }}>{p.gateway_reference || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 12, color: '#8b92a5', marginBottom: 8 }}>{mr.riskScore}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#141822', marginBottom: 8 }}>
              {property.risk_score ?? 0}
            </div>
            <RiskBadge level={property.risk_level} />
            <div style={{ marginTop: 16 }}>
              <RiskBar score={property.risk_score ?? 0} level={property.risk_level} />
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: '#50576a' }}>
              {mr.impact}: <strong>{formatCurrency(property.estimated_revenue_impact)}</strong>
            </div>
          </div>

          <Link href="/properties" className="btn btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
            ← Back to properties
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
