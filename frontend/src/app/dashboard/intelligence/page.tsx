'use client'

import { DrrtStatePanel } from '@/components/drrt/DrrtStatePanel'
import { TransactionIntelligencePanel } from '@/components/banking/TransactionIntelligencePanel'
import { AnomalyAlertFeed } from '@/components/banking/AnomalyAlertFeed'
import { api } from '@/lib/api'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function IntelligencePage() {
  const [drrt, setDrrt] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getDrrtState()
      .then(d => { setDrrt(d); setError(null) })
      .catch(e => setError(e.message))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Transaction Intelligence</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">
          DRRT-powered pattern recognition and anomaly detection
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-400/80 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-4">
          <DrrtStatePanel drrt={drrt} error={error} loading={!drrt && !error} />
        </div>
        <div className="glass p-4">
          <TransactionIntelligencePanel />
        </div>
        <div className="glass p-4">
          <div className="text-[0.65rem] text-white/40 font-mono mb-3">ANOMALY ALERTS</div>
          <AnomalyAlertFeed />
        </div>
      </div>
    </div>
  )
}
