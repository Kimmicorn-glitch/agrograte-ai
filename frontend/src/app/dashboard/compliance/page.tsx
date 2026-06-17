'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { Shield, AlertTriangle, CheckCircle, FileText, Clock, ArrowRight, TrendingUp, PiggyBank } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface ComplianceReport {
  overall_score: number
  vat_score: number
  vat_compliant: boolean
  tax_score: number
  tax_compliant: boolean
  violations: Array<{
    code: string
    severity: string
    description: string
    regulation_ref: string
    remediation: string
  }>
  recommendations: string[]
  drrt_coherence: number
}

interface TaxReserve {
  estimated_vat_liability: number
  estimated_income_tax: number
  total_reserve_required: number
  current_reserve_balance: number
  reserve_gap: number
  drrt_confidence: number
  recommended_monthly_allocation: number
}

export default function CompliancePage() {
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [taxReserve, setTaxReserve] = useState<TaxReserve | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reserveError, setReserveError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getComplianceReport().then(setReport).catch(e => setError(e.message)),
      api.getComplianceTaxReserve().then(setTaxReserve).catch(e => setReserveError(e.message)),
    ]).finally(() => setLoading(false))
  }, [])

  const scoreColor = (s: number) => s > 0.8 ? 'success' : s > 0.5 ? 'warning' : 'error'
  const formatRand = (v: number) => `R ${v.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">SARS Compliance</h1>
          <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">VAT Act 89 of 1991 · Income Tax Act 58 of 1962</p>
        </div>
        <div className="flex items-center justify-center py-16 text-white/40 font-mono text-xs gap-2">
          <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          Loading compliance data...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">SARS Compliance</h1>
          <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">VAT Act 89 of 1991 · Income Tax Act 58 of 1962</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/compliance/vat" className="btn-ghost text-xs flex items-center gap-1">
            VAT Returns <ArrowRight size={10} />
          </Link>
          <Link href="/dashboard/compliance/tax" className="btn-ghost text-xs flex items-center gap-1">
            Tax Records <ArrowRight size={10} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400/80 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={12} /> Failed to load compliance report: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex flex-col items-center text-center py-2">
            <div className="text-3xl font-bold font-mono text-white">
              {report ? Math.round((report.overall_score ?? 0) * 100) : 0}
            </div>
            <div className="text-[0.55rem] text-white/30 font-mono mt-1 uppercase tracking-wider">Overall Score</div>
            <div className="w-full mt-3 progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(report?.overall_score ?? 0) * 100}%` }} />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="VAT Compliance" value={report?.vat_compliant ? 'Compliant' : 'Attention'} status={report?.vat_compliant ? 'success' : 'error'} />
          <MetricTile label="VAT Score" value={`${((report?.vat_score ?? 0) * 100).toFixed(0)}%`} status={scoreColor(report?.vat_score ?? 0)} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Tax Compliance" value={report?.tax_compliant ? 'Compliant' : 'Attention'} status={report?.tax_compliant ? 'success' : 'error'} />
          <MetricTile label="Tax Score" value={`${((report?.tax_score ?? 0) * 100).toFixed(0)}%`} status={scoreColor(report?.tax_score ?? 0)} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Violations" value={report?.violations.length ?? 0} status={(report?.violations.length ?? 0) > 0 ? 'error' : 'success'} />
          <MetricTile label="Recommendations" value={report?.recommendations.length ?? 0} status={(report?.recommendations.length ?? 0) > 0 ? 'warning' : 'success'} />
          <MetricTile label="DRRT Coherence" value={`${((report?.drrt_coherence ?? 0) * 100).toFixed(1)}%`} status={scoreColor(report?.drrt_coherence ?? 0)} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className={report?.violations.length && report.violations.length > 0 ? 'text-scarlet-400' : 'text-success'} />
            <h2 className="section-title mb-0">Violations & Recommendations</h2>
          </div>
          {(!report || report.violations.length === 0) && (!report || report.recommendations.length === 0) ? (
            <div className="flex flex-col items-center gap-2 py-8 text-xs text-success">
              <CheckCircle size={20} />
              <span>All compliant — no violations or recommendations</span>
            </div>
          ) : (
            <div className="space-y-3">
              {report?.violations.map((v, i) => (
                <div key={`v-${i}`} className="bg-white/5 rounded-lg px-3 py-2.5 space-y-1.5 border-l-2 border-scarlet-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/80">{v.code}</span>
                    <span className={`text-[0.55rem] uppercase tracking-wider ${v.severity === 'Critical' ? 'text-error' : v.severity === 'High' ? 'text-warning' : 'text-white/40'}`}>{v.severity}</span>
                  </div>
                  <p className="text-[0.6rem] text-white/60">{v.description}</p>
                  <div className="text-[0.55rem] text-white/30 font-mono">{v.regulation_ref}</div>
                  <div className="text-[0.55rem] text-white/40 flex items-start gap-1">
                    <span className="text-scarlet-400 mt-0.5">&rarr;</span>
                    {v.remediation}
                  </div>
                </div>
              ))}
              {report?.recommendations.filter(r => !report?.violations.some(v => v.remediation === r)).map((r, i) => (
                <div key={`r-${i}`} className="bg-white/5 rounded-lg px-3 py-2.5 flex items-start gap-2 border-l-2 border-scarlet-500/20">
                  <span className="text-[0.55rem] text-scarlet-400 mt-0.5">&rarr;</span>
                  <span className="text-[0.6rem] text-white/60">{r}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-glass-border">
            <div className="flex items-center gap-2 text-[0.6rem] text-white/30 font-mono">
              <Clock size={10} />
              Last checked: {new Date().toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Tax Reserve</h2>
          </div>
          {reserveError ? (
            <div className="text-xs text-red-400/80 font-mono py-4 text-center">Unable to load reserve data</div>
          ) : !taxReserve ? (
            <div className="flex items-center gap-2 py-6 text-xs text-white/40 font-mono">
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
              Loading reserve...
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="metric-label">Reserve Required</div>
                <div className="font-mono text-lg font-bold text-white">{formatRand(taxReserve.total_reserve_required)}</div>
              </div>
              <MetricTile label="Current Reserve" value={formatRand(taxReserve.current_reserve_balance)} status={taxReserve.reserve_gap <= 0 ? 'success' : 'warning'} />
              <MetricTile label="Reserve Gap" value={formatRand(taxReserve.reserve_gap)} status={taxReserve.reserve_gap > 0 ? 'error' : 'success'} />
              <div className="pt-3 border-t border-glass-border">
                <MetricTile label="Est. VAT Liability" value={formatRand(taxReserve.estimated_vat_liability)} />
                <MetricTile label="Est. Income Tax" value={formatRand(taxReserve.estimated_income_tax)} />
                <MetricTile label="Monthly Allocation" value={formatRand(taxReserve.recommended_monthly_allocation)} />
              </div>
              <div className="flex items-center gap-2 text-[0.55rem] text-white/30 font-mono pt-2">
                <TrendingUp size={10} />
                DRRT Confidence: {((taxReserve.drrt_confidence ?? 1) * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
