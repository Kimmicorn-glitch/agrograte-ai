'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, CheckCircle2, Brain, AlertTriangle, Clock } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { api } from '@/lib/api'

const deadlineItems = [
  { date: '07 Jul 2025', item: 'PAYE/EMP201 Monthly Submission', getStatus: (c: any) => c?.payroll_compliant ? 'success' as const : 'warning' as const },
  { date: '25 Jul 2025', item: 'VAT201 Bi-monthly Return', getStatus: (c: any) => c?.vat_compliant ? 'success' as const : 'warning' as const },
  { date: '31 Aug 2025', item: 'Provisional Tax (1st Half)', getStatus: () => 'neutral' as const },
  { date: '15 Sep 2025', item: 'CIPC Annual Return', getStatus: () => 'neutral' as const },
  { date: '31 Jan 2026', item: 'Income Tax Annual Return', getStatus: (c: any) => c?.tax_compliant ? 'success' as const : 'warning' as const },
]

export default function ComplianceWorkspace() {
  const [summary, setSummary] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const [s, r] = await Promise.all([
          api.getComplianceSummary().catch(() => null),
          api.getComplianceReport().catch(() => null),
        ])
        if (!mounted) return
        if (s) setSummary(s)
        if (r) setReport(r)
      } catch (e: any) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const complianceItems = [
    {
      id: 'vat-returns',
      title: 'VAT Returns',
      deadline: '25 Jul 2025',
      status: summary?.vat_compliant ? 'ready' : 'attention',
      progress: summary?.vat_compliant ? 100 : 60,
      description: 'Bi-monthly VAT201 filing',
    },
    {
      id: 'income-tax',
      title: 'Income Tax',
      deadline: '31 Jan 2026',
      status: summary?.tax_compliant ? 'in-progress' : 'attention',
      progress: summary?.tax_compliant ? 75 : 25,
      description: 'Annual provisional tax return',
    },
    {
      id: 'payroll',
      title: 'Payroll (PAYE)',
      deadline: '07 Jul 2025',
      status: summary?.payroll_compliant !== false ? 'ready' : 'attention',
      progress: 100,
      description: 'Monthly EMP201 submission',
    },
    {
      id: 'cipc',
      title: 'CIPC Annual Return',
      deadline: '15 Sep 2025',
      status: 'pending',
      progress: 10,
      description: 'Annual compliance filing',
    },
    {
      id: 'overall',
      title: 'SARS Compliance',
      deadline: 'Ongoing',
      status: (summary?.sars_compliance_score || 0) >= 80 ? 'ready' : (summary?.sars_compliance_score || 0) >= 60 ? 'in-progress' : 'attention',
      progress: summary?.sars_compliance_score || 0,
      description: `${summary?.outstanding_returns || 0} outstanding returns`,
    },
  ]

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center justify-center py-24 text-charcoal-400 font-mono text-sm gap-2">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          Loading compliance data...
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-mono">
          <AlertTriangle size={14} /> {error}
        </div>
      </motion.div>
    )
  }

  const s: Record<string, { label: string; status: 'success' | 'active' | 'neutral' | 'warning' }> = {
    'ready': { label: 'Ready to File', status: 'success' },
    'in-progress': { label: 'In Progress', status: 'active' },
    'pending': { label: 'Pending', status: 'neutral' },
    'attention': { label: 'Needs Attention', status: 'warning' },
  }

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

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-secondary">{summary?.sars_compliance_score || 0}</div>
          <div className="text-caption text-charcoal-500">Compliance Score</div>
          <div className="flex items-center justify-center gap-1 mt-2 text-caption text-charcoal-400">
            <Clock size={10} />
            <span>Updated now</span>
          </div>
        </div>
        <div className="card text-center">
          <div className={`text-3xl font-bold ${summary?.vat_compliant ? 'text-success' : 'text-warning'}`}>
            {summary?.vat_compliant ? 'OK' : 'Due'}
          </div>
          <div className="text-caption text-charcoal-500">VAT Status</div>
          <p className="text-caption text-charcoal-400 mt-1">Next filing: 25 Jul 2025</p>
        </div>
        <div className="card text-center">
          <div className={`text-3xl font-bold ${summary?.tax_compliant ? 'text-success' : 'text-warning'}`}>
            {summary?.tax_compliant ? 'Ready' : 'Pending'}
          </div>
          <div className="text-caption text-charcoal-500">Tax Readiness</div>
          <p className="text-caption text-charcoal-400 mt-1">Annual return due 31 Jan 2026</p>
        </div>
        <div className="card text-center">
          <div className={`text-3xl font-bold ${(summary?.outstanding_returns || 0) > 0 ? 'text-warning' : 'text-success'}`}>
            {summary?.outstanding_returns || 0}
          </div>
          <div className="text-caption text-charcoal-500">Outstanding Returns</div>
          <p className="text-caption text-charcoal-400 mt-1">Requires attention</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ErrorBoundary>
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <div className="card">
            <h2 className="text-heading-md text-secondary mb-6">Compliance Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-charcoal-200" />
              <div className="space-y-6">
                {complianceItems.map((item) => {
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
        </ErrorBoundary>

        <ErrorBoundary>
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">Upcoming Deadlines</h2>
            <div className="space-y-3">
              {deadlineItems.map((d) => (
                <div key={d.date + d.item} className="flex items-start gap-3 py-2 border-b border-charcoal-100 last:border-0">
                  <StatusBadge status={d.getStatus(summary)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary">{d.item}</p>
                    <p className="text-caption text-charcoal-400">{d.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {report?.recommendations?.length > 0 && (
            <div className="card">
              <h2 className="text-heading-sm text-secondary mb-3">Recommendations</h2>
              <div className="space-y-2">
                {report.recommendations.slice(0, 3).map((r: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-charcoal-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report?.violations?.length > 0 && (
            <div className="card border-warning/20">
              <h2 className="text-heading-sm text-warning mb-3">Risk Warnings</h2>
              <div className="space-y-2">
                {report.violations.slice(0, 2).map((v: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-secondary font-medium">{v.code}</p>
                      <p className="text-charcoal-500 text-xs">{v.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card bg-accent-subtle border-accent/10">
            <div className="flex items-start gap-3">
              <Brain size={16} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-secondary mb-1">AI Compliance Review</h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  {summary?.vat_compliant
                    ? 'Your compliance position is strong. All SARS filings are up to date.'
                    : 'Some filings require attention. Review outstanding items above.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        </ErrorBoundary>
      </div>
    </motion.div>
  )
}
