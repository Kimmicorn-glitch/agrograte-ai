'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { Brain, RefreshCw, Network, Zap, Info } from 'lucide-react'
import { api } from '@/lib/api'

const DIMENSION_COLORS = [
  'from-accent/20 to-accent/5',
  'from-blue-400/20 to-blue-400/5',
  'from-green-400/20 to-green-400/5',
  'from-yellow-400/20 to-yellow-400/5',
  'from-purple-400/20 to-purple-400/5',
  'from-cyan-400/20 to-cyan-400/5',
  'from-pink-400/20 to-pink-400/5',
  'from-orange-400/20 to-orange-400/5',
  'from-teal-400/20 to-teal-400/5',
  'from-indigo-400/20 to-indigo-400/5',
  'from-red-400/20 to-red-400/5',
  'from-violet-400/20 to-violet-400/5',
]

const METRIC_EXPLANATIONS: Record<string, string> = {
  'Coherence K(T)': 'Overall logical consistency of the knowledge graph. Higher = fewer contradictions between business dimensions.',
  'Contradiction C(T)': 'Measures conflicting signals between dimensions (e.g. high revenue + declining cashflow). Lower is better.',
  'Stability': 'How stable the tensor state is across iterations. High stability means consistent pattern recognition.',
  'Entropy H_R(T)': 'Degree of randomness/uncertainty in the relational graph. Lower = more structured knowledge.',
  'Frustration Index': 'Tension between conflicting relationships. High frustration = business dimensions pulling in different directions.',
  'Iterations': 'Number of convergence cycles the engine ran to reach current coherence. More iterations = more complex reconciliation.',
  'Memory States': 'Number of historical tensor states retained. More memory = better pattern recognition over time.',
  'Trend': 'Direction of coherence change over recent iterations. Improving = good, Degrading = needs attention.',
}

export default function DrrtPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [converging, setConverging] = useState(false)
  const [showExplanations, setShowExplanations] = useState(false)

  const load = useCallback(() => {
    api.getDrrtState().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleConverge = async () => {
    setConverging(true)
    try {
      const result = await api.convergeDrrt()
      setData(result)
    } catch (e) {
      console.warn('Converge failed:', e)
    }
    setConverging(false)
  }

  if (loading) return <div className="text-caption text-charcoal-500 py-12 text-center">Loading tensor state...</div>

  const s = data
  const dims = data?.dimensions ?? []

  const coherenceColor = (v: number) => v > 0.8 ? 'success' : v > 0.5 ? 'warning' : 'error'
  const formatPct = (v: number) => `${(v * 100).toFixed(1)}%`

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-xl text-secondary">DRRT Tensor State</h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Dynamic Recursive Relational Tensor &middot; {dims.length} dimensions
          </p>
        </div>
        <button
          onClick={() => setShowExplanations(!showExplanations)}
          className="flex items-center gap-1.5 text-caption text-charcoal-500 hover:text-charcoal-700 transition-colors shrink-0 mt-1"
        >
          <Info size={14} />
          {showExplanations ? 'Hide' : 'What is this?'}
        </button>
      </div>

      {showExplanations && (
        <div className="bg-accent/5 border border-accent/10 rounded-lg p-4 space-y-2">
          <p className="text-body-sm font-medium text-secondary">DRRT (Dynamic Recursive Relational Tensor) is Agrograte&apos;s financial intelligence engine. It maps relationships between your business dimensions — cash flow, revenue, compliance, risk — and measures how consistently they interact. Higher coherence means your financial dimensions are telling a consistent story.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <GlassCard>
          <MetricTile label="Coherence K(T)" value={formatPct(s?.coherence ?? 0)} status={coherenceColor(s?.coherence ?? 0)} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Coherence K(T)']}</div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="Contradiction C(T)" value={formatPct(s?.contradiction ?? 0)} status={s?.contradiction < 0.2 ? 'success' : s?.contradiction < 0.5 ? 'warning' : 'error'} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Contradiction C(T)']}</div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="Stability" value={formatPct(s?.stability ?? 0)} status={coherenceColor(s?.stability ?? 0)} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Stability']}</div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="Entropy H_R(T)" value={s?.entropy?.toFixed(3) ?? '0.000'} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Entropy H_R(T)']}</div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="Frustration Index" value={formatPct(s?.frustration_index ?? 0)} status={s?.frustration_index < 0.2 ? 'success' : s?.frustration_index < 0.5 ? 'warning' : 'error'} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Frustration Index']}</div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="Iterations" value={s?.convergence_iterations ?? 0} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Iterations']}</div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="Memory States" value={s?.memory_size ?? 0} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Memory States']}</div>
        </GlassCard>
        <GlassCard>
          <MetricTile label="Trend" value={s?.trend ?? '\u2014'} status={s?.trend === 'Improving' ? 'success' : s?.trend === 'Degrading' ? 'error' : 'warning'} />
          <div className="text-caption text-charcoal-500 mt-1">{METRIC_EXPLANATIONS['Trend']}</div>
          <button
            onClick={handleConverge}
            disabled={converging}
            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-white text-caption font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={converging ? 'animate-spin' : ''} />
            {converging ? 'Converging...' : 'Converge Tensor'}
          </button>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-accent" />
            <h2 className="text-heading-md text-secondary mb-0">Tensor Dimensions</h2>
          </div>
          <div className="space-y-2">
            {dims.length > 0 ? (
              dims.map((d: any, i: number) => (
                <div key={d.id || i} className={`bg-gradient-to-r ${DIMENSION_COLORS[i % DIMENSION_COLORS.length]} rounded-lg px-3 py-2.5`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-body-sm font-medium text-secondary">{d.name}</span>
                    <span className="text-caption text-charcoal-500">w:{d.weight.toFixed(1)} a:{d.activation.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent/60 rounded-full" style={{ width: `${d.weight * 100}%` }} />
                      </div>
                      <div className="text-caption text-charcoal-400 mt-0.5">weight</div>
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400/60 rounded-full" style={{ width: `${d.activation * 100}%` }} />
                      </div>
                      <div className="text-caption text-charcoal-400 mt-0.5">activation</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-charcoal-400">
                <p className="text-body-sm">No dimension data available</p>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Network size={16} className="text-accent" />
            <h2 className="text-heading-md text-secondary mb-0">Relationship Graph</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Network size={32} className="text-charcoal-200 mb-3" />
            {data?.relationships?.length > 0 ? (
              <div className="w-full space-y-1.5">
                {data.relationships.map((r: any, i: number) => (
                  <div key={i} className="bg-charcoal-50 rounded px-3 py-1.5 flex items-center justify-between text-caption">
                    <span className="font-mono text-charcoal-600">{r.relation_type}</span>
                    <span className={`${r.sign === 'Positive' ? 'text-success' : r.sign === 'Negative' ? 'text-error' : 'text-charcoal-400'}`}>
                      {r.sign}
                    </span>
                    <span className="text-charcoal-400">{r.strength.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-body-sm text-charcoal-400">
                No relationships defined yet.<br />
                Relationships form automatically as the tensor converges across business dimensions.
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-caption text-charcoal-400">
            <Zap size={12} />
            {data?.relationships?.length ?? 0} edges &middot; convergence: {s?.convergence_iterations ?? 0} iterations
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
