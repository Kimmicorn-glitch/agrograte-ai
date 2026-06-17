'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

interface VatReturnItem {
  period: string
  start: string
  end: string
  vat_on_sales: number
  vat_on_purchases: number
  net_vat_due: number
  is_submitted: boolean
  penalties: number
}

export default function VatReturnsPage() {
  const [returns, setReturns] = useState<VatReturnItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getVatReturns()
      .then(setReturns)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const totalVat = returns.reduce((s, r) => s + r.net_vat_due, 0)
  const submitted = returns.filter(r => r.is_submitted).length
  const totalPenalties = returns.reduce((s, r) => s + r.penalties, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">VAT Returns</h1>
          <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">VAT 201 return periods and status</p>
        </div>
        <div className="flex items-center justify-center py-16 text-white/40 font-mono text-xs gap-2">
          <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          Loading VAT returns...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">VAT Returns</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">VAT 201 return periods and status</p>
      </div>

      {error && (
        <div className="text-xs text-red-400/80 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <MetricTile label="Total Periods" value={returns.length} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Submitted" value={submitted} status="success" />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Outstanding" value={returns.length - submitted} status={returns.length - submitted > 0 ? 'warning' : 'success'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Total Penalties" value={`R${totalPenalties.toLocaleString()}`} status={totalPenalties > 0 ? 'error' : 'success'} />
        </GlassCard>
      </div>

      {returns.length === 0 && !error ? (
        <GlassCard>
          <div className="flex flex-col items-center gap-2 py-10 text-xs text-white/40 font-mono">
            <FileText size={20} className="text-white/20" />
            No VAT returns found
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Return Periods</h2>
          </div>
          <div className="space-y-2">
            {returns.map((r, i) => (
              <div key={i} className="bg-white/5 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/80">{r.period}</span>
                    {r.is_submitted ? (
                      <span className="text-[0.55rem] text-success flex items-center gap-1">
                        <CheckCircle size={8} /> Filed
                      </span>
                    ) : (
                      <span className="text-[0.55rem] text-warning flex items-center gap-1">
                        <XCircle size={8} /> Pending
                      </span>
                    )}
                  </div>
                  <div className="text-[0.55rem] text-white/30 font-mono">
                    {new Date(r.start).toLocaleDateString()} &ndash; {new Date(r.end).toLocaleDateString()}
                  </div>
                  <div className="text-[0.55rem] text-white/30">
                    Sales VAT: R{r.vat_on_sales.toLocaleString()} · Purchases VAT: R{r.vat_on_purchases.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-white/80">R {r.net_vat_due.toLocaleString()}</div>
                  {r.penalties > 0 && <div className="text-[0.55rem] text-error">+R {r.penalties.toLocaleString()} penalties</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-2 text-[0.6rem] text-white/30 font-mono">
            <Clock size={10} /> VAT Act 89 of 1991 &middot; 15% standard rate
          </div>
        </GlassCard>
      )}
    </div>
  )
}
