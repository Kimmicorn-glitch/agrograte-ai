'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import type { BankingSummary } from '@/types'

export function BankingPanel({
  banking,
  error,
  loading,
}: {
  banking: BankingSummary | null
  error?: string
  loading?: boolean
}) {
  if (loading && !banking) {
    return (
      <GlassCard>
        <SectionTitle accent>Investec Banking</SectionTitle>
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          Loading banking data...
        </div>
      </GlassCard>
    )
  }

  if (error && !banking) {
    return (
      <GlassCard>
        <SectionTitle accent>Investec Banking</SectionTitle>
        <div className="text-xs text-red-400/80 font-mono">Unable to load banking data</div>
      </GlassCard>
    )
  }

  const b = banking ?? { available_balance: 0, pending_transactions: 0, reserved_tax_funds: 0, programmable_rules: 0, approval_workflows: 0 }

  return (
    <GlassCard depth={2} glow="scarlet">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <SectionTitle accent>Investec Banking</SectionTitle>

        <motion.div variants={fadeInUp} className="mb-4">
          <div className="metric-label">Available Balance</div>
          <motion.div
            className="font-mono text-3xl font-bold text-gradient-accent bg-gradient-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            R {b.available_balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </motion.div>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-1">
          <MetricTile label="Pending Transactions" value={b.pending_transactions} status={b.pending_transactions > 0 ? 'warning' : 'success'} />
          <MetricTile label="Reserved Tax Funds" value={`R ${b.reserved_tax_funds.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`} />
          <MetricTile label="Programmable Rules" value={b.programmable_rules} />
          <MetricTile label="Approval Workflows" value={b.approval_workflows} />
        </motion.div>

        <motion.div variants={fadeInUp} className="flex gap-2 pt-2">
          <button className="btn-primary flex-1 text-xs py-2" onClick={() => window.location.href = '/api/investec/auth-url'}>
            Connect Investec
          </button>
          <button className="btn-glass flex-1 text-xs py-2" onClick={() => window.location.href = '/dashboard/banking/rules'}>
            Programmable Rules
          </button>
        </motion.div>
      </motion.div>
    </GlassCard>
  )
}
