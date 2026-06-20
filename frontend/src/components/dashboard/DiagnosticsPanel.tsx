'use client'

import { useState, useEffect } from 'react'
import { Activity, Database, ShieldCheck, Brain, Banknote, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'

interface ServiceStatus {
  name: string
  status: 'ok' | 'degraded' | 'down'
  icon: React.ReactNode
  detail: string
  latency: string
}

export function DiagnosticsPanel() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)

  const checkServices = async () => {
    setLoading(true)
    const results: ServiceStatus[] = []

    try {
      const start = Date.now()
      const health = await fetch('/api/health').then((r) => r.json())
      const latency = `${Date.now() - start}ms`
      results.push({
        name: 'API Server',
        status: health.status === 'ok' ? 'ok' : 'degraded',
        icon: <Activity size={12} />,
        detail: `v${health.version || 'unknown'}`,
        latency,
      })
      results.push({
        name: 'Database',
        status: health.database === 'connected' ? 'ok' : 'down',
        icon: <Database size={12} />,
        detail: health.database || 'unknown',
        latency,
      })
    } catch {
      results.push({
        name: 'API Server',
        status: 'down',
        icon: <Activity size={12} />,
        detail: 'Unreachable',
        latency: '—',
      })
      results.push({
        name: 'Database',
        status: 'down',
        icon: <Database size={12} />,
        detail: 'Unknown',
        latency: '—',
      })
    }

    try {
      const start = Date.now()
      const status = await api.getInvestecStatus()
      results.push({
        name: 'Investec',
        status: status.connected ? 'ok' : 'degraded',
        icon: <Banknote size={12} />,
        detail: status.connected ? `${status.accounts_linked || 0} accounts linked` : 'Disconnected',
        latency: `${Date.now() - start}ms`,
      })
    } catch {
      results.push({
        name: 'Investec',
        status: 'down',
        icon: <Banknote size={12} />,
        detail: 'Unavailable',
        latency: '—',
      })
    }

    try {
      const start = Date.now()
      const summary = await api.getComplianceSummary()
      results.push({
        name: 'Compliance Engine',
        status: summary ? 'ok' : 'degraded',
        icon: <ShieldCheck size={12} />,
        detail: summary ? `${summary.sars_compliance_score}/100` : 'No data',
        latency: `${Date.now() - start}ms`,
      })
    } catch {
      results.push({
        name: 'Compliance Engine',
        status: 'degraded',
        icon: <ShieldCheck size={12} />,
        detail: 'Limited',
        latency: '—',
      })
    }

    try {
      const start = Date.now()
      const health = await api.getFinancialHealth()
      results.push({
        name: 'Orb',
        status: health ? 'ok' : 'degraded',
        icon: <Brain size={12} />,
        detail: health ? `${health.health_score}/100` : 'No data',
        latency: `${Date.now() - start}ms`,
      })
    } catch {
      results.push({
        name: 'Orb',
        status: 'degraded',
        icon: <Brain size={12} />,
        detail: 'No data',
        latency: '—',
      })
    }

    setServices(results)
    setLoading(false)
  }

  useEffect(() => {
    checkServices()
    const interval = setInterval(checkServices, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs">
      <div className="glass rounded-xl p-3 border border-glass-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.55rem] font-mono text-white/40 uppercase tracking-wider">System Diagnostics</span>
          <button onClick={checkServices} className="text-white/30 hover:text-white/60 transition-colors">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="space-y-1.5">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  s.status === 'ok' ? 'bg-emerald-400' : s.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-[0.55rem] font-mono text-white/50">{s.icon}</span>
                <span className="text-[0.55rem] font-mono text-white/50">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[0.5rem] font-mono ${
                  s.status === 'ok' ? 'text-emerald-400/60' : s.status === 'degraded' ? 'text-yellow-400/60' : 'text-red-400/60'
                }`}>
                  {s.latency}
                </span>
                <span className={`text-[0.5rem] font-mono ${
                  s.status === 'ok' ? 'text-emerald-400' : s.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {s.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
