'use strict'

const { getDataStore } = require('./data-store')

class CashFlowEngine {
  static generateForecast(businessId) {
    const store = getDataStore()
    const transactions = store.getAllTransactionsForBusiness(businessId)
    const accounts = store.getAccounts(businessId)
    const drrt = store.getDrrtState()
    const currentBalance = accounts.reduce((s, a) => s + (a.available_balance || 0), 0)

    const postedTxns = transactions.filter(t => t.status === 'posted')
    const recentTxns = postedTxns.filter(t => {
      const d = new Date(t.posted_at)
      return d >= new Date(Date.now() - 90 * 86400000)
    })

    const dailyFlows = this.calculateDailyFlows(recentTxns)
    const avgDailyInflow = dailyFlows.avgInflow
    const avgDailyOutflow = dailyFlows.avgOutflow
    const inflowVolatility = dailyFlows.inflowVolatility
    const outflowVolatility = dailyFlows.outflowVolatility

    const confidence = this.calculateConfidence(recentTxns.length, inflowVolatility, outflowVolatility, drrt.global_coherence)

    const projectedBalance = currentBalance + (avgDailyInflow - avgDailyOutflow) * 90
    const baseBalance = currentBalance + (avgDailyInflow - avgDailyOutflow) * 90
    const optimisticBalance = currentBalance + (avgDailyInflow * 1.2 - avgDailyOutflow * 0.9) * 90
    const pessimisticBalance = currentBalance + (avgDailyInflow * 0.85 - avgDailyOutflow * 1.15) * 90
    const stressBalance = currentBalance + (avgDailyInflow * 0.6 - avgDailyOutflow * 1.3) * 90

    return {
      projected_balance: Math.round(projectedBalance * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      drrt_coherence: drrt.global_coherence || 0.82,
      avg_daily_inflow: Math.round(avgDailyInflow * 100) / 100,
      avg_daily_outflow: Math.round(avgDailyOutflow * 100) / 100,
      inflow_volatility: Math.round(inflowVolatility * 100) / 100,
      outflow_volatility: Math.round(outflowVolatility * 100) / 100,
      current_balance: Math.round(currentBalance * 100) / 100,
      net_daily_flow: Math.round((avgDailyInflow - avgDailyOutflow) * 100) / 100,
      forecast_date: new Date(Date.now() + 90 * 86400000).toISOString(),
      scenarios: [
        {
          scenario_type: 'Optimistic',
          projected_balance: Math.round(optimisticBalance * 100) / 100,
          probability: 0.2,
        },
        {
          scenario_type: 'Base',
          projected_balance: Math.round(baseBalance * 100) / 100,
          probability: 0.5,
        },
        {
          scenario_type: 'Pessimistic',
          projected_balance: Math.round(pessimisticBalance * 100) / 100,
          probability: 0.2,
        },
        {
          scenario_type: 'Stress',
          projected_balance: Math.round(stressBalance * 100) / 100,
          probability: 0.1,
        },
      ],
    }
  }

  static calculateDailyFlows(transactions) {
    if (transactions.length === 0) {
      return { avgInflow: 0, avgOutflow: 0, inflowVolatility: 1, outflowVolatility: 1 }
    }

    const days = new Set()
    const inflowByDay = {}
    const outflowByDay = {}

    transactions.forEach(t => {
      const day = t.posted_at ? t.posted_at.split('T')[0] : 'unknown'
      days.add(day)
      if (!inflowByDay[day]) inflowByDay[day] = 0
      if (!outflowByDay[day]) outflowByDay[day] = 0
      if (t.transaction_type === 'credit' || t.amount > 0) {
        inflowByDay[day] += Math.abs(t.amount)
      } else {
        outflowByDay[day] += Math.abs(t.amount)
      }
    })

    const dayCount = Math.max(days.size, 1)
    const inflows = Object.values(inflowByDay)
    const outflows = Object.values(outflowByDay)

    const avgInflow = inflows.reduce((s, v) => s + v, 0) / dayCount
    const avgOutflow = outflows.reduce((s, v) => s + v, 0) / dayCount

    const inflowVariance = inflows.reduce((s, v) => s + (v - avgInflow) ** 2, 0) / Math.max(inflows.length, 1)
    const outflowVariance = outflows.reduce((s, v) => s + (v - avgOutflow) ** 2, 0) / Math.max(outflows.length, 1)

    const inflowVolatility = avgInflow > 0 ? Math.sqrt(inflowVariance) / avgInflow : 1
    const outflowVolatility = avgOutflow > 0 ? Math.sqrt(outflowVariance) / avgOutflow : 1

    return {
      avgInflow: Math.round(avgInflow * 100) / 100,
      avgOutflow: Math.round(avgOutflow * 100) / 100,
      inflowVolatility: Math.min(1, Math.round(inflowVolatility * 100) / 100),
      outflowVolatility: Math.min(1, Math.round(outflowVolatility * 100) / 100),
    }
  }

  static calculateConfidence(txnCount, inflowVol, outflowVol, coherence) {
    const countFactor = Math.min(1, txnCount / 100)
    const volFactor = 1 - Math.max(inflowVol, outflowVol)
    const coherenceFactor = coherence || 0.5
    return Math.min(1, Math.max(0.1, (countFactor * 0.3 + volFactor * 0.3 + coherenceFactor * 0.4)))
  }
}

module.exports = { CashFlowEngine }
