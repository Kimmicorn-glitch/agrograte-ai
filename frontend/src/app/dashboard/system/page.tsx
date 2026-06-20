'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { useOrbStore } from '@/components/intelligence-orb/store'

interface SystemStatus {
  label: string
  endpoint: string
  status: 'ok' | 'degraded' | 'error' | 'loading'
  message: string
  timing: string
}

async function checkEndpoint(path: string): Promise<{ ok: boolean; data: any; timing: number }> {
  const start = performance.now()
  try {
    const res = await fetch(path)
    const data = await res.json()
    return { ok: res.ok, data, timing: Math.round(performance.now() - start) }
  } catch (e: any) {
    return { ok: false, data: { error: e.message }, timing: Math.round(performance.now() - start) }
  }
}

function StatusBadge({ status }: { status: SystemStatus['status'] }) {
  const colors = {
    ok: 'bg-success/20 text-success border-success/30',
    degraded: 'bg-warning/20 text-warning border-warning/30',
    error: 'bg-error/20 text-error border-error/30',
    loading: 'bg-charcoal-100 text-charcoal-500 border-charcoal-200 animate-pulse',
  }
  return (
    <span className={`text-[0.6rem] font-mono px-2 py-0.5 rounded-full border ${colors[status]}`}>
      {status.toUpperCase()}
    </span>
  )
}

export default function SystemPage() {
  const [checks, setChecks] = useState<SystemStatus[]>([
    { label: 'API Health', endpoint: '/api/health', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Financial Health', endpoint: '/api/financial/health', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Banking Summary', endpoint: '/api/banking/summary', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Compliance Summary', endpoint: '/api/compliance/summary', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Cash Flow Forecast', endpoint: '/api/cashflow/forecast', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Transaction Intelligence', endpoint: '/api/transactions/intelligence', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'VAT Returns', endpoint: '/api/compliance/vat-returns', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Tax Records', endpoint: '/api/compliance/tax-records', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Investec Status', endpoint: '/api/investec/status', status: 'loading', message: 'Checking...', timing: '' },
    { label: 'Banking Accounts', endpoint: '/api/banking/accounts', status: 'loading', message: 'Checking...', timing: '' },
  ])

  const [frontendEnv, setFrontendEnv] = useState<Record<string, string>>({})
  const orbMetrics = useOrbStore((s) => s.metrics)

  useEffect(() => {
    setFrontendEnv({
      'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL || '(not set)',
      'NODE_ENV': process.env.NODE_ENV || '(not set)',
    })
  }, [])

  useEffect(() => {
    let mounted = true
    const runChecks = async () => {
      const results = await Promise.all(
        checks.map(async (c) => {
          const { ok, data, timing } = await checkEndpoint(c.endpoint)
          let status: SystemStatus['status'] = ok ? 'ok' : 'error'
          let message = ''
          if (ok && data.status === 'degraded') {
            status = 'degraded'
            message = data.message || 'Degraded'
          } else if (ok && data.status === 'ok') {
            message = 'Healthy'
          } else if (ok && Array.isArray(data)) {
            message = `${data.length} records`
          } else if (ok && typeof data === 'object') {
            const keys = Object.keys(data)
            message = `${keys.length} fields`
          } else {
            message = data?.error || 'Unknown error'
          }
          if (c.endpoint === '/api/transactions/intelligence' && ok) {
            message = `${data.total_transactions || 0} txns, ${(data.top_merchants || []).length} merchants`
          }
          if (c.endpoint === '/api/compliance/vat-returns' && ok) {
            const pending = data.filter((r: any) => !r.is_submitted).length
            message = `${data.length} periods, ${pending} pending`
          }
          if (c.endpoint === '/api/compliance/tax-records' && ok) {
            const pending = data.filter((r: any) => r.status !== 'Filed' && r.status !== 'Approved').length
            message = `${data.length} records, ${pending} pending`
          }
          if (c.endpoint === '/api/investec/status' && ok) {
            message = data.connected ? 'Connected' : `Disconnected: ${data.error || 'No connection'}`
          }
          return { ...c, status, message, timing: `${timing}ms` }
        })
      )
      if (mounted) setChecks(results)
    }
    runChecks()
    const interval = setInterval(runChecks, 15000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const orbScore = Math.round(
    ((orbMetrics?.cashflowHealth || 0) +
      (orbMetrics?.complianceScore || 0) +
      (1 - (orbMetrics?.taxLiability || 0)) +
      (orbMetrics?.forecastConfidence || 0) +
      (1 - (orbMetrics?.riskLevel || 0))) /
      5 * 100
  )

  const allOk = checks.every((c) => c.status === 'ok')
  const anyError = checks.some((c) => c.status === 'error')
  const anyDegraded = checks.some((c) => c.status === 'degraded')

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div>
            <h1 className="text-display-sm text-secondary">System Diagnostics</h1>
            <p className="text-body-md text-charcoal-500">Real-time status of all platform subsystems</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-lg border ${
          allOk ? 'bg-success/10 border-success/30 text-success' :
          anyError ? 'bg-error/10 border-error/30 text-error' :
          'bg-warning/10 border-warning/30 text-warning'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {allOk ? 'ALL SYSTEMS OK' : anyError ? 'SYSTEM ERRORS' : 'DEGRADED'}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-2">
        {checks.map((c) => (
          <div key={c.endpoint} className="card flex items-center justify-between py-2.5 px-4">
            <div className="flex items-center gap-3 min-w-0">
              <StatusBadge status={c.status} />
              <div className="min-w-0">
                <span className="text-sm font-medium text-secondary">{c.label}</span>
                <span className="text-caption text-charcoal-400 ml-2 font-mono">{c.endpoint}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className={`text-xs font-mono ${
                c.status === 'ok' ? 'text-success' : c.status === 'degraded' ? 'text-warning' : 'text-error'
              }`}>
                {c.message}
              </span>
              <span className="text-[0.6rem] font-mono text-charcoal-400 w-10 text-right">{c.timing}</span>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-heading-sm text-secondary mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(frontendEnv).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-1.5 border-b border-charcoal-100 last:border-0">
                <span className="text-sm font-mono text-charcoal-600">{key}</span>
                <span className={`text-sm font-mono ${value === '(not set)' ? 'text-error' : 'text-success'}`}>
                  {value === '(not set)' ? '❌ NOT SET' : '✅ Set'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-heading-sm text-secondary mb-4">Orb Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-600">Composite Health</span>
              <span className="text-lg font-bold font-mono text-secondary">{orbScore}<span className="text-sm text-charcoal-400">/100</span></span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${orbScore}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.entries(orbMetrics || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-charcoal-500">{key}</span>
                  <span className="text-secondary">{typeof value === 'number' ? value.toFixed(3) : String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="card bg-success/5 border-success/20">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${allOk ? 'bg-success' : anyError ? 'bg-error animate-pulse' : 'bg-warning animate-pulse'}`} />
          <span className="text-sm text-secondary font-mono">
            {allOk
              ? 'Production: All 10 subsystems are operational'
              : anyError
              ? `Production: ${checks.filter(c => c.status === 'error').length} subsystem(s) reporting errors`
              : `Production: ${checks.filter(c => c.status === 'degraded').length} subsystem(s) degraded`
            }
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
