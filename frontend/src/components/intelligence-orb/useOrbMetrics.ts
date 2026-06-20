'use client'

import { useEffect, useState, useRef } from 'react'
import { useOrbStore } from './store'
import { api } from '@/lib/api'

export function useOrbMetrics() {
  const setMetrics = useOrbStore((s) => s.setMetrics)
  const metrics = useOrbStore((s) => s.metrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        const [health, compliance, cashflow, banking] = await Promise.all([
          api.getFinancialHealth().catch(() => null),
          api.getComplianceSummary().catch(() => null),
          api.getCashflowForecast().catch(() => null),
          api.getBankingSummary().catch(() => null),
        ])

        if (!mounted) return

        const healthScore = health ? Math.max(0, Math.min(1, health.health_score / 100)) : 0.5
        const complianceScore = compliance
          ? Math.max(0, Math.min(1, (compliance.sars_compliance_score || 0) / 100))
          : 0.5
        const forecastConfidence = cashflow ? Math.max(0, Math.min(1, cashflow.confidence || 0.5)) : 0.5
        const riskLevel = health && health.risk_score ? 1 - Math.max(0, Math.min(1, health.risk_score)) : 0.3
        const cashflowHealth = cashflow
          ? Math.max(0, Math.min(1, (cashflow.projected_balance || 0) / 5000000))
          : healthScore
        const revenueMomentum = health
          ? Math.max(0, Math.min(1, (health.revenue || 0) / 5000000))
          : 0.5
        const expenseRatio = health && health.revenue
          ? Math.max(0, Math.min(1, (health.expenses || 0) / Math.max(health.revenue, 1)))
          : 0.5
        const taxLiability = compliance
          ? Math.max(0, Math.min(1, (compliance.vat_liability_estimate || 0) / 1000000))
          : 0.3
        const transactionVelocity = cashflow
          ? Math.max(0, Math.min(1, ((cashflow.avg_daily_inflow || 0) + (cashflow.avg_daily_outflow || 0)) / 100000))
          : 0.5

        setMetrics({
          cashflowHealth,
          taxLiability,
          complianceScore,
          forecastConfidence,
          transactionVelocity,
          riskLevel,
          revenueMomentum,
          expenseRatio,
        })
        setError(null)
      } catch (e: any) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    intervalRef.current = setInterval(fetchData, 15000)

    return () => {
      mounted = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [setMetrics])

  const insights = [
    {
      id: 'cashflow',
      type: (metrics.cashflowHealth > 0.7 ? 'positive' : metrics.cashflowHealth > 0.4 ? 'neutral' : 'negative') as 'positive' | 'negative' | 'neutral' | 'warning',
      label: 'Cashflow Health',
      value: `${Math.round(metrics.cashflowHealth * 100)}%`,
      detail:
        metrics.cashflowHealth > 0.7
          ? 'Cash reserves remain stable with positive inflow trends.'
          : metrics.cashflowHealth > 0.4
          ? 'Cash flow is adequate but monitor receivables.'
          : 'Cash flow pressure detected. Review outstanding invoices.',
    },
    {
      id: 'compliance',
      type: (metrics.complianceScore > 0.8 ? 'positive' : metrics.complianceScore > 0.5 ? 'neutral' : 'warning') as 'positive' | 'negative' | 'neutral' | 'warning',
      label: 'SARS Compliance',
      value: `${Math.round(metrics.complianceScore * 100)}/100`,
      detail:
        metrics.complianceScore > 0.8
          ? 'All compliance obligations are up to date.'
          : metrics.complianceScore > 0.5
          ? 'Some filings pending. Review compliance timeline.'
          : 'Compliance gaps detected. Immediate attention required.',
    },
    {
      id: 'tax',
      type: (metrics.taxLiability > 0.6 ? 'warning' : 'neutral') as 'positive' | 'negative' | 'neutral' | 'warning',
      label: 'Tax Readiness',
      value: `${Math.round((1 - metrics.taxLiability) * 100)}%`,
      detail: `VAT obligations projected to ${metrics.taxLiability > 0.5 ? 'increase' : 'decrease'} next month.`,
    },
    {
      id: 'forecast',
      type: (metrics.forecastConfidence > 0.7 ? 'positive' : 'neutral') as 'positive' | 'negative' | 'neutral' | 'warning',
      label: 'Forecast Confidence',
      value: `${Math.round(metrics.forecastConfidence * 100)}%`,
      detail:
        metrics.forecastConfidence > 0.7
          ? 'Data patterns are stable. Forecasts are reliable.'
          : 'Recent volatility reducing forecast accuracy.',
    },
    {
      id: 'risk',
      type: (metrics.riskLevel > 0.5 ? 'warning' : metrics.riskLevel > 0.3 ? 'neutral' : 'positive') as 'positive' | 'negative' | 'neutral' | 'warning',
      label: 'Risk Rating',
      value: metrics.riskLevel > 0.5 ? 'Elevated' : metrics.riskLevel > 0.3 ? 'Moderate' : 'Low',
      detail:
        metrics.riskLevel > 0.5
          ? 'Anomaly clusters detected. Review flagged transactions.'
          : metrics.riskLevel > 0.3
          ? 'Minor risk signals present. Monitoring active.'
          : 'No significant risk indicators detected.',
    },
  ]

  return { metrics, insights, loading, error }
}
