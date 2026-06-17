'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { Brain, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { api } from '@/lib/api'

export default function DrrtMemoryPage() {
  const [memory, setMemory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDrrtMemory().then(d => { setMemory(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-white/40 text-xs py-12 text-center">Loading memory...</div>

  const history = memory?.recent_history ?? []
  const patterns = memory?.patterns ?? []

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Tensor Memory</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">
          Pattern memory and convergence history
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <MetricTile label="Memory States" value={memory?.memory_size ?? 0} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Detected Patterns" value={patterns.length} status={patterns.length > 0 ? 'warning' : 'success'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Recent History" value={history.length} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Pattern Detection</h2>
          </div>
          {patterns.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/30 font-mono">No patterns detected yet</div>
          ) : (
            <div className="space-y-2">
              {patterns.map((p: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-white/80">{p.pattern_type}</span>
                    <span className="text-[0.55rem] text-white/40">{(p.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <div className="flex gap-3 text-[0.55rem] text-white/30">
                    <span>freq: {p.frequency}x</span>
                    <span>last: iteration {p.last_observed}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Convergence History</h2>
          </div>
          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/30 font-mono">No history entries yet</div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {history.map((h: any, i: number) => (
                <div key={i} className="bg-white/5 rounded px-3 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.5rem] text-white/30 font-mono">#{h.iteration}</span>
                    <span className={`text-[0.55rem] font-mono ${h.coherence > 0.5 ? 'text-success' : 'text-error'}`}>
                      K={(h.coherence ?? 0).toFixed(3)}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[0.5rem] text-white/30 font-mono">
                    <span>C={(h.contradiction ?? 0).toFixed(3)}</span>
                    <span>F={(h.frustration ?? 0).toFixed(3)}</span>
                    <span>H={(h.entropy ?? 0).toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-glass-border flex items-center gap-2 text-[0.55rem] text-white/30 font-mono">
            <Brain size={10} /> Iterations tracked in tensor memory
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-scarlet-400" />
          <h2 className="section-title mb-0">Coherence Trajectory</h2>
        </div>
        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/30 font-mono">Converge the tensor to generate history</div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-end gap-0.5 h-24 bg-white/5 rounded-lg p-2">
              {[...history].reverse().slice(0, 60).map((h: any, i: number) => {
                const height = Math.max(4, (h.coherence ?? 0) * 100)
                return (
                  <div
                    key={i}
                    className="flex-1 bg-scarlet-400/40 rounded-t hover:bg-scarlet-400/60 transition-colors"
                    style={{ height: `${height}%` }}
                    title={`K=${(h.coherence ?? 0).toFixed(3)}`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-[0.5rem] text-white/25 font-mono">
              <span>iteration {history[history.length - 1]?.iteration ?? 0}</span>
              <span>coherence K(T) over time</span>
              <span>iteration {history[0]?.iteration ?? 0}</span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
