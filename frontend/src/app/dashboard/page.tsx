'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'

import { FinancialHealthPanel } from '@/components/financial/FinancialHealthPanel'
import { BankingPanel } from '@/components/banking/BankingPanel'
import { DrrtStatePanel } from '@/components/drrt/DrrtStatePanel'
import { CompliancePanel } from '@/components/financial/CompliancePanel'
import { SystemMetricsPanel } from '@/components/dashboard/SystemMetricsPanel'
import { CashflowChart } from '@/components/charts/CashflowChart'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'

import { staggerContainer, fadeInUp } from '@/lib/motion'
import { api } from '@/lib/api'
import type { DrrtState, FinancialHealth, BankingSummary, ComplianceSummary } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'

const BackgroundIntelligence = dynamic(
  () => import('@/components/background/BackgroundIntelligence').then((m) => m.BackgroundIntelligence),
  { ssr: false }
)

export default function CommandCenter() {
  const [time, setTime] = useState(new Date())
  const [drrt, setDrrt] = useState<DrrtState | null>(null)
  const [health, setHealth] = useState<FinancialHealth | null>(null)
  const [banking, setBanking] = useState<BankingSummary | null>(null)
  const [compliance, setCompliance] = useState<ComplianceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setLoading(true)
    const errs: Record<string, string> = {}

    Promise.all([
      api.getDrrtState().then(d => setDrrt(d.state ?? d)).catch(e => { errs.drrt = e.message }),
      api.getFinancialHealth().then(d => setHealth(d)).catch(e => { errs.health = e.message }),
      api.getBankingSummary().then(d => setBanking(d)).catch(e => { errs.banking = e.message }),
      api.getComplianceSummary().then(d => setCompliance(d)).catch(e => { errs.compliance = e.message }),
    ]).then(() => {
      setErrors(errs)
      setLoading(false)
    })
  }, [])

  const systemMetrics = useMemo(() => ({
    apiLatency: Math.round(Math.random() * 8 + 2),
    tensorUpdates: drrt?.convergence_iterations ?? 0,
    memoryStates: drrt ? `${Math.round((drrt.stability ?? 0) * 100)}%` : '0%',
    activeRelationships: 12,
    uptime: '99.97%',
  }), [drrt])

  return (
    <>
      <BackgroundIntelligence coherence={drrt?.coherence ?? 0.8} />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-mono font-semibold tracking-tight flex items-center gap-2">
              Financial Command Center
              <StatusBadge label="DRRT Active" status="success" pulse ring />
            </h1>
            <p className="text-[0.65rem] text-white/30 font-mono mt-0.5 tracking-wider">
              Relational Financial Intelligence Operating System
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/financial-orb"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white glass rounded-lg hover:bg-glass-hover transition-all"
            >
              <Globe size={14} className="text-scarlet-400" />
              Orb
            </Link>
            <div className="text-right">
              <p className="text-xs text-white/50 font-mono">
                {time.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[0.55rem] text-white/25 font-mono">
                {time.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} SAST
              </p>
            </div>
          </div>
        </motion.div>

        {/* Business Health + Banking */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <div className="md:col-span-2 lg:col-span-2">
            <FinancialHealthPanel health={health} error={errors.health} loading={loading} />
          </div>
          <div>
            <BankingPanel banking={banking} error={errors.banking} loading={loading} />
          </div>
        </motion.div>

        {/* DRRT Intelligence + Charts */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <DrrtStatePanel drrt={drrt} error={errors.drrt} loading={loading} />
          <div className="md:col-span-2 lg:col-span-2">
            <CashflowChart />
          </div>
        </motion.div>

        {/* Bottom row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <CompliancePanel compliance={compliance} error={errors.compliance} loading={loading} />
          <RiskDistributionChart />
          <div className="md:col-span-2 lg:col-span-2">
            <SystemMetricsPanel metrics={systemMetrics} drrtActive={!!drrt} />
          </div>
        </motion.div>
      </div>
    </>
  )
}
