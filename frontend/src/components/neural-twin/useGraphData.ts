'use client'

import { useEffect, useCallback } from 'react'
import { useNeuralTwinStore } from '../neural-twin/store/graph-store'
import { api } from '@/lib/api'
import type { GraphNode, GraphEdge, ScoreContributor, StoryInsight } from '../neural-twin/types'

const SEVERITY_COLORS: Record<string, string> = {
  healthy: '#22c55e',
  warning: '#f59e0b',
  risk: '#ef4444',
}

function getHealthColor(val: number): string {
  if (val >= 70) return '#22c55e'
  if (val >= 40) return '#f59e0b'
  return '#ef4444'
}

async function buildGraphNodes(businessId: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  let idCounter = 0
  const nextId = () => `node-${++idCounter}`

  try {
    const banking = await api.getBankingSummary().catch(() => null)
    const financial = await api.getFinancialHealth().catch(() => null)
    const compliance = await api.getComplianceSummary().catch(() => null)
    const cashflow = await api.getCashflowForecast().catch(() => null)
    const drrtState = await api.getDrrtState().catch(() => null)
    const accounts = await api.getBankingAccounts().catch(() => [])
    const transactions = await api.getBankingTransactions().catch(() => [])
    const intelligence = await api.getTransactionIntelligence().catch(() => null)

    // Account nodes
    const accountList = Array.isArray(accounts) ? accounts : banking?.accounts || []
    for (const acct of accountList) {
      const acctId = acct.account_id || acct.accountId || acct.id || nextId()
      const balance = acct.current_balance || acct.currentBalance || acct.balance || 0
      const available = acct.available_balance || acct.availableBalance || 0
      nodes.push({
        id: acctId,
        type: 'account',
        label: acct.account_name || acct.accountName || acct.accountNumber || acct.account_number || 'Account',
        value: balance,
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 10,
        vx: 0, vy: 0, vz: 0,
        color: balance >= 0 ? '#22c55e' : '#ef4444',
        size: Math.max(1.5, Math.min(4, Math.abs(balance) / 500000)),
        pulse: false,
        glow: balance > 1000000,
        metadata: { balance, available, risk: 'Low', transactions: 0 },
      })
    }

    // DRRT node
    if (drrtState) {
      const coherence = drrtState.coherence ?? drrtState.global_coherence ?? 0.5
      nodes.push({
        id: 'drrt-core',
        type: 'drrt',
        label: 'DRRT Core',
        value: coherence,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        color: getHealthColor(coherence * 100),
        size: 2 + coherence * 2,
        pulse: true,
        glow: true,
        metadata: { coherence, entropy: drrtState.entropy || 0.3, memory: drrtState.memory?.length || 0, resolution: drrtState.trend || 'stable' },
      })

      // Connect DRRT to accounts
      for (const acct of accountList) {
        const acctId = acct.account_id || acct.accountId || acct.id
        if (acctId) {
          edges.push({ id: `edge-drrt-${acctId}`, source: 'drrt-core', target: acctId, strength: coherence, label: 'monitors', color: '#6366f1', width: 0.5 })
        }
      }
    }

    // Cashflow node
    if (cashflow) {
      nodes.push({
        id: 'cashflow-core',
        type: 'drrt',
        label: 'Cashflow Forecast',
        value: cashflow.projected_balance || 0,
        x: 12, y: 8, z: 0,
        vx: 0, vy: 0, vz: 0,
        color: getHealthColor((cashflow.confidence || 0) * 100),
        size: 2 + (cashflow.confidence || 0.5) * 1.5,
        pulse: false,
        glow: false,
        metadata: { balance: cashflow.projected_balance, confidence: cashflow.confidence, inflow: cashflow.avg_daily_inflow, outflow: cashflow.avg_daily_outflow },
      })
      edges.push({ id: 'edge-drrt-cf', source: 'drrt-core', target: 'cashflow-core', strength: 0.6, label: 'forecasts', color: '#06b6d4', width: 0.5 })
    }

    // Compliance node
    if (compliance) {
      nodes.push({
        id: 'compliance-core',
        type: 'drrt',
        label: 'Compliance',
        value: compliance.overall_score || 0,
        x: -10, y: 10, z: 3,
        vx: 0, vy: 0, vz: 0,
        color: getHealthColor((compliance.overall_score || 0) * 100),
        size: 1.5 + (compliance.overall_score || 0.5) * 1.5,
        pulse: false,
        glow: (compliance.overall_score || 1) < 0.6,
        metadata: { score: compliance.overall_score, vat: compliance.vat_score, tax: compliance.tax_score },
      })
      edges.push({ id: 'edge-drrt-comp', source: 'drrt-core', target: 'compliance-core', strength: 0.5, label: 'regulates', color: '#8b5cf6', width: 0.5 })
    }

    // Transaction clusters
    const txnList = Array.isArray(transactions) ? transactions : []
    const categoryGroups: Record<string, { total: number; count: number }> = {}
    for (const t of txnList) {
      const cat = t.category || 'other'
      if (!categoryGroups[cat]) categoryGroups[cat] = { total: 0, count: 0 }
      categoryGroups[cat].total += Math.abs(t.amount || 0)
      categoryGroups[cat].count++
    }

    Object.entries(categoryGroups).forEach(([cat, data], i) => {
      const angle = (i / Object.keys(categoryGroups).length) * Math.PI * 2
      const radius = 16
      nodes.push({
        id: `cluster-${cat}`,
        type: 'cluster',
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: data.total,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.5,
        z: (Math.random() - 0.5) * 5,
        vx: 0, vy: 0, vz: 0,
        color: '#8b5cf6',
        size: Math.min(4, Math.max(1, data.total / 100000)),
        pulse: false,
        glow: false,
        metadata: { transactions: data.count, frequency: Math.round(data.count / 3), volatility: 0.3, trend: 'Stable' },
      })
      edges.push({ id: `edge-txn-${cat}`, source: 'drrt-core', target: `cluster-${cat}`, strength: 0.4, label: 'analyzes', color: '#7c3aed', width: 0.3 })
    })

    // Risk/anomaly nodes
    if (intelligence?.anomalies) {
      const anomalies = Array.isArray(intelligence.anomalies) ? intelligence.anomalies : []
      anomalies.forEach((a: any, i: number) => {
        const angle = (i / anomalies.length) * Math.PI * 2 + 0.5
        nodes.push({
          id: `anomaly-${i}`,
          type: 'risk',
          label: a.description || 'Anomaly',
          value: a.impact || a.amount || 0,
        x: Math.cos(angle) * 18,
        y: Math.sin(angle) * 14 - 5,
        z: (Math.random() - 0.5) * 8,
          vx: 0, vy: 0, vz: 0,
          color: '#ef4444',
          size: 2.5,
          pulse: true,
          glow: true,
          metadata: { severity: a.severity || 'High', impact: a.impact || a.amount || 0, recommendation: a.recommendation || 'Review', detected: a.detected_at || a.date || 'N/A' },
        })
        edges.push({ id: `edge-anomaly-${i}`, source: 'drrt-core', target: `anomaly-${i}`, strength: 0.7, label: 'detected', color: '#ef4444', width: 0.6 })
      })
    }
  } catch (err) {
    console.warn('[NeuralTwin] Failed to build graph:', err)
  }

  return { nodes, edges }
}

