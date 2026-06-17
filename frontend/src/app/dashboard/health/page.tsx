'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { Activity, TrendingUp, TrendingDown, Shield, Brain, BarChart3, DollarSign, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

interface HealthData {
  health_score: number
  liquidity: string
  liquidity_score: number
  risk: string
  risk_score: number
  compliance: number
  revenue: number
  expenses: number
  profit: number
  drrt_coherence: number
}

interface HealthDetail extends HealthData {
  compliance_score: number
  profit_margin: number
  breakdown: Array<{
    dimension: string
    score: number
    weight: number
    status: string
  }>
}

export default function HealthPage() {
  const [data, setData] = useState<HealthDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getFinancialHealthDetail()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-16 text-white/40 font-mono text-xs gap-2"><div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />Loading health data...</div>
  if (error) return <div className="text-xs text-red-400/80 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 flex items-center gap-2"><AlertTriangle size={12} />{error}</div>

  const scoreColor = (v: number) => v > 70 ? 'success' : v > 40 ? 'warning' : 'error'
  const riskColor = (r: string) => r === 'Low' ? 'success' : r === 'Medium' ? 'warning' : 'error'
  const liqColor = (l: string) => l === 'Strong' ? 'success' : l === 'Moderate' ? 'warning' : 'error'

  const fmt = (v: number) => v.toLocaleString('en-ZA', { minimumFractionDigits: 2 })
  const fmtShort = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `R${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `R${(v / 1_000).toFixed(1)}k`
    return `R${v.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Financial Health Score</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">
          DRRT-powered financial health assessment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="md:col-span-2 lg:col-span-2">
          <div className="flex items-start gap-6">
            <div className="text-center">
              <div className={`text-5xl font-bold font-mono ${
                (data?.health_score ?? 0) > 70 ? 'text-success' : (data?.health_score ?? 0) > 40 ? 'text-warning' : 'text-error'
              }`}>
                {data?.health_score ?? 0}
              </div>
              <div className="text-[0.55rem] text-white/30 font-mono mt-1 uppercase tracking-wider">/ 100</div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex justify-between text-[0.55rem] text-white/40 font-mono mb-1">
                  <span>Health Score</span>
                  <span>{data?.health_score ?? 0}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    (data?.health_score ?? 0) > 70 ? 'bg-success' : (data?.health_score ?? 0) > 40 ? 'bg-warning' : 'bg-error'
                  }`} style={{ width: `${data?.health_score ?? 0}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                  <div className={`text-sm font-mono font-bold ${liqColor(data?.liquidity ?? 'Moderate')}`}>
                    {data?.liquidity}
                  </div>
                  <div className="text-[0.5rem] text-white/30 font-mono">Liquidity</div>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                  <div className={`text-sm font-mono font-bold ${riskColor(data?.risk ?? 'Medium')}`}>
                    {data?.risk}
                  </div>
                  <div className="text-[0.5rem] text-white/30 font-mono">Risk</div>
                </div>
                <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                  <div className={`text-sm font-mono font-bold ${scoreColor(data?.compliance ?? 0)}`}>
                    {data?.compliance?.toFixed(0)}%
                  </div>
                  <div className="text-[0.5rem] text-white/30 font-mono">Compliance</div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Revenue</h2>
          </div>
          <div className="text-2xl font-mono font-bold text-white">{fmtShort(data?.revenue ?? 0)}</div>
          <MetricTile label="Expenses" value={fmtShort(data?.expenses ?? 0)} />
          <MetricTile label="Net Profit" value={fmtShort(data?.profit ?? 0)} status={(data?.profit ?? 0) >= 0 ? 'success' : 'error'} />
          <MetricTile
            label="Profit Margin"
            value={`${(data?.profit_margin ?? 0).toFixed(1)}%`}
            status={(data?.profit_margin ?? 0) > 0 ? 'success' : 'error'}
          />
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">DRRT Influence</h2>
          </div>
          <MetricTile
            label="Tensor Coherence"
            value={`${((data?.drrt_coherence ?? 0) * 100).toFixed(1)}%`}
            status={scoreColor((data?.drrt_coherence ?? 0) * 100)}
          />
          <MetricTile
            label="Liquidity Score"
            value={`${((data?.liquidity_score ?? 0) * 100).toFixed(0)}%`}
            status={liqColor(data?.liquidity ?? 'Moderate')}
          />
          <MetricTile
            label="Risk Score"
            value={`${((data?.risk_score ?? 0) * 100).toFixed(0)}%`}
            status={riskColor(data?.risk ?? 'Medium')}
          />
          <MetricTile label="Compliance Score" value={`${(data?.compliance_score ?? 0).toFixed(2)}`} />
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-scarlet-400" />
          <h2 className="section-title mb-0">Dimension Breakdown</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {data?.breakdown.map((b, i) => (
            <div key={i} className="bg-white/5 rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.55rem] font-mono text-white/60">
                  {b.dimension.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </span>
                <span className={`text-[0.5rem] font-mono ${
                  b.status === 'healthy' ? 'text-success' : b.status === 'warning' ? 'text-warning' : 'text-error'
                }`}>{b.status}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  b.status === 'healthy' ? 'bg-success' : b.status === 'warning' ? 'bg-warning' : 'bg-error'
                }`} style={{ width: `${b.score * 100}%` }} />
              </div>
              <div className="text-[0.5rem] text-white/30 font-mono mt-1">{(b.score * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
