'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { Brain, Activity, BarChart3, RefreshCw, Network, Zap } from 'lucide-react'
import { api } from '@/lib/api'

const DIMENSION_COLORS = [
  'from-scarlet-400/20 to-scarlet-400/5',
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

export default function DrrtPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [converging, setConverging] = useState(false)

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

  if (loading) return <div className="text-white/40 text-xs py-12 text-center">Loading tensor state...</div>

  const s = data?.state
  const dims = data?.dimensions ?? []

  const coherenceColor = (v: number) => v > 0.8 ? 'success' : v > 0.5 ? 'warning' : 'error'
  const formatPct = (v: number) => `${(v * 100).toFixed(1)}%`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">DRRT Tensor State</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">
          Dynamic Recursive Relational Tensor &middot; {dims.length} dimensions &middot; {data?.relationships?.length ?? 0} relationships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <MetricTile label="Coherence K(T)" value={formatPct(s?.coherence ?? 0)} status={coherenceColor(s?.coherence ?? 0)} />
          <MetricTile label="Contradiction C(T)" value={formatPct(s?.contradiction ?? 0)} status={s?.contradiction < 0.2 ? 'success' : s?.contradiction < 0.5 ? 'warning' : 'error'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Stability" value={formatPct(s?.stability ?? 0)} status={coherenceColor(s?.stability ?? 0)} />
          <MetricTile label="Entropy H_R(T)" value={s?.entropy.toFixed(3) ?? '0.000'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Frustration Index" value={formatPct(s?.frustration_index ?? 0)} status={s?.frustration_index < 0.2 ? 'success' : s?.frustration_index < 0.5 ? 'warning' : 'error'} />
          <MetricTile label="Iterations" value={s?.convergence_iterations ?? 0} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Memory States" value={s?.memory_size ?? 0} />
          <MetricTile label="Trend" value={s?.trend ?? '—'} status={s?.trend === 'Improving' ? 'success' : s?.trend === 'Degrading' ? 'error' : 'warning'} />
          <button
            onClick={handleConverge}
            disabled={converging}
            className="btn-primary w-full text-xs mt-2 flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={12} className={converging ? 'animate-spin' : ''} />
            {converging ? 'Converging...' : 'Converge Tensor'}
          </button>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Tensor Dimensions</h2>
          </div>
          <div className="space-y-0.5">
            {dims.map((d: any, i: number) => (
              <div key={d.id || i} className={`bg-gradient-to-r ${DIMENSION_COLORS[i % DIMENSION_COLORS.length]} rounded-lg px-3 py-2`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.6rem] font-mono text-white/80">{d.name.replace(/([a-z])([A-Z])/g, '$1 $2')}</span>
                  <span className="text-[0.55rem] text-white/40">w:{d.weight.toFixed(1)} a:{d.activation.toFixed(2)}</span>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-scarlet-400/60 rounded-full" style={{ width: `${d.weight * 100}%` }} />
                    </div>
                    <div className="text-[0.45rem] text-white/25 mt-0.5">weight</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400/60 rounded-full" style={{ width: `${d.activation * 100}%` }} />
                    </div>
                    <div className="text-[0.45rem] text-white/25 mt-0.5">activation</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Network size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Relationship Graph</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Network size={32} className="text-white/10 mb-3" />
            {data?.relationships?.length > 0 ? (
              <div className="w-full space-y-1.5">
                {data.relationships.map((r: any, i: number) => (
                  <div key={i} className="bg-white/5 rounded px-3 py-1.5 flex items-center justify-between text-[0.6rem]">
                    <span className="font-mono text-white/60">{r.relation_type}</span>
                    <span className={`${r.sign === 'Positive' ? 'text-success' : r.sign === 'Negative' ? 'text-error' : 'text-white/40'}`}>
                      {r.sign}
                    </span>
                    <span className="text-white/30">{r.strength.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[0.65rem] text-white/30 font-mono">
                No relationships defined yet.<br />
                Add relationships to build the tensor graph.
              </div>
            )}
          </div>
          <div className="mt-2 pt-3 border-t border-glass-border flex items-center gap-2 text-[0.55rem] text-white/30 font-mono">
            <Zap size={10} />
            {data?.relationships?.length ?? 0} edges &middot; convergence: {s?.convergence_iterations ?? 0} iterations
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
