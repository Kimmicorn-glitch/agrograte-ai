'use client'

import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useOrbMetrics } from './useOrbMetrics'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '@/lib/motion'

const typeConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  positive: {
    icon: <CheckCircle size={14} />,
    bg: 'bg-success/8',
    text: 'text-success',
    border: 'border-success/15',
  },
  negative: {
    icon: <ArrowDown size={14} />,
    bg: 'bg-error/8',
    text: 'text-error',
    border: 'border-error/15',
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    bg: 'bg-warning/8',
    text: 'text-warning',
    border: 'border-warning/15',
  },
  neutral: {
    icon: <Info size={14} />,
    bg: 'bg-charcoal-50',
    text: 'text-charcoal-500',
    border: 'border-charcoal-100',
  },
}

export function AIInsightsPanel() {
  const { metrics, insights, loading } = useOrbMetrics()

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-3">
        <div className="card">
          <div className="text-caption text-charcoal-400">Loading live intelligence...</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-3"
    >
      <motion.div variants={fadeInUp} className="mb-4">
        <h2 className="text-heading-sm text-secondary">AI Intelligence</h2>
        <p className="text-caption text-charcoal-500">Real-time financial analysis</p>
      </motion.div>

      {insights.map((insight, i) => {
        const cfg = typeConfig[insight.type]
        return (
          <motion.div
            key={insight.id}
            variants={fadeInUp}
            className={`card ${cfg.bg} ${cfg.border} border`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${cfg.text}`}>{cfg.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-secondary">{insight.label}</span>
                  <span className={`text-sm font-bold ${cfg.text}`}>{insight.value}</span>
                </div>
                <p className="text-sm text-charcoal-500 leading-relaxed">{insight.detail}</p>
              </div>
            </div>
          </motion.div>
        )
      })}

      <motion.div variants={fadeInUp} className="pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-charcoal-500">Composite Health</span>
          <span className="text-xl font-bold text-secondary">
          {Math.round(
            (metrics.cashflowHealth +
              metrics.complianceScore +
              (1 - metrics.taxLiability) +
              metrics.forecastConfidence +
              (1 - metrics.riskLevel)) /
              5 *
              100
          )}
            <span className="text-sm font-medium text-charcoal-400">/100</span>
          </span>
        </div>
        <div className="progress-bar mt-2">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.round(
                (metrics.cashflowHealth +
                  metrics.complianceScore +
                  (1 - metrics.taxLiability) +
                  metrics.forecastConfidence +
                  (1 - metrics.riskLevel)) /
                  5 *
                  100
              )}%`,
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
