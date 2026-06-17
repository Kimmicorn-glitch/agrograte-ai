'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { TrendingUp, TrendingDown, BarChart3, Clock, Activity, Brain, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

interface Scenario {
  scenario_type: string
  projected_balance: number
  probability: number
}

interface CashFlowData {
  projected_balance: number
  confidence: number
  drrt_coherence: number
  avg_daily_inflow: number
  avg_daily_outflow: number
  inflow_volatility: number
  outflow_volatility: number
  scenarios: Scenario[]
  forecast_date: string
}

export default function CashFlowPage() {
  const [data, setData] = useState<CashFlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getCashflowForecast()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-16 text-white/40 font-mono text-xs gap-2"><div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />Loading cash flow forecast...</div>
  }

  if (error) {
    return <div className="text-xs text-red-400/80 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 flex items-center gap-2"><AlertTriangle size={12} />{error}</div>
  }

  const scenarioColor = (t: string) => {
    if (t === 'Optimistic') return 'border-scarlet-400/40 bg-scarlet-400/5'
    if (t === 'Base') return 'border-white/20 bg-white/5'
    if (t === 'Pessimistic') return 'border-yellow-400/40 bg-yellow-400/5'
    return 'border-red-400/40 bg-red-400/5'
  }

  const scenarioLabel = (t: string) => {
    if (t === 'Optimistic') return 'Optimistic'
    if (t === 'Base') return 'Base Case'
    if (t === 'Pessimistic') return 'Pessimistic'
    return 'Stress Test'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Cash Flow Forecast</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">
          DRRT-powered 90-day cash flow projection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex flex-col items-center text-center py-2">
            <div className={`text-3xl font-bold font-mono ${(data?.projected_balance ?? 0) >= 0 ? 'text-success' : 'text-error'}`}>
              R {(data?.projected_balance ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[0.55rem] text-white/30 font-mono mt-1 uppercase tracking-wider">Projected Balance</div>
            <div className="w-full mt-3 progress-bar">
              <div className="progress-bar-fill" style={{
                width: `${Math.min(100, Math.max(0, ((data?.confidence ?? 0) * 100)))}%`
              }} />
            </div>
            <div className="text-[0.55rem] text-white/30 mt-1">{((data?.confidence ?? 0) * 100).toFixed(0)}% confidence</div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={12} className="text-success" />
            <span className="text-[0.55rem] text-white/40 font-mono uppercase">Daily Inflow</span>
          </div>
          <div className="text-lg font-mono text-success">
            R{(data?.avg_daily_inflow ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </div>
          <MetricTile label="Volatility" value={`${((data?.inflow_volatility ?? 1) * 100).toFixed(0)}%`} status={(data?.inflow_volatility ?? 1) < 0.3 ? 'success' : (data?.inflow_volatility ?? 1) < 0.6 ? 'warning' : 'error'} />
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={12} className="text-error" />
            <span className="text-[0.55rem] text-white/40 font-mono uppercase">Daily Outflow</span>
          </div>
          <div className="text-lg font-mono text-error">
            R{(data?.avg_daily_outflow ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </div>
          <MetricTile label="Volatility" value={`${((data?.outflow_volatility ?? 1) * 100).toFixed(0)}%`} status={(data?.outflow_volatility ?? 1) < 0.3 ? 'success' : (data?.outflow_volatility ?? 1) < 0.6 ? 'warning' : 'error'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="DRRT Coherence" value={`${((data?.drrt_coherence ?? 0) * 100).toFixed(1)}%`} status={(data?.drrt_coherence ?? 0) > 0.8 ? 'success' : (data?.drrt_coherence ?? 0) > 0.5 ? 'warning' : 'error'} />
          <MetricTile label="Forecast Horizon" value="90 days" />
          <div className="flex items-center gap-1 mt-2 text-[0.55rem] text-white/30 font-mono">
            <Clock size={10} /> {data?.forecast_date ? new Date(data.forecast_date).toLocaleDateString() : '—'}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Scenario Analysis</h2>
          </div>
          <div className="space-y-3">
            {data?.scenarios.map((s, i) => (
              <div key={i} className={`rounded-lg border px-4 py-3 ${scenarioColor(s.scenario_type)}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-white/80">{scenarioLabel(s.scenario_type)}</span>
                  <span className="text-[0.55rem] text-white/40">{(s.probability * 100).toFixed(0)}% probability</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className={`text-lg font-mono font-bold ${s.projected_balance >= 0 ? 'text-success' : 'text-error'}`}>
                    R {s.projected_balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.scenario_type === 'Optimistic' ? 'bg-success' : s.scenario_type === 'Base' ? 'bg-white/40' : s.scenario_type === 'Pessimistic' ? 'bg-warning' : 'bg-error'}`}
                      style={{ width: `${Math.min(100, Math.abs(s.projected_balance / (data?.projected_balance || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Forecast Insights</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg px-4 py-3">
              <div className="text-xs text-white/80 mb-1">Net Daily Flow</div>
              <div className={`text-lg font-mono font-bold ${((data?.avg_daily_inflow ?? 0) - (data?.avg_daily_outflow ?? 0)) >= 0 ? 'text-success' : 'text-error'}`}>
                R {((data?.avg_daily_inflow ?? 0) - (data?.avg_daily_outflow ?? 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[0.55rem] text-white/30 mt-1">
                {(data?.avg_daily_inflow ?? 0) > 0
                  ? `Inflow/outflow ratio: ${((data?.avg_daily_inflow ?? 0) / Math.max((data?.avg_daily_outflow ?? 0), 0.01)).toFixed(2)}`
                  : 'No transaction data available'}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={12} className="text-scarlet-400" />
                <span className="text-xs text-white/80">DRRT Confidence Weighting</span>
              </div>
              <div className="text-[0.6rem] text-white/40 leading-relaxed">
                Forecast confidence is computed from DRRT tensor coherence
                ({(data?.drrt_coherence ?? 0).toFixed(2)}), inflow volatility
                ({((data?.inflow_volatility ?? 1) * 100).toFixed(0)}%), and outflow volatility
                ({((data?.outflow_volatility ?? 1) * 100).toFixed(0)}%).
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-2 text-[0.6rem] text-white/30 font-mono">
            <Clock size={10} /> 90-day forecast &middot; DRRT coherence at forecast time
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Balance Projection Range</h2>
          </div>
          <div className="relative h-20 bg-white/5 rounded-lg overflow-hidden">
            {data && (
              <div className="absolute inset-0 flex items-end px-4 pb-3 gap-1">
                {data.scenarios.map((s, i) => {
                  const allBalances = data.scenarios.map(x => Math.abs(x.projected_balance))
                  const maxAbs = Math.max(...allBalances, 1)
                  const heightPct = Math.abs(s.projected_balance) / maxAbs * 100
                  const isPositive = s.projected_balance >= 0
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[0.5rem] text-white/30 font-mono">
                        R{(s.projected_balance / 1000).toFixed(0)}k
                      </div>
                      <div
                        className={`w-full rounded-t ${isPositive ? 'bg-success/40' : 'bg-error/40'}`}
                        style={{ height: `${Math.max(heightPct, 4)}%` }}
                      />
                      <div className="text-[0.5rem] text-white/40 font-mono mt-1">
                        {scenarioLabel(s.scenario_type).split(' ')[0]}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="mt-2 flex justify-center gap-4 text-[0.55rem] text-white/30 font-mono">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-success/40" /> Positive</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-error/40" /> Negative</span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
