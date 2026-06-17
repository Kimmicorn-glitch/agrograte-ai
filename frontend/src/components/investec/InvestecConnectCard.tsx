'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'

interface ConnectionStatus {
  connected: boolean
  accounts_linked: number
  last_sync: string | null
}

export function InvestecConnectCard() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const data = await api.getInvestecStatus()
      setStatus(data)
    } catch {
      setStatus({ connected: false, accounts_linked: 0, last_sync: null })
    } finally {
      setLoading(false)
    }
  }

  const connectInvestec = async () => {
    try {
      const { url } = await api.getInvestecAuthUrl()
      window.open(url, '_blank', 'width=600,height=700')
    } catch (e) {
      console.error('Failed to get auth URL:', e)
    }
  }

  return (
    <GlassCard>
      <div className="space-y-4">
        <div className="section-title">Investec Connection</div>
        {status?.connected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/60">Connected</span>
            </div>
            <p className="text-xs text-white/40">
              {status.accounts_linked} account{status.accounts_linked !== 1 ? 's' : ''} linked
            </p>
            {status.last_sync && (
              <p className="text-xs text-white/30">Last sync: {status.last_sync}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-white/40">
              Connect your Investec Programmable Banking account to enable real-time financial intelligence.
            </p>
            <button
              onClick={connectInvestec}
              className="w-full px-4 py-2 text-xs font-mono rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Connect Investec
            </button>
            <button
              onClick={checkStatus}
              disabled={loading}
              className="w-full px-4 py-2 text-xs font-mono rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Connection Status'}
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
