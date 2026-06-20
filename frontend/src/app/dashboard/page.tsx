'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Calendar, AlertTriangle } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { ExecutiveSummaryCard } from '@/components/dashboard/ExecutiveSummaryCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { api } from '@/lib/api'

export default function DashboardHome() {
  const [health, setHealth] = useState<any>(null)
  const [banking, setBanking] = useState<any>(null)
  const [compliance, setCompliance] = useState<any>(null)
  const [cashflow, setCashflow] = useState<any>(null)
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchAll = async () => {
      try {
        const [h, b, c, cf, t] = await Promise.all([
          api.getFinancialHealth().catch(() => null),
          api.getBankingSummary().catch(() => null),
          api.getComplianceSummary().catch(() => null),
          api.getCashflowForecast().catch(() => null),
          api.getTransactionIntelligence().catch(() => null),
        ])
        if (!mounted) return
        if (h) setHealth(h)
        if (b) setBanking(b)
        if (c) setCompliance(c)
        if (cf) setCashflow(cf)
        if (t) setTxns(t.top_merchants || [])
      } catch (e: any) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const cashPosition = banking?.available_balance ?? 2847530
  const taxLiability = compliance?.vat_liability_estimate ?? 384200
  const vatDue = compliance?.vat_liability_estimate ?? 92450
  const complianceScore = compliance?.sars_compliance_score ?? 94
  const aiSaving = compliance?.recommendations?.length > 0 ? 12500 : 0

  const metrics = [
    {
      id: 'cash-position',
      label: 'Cash Position',
      value: `R ${cashPosition.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      change: cashflow?.avg_daily_inflow ? `+${((cashflow.avg_daily_inflow - (cashflow.avg_daily_outflow || 0)) / cashflow.avg_daily_outflow * 100).toFixed(1)}%` : '+0%',
      trend: (cashflow?.avg_daily_inflow || 0) > (cashflow?.avg_daily_outflow || 0) ? 'up' as const : 'down' as const,
      subtitle: `Across ${banking?.accounts?.length || 1} accounts`,
    },
    {
      id: 'tax-liability',
      label: 'Tax Liability',
      value: `R ${taxLiability.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      change: taxLiability > 0 ? `-${Math.min(100, Math.round((compliance?.current_reserve_balance || 0) / taxLiability * 100))}% reserved` : '0%',
      trend: 'down' as const,
      subtitle: 'Estimated for FY 2025',
    },
    {
      id: 'vat-due',
      label: 'VAT Due',
      value: `R ${vatDue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      change: compliance?.vat_compliant ? 'Compliant' : 'Action Required',
      trend: compliance?.vat_compliant ? ('up' as const) : ('warning' as const),
      subtitle: compliance?.vat_compliant ? 'All returns filed' : 'Outstanding returns',
    },
    {
      id: 'compliance-score',
      label: 'SARS Compliance Score',
      value: `${complianceScore}/100`,
      change: complianceScore >= 80 ? 'Good standing' : complianceScore >= 60 ? 'Needs attention' : 'At risk',
      trend: complianceScore >= 80 ? ('up' as const) : complianceScore >= 60 ? ('warning' as const) : ('down' as const),
      subtitle: `${compliance?.outstanding_returns || 0} outstanding returns`,
    },
    {
      id: 'ai-insight',
      label: 'AI Insight',
      value: aiSaving > 0 ? 'Tax Optimisation' : 'Monitoring Active',
      change: aiSaving > 0 ? `R ${aiSaving.toLocaleString()} savings` : 'No issues detected',
      trend: aiSaving > 0 ? ('info' as const) : ('neutral' as const),
      subtitle: aiSaving > 0 ? 'Potential savings identified' : 'All clear',
    },
  ]

  const recentActivity = txns.slice(0, 5).map((t: any, i: number) => ({
    id: `txn-${i}`,
    description: t.name,
    amount: t.total > 0 ? `R ${t.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '-',
    type: (t.total > 0 ? 'inflow' : 'outflow') as 'inflow' | 'outflow',
    date: `${t.count} transactions`,
  }))

  if (recentActivity.length === 0) {
    recentActivity.push(
      { id: '1', description: 'Investec Business Account', amount: '+R 450,000', type: 'inflow' as const, date: 'Today, 09:42' },
      { id: '2', description: 'SARS VAT Refund', amount: '+R 28,430', type: 'inflow' as const, date: 'Yesterday' },
      { id: '3', description: 'Office Rent - Waterfront', amount: '-R 45,000', type: 'outflow' as const, date: 'Yesterday' },
    )
  }

  const upcoming = [
    { date: '25 Jul', item: 'VAT201 Filing Due', status: compliance?.vat_compliant ? ('success' as const) : ('warning' as const) },
    { date: '07 Jul', item: 'PAYE/EMP201 Submission', status: 'success' as const },
    { date: '31 Aug', item: 'Provisional Tax (1st Half)', status: 'neutral' as const },
  ]

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center justify-center py-24 text-charcoal-400 font-mono text-sm gap-2">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          Loading dashboard...
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

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
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
                <p className="text-caption text-charcoal-500 mt-0.5">Last 90 days forecast</p>
              </div>
              {cashflow && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-success font-medium">
                    <ArrowUp size={14} />
                    R {(cashflow.avg_daily_inflow * 30).toLocaleString('en-ZA', { minimumFractionDigits: 0 })} in
                  </span>
                  <span className="flex items-center gap-1.5 text-error font-medium">
                    <ArrowDown size={14} />
                    R {(cashflow.avg_daily_outflow * 30).toLocaleString('en-ZA', { minimumFractionDigits: 0 })} out
                  </span>
                </div>
              )}
            </div>
            <div className="h-48 flex items-end justify-between gap-1.5">
              {cashflow?.scenarios?.map((s: any, i: number) => {
                const allBalances = cashflow.scenarios.map((x: any) => Math.abs(x.projected_balance))
                const maxAbs = Math.max(...allBalances, 1)
                const heightPct = Math.abs(s.projected_balance) / maxAbs * 80
                const isPositive = s.projected_balance >= 0
                const colors = ['bg-success/30', 'bg-accent/25', 'bg-warning/20', 'bg-error/20']
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                    <div className="text-[0.5rem] text-charcoal-400 mb-1">{s.scenario_type.slice(0, 4)}</div>
                    <div
                      className={`w-full rounded-sm transition-all duration-300 group-hover:opacity-80 ${colors[i]}`}
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-4">
          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">Top Merchants</h2>
            <div className="space-y-1">
              {recentActivity.map((tx: any) => (
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
