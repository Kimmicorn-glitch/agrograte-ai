'use client'

import { useEffect, useState } from 'react'
import { MetricTile } from '@/components/ui/MetricTile'
import { api } from '@/lib/api'

interface PatternInfo {
  pattern_type: string
  frequency: number
  confidence: number
  last_observed: number
}

interface AnomalyInfo {
  anomaly_type: string
  severity: string
  coherence: number
  contradiction: number
  description: string
}

interface IntelligenceData {
  categories: any[]
  patterns: PatternInfo[]
  anomalies: AnomalyInfo[]
  drrt_coherence: number
}

export function TransactionIntelligencePanel() {
  const [data, setData] = useState<IntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getTransactionIntelligence()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-white/40 text-xs">Loading intelligence...</div>
  if (error) return <div className="text-red-400 text-xs">Error: {error}</div>
  if (!data) return null

  const severityColor = (s: string) =>
    s === 'critical' ? 'error' : s === 'warning' ? 'warning' : 'success'

  return (
    <div className="space-y-4">
      <div className="section-title">Transaction Intelligence</div>

      <MetricTile
        label="DRRT Coherence"
        value={`${(data.drrt_coherence * 100).toFixed(1)}%`}
        status={data.drrt_coherence > 0.8 ? 'success' : data.drrt_coherence > 0.5 ? 'warning' : 'error'}
      />

      <MetricTile
        label="Patterns Detected"
        value={data.patterns.length}
      />

      <MetricTile
        label="Active Anomalies"
        value={data.anomalies.filter(a => a.severity === 'critical' || a.severity === 'warning').length}
        status={data.anomalies.some(a => a.severity === 'critical') ? 'error' : 'warning'}
      />

      {data.patterns.length > 0 && (
        <div className="pt-4 border-t border-glass-border">
          <div className="text-[0.65rem] text-white/40 font-mono mb-2">PATTERNS</div>
          <div className="space-y-2">
            {data.patterns.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <div>
                  <div className="text-xs text-white/80 font-mono">{p.pattern_type}</div>
                  <div className="text-[0.6rem] text-white/40">
                    freq: {p.frequency} &middot; confidence: {(p.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <span className="text-[0.55rem] text-white/30">observed: {p.frequency}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.anomalies.length > 0 && (
        <div className="pt-4 border-t border-glass-border">
          <div className="text-[0.65rem] text-white/40 font-mono mb-2">ANOMALIES</div>
          <div className="space-y-2">
            {data.anomalies.map((a, i) => (
              <div key={i} className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 status-dot ${severityColor(a.severity)}`} />
                  <span className="text-white/80">{a.anomaly_type}</span>
                  <span className="text-white/30 text-[0.55rem] uppercase">{a.severity}</span>
                </div>
                <div className="text-[0.55rem] text-white/40 pl-3.5">{a.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
