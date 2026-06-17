'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface AnomalyInfo {
  anomaly_type: string
  severity: string
  coherence: number
  contradiction: number
  description: string
}

export function AnomalyAlertFeed() {
  const [anomalies, setAnomalies] = useState<AnomalyInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTransactionAnomalies()
      .then(setAnomalies)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const severityDot = (s: string) => {
    if (s === 'critical') return 'bg-red-400'
    if (s === 'warning') return 'bg-yellow-400'
    return 'bg-green-400'
  }

  if (loading) return <div className="text-white/40 text-xs p-4">Loading alerts...</div>

  return (
    <div className="space-y-3">
      {anomalies.length === 0 && (
        <div className="text-white/30 text-xs p-4 text-center">No anomalies detected</div>
      )}

      {anomalies.map((a, i) => (
        <div key={i} className="bg-white/5 rounded-lg px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${severityDot(a.severity)}`} />
              <span className="text-xs text-white/80 font-mono">{a.anomaly_type}</span>
            </div>
            <span className="text-[0.55rem] uppercase tracking-wider text-white/40">{a.severity}</span>
          </div>
          <p className="text-[0.6rem] text-white/50 leading-relaxed">{a.description}</p>
          <div className="flex gap-3 text-[0.55rem] text-white/30">
            <span>coherence: {a.coherence.toFixed(3)}</span>
            <span>contradiction: {a.contradiction.toFixed(3)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
