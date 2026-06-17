'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { Brain, Shield, Activity, Banknote } from 'lucide-react'
import type { DrrtState, FinancialHealth, BankingSummary, ComplianceSummary } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`)
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export default function DashboardOverview() {
  const [drrt, setDrrt] = useState<DrrtState | null>(null)
  const [health, setHealth] = useState<FinancialHealth | null>(null)
  const [banking, setBanking] = useState<BankingSummary | null>(null)
  const [compliance, setCompliance] = useState<ComplianceSummary | null>(null)
  const [time, setTime] = useState(new Date())
  const [latency, setLatency] = useState<number | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const start = performance.now()
      const [drrtData, healthData, bankingData, complianceData] = await Promise.all([
        fetchJSON<DrrtState>('/api/drrt/state'),
        fetchJSON<FinancialHealth>('/api/financial/health'),
        fetchJSON<BankingSummary>('/api/banking/summary'),
        fetchJSON<ComplianceSummary>('/api/compliance/summary'),
      ])
      setLatency(Math.round(performance.now() - start))
      if (drrtData) setDrrt(drrtData)
      if (healthData) setHealth(healthData)
      if (bankingData) setBanking(bankingData)
      if (complianceData) setCompliance(complianceData)
    }

    loadData()
    const interval = setInterval(loadData, 30000)
    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => { clearInterval(interval); clearInterval(clock) }
  }, [])

  return (
    <div className="space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-semibold tracking-tight">Financial Overview</h1>
          <p className="text-[0.65rem] text-white/30 font-mono mt-0.5">
            {time.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            {time.toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit' })} SAST
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
          <span className={`status-dot ${latency !== null && latency < 200 ? 'status-dot-success' : 'status-dot-warning'}`} />
          {latency !== null ? `${latency}ms` : '...'}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-5">
        <GlassCard depth={2} className="md:col-span-2">
          <div className="space-y-4">
            <SectionTitle>Financial Health</SectionTitle>
            {health ? (
              <>
                <div className="flex items-end gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold">{Math.round(health.health_score)}</span>
                    <span className="text-xs text-white/30 font-mono">/100</span>
                  </div>
                  <div className="flex-1">
                    <div className="progress-bar">
                      <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${health.health_score}%` }}
                        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <MetricTile label="Liquidity" value={String(health.liquidity)} status={health.liquidity > 0.5 ? 'success' : 'warning'} />
                  <MetricTile label="Risk" value={String(health.risk)} status={health.risk < 0.5 ? 'success' : 'error'} />
                  <MetricTile label="Compliance" value={`${Math.round(health.compliance)}%`} status={health.compliance > 80 ? 'success' : 'warning'} />
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-white/30 font-mono">Loading health data...</div>
            )}
          </div>
        </GlassCard>

        <GlassCard depth={2} glow="scarlet">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Banknote size={12} className="text-scarlet-400" />
              <SectionTitle className="mb-0">Banking Summary</SectionTitle>
            </div>
            {banking ? (
              <>
                <div>
                  <div className="metric-label">Available Balance</div>
                  <div className="font-mono text-2xl font-bold text-gradient-accent bg-gradient-accent bg-clip-text text-transparent mt-1">
                    R {banking.available_balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="space-y-1">
                  <MetricTile label="Pending" value={banking.pending_transactions} status="warning" />
                  <MetricTile label="Tax Reserve" value={`R${banking.reserved_tax_funds.toLocaleString('en-ZA')}`} />
                  <MetricTile label="Rules Active" value={banking.programmable_rules} status="success" />
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-white/30 font-mono">Connect Investec to view</div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-5">
        <GlassCard depth={1}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain size={12} className="text-scarlet-400" />
              <SectionTitle className="mb-0">DRRT Tensor State</SectionTitle>
            </div>
            {drrt ? (
              <div className="space-y-1">
                <MetricTile label="Coherence K(T)" value={`${(drrt.coherence * 100).toFixed(1)}%`} status={drrt.coherence > 0.8 ? 'success' : drrt.coherence > 0.5 ? 'warning' : 'error'} />
                <MetricTile label="Contradiction C(T)" value={`${(drrt.contradiction * 100).toFixed(1)}%`} status={drrt.contradiction < 0.2 ? 'success' : 'warning'} />
                <MetricTile label="Stability" value={`${(drrt.stability * 100).toFixed(1)}%`} status={drrt.stability > 0.7 ? 'success' : 'warning'} />
                <MetricTile label="Entropy H_R(T)" value={drrt.entropy.toFixed(3)} />
                <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                  <span className="text-[0.55rem] text-white/30 font-mono">Convergence</span>
                  <StatusBadge label="Active" status="success" pulse />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-white/30 font-mono">Tensor initializing...</div>
            )}
          </div>
        </GlassCard>

        <GlassCard depth={1}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-scarlet-400" />
              <SectionTitle className="mb-0">Compliance Status</SectionTitle>
            </div>
            {compliance ? (
              <div className="space-y-1">
                <MetricTile label="SARS Score" value={`${compliance.sars_compliance_score}%`} status={compliance.sars_compliance_score > 90 ? 'success' : compliance.sars_compliance_score > 70 ? 'warning' : 'error'} />
                <MetricTile label="VAT" value={compliance.vat_compliant ? 'Compliant' : 'Attention'} status={compliance.vat_compliant ? 'success' : 'error'} />
                <MetricTile label="Tax" value={compliance.tax_compliant ? 'Compliant' : 'Attention'} status={compliance.tax_compliant ? 'success' : 'error'} />
                <MetricTile label="Outstanding Returns" value={compliance.outstanding_returns} status={compliance.outstanding_returns === 0 ? 'success' : 'warning'} />
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-white/30 font-mono">Checking compliance...</div>
            )}
            <div className="pt-2 border-t border-glass-border">
              <p className="text-[0.5rem] text-white/20 font-mono">VAT Act 89 of 1991 · Income Tax Act 58 of 1962</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard depth={1}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-scarlet-400" />
              <SectionTitle className="mb-0">System Metrics</SectionTitle>
            </div>
            <div className="space-y-1">
              <MetricTile label="API Latency" value={latency !== null ? `${latency}ms` : '...'} status={latency !== null && latency < 200 ? 'success' : 'warning'} />
              <MetricTile label="Tensor Updates" value={drrt?.convergence_iterations ?? 0} />
              <MetricTile label="Memory States" value={drrt?.convergence_iterations ?? 0} />
              <MetricTile label="Trend" value={drrt?.trend ?? 'stable'} status={drrt?.trend === 'improving' ? 'success' : drrt?.trend === 'degrading' ? 'error' : 'neutral'} />
            </div>
            <div className="pt-2 border-t border-glass-border">
              <StatusBadge label="Recursive convergence active" status="success" pulse />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
