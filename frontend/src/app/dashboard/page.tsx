"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Zap, BarChart3, RefreshCw } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { ExecutiveSummaryCard } from '@/components/dashboard/ExecutiveSummaryCard'
import { api } from '@/lib/api'
import AICommandCenter from '@/components/ui/AICommandCenter'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FinancialNeuralTwin } from '@/components/neural-twin/FinancialNeuralTwin'
import { useGraphData } from '@/components/neural-twin/useGraphData'
import { useNeuralTwinStore } from '@/components/neural-twin/store/graph-store'
import { ScoreBreakdown } from '@/components/explainability/ScoreBreakdown'
import { InsightFeed } from '@/components/storytelling/InsightFeed'

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

  useGraphData()
  const contributors = useNeuralTwinStore((s) => s.contributors)

  if (loading) {
    return (
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-center py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <p className="text-sm text-slate-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </MotionDiv>
    )
  }

  if (error) {
    return (
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 sm:space-y-8">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl text-secondary font-bold">Executive Dashboard</h1>
            <p className="text-body-md text-charcoal-500 mt-1">Real-time financial intelligence and compliance monitoring</p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="flex items-center gap-2 text-success font-medium text-body-sm">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Live Data
            </div>
            <p className="text-caption text-charcoal-400 mt-0.5">Last updated now</p>
          </div>
        </div>
      </MotionDiv>

      {/* Executive Overview Cards */}
      <MotionDiv variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => (
          <ExecutiveSummaryCard key={metric.id} {...metric} index={index} />
        ))}
      </MotionDiv>

      {/* Financial Neural Twin */}
      <ErrorBoundary>
        <MotionDiv variants={fadeInUp}>
          <div className="card overflow-hidden">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-charcoal-200/40 flex items-center justify-between">
              <div>
                <h2 className="text-heading-md text-secondary font-semibold">Financial Neural Twin</h2>
                <p className="text-body-sm text-charcoal-500 mt-0.5">Interactive knowledge graph of your financial ecosystem</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-caption text-charcoal-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success-DEFAULT" /> Accounts</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Clusters</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Merchants</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Risks</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> DRRT</span>
              </div>
            </div>
            <FinancialNeuralTwin />
          </div>
        </MotionDiv>
      </ErrorBoundary>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
        {/* Explainability + Storytelling (Left - 3 cols) */}
        <MotionDiv variants={fadeInUp} className="lg:col-span-3 space-y-4">
          {/* Score Breakdown */}
          {contributors.length > 0 && health && (
            <ScoreBreakdown
              score={health.health_score || 0}
              label="Financial Health Score"
              contributors={contributors}
            />
          )}

          {/* Cash Flow Analytics */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-body-sm text-secondary font-semibold">Cash Flow Analytics</h3>
                <p className="text-caption text-charcoal-500 mt-0.5">30-day forecast and scenario analysis</p>
              </div>
              {cashflow && (
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-caption text-charcoal-500">Monthly Inflow</p>
                    <p className="text-body-sm text-success font-semibold font-mono">
                      {formatMoney((cashflow.avg_daily_inflow ?? 0) * 30)}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-charcoal-500">Monthly Outflow</p>
                    <p className="text-body-sm text-error font-semibold font-mono">
                      {formatMoney((cashflow.avg_daily_outflow ?? 0) * 30)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {cashflow?.scenarios?.length ? (
              <div className="h-48 flex items-end justify-between gap-1 p-3 rounded-lg bg-charcoal-50/50">
                {cashflow.scenarios.map((scenario: any, i: number) => {
                  const allBalances = cashflow.scenarios.map((x: any) => Math.abs(x.projected_balance))
                  const maxBalance = Math.max(...allBalances, 1)
                  const heightPct = (Math.abs(scenario.projected_balance) / maxBalance) * 100
                  const colors = ['#059669', '#2563eb', '#d97706', '#dc2626']
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                      <div className="text-caption font-medium text-charcoal-600 truncate max-w-full">
                        {scenario.scenario_type}
                      </div>
                      <div className="w-full flex-1 rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                        style={{ height: `${Math.max(heightPct, 10)}%`, backgroundColor: colors[i] }}
                      />
                      <div className="text-caption text-charcoal-500 font-medium">
                        {formatMoney(scenario.projected_balance).replace('R ', '')}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-body-sm text-charcoal-500">No forecast data available</div>
            )}
          </div>
        </MotionDiv>

        {/* Storytelling + Compliance (Right - 2 cols) */}
        <MotionDiv variants={fadeInUp} className="lg:col-span-2 space-y-4">
          {/* Insight Feed */}
          <InsightFeed />

          {/* Compliance Status */}
          <div className="card p-4">
            <h3 className="text-body-sm text-secondary font-semibold mb-3">Compliance Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption text-charcoal-600">SARS Compliance</span>
                <span className={`text-caption font-semibold ${complianceScore && complianceScore >= 80 ? 'text-success' : 'text-warning'}`}>
                  {complianceScore ? `${complianceScore}%` : '—'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300"
                  style={{ width: `${complianceScore || 0}%` }}
                />
              </div>
              <p className="text-caption text-charcoal-500 mt-1">
                VAT: {compliance?.vat_compliant ? 'Compliant' : compliance?.vat_compliant === null ? 'No data' : 'Action needed'}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-charcoal-100">
              <p className="text-caption text-charcoal-400">Updated {new Date().toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Top Merchants */}
      <ErrorBoundary>
        <MotionDiv variants={fadeInUp}>
          <div className="card p-4">
            <h3 className="text-body-sm text-secondary font-semibold mb-3">Top Merchants</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topMerchants.length > 0 ? (
                topMerchants.map((merchant, i) => (
                  <div key={i} className="bg-charcoal-50/50 border border-charcoal-200/40 rounded-lg p-3">
                    <p className="text-body-sm text-secondary font-medium truncate mb-1">{merchant.name}</p>
                    <p className="text-caption text-charcoal-500">{merchant.count} transactions</p>
                    <p className={`text-caption font-semibold mt-1 font-mono ${merchant.amount > 0 ? 'text-success' : 'text-error'}`}>
                      {merchant.amount > 0 ? '+' : ''}{formatMoney(merchant.amount).replace('R ', '')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-charcoal-500 text-body-sm">No transaction data available</div>
              )}
            </div>
          </div>
        </MotionDiv>
      </ErrorBoundary>

      {/* AI Command Center */}
      <ErrorBoundary>
        <MotionDiv variants={fadeInUp}>
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-charcoal-200/40">
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-accent shrink-0" />
                <h2 className="text-body-sm text-secondary font-semibold">AI Command Center</h2>
              </div>
              <p className="text-caption text-charcoal-500 mt-0.5">Chat with Agrograte AI for insights and recommendations</p>
            </div>
            <div className="p-4">
              <AICommandCenter />
            </div>
          </div>
        </MotionDiv>
      </ErrorBoundary>
    </MotionDiv>
  )
}
