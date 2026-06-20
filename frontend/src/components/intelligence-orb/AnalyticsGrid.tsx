'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, FileText, Calendar } from 'lucide-react'
import { useOrbMetrics } from './useOrbMetrics'
import { staggerContainer, fadeInUp } from '@/lib/motion'

function MetricCard({
  label,
  value,
  change,
  trend,
  icon,
  delay = 0,
}: {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="card card-hover"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption font-medium text-charcoal-500">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-accent-subtle flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-heading-md text-secondary font-bold mb-1">{value}</p>
      <div className="flex items-center gap-1">
        {trend === 'up' ? (
          <ArrowUpRight size={14} className="text-success" />
        ) : trend === 'down' ? (
          <ArrowDownRight size={14} className="text-error" />
        ) : (
          <span className="w-3.5" />
        )}
        <span
          className={`text-sm font-medium ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-charcoal-400'
          }`}
        >
          {change}
        </span>
      </div>
    </motion.div>
  )
}

export function AnalyticsGrid() {
  const { metrics, loading } = useOrbMetrics()

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <div className="card">
          <div className="text-caption text-charcoal-400">Loading live analytics...</div>
        </div>
      </motion.div>
    )
  }

  const cards = [
    {
      label: 'Revenue Momentum',
      value: `R ${(metrics.revenueMomentum * 4.2).toFixed(1)}M`,
      change: `${metrics.revenueMomentum > 0.5 ? '+' : ''}${Math.round((metrics.revenueMomentum - 0.5) * 40)}%`,
      trend: (metrics.revenueMomentum > 0.5 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
      icon: <TrendingUp size={13} className="text-accent" />,
    },
    {
      label: 'Expense Ratio',
      value: `${Math.round(metrics.expenseRatio * 100)}%`,
      change: `${metrics.expenseRatio > 0.5 ? '+' : ''}${Math.round((metrics.expenseRatio - 0.5) * 20)}%`,
      trend: (metrics.expenseRatio < 0.5 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
      icon: <TrendingDown size={13} className="text-accent" />,
    },
    {
      label: 'Tax Projection',
      value: `R ${(metrics.taxLiability * 2.4).toFixed(2)}M`,
      change: `${metrics.taxLiability > 0.4 ? '+' : ''}${Math.round(metrics.taxLiability * 30)}%`,
      trend: (metrics.taxLiability < 0.5 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
      icon: <DollarSign size={13} className="text-accent" />,
    },
    {
      label: 'Forecast Stability',
      value: `${Math.round(metrics.forecastConfidence * 100)}%`,
      change: 'Stable',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      icon: <FileText size={13} className="text-accent" />,
    },
  ]

  const complianceItems = [
    {
      label: 'VAT Returns',
      status: 'Current',
      date: '25 Jul 2025',
      color: 'text-success',
    },
    {
      label: 'Income Tax',
      status: 'Provisioned',
      date: '31 Jan 2026',
      color: 'text-warning',
    },
    {
      label: 'PAYE/EMP201',
      status: 'Filed',
      date: '07 Jul 2025',
      color: 'text-success',
    },
    {
      label: 'CIPC Annual',
      status: 'Pending',
      date: '15 Sep 2025',
      color: 'text-charcoal-400',
    },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-heading-sm text-secondary mb-4">Advanced Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map((card, i) => (
            <MetricCard key={card.label} {...card} delay={i * 40} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading-sm text-secondary">Compliance Timeline</h2>
          <Calendar size={14} className="text-charcoal-400" />
        </div>
        <div className="card divide-y divide-charcoal-100">
          {complianceItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" style={{ color: item.color }} />
                <span className="text-sm text-secondary">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-charcoal-500">{item.status}</span>
                <span className="text-caption text-charcoal-400">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