export function useGraphData() {
  const { setNodes, setEdges, setContributors, setInsights, setCashflowData } = useNeuralTwinStore()

  const refresh = useCallback(async () => {
    const { nodes, edges } = await buildGraphNodes('biz-1')
    setNodes(nodes)
    setEdges(edges)

    // Build explainability data
    try {
      const financial = await api.getFinancialHealth().catch(() => null)
      const compliance = await api.getComplianceSummary().catch(() => null)
      const cashflow = await api.getCashflowForecast().catch(() => null)

      if (financial) {
        const contributors: ScoreContributor[] = [
          { label: 'Cash Position', value: financial.liquidity_score || 0, impact: 12, direction: 'positive', detail: `Liquidity: ${financial.liquidity || 'N/A'}` },
          { label: 'Compliance', value: (financial.compliance || 0) / 100, impact: -9, direction: 'negative', detail: `Compliance score: ${financial.compliance || 0}%` },
          { label: 'Merchant Concentration', value: 0.4, impact: -11, direction: 'negative', detail: 'Top merchant exceeds 25% of spend' },
          { label: 'Forecast Stability', value: cashflow?.confidence || 0.5, impact: -5, direction: 'negative', detail: `Confidence: ${((cashflow?.confidence || 0) * 100).toFixed(0)}%` },
          { label: 'Liquidity', value: financial.liquidity_score || 0.5, impact: 4, direction: 'positive', detail: `Liquidity ratio: ${financial.liquidity_score || 0.5}` },
          { label: 'Revenue Growth', value: financial.health_score ? financial.health_score / 100 : 0.5, impact: 8, direction: 'positive', detail: `Revenue: R${(financial.revenue || 0).toLocaleString()}` },
        ]
        setContributors(contributors)
      }

      if (compliance) {
        const insights: StoryInsight[] = [
          {
            id: 'insight-vat', type: 'alert', title: 'VAT Exposure',
            body: `VAT exposure increased due to supplier spending. ${compliance.vat_liability_estimate ? `Estimated liability: R${compliance.vat_liability_estimate.toLocaleString()}` : ''}`,
            severity: (compliance.vat_score || 1) < 0.6 ? 'high' : 'medium',
            timestamp: new Date().toISOString(), relatedNodeIds: ['compliance-core'],
          },
          {
            id: 'insight-cash', type: 'forecast', title: 'Cash Runway',
            body: `Cash reserves support operations for ${cashflow ? Math.round(cashflow.projected_balance / Math.abs(cashflow.avg_daily_outflow || 1) / 30) : 'N/A'} months.`,
            severity: 'low', timestamp: new Date().toISOString(), relatedNodeIds: ['cashflow-core'],
          },
          {
            id: 'insight-conf', type: 'trend', title: 'Forecast Confidence',
            body: `Forecast confidence ${(cashflow?.confidence || 0) < 0.5 ? 'decreased' : 'stable'} because transaction volatility ${(cashflow?.inflow_volatility || 0) > 0.5 ? 'rose' : 'remained low'}.`,
            severity: (cashflow?.confidence || 1) < 0.5 ? 'medium' : 'low',
            timestamp: new Date().toISOString(), relatedNodeIds: ['cashflow-core'],
          },
        ]
        setInsights(insights)
      }

      // Cashflow data for charts
      if (cashflow) {
        const today = new Date()
        const history: any[] = []
        const projection: any[] = []
        const balance = cashflow.current_balance || 0
        const netDaily = (cashflow.avg_daily_inflow || 0) - (cashflow.avg_daily_outflow || 0)

        for (let i = -30; i <= 90; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() + i)
          const dateStr = date.toISOString().slice(0, 10)
          const projected = balance + netDaily * (i + 30)
          const conf = cashflow.confidence || 0.5
          const band = projected * (1 - conf) * 0.3

          if (i <= 0) {
            history.push({ date: dateStr, actual: balance + netDaily * (i + 30) })
          }
          projection.push({
            date: dateStr,
            projected: projected,
            confidenceUpper: projected + band,
            confidenceLower: projected - band,
          })
        }
        setCashflowData(history, projection)
      }
    } catch (err) {
      console.warn('[NeuralTwin] Failed to build insights:', err)
    }
  }, [setNodes, setEdges, setContributors, setInsights, setCashflowData])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { refresh }
}
