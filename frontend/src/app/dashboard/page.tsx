"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, TrendingUp, AlertTriangle, Zap, BarChart3, RefreshCw } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { ExecutiveSummaryCard } from '@/components/dashboard/ExecutiveSummaryCard'
import { api } from '@/lib/api'
import AICommandCenter from '@/components/ui/AICommandCenter'
import ComplianceTimeline from '@/components/ui/ComplianceTimeline'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ChartFallback } from '@/components/charts/ChartFallback'

const MotionDiv = motion.div

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
        setHealth(h)
        setBanking(b)
        setCompliance(c)
        setCashflow(cf)
        setTxns(Array.isArray(t?.top_merchants) ? t.top_merchants : [])
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
  const forecastConfidence = cashflow?.confidence_score ?? 85

  const lastUpdated = new Date().toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })

  const metrics = [
    {
      id: 'cash-position',
      label: 'Cash Position',
      value: formatMoney(cashPosition),
      description: banking?.accounts?.length
        ? `Across ${banking.accounts.length} linked account${banking.accounts.length === 1 ? '' : 's'}`
        : 'No linked accounts',
      change: cashflow?.avg_daily_inflow != null && cashflow?.avg_daily_outflow != null
        ? `${((cashflow.avg_daily_inflow - cashflow.avg_daily_outflow) / Math.max(cashflow.avg_daily_outflow, 1) * 100).toFixed(1)}%`
        : '—',
      trend: (cashflow?.avg_daily_inflow ?? 0) > (cashflow?.avg_daily_outflow ?? 0) ? 'up' as const : 'down' as const,
      timestamp: `Updated ${lastUpdated}`,
    },
    {
      id: 'tax-exposure',
      label: 'Tax Exposure',
      value: formatMoney(taxLiability),
      description: 'Estimated SARS tax liability based on current period',
      change: compliance?.current_reserve_balance ? `${Math.round((compliance.current_reserve_balance / taxLiability) * 100)}% covered` : 'Not reserved',
      trend: taxLiability ? 'down' as const : 'neutral' as const,
      timestamp: `Updated ${lastUpdated}`,
    },
    {
      id: 'compliance-score',
      label: 'Compliance Score',
      value: complianceScore == null ? '—' : `${complianceScore}/100`,
      description: compliance?.outstanding_returns ?? 0
        ? `${compliance.outstanding_returns} outstanding return${compliance.outstanding_returns === 1 ? '' : 's'}`
        : 'All compliance filings up to date',
      change: complianceScore ? (complianceScore >= 80 ? 'Good Standing' : 'Needs Attention') : 'Pending',
      trend: complianceScore ? (complianceScore >= 80 ? 'up' as const : 'warning' as const) : 'neutral' as const,
      timestamp: `Updated ${lastUpdated}`,
    },
    {
      id: 'forecast-confidence',
      label: 'Forecast Confidence',
      value: `${forecastConfidence}%`,
      description: 'AI-generated prediction reliability score',
      change: 'AI Generated',
      trend: 'up' as const,
      timestamp: `Updated ${lastUpdated}`,
    },
  ]

  const topMerchants = txns.slice(0, 6).map((t: any) => ({
    name: t.name,
    amount: t.total,
    count: t.count,
  }))

  if (loading) {
    return (
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-center py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <p className="text-caption sm:text-body-sm text-charcoal-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </MotionDiv>
    )
  }

  if (error) {
    return (
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 sm:space-y-8">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-error/10 border border-error/20 text-error text-caption sm:text-sm font-medium">
          <AlertTriangle size={14} className="sm:w-4 sm:h-4 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      </MotionDiv>
    )
  }

  return (
    <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <MotionDiv variants={fadeInUp}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-heading-xl sm:text-display-sm lg:text-display-md text-secondary">Executive Dashboard</h1>
            <p className="text-body-sm sm:text-body-md text-charcoal-500 mt-1 sm:mt-2">
              Real-time financial intelligence and compliance monitoring
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="flex items-center gap-2 text-success font-medium text-caption sm:text-body-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
              Live Data
            </div>
            <p className="text-caption text-charcoal-400 mt-0.5 sm:mt-1">Last updated now</p>
          </div>
        </div>
      </MotionDiv>

      {/* Executive Overview Cards */}
      <MotionDiv variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => (
          <ExecutiveSummaryCard key={metric.id} {...metric} index={index} />
        ))}
      </MotionDiv>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
        {/* Financial Intelligence Orb (Left - 3 cols on desktop) */}
        <ErrorBoundary>
          <MotionDiv variants={fadeInUp} className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-charcoal-200 overflow-hidden shadow-card h-full">
              <div className="p-4 sm:p-5 lg:p-6 border-b border-charcoal-200/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Zap size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5 text-accent shrink-0" />
                  <h2 className="text-heading-sm sm:text-heading-md lg:text-heading-lg text-secondary">Financial Intelligence</h2>
                </div>
                <p className="text-caption sm:text-body-sm text-charcoal-500 mt-1">AI-powered analysis of your financial health and risk profile</p>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-charcoal-50/50 min-h-60 sm:min-h-72 lg:min-h-80">
                {complianceScore != null ? (
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto rounded-full bg-gradient-to-br from-accent/20 via-accent/10 to-transparent flex items-center justify-center border border-accent/20">
                      <div className="text-center">
                        <p className="text-caption text-charcoal-500 font-medium">Overall Health</p>
                        <p className="text-display-sm sm:text-display-sm lg:text-display-sm xl:text-display-md text-accent font-bold">{complianceScore}%</p>
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-body-sm sm:text-body-md text-secondary font-medium">
                        {complianceScore >= 80 ? 'Excellent Financial Health' : complianceScore >= 60 ? 'Good Financial Health' : 'Needs Attention'}
                      </p>
                      <p className="text-caption sm:text-body-sm text-charcoal-500 max-w-md mx-auto">
                        {complianceScore >= 80
                          ? 'All compliance requirements met. Continue monitoring.'
                          : 'Review outstanding items and take corrective action.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ChartFallback message="No health score available" height="md" />
                )}
              </div>
            </div>
          </MotionDiv>
        </ErrorBoundary>

        {/* AI Insights Feed (Right - 2 cols on desktop) */}
        <ErrorBoundary>
          <MotionDiv variants={fadeInUp} className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* AI Recommendations */}
            <div className="bg-white rounded-lg border border-charcoal-200 p-4 sm:p-5 lg:p-6 shadow-card">
              <h3 className="text-heading-sm sm:text-heading-md text-secondary mb-3 sm:mb-4">AI Insights</h3>
              <div className="space-y-2 sm:space-y-3">
                {compliance?.recommendations && compliance.recommendations.length > 0 ? (
                  compliance.recommendations.slice(0, 3).map((rec: any, i: number) => (
                    <div key={i} className="p-2.5 sm:p-3 bg-accent/5 border-l-2 border-accent rounded">
                      <p className="text-caption sm:text-body-sm text-secondary font-medium line-clamp-2">{rec}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 sm:py-4">
                    <BarChart3 size={20} className="mx-auto text-charcoal-300 mb-2" />
                    <p className="text-caption text-charcoal-500">No recommendations at this time</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white rounded-lg border border-charcoal-200 p-4 sm:p-5 lg:p-6 shadow-card">
              <h3 className="text-heading-sm sm:text-heading-md text-secondary mb-3 sm:mb-4">Compliance Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-caption sm:text-body-sm text-charcoal-600">SARS Compliance</span>
                  <span className={`text-caption sm:text-body-sm font-semibold ${complianceScore && complianceScore >= 80 ? 'text-success' : 'text-warning'}`}>
                    {complianceScore ? `${complianceScore}%` : '—'}
                  </span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-charcoal-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300"
                    style={{ width: `${complianceScore || 0}%` }}
                  />
                </div>
                <p className="text-caption text-charcoal-500 mt-1 sm:mt-2">
                  VAT: {compliance?.vat_compliant ? 'Compliant' : compliance?.vat_compliant === null ? 'No data' : 'Action needed'}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-charcoal-100">
                <p className="text-caption text-charcoal-400">
                  Updated {new Date().toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            </div>
          </MotionDiv>
        </ErrorBoundary>
      </div>

      {/* Cash Flow Analytics */}
      <ErrorBoundary>
        <MotionDiv variants={fadeInUp}>
          <div className="bg-white rounded-lg border border-charcoal-200 overflow-hidden shadow-card">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-charcoal-200/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h2 className="text-heading-sm sm:text-heading-md lg:text-heading-lg text-secondary">Cash Flow Analytics</h2>
                  <p className="text-caption sm:text-body-sm text-charcoal-500 mt-0.5 sm:mt-1">30-day forecast and scenario analysis</p>
                </div>
                {cashflow && (
                  <div className="flex items-center gap-4 sm:gap-5 lg:gap-6 text-right">
                    <div>
                      <p className="text-caption text-charcoal-500 font-medium">Monthly Inflow</p>
                      <p className="text-heading-sm sm:text-heading-md text-success mt-0.5">
                        {formatMoney((cashflow.avg_daily_inflow ?? 0) * 30)}
                      </p>
                    </div>
                    <div>
                      <p className="text-caption text-charcoal-500 font-medium">Monthly Outflow</p>
                      <p className="text-heading-sm sm:text-heading-md text-error mt-0.5">
                        {formatMoney((cashflow.avg_daily_outflow ?? 0) * 30)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 bg-charcoal-50/50">
              {cashflow?.scenarios?.length ? (
                <div className="h-48 sm:h-56 lg:h-64 flex items-end justify-between gap-1 bg-gradient-to-t from-accent/5 to-transparent p-3 sm:p-4 rounded-lg">
                  {cashflow.scenarios.map((scenario: any, i: number) => {
                    const allBalances = cashflow.scenarios.map((x: any) => Math.abs(x.projected_balance))
                    const maxBalance = Math.max(...allBalances, 1)
                    const heightPct = (Math.abs(scenario.projected_balance) / maxBalance) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2 group min-w-0">
                        <div className="text-caption font-medium text-charcoal-500 truncate max-w-full text-[0.6rem] sm:text-caption">
                          {scenario.scenario_type.slice(0, 8)}
                        </div>
                        <div className="w-full flex-1 rounded-t-lg bg-gradient-to-t from-accent to-accent/40 hover:from-accent-hover hover:to-accent-hover/40 transition-all duration-300 shadow-sm group-hover:shadow-md" 
                          style={{ height: `${Math.max(heightPct, 10)}%` }}>
                        </div>
                        <div className="text-caption text-charcoal-600 font-medium text-[0.6rem] sm:text-caption">
                          {formatMoney(scenario.projected_balance).replace('R ', '')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <ChartFallback message="No forecast data available" />
              )}
            </div>
          </div>
        </MotionDiv>
      </ErrorBoundary>

      {/* Bottom Section: Timeline & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
        {/* Compliance Timeline */}
        <ErrorBoundary>
          <MotionDiv variants={fadeInUp} className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-charcoal-200 p-4 sm:p-5 lg:p-6 shadow-card h-full">
              <h2 className="text-heading-sm sm:text-heading-md lg:text-heading-lg text-secondary mb-3 sm:mb-4">Compliance Timeline</h2>
              <ComplianceTimeline />
            </div>
          </MotionDiv>
        </ErrorBoundary>

        {/* Top Merchants */}
        <ErrorBoundary>
          <MotionDiv variants={fadeInUp} className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-charcoal-200 p-4 sm:p-5 lg:p-6 shadow-card h-full">
              <h2 className="text-heading-sm sm:text-heading-md lg:text-heading-lg text-secondary mb-3 sm:mb-4">Top Merchants</h2>
              <div className="space-y-2 sm:space-y-3">
                {topMerchants.length > 0 ? (
                  topMerchants.map((merchant, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 sm:py-2 border-b border-charcoal-100 last:border-0">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-caption sm:text-body-sm font-medium text-secondary truncate">{merchant.name}</p>
                        <p className="text-caption text-charcoal-500">{merchant.count} transactions</p>
                      </div>
                      <span className={`text-caption sm:text-body-sm font-semibold shrink-0 ${merchant.amount > 0 ? 'text-success' : 'text-error'}`}>
                        {merchant.amount > 0 ? '+' : ''}{formatMoney(merchant.amount).replace('R ', '')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-charcoal-400">
                    <BarChart3 size={20} className="mx-auto text-charcoal-300 mb-2" />
                    <p className="text-caption sm:text-body-sm">No transaction data available</p>
                  </div>
                )}
              </div>
            </div>
          </MotionDiv>
        </ErrorBoundary>
      </div>

      {/* AI Command Center */}
      <ErrorBoundary>
        <MotionDiv variants={fadeInUp}>
          <div className="bg-white rounded-lg border border-charcoal-200 overflow-hidden shadow-card">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-charcoal-200/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <RefreshCw size={16} className="text-accent shrink-0" />
                <h2 className="text-heading-sm sm:text-heading-md lg:text-heading-lg text-secondary">AI Command Center</h2>
              </div>
              <p className="text-caption sm:text-body-sm text-charcoal-500 mt-0.5 sm:mt-1">Chat with Agrograte AI for insights and recommendations</p>
            </div>
            <div className="p-4 sm:p-5 lg:p-6 bg-charcoal-50/50">
              <AICommandCenter />
            </div>
          </div>
        </MotionDiv>
      </ErrorBoundary>
    </MotionDiv>
  )
}
