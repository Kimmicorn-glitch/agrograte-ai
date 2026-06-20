'use client'

import { useEffect, useRef } from 'react'
import { useOrbStore, generateSimulatedMetrics } from './store'

export function useOrbMetrics() {
  const setMetrics = useOrbStore((s) => s.setMetrics)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const tick = () => {
      const fresh = generateSimulatedMetrics()
      setMetrics(fresh)
    }

    tick()
    intervalRef.current = setInterval(tick, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [setMetrics])

  const metrics = useOrbStore((s) => s.metrics)

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

  return { metrics, insights }
}
