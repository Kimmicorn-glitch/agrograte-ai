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
    const start = Date.now()

    const results: ServiceStatus[] = []

    try {
      const healthStart = Date.now()
      const health = await fetch('/health').then(r => r.json())
      results.push({
        name: 'API Server',
        status: health.status === 'ok' ? 'ok' : 'degraded',
        icon: <Activity size={12} />,
        detail: health.status === 'ok' ? 'Running' : 'Degraded',
        latency: `${Date.now() - healthStart}ms`,
      })
    } catch {
      results.push({
        name: 'API Server',
        status: 'down',
        icon: <Activity size={12} />,
        detail: 'Unreachable',
        latency: '—',
      })
    }

    try {
      const dbStart = Date.now()
      await api.getDrrtState()
      results.push({
        name: 'DRRT Engine',
        status: 'ok',
        icon: <Brain size={12} />,
        detail: 'Tensor active',
        latency: `${Date.now() - dbStart}ms`,
      })
    } catch {
      results.push({
        name: 'DRRT Engine',
        status: 'degraded',
        icon: <Brain size={12} />,
        detail: 'Fallback mode',
        latency: '—',
      })
    }

    try {
      const compStart = Date.now()
      await api.getComplianceSummary()
      results.push({
        name: 'Compliance Engine',
        status: 'ok',
        icon: <ShieldCheck size={12} />,
        detail: 'SARS rules loaded',
        latency: `${Date.now() - compStart}ms`,
      })
    } catch {
      results.push({
        name: 'Compliance Engine',
        status: 'degraded',
        icon: <ShieldCheck size={12} />,
        detail: 'Limited functionality',
        latency: '—',
      })
    }

    try {
      const invStart = Date.now()
      await api.getInvestecStatus()
      results.push({
        name: 'Investec',
        status: 'ok',
        icon: <Banknote size={12} />,
        detail: 'Connected',
        latency: `${Date.now() - invStart}ms`,
      })
    } catch {
      results.push({
        name: 'Investec',
        status: 'degraded',
        icon: <Banknote size={12} />,
        detail: 'Sandbox mode',
        latency: '—',
      })
    }

    try {
      const orbStart = Date.now()
      await api.getFinancialHealth()
      results.push({
        name: 'Financial Orb',
        status: 'ok',
        icon: <Activity size={12} />,
        detail: 'Live metrics',
        latency: `${Date.now() - orbStart}ms`,
      })
    } catch {
      results.push({
        name: 'Financial Orb',
        status: 'degraded',
        icon: <Activity size={12} />,
        detail: 'Cache mode',
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
