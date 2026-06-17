'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import type { ComplianceSummary } from '@/types'

export function CompliancePanel({
  compliance,
  error,
  loading,
}: {
  compliance: ComplianceSummary | null
  error?: string
  loading?: boolean
}) {
  if (loading && !compliance) {
    return (
      <GlassCard>
        <SectionTitle>SARS Compliance</SectionTitle>
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          Loading compliance data...
        </div>
      </GlassCard>
    )
  }

  if (error && !compliance) {
    return (
      <GlassCard>
        <SectionTitle>SARS Compliance</SectionTitle>
        <div className="text-xs text-red-400/80 font-mono">Unable to load compliance data</div>
      </GlassCard>
    )
  }

  const c = compliance ?? { sars_compliance_score: 0, vat_compliant: false, tax_compliant: false, outstanding_returns: 0 }

  return (
    <GlassCard depth={1}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <SectionTitle>SARS Compliance</SectionTitle>

        <motion.div variants={fadeInUp} className="space-y-1">
          <MetricTile
            label="Compliance Score"
            value={`${c.sars_compliance_score}%`}
            status={c.sars_compliance_score >= 90 ? 'success' : c.sars_compliance_score >= 70 ? 'warning' : 'error'}
          />
          <MetricTile label="VAT Compliant" value={c.vat_compliant ? 'Yes' : 'No'} status={c.vat_compliant ? 'success' : 'error'} />
          <MetricTile label="Tax Compliant" value={c.tax_compliant ? 'Yes' : 'No'} status={c.tax_compliant ? 'success' : 'error'} />
          <MetricTile label="Outstanding Returns" value={c.outstanding_returns} status={c.outstanding_returns > 0 ? 'error' : 'success'} />
        </motion.div>

        <motion.div variants={fadeInUp} className="divider-glass" />

        <motion.div variants={fadeInUp} className="flex items-center gap-2">
          <div className={`w-full h-1.5 rounded-full bg-white/5 overflow-hidden`}>
            <motion.div
              className={`h-full rounded-full ${c.sars_compliance_score >= 90 ? 'bg-success' : c.sars_compliance_score >= 70 ? 'bg-warning' : 'bg-error'}`}
              initial={{ width: 0 }}
              animate={{ width: `${c.sars_compliance_score}%` }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-[0.55rem] text-white/30 font-mono">
          VAT Act 89 of 1991 &middot; Income Tax Act 58 of 1962
        </motion.div>
      </motion.div>
    </GlassCard>
  )
}
