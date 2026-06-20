"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Calendar, AlertTriangle } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { ExecutiveSummaryCard } from '@/components/dashboard/ExecutiveSummaryCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { api } from '@/lib/api'
import Hero from '@/components/ui/Hero'
import AICommandCenter from '@/components/ui/AICommandCenter'
import { DashboardCards } from '@/components/ui/DashboardCards'
import ComplianceTimeline from '@/components/ui/ComplianceTimeline'

const MotionDiv = motion.div

export default function DashboardHome() {
  const [health, setHealth] = useState<any>(null)
  const [banking, setBanking] = useState<any>(null)
  const [compliance, setCompliance] = useState<any>(null)
  const [cashflow, setCashflow] = useState<any>(null)
  const [vatReturns, setVatReturns] = useState<any[]>([])
  const [taxRecords, setTaxRecords] = useState<any[]>([])
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchAll = async () => {
      try {
        const [h, b, c, cf, t, vat, tax] = await Promise.all([
          api.getFinancialHealth().catch(() => null),
          api.getBankingSummary().catch(() => null),
          api.getComplianceSummary().catch(() => null),
          api.getCashflowForecast().catch(() => null),
          api.getTransactionIntelligence().catch(() => null),
          api.getVatReturns().catch(() => []),
          api.getTaxRecords().catch(() => []),
        ])
        if (!mounted) return
        setHealth(h)
        setBanking(b)
        setCompliance(c)
        setCashflow(cf)
        setTxns(Array.isArray(t?.top_merchants) ? t.top_merchants : [])
        setVatReturns(Array.isArray(vat) ? vat : [])
        setTaxRecords(Array.isArray(tax) ? tax : [])
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

  const formatMoney = (value: number | null | undefined) =>
    value == null ? '—' : `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

  const cashPosition = banking?.available_balance ?? null
  const taxLiability = compliance?.tax_liability_estimate ?? null
  const vatDue = compliance?.vat_liability_estimate ?? null
  const complianceScore = compliance?.sars_compliance_score ?? null
  const aiSaving = compliance?.recommendations?.length ? compliance.recommendations.length * 1000 : 0

  const metrics = [
    {
      id: 'cash-position',
      label: 'Cash Position',
      value: formatMoney(cashPosition),
      change: cashflow?.avg_daily_inflow != null && cashflow?.avg_daily_outflow != null
        ? `${cashflow.avg_daily_inflow - cashflow.avg_daily_outflow >= 0 ? '+' : ''}${((cashflow.avg_daily_inflow - cashflow.avg_daily_outflow) / Math.max(cashflow.avg_daily_outflow, 1) * 100).toFixed(1)}%`
        : '—',
      trend: cashflow?.avg_daily_inflow > cashflow?.avg_daily_outflow ? 'up' as const : cashflow?.avg_daily_inflow < cashflow?.avg_daily_outflow ? 'down' as const : 'neutral' as const,
      subtitle: banking?.accounts?.length ? `Across ${banking.accounts.length} accounts` : 'No linked accounts',
    },
    {
      id: 'tax-liability',
      label: 'Tax Liability',
      value: formatMoney(taxLiability),
      change: taxLiability && taxLiability > 0
        ? `-${Math.min(100, Math.round((compliance?.current_reserve_balance || 0) / taxLiability * 100))}% reserved`
        : '—',
      trend: taxLiability && taxLiability > 0 ? ('down' as const) : ('neutral' as const),
      subtitle: 'Live SARS estimate',
    },
    {
      id: 'vat-due',
      label: 'VAT Due',
      value: formatMoney(vatDue),
      change: compliance?.vat_compliant == null ? '—' : compliance.vat_compliant ? 'Compliant' : 'Action Required',
      trend: compliance?.vat_compliant == null ? ('neutral' as const) : compliance.vat_compliant ? ('up' as const) : ('warning' as const),
      subtitle: compliance?.vat_compliant == null ? 'No VAT data' : compliance.vat_compliant ? 'All returns filed' : 'Outstanding returns',
    },
    {
      id: 'compliance-score',
      label: 'SARS Compliance Score',
      value: complianceScore == null ? '—' : `${complianceScore}/100`,
      change: complianceScore == null ? '—' : complianceScore >= 80 ? 'Good standing' : complianceScore >= 60 ? 'Needs attention' : 'At risk',
      trend: complianceScore == null ? ('neutral' as const) : complianceScore >= 80 ? ('up' as const) : complianceScore >= 60 ? ('warning' as const) : ('down' as const),
      subtitle: compliance?.outstanding_returns == null ? 'No compliance data' : `${compliance.outstanding_returns} outstanding returns`,
    },
    {
      id: 'ai-insight',
      label: 'AI Insight',
      value: aiSaving > 0 ? 'Tax Optimisation' : 'Monitoring Active',
      change: aiSaving > 0 ? `R ${aiSaving.toLocaleString()} potential savings` : 'No issues detected',
      trend: aiSaving > 0 ? ('up' as const) : ('neutral' as const),
      subtitle: aiSaving > 0 ? 'Potential savings identified' : 'All clear',
    },
  ]

  const recentActivity = txns.slice(0, 5).map((t: any, i: number) => ({
    id: `txn-${i}`,
    description: t.name,
    amount: t.total > 0 ? `R ${t.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : `-R ${Math.abs(t.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
    type: (t.total > 0 ? 'inflow' : 'outflow') as 'inflow' | 'outflow',
    date: `${t.count} transactions`,
  }))

  const upcoming = [
    ...vatReturns.filter((r) => !r.is_submitted).map((r) => ({
      date: r.end ? new Date(r.end).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' }) : '—',
      item: `VAT return ${r.period}`,
      status: 'warning' as const,
    })),
    ...taxRecords.filter((r) => r.status !== 'Filed' && r.status !== 'Approved').map((r) => ({
      date: r.tax_period || '—',
      item: `${r.tax_type} filing`,
      status: 'warning' as const,
    })),
  ].slice(0, 3)

  if (loading) {
    return (
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center justify-center py-24 text-charcoal-400 font-mono text-sm gap-2">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          Loading dashboard...
        </div>
      </MotionDiv>
    )
  }

  if (error) {
    return (
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-mono">
          <AlertTriangle size={14} /> {error}
        </div>
      </MotionDiv>
    )
  }

  return (
    <MotionDiv initial="hidden" animate="visible" variants={staggerContainer}>
      <Hero />
      <MotionDiv variants={fadeInUp} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary">Executive Dashboard</h1>
          <p className="text-body-md text-charcoal-500 mt-1">
            Real-time financial intelligence for your business
          </p>
        </div>
        <StatusBadge status={health ? 'success' : 'warning'} label={health ? 'Live Data' : 'Awaiting Data'} dot={false} />
      </MotionDiv>

      <MotionDiv variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <ExecutiveSummaryCard key={metric.id} {...metric} index={index} />
        ))}
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionDiv variants={fadeInUp} className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-heading-md text-secondary">Cash Flow Overview</h2>
                <p className="text-caption text-charcoal-500 mt-0.5">Last 90 days forecast</p>
              </div>
              {cashflow && cashflow.avg_daily_inflow != null && cashflow.avg_daily_outflow != null && (
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
              {cashflow?.scenarios?.length ? cashflow.scenarios.map((s: any, i: number) => {
                const allBalances = cashflow.scenarios.map((x: any) => Math.abs(x.projected_balance))
                const maxAbs = Math.max(...allBalances, 1)
                const heightPct = Math.abs(s.projected_balance) / maxAbs * 80
                const colors = ['bg-success/30', 'bg-accent/25', 'bg-warning/20', 'bg-error/20']
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                    <div className="text-[0.5rem] text-charcoal-400 mb-1">{s.scenario_type.slice(0, 4)}</div>
                    <div
                      className={`w-full rounded-sm transition-all duration-300 group-hover:opacity-80 ${colors[i % colors.length]}`}
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                )
              }) : (
                <div className="flex-1 flex items-center justify-center text-caption text-charcoal-400">
                  No forecast data available
                </div>
              )}
            </div>
          </div>
        </MotionDiv>

        <MotionDiv variants={fadeInUp} className="space-y-4">
          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">Top Merchants</h2>
            <div className="space-y-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-charcoal-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-secondary truncate">{tx.description}</p>
                      <p className="text-caption text-charcoal-400">{tx.date}</p>
                    </div>
                    <span className={`text-sm font-semibold ml-4 shrink-0 ${tx.type === 'inflow' ? 'text-success' : 'text-error'}`}>{tx.amount}</span>
                  </div>
                ))
              ) : (
                <div className="text-caption text-charcoal-400">No recent activity</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-heading-sm text-secondary">Upcoming</h2>
              <Calendar size={14} className="text-charcoal-400" />
            </div>
            <div className="space-y-2">
              {upcoming.length > 0 ? (
                upcoming.map((u, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">{u.item}</div>
                      <div className="text-caption text-charcoal-400">{u.date}</div>
                    </div>
                    <div className="text-sm font-medium text-warning">{u.status}</div>
                  </div>
                ))
              ) : (
                <div className="text-caption text-charcoal-400">No upcoming items</div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">AI Command Center</h2>
            <AICommandCenter />
          </div>

          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">Quick Metrics</h2>
            <DashboardCards stats={metrics.map(m => ({ label: m.label, value: m.value }))} />
          </div>

          <div className="card">
            <h2 className="text-heading-md text-secondary mb-4">Compliance Timeline</h2>
            <ComplianceTimeline />
          </div>
        </MotionDiv>
      </div>
    </MotionDiv>
  )
}
