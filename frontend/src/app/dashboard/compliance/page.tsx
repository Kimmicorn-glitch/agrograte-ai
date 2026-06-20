'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowRight, CheckCircle2, Brain } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { COMPLIANCE_ITEMS } from '@/lib/constants'
import { StatusBadge } from '@/components/ui/StatusBadge'

const s: Record<string, { label: string; status: 'success' | 'active' | 'neutral' | 'warning' }> = {
  'ready': { label: 'Ready to File', status: 'success' },
  'in-progress': { label: 'In Progress', status: 'active' },
  'pending': { label: 'Pending', status: 'neutral' },
  'attention': { label: 'Needs Attention', status: 'warning' },
}

const deadlines = [
  { date: '07 Jul 2025', item: 'PAYE/EMP201 Monthly Submission', status: 'success' as const },
  { date: '25 Jul 2025', item: 'VAT201 Bi-monthly Return', status: 'warning' as const },
  { date: '31 Aug 2025', item: 'Provisional Tax (1st Half)', status: 'neutral' as const },
  { date: '15 Sep 2025', item: 'CIPC Annual Return', status: 'neutral' as const },
  { date: '31 Jan 2026', item: 'Income Tax Annual Return', status: 'neutral' as const },
]

export default function ComplianceWorkspace() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
          <Calendar size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-display-sm text-secondary">Compliance Workspace</h1>
          <p className="text-body-md text-charcoal-500">Manage your SARS, CIPC, and regulatory obligations</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <div className="card">
            <h2 className="text-heading-md text-secondary mb-6">Compliance Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-charcoal-200" />
              <div className="space-y-6">
                {COMPLIANCE_ITEMS.map((item) => {
                  const c = s[item.status]
                  return (
                    <div key={item.id} className="relative pl-10">
                      <div className={`absolute left-2.5 w-3.5 h-3.5 rounded-full border-2 bg-white -translate-x-1/2 ${
                        item.status === 'ready' ? 'border-success' : item.status === 'in-progress' ? 'border-accent' : item.status === 'attention' ? 'border-warning' : 'border-charcoal-300'
                      }`}>
                        {item.status === 'ready' && <CheckCircle2 size={14} className="text-success absolute -top-0.5 -left-0.5" />}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-heading-sm text-secondary">{item.title}</h3>
                            {c && <StatusBadge status={c.status} label={c.label} dot={false} />}
                          </div>
                          <p className="text-body-sm text-charcoal-500 mb-2">{item.description}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1.5 text-charcoal-400"><Calendar size={12} />{item.deadline}</span>
                            <span className="text-charcoal-300">|</span>
                            <span className="text-charcoal-400">{item.progress}% complete</span>
                          </div>
                        </div>
                        <button className="btn-ghost shrink-0 ml-4"><ArrowRight size={14} /></button>
                      </div>
                      <div className="progress-bar mt-3">
                        <div className={`progress-bar-fill ${item.status === 'ready' ? 'progress-bar-fill-success' : item.status === 'attention' ? 'progress-bar-fill-warning' : ''}`} style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">Upcoming Deadlines</h2>
            <div className="space-y-3">
              {deadlines.map((d) => (
                <div key={d.date + d.item} className="flex items-start gap-3 py-2 border-b border-charcoal-100 last:border-0">
                  <StatusBadge status={d.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary">{d.item}</p>
                    <p className="text-caption text-charcoal-400">{d.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-accent-subtle border-accent/10">
            <div className="flex items-start gap-3">
              <Brain size={16} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-secondary mb-1">AI Compliance Review</h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Your compliance position is strong. All SARS filings are up to date. I recommend preparing your VAT201 filing this week to stay ahead of the deadline.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
