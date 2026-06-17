'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import type { FinancialHealth } from '@/types'

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#00C853' : score >= 60 ? '#FFAB00' : '#FF1744'
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="80" height="80" className="transform -rotate-90">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <motion.circle
          cx="40" cy="40" r="36" fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </svg>
      <motion.span
        className="absolute font-mono text-lg font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {score}
      </motion.span>
    </div>
  )
}

export function FinancialHealthPanel({
  health,
  error,
  loading,
}: {
  health: FinancialHealth | null
  error?: string
  loading?: boolean
}) {
  if (loading && !health) {
    return (
      <GlassCard>
        <SectionTitle>Business Health</SectionTitle>
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          Loading health data...
        </div>
      </GlassCard>
    )
  }

  if (error && !health) {
    return (
      <GlassCard>
        <SectionTitle>Business Health</SectionTitle>
        <div className="text-xs text-red-400/80 font-mono">Unable to load health data</div>
      </GlassCard>
    )
  }

  const h = health ?? { health_score: 0, liquidity: '--' as any, risk: '--' as any, compliance: 0, revenue: 0, expenses: 0, profit: 0 }

  return (
    <GlassCard depth={2}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="flex items-start justify-between">
          <SectionTitle>Business Health</SectionTitle>
          <HealthScoreRing score={h.health_score} />
        </div>

        <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
          <MetricTile label="Liquidity" value={String(h.liquidity)} status={String(h.liquidity) === 'Strong' ? 'success' : String(h.liquidity) === 'Moderate' ? 'warning' : 'error'} />
          <MetricTile label="Risk" value={String(h.risk)} status={String(h.risk) === 'Low' ? 'success' : String(h.risk) === 'Medium' ? 'warning' : 'error'} />
          <MetricTile label="Compliance" value={`${h.compliance}%`} status={h.compliance >= 80 ? 'success' : h.compliance >= 60 ? 'warning' : 'error'} />
        </motion.div>

        <motion.div variants={fadeInUp} className="divider-glass" />

        <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
          <div>
            <div className="metric-label">Revenue</div>
            <div className="font-mono text-sm font-medium text-white/80">R {(h.revenue ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="metric-label">Expenses</div>
            <div className="font-mono text-sm font-medium text-white/80">R {(h.expenses ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="metric-label">Net Profit</div>
            <div className={`font-mono text-sm font-medium ${(h.profit ?? 0) >= 0 ? 'text-success' : 'text-error'}`}>
              {(h.profit ?? 0) >= 0 ? '+' : ''}R {(h.profit ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </GlassCard>
  )
}
