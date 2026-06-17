'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { PiggyBank, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

interface TaxReserveData {
  estimated_vat_liability: number
  estimated_income_tax: number
  estimated_paye: number
  total_reserve_required: number
  current_reserve_balance: number
  reserve_gap: number
  drrt_confidence: number
  recommended_monthly_allocation: number
}

export default function TaxReservePage() {
  const [reserve, setReserve] = useState<TaxReserveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getComplianceTaxReserve()
      .then(setReserve)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const gapPercent = reserve && reserve.total_reserve_required > 0
    ? Math.round((reserve.reserve_gap / reserve.total_reserve_required) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Tax Reserve</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">
          Automated tax fund allocation and reserve management
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/40 font-mono text-xs gap-2"><div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />Loading tax reserve data...</div>
      ) : error ? (
        <div className="text-xs text-red-400/80 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 flex items-center gap-2"><AlertTriangle size={12} />{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard>
              <div className="flex flex-col items-center text-center py-2">
                <div className="text-3xl font-bold font-mono text-white">
                  R {reserve ? reserve.total_reserve_required.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="text-[0.55rem] text-white/30 font-mono mt-1 uppercase tracking-wider">Total Reserve Required</div>
                <div className="w-full mt-3 progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${100 - gapPercent}%` }} />
                </div>
                <div className="text-[0.55rem] text-white/30 mt-1">{100 - gapPercent}% funded</div>
              </div>
            </GlassCard>
            <GlassCard>
              <MetricTile label="VAT Liability" value={`R${(reserve?.estimated_vat_liability ?? 0).toLocaleString()}`} />
              <MetricTile label="Income Tax" value={`R${(reserve?.estimated_income_tax ?? 0).toLocaleString()}`} />
            </GlassCard>
            <GlassCard>
              <MetricTile label="PAYE" value={`R${(reserve?.estimated_paye ?? 0).toLocaleString()}`} />
              <MetricTile label="Current Reserve" value={`R${(reserve?.current_reserve_balance ?? 0).toLocaleString()}`} status="success" />
            </GlassCard>
            <GlassCard>
              <MetricTile label="Reserve Gap" value={`R${(reserve?.reserve_gap ?? 0).toLocaleString()}`} status={gapPercent > 50 ? 'error' : gapPercent > 0 ? 'warning' : 'success'} />
              <MetricTile label="Monthly Allocation" value={`R${(reserve?.recommended_monthly_allocation ?? 0).toLocaleString()}`} />
              <MetricTile label="DRRT Confidence" value={`${((reserve?.drrt_confidence ?? 0) * 100).toFixed(1)}%`} />
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank size={14} className="text-scarlet-400" />
                <h2 className="section-title mb-0">Reserve Breakdown</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg px-4 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-white/80">VAT (15%)</span>
                    <span className="text-xs font-mono text-white/60">
                      R {(reserve?.estimated_vat_liability ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-scarlet-400" style={{
                      width: `${reserve && reserve.total_reserve_required > 0
                        ? ((reserve.estimated_vat_liability / reserve.total_reserve_required) * 100).toFixed(1)
                        : 0}%`
                    }} />
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg px-4 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-white/80">Income Tax (28%)</span>
                    <span className="text-xs font-mono text-white/60">
                      R {(reserve?.estimated_income_tax ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-yellow-400" style={{
                      width: `${reserve && reserve.total_reserve_required > 0
                        ? ((reserve.estimated_income_tax / reserve.total_reserve_required) * 100).toFixed(1)
                        : 0}%`
                    }} />
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg px-4 py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-white/80">PAYE (1%)</span>
                    <span className="text-xs font-mono text-white/60">
                      R {(reserve?.estimated_paye ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-green-400" style={{
                      width: `${reserve && reserve.total_reserve_required > 0
                        ? ((reserve.estimated_paye / reserve.total_reserve_required) * 100).toFixed(1)
                        : 0}%`
                    }} />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-scarlet-400" />
                <h2 className="section-title mb-0">Funding Strategy</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg px-4 py-3">
                  <div className="text-xs text-white/80 mb-1">Recommended Monthly Allocation</div>
                  <div className="text-lg font-mono text-white font-bold">
                    R {(reserve?.recommended_monthly_allocation ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[0.55rem] text-white/30 mt-1">
                    Based on estimated annual tax liability
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg px-4 py-3">
                  <div className="text-xs text-white/80 mb-1">Current Reserve Balance</div>
                  <div className="text-lg font-mono text-white font-bold">
                    R {(reserve?.current_reserve_balance ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-[0.6rem] text-white/30 font-mono leading-relaxed">
                  Allocate tax funds monthly to avoid year-end shortfalls.
                  DRRT coherence of {((reserve?.drrt_confidence ?? 0)).toFixed(2)} indicates forecast confidence.
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-2 text-[0.6rem] text-white/30 font-mono">
                <Clock size={10} /> Updated in real-time with DRRT coherence weighting
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  )
}
