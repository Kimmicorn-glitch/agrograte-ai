'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Calendar, ChevronRight } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { ExecutiveSummaryCard } from '@/components/dashboard/ExecutiveSummaryCard'
import { StatusBadge } from '@/components/ui/StatusBadge'

const metrics = [
  {
    id: 'cash-position',
    label: 'Cash Position',
    value: 'R 2,847,530',
    change: '+12.3%',
    trend: 'up' as const,
    subtitle: 'Across 4 accounts',
  },
  {
    id: 'tax-liability',
    label: 'Tax Liability',
    value: 'R 384,200',
    change: '-8.1%',
    trend: 'down' as const,
    subtitle: 'Estimated for FY 2025',
  },
  {
    id: 'vat-due',
    label: 'VAT Due',
    value: 'R 92,450',
    change: 'Due 25 Jul',
    trend: 'warning' as const,
    subtitle: 'Next filing window',
  },
  {
    id: 'compliance-score',
    label: 'SARS Compliance Score',
    value: '94/100',
    change: '+2 pts',
    trend: 'up' as const,
    subtitle: 'All filings current',
  },
  {
    id: 'ai-insight',
    label: 'AI Insight',
    value: 'Tax Optimisation',
    change: 'Actionable',
    trend: 'info' as const,
    subtitle: 'R 12,500 in potential savings',
  },
]

const recentActivity = [
  { id: '1', description: 'Investec Business Account', amount: '+R 450,000', type: 'inflow' as const, date: 'Today, 09:42' },
  { id: '2', description: 'SARS VAT Refund', amount: '+R 28,430', type: 'inflow' as const, date: 'Yesterday' },
  { id: '3', description: 'Office Rent - Waterfront', amount: '-R 45,000', type: 'outflow' as const, date: 'Yesterday' },
  { id: '4', description: 'Client Payment - AgriGroup', amount: '+R 182,500', type: 'inflow' as const, date: '2 days ago' },
  { id: '5', description: 'AWS Cloud Infrastructure', amount: '-R 12,847', type: 'outflow' as const, date: '3 days ago' },
]

const upcoming = [
  { date: '25 Jul', item: 'VAT201 Filing Due', status: 'warning' as const },
  { date: '07 Jul', item: 'PAYE/EMP201 Submission', status: 'success' as const },
  { date: '31 Aug', item: 'Provisional Tax (1st Half)', status: 'neutral' as const },
]

export default function DashboardHome() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary">Executive Dashboard</h1>
          <p className="text-body-md text-charcoal-500 mt-1">
            Real-time financial intelligence for your business
          </p>
        </div>
        <StatusBadge status="success" label="All Systems Nominal" dot={false} />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <ExecutiveSummaryCard key={metric.id} {...metric} index={index} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-heading-md text-secondary">Cash Flow Overview</h2>
                <p className="text-caption text-charcoal-500 mt-0.5">Last 30 days</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-success font-medium">
                  <ArrowUp size={14} />
                  R 2.1M in
                </span>
                <span className="flex items-center gap-1.5 text-error font-medium">
                  <ArrowDown size={14} />
                  R 1.4M out
                </span>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-1.5">
              {Array.from({ length: 30 }).map((_, i) => {
                const h = 20 + Math.random() * 80
                const inflow = Math.random() > 0.4
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                    <div
                      className={`w-full rounded-sm transition-all duration-300 group-hover:opacity-80 ${
                        inflow ? 'bg-success/25' : 'bg-error/20'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                    {i % 5 === 0 && (
                      <span className="text-[0.55rem] text-charcoal-400 mt-1">{i + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">Recent Activity</h2>
            <div className="space-y-1">
              {recentActivity.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 border-b border-charcoal-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary truncate">{tx.description}</p>
                    <p className="text-caption text-charcoal-400">{tx.date}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ml-4 shrink-0 ${
                      tx.type === 'inflow' ? 'text-success' : 'text-error'
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-heading-sm text-secondary">Upcoming</h2>
              <Calendar size={14} className="text-charcoal-400" />
            </div>
            <div className="space-y-2">
              {upcoming.map((item) => (
                <div key={item.item} className="flex items-center gap-3 py-1.5">
                  <StatusBadge status={item.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary truncate">{item.item}</p>
                  </div>
                  <span className="text-caption text-charcoal-400 shrink-0">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
