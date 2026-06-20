'use strict'

const { getDataStore } = require('./data-store')

class DrrtEngine {
  static getState() {
    const store = getDataStore()
    const drrt = store.getDrrtState()
    return {
      coherence: Math.round(drrt.coherence * 1000) / 1000,
      contradiction: Math.round(drrt.contradiction * 1000) / 1000,
      frustration_index: Math.round(drrt.frustration_index * 1000) / 1000,
      stability: Math.round(drrt.stability * 1000) / 1000,
      entropy: Math.round(drrt.entropy * 1000) / 1000,
      convergence_iterations: drrt.convergence_iterations,
      trend: drrt.trend,
      global_coherence: Math.round(drrt.global_coherence * 1000) / 1000,
      dimensions: drrt.dimensions || [],
    }
  }

  static getDimensions() {
    const store = getDataStore()
    return (store.getDrrtState().dimensions || []).map(d => ({
      ...d,
      activation: Math.round(d.activation * 1000) / 1000,
    }))
  }

  static converge() {
    const store = getDataStore()
    const drrt = store.getDrrtState()
    drrt.convergence_iterations += 1
    drrt.coherence = Math.min(0.98, drrt.coherence + 0.01 + Math.random() * 0.02)
    drrt.contradiction = Math.max(0.02, drrt.contradiction - 0.005 - Math.random() * 0.01)
    drrt.frustration_index = Math.max(0.01, drrt.frustration_index - 0.01)
    drrt.stability = Math.min(1, drrt.stability + 0.005)
    drrt.entropy = Math.max(0.05, drrt.entropy - 0.005)
    drrt.global_coherence = (drrt.coherence + drrt.stability) / 2
    if (drrt.coherence > 0.9) drrt.trend = 'improving'
    else if (drrt.coherence > 0.7) drrt.trend = 'stable'
    else drrt.trend = 'degrading'

    if (drrt.dimensions) {
      drrt.dimensions = drrt.dimensions.map(d => ({
        ...d,
        activation: Math.min(1, Math.max(0, d.activation + (Math.random() - 0.5) * 0.05)),
      }))
    }
    drrt.memory = drrt.memory || []
    drrt.memory.push({
      iteration: drrt.convergence_iterations,
      coherence: drrt.coherence,
      timestamp: new Date().toISOString(),
    })
    if (drrt.memory.length > 100) drrt.memory = drrt.memory.slice(-100)
    store.updateDrrtState(drrt)
    return this.getState()
  }

  static addRelationship(data) {
    const store = getDataStore()
    const drrt = store.getDrrtState()
    const rel = {
      id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: data.source || 'unknown',
      target: data.target || 'unknown',
      weight: data.weight || 0.5,
      relationship_type: data.relationship_type || 'inference',
      coherence: 0.5 + Math.random() * 0.4,
      created_at: new Date().toISOString(),
    }
    drrt.relationships = drrt.relationships || []
    drrt.relationships.push(rel)
    drrt.convergence_iterations += 1
    store.updateDrrtState(drrt)
    return { success: true, id: rel.id, relationship: rel }
  }

  static getMemory() {
    const store = getDataStore()
    return (store.getDrrtState().memory || []).map(m => ({
      ...m,
      coherence: Math.round((m.coherence || 0) * 1000) / 1000,
    }))
  }

  static updateFromFinancialMetrics(metrics) {
    const store = getDataStore()
    const drrt = store.getDrrtState()
    drrt.financial_metrics = drrt.financial_metrics || {}

    if (metrics.total_balance !== undefined) drrt.financial_metrics.total_balance = metrics.total_balance
    if (metrics.free_cash !== undefined) drrt.financial_metrics.free_cash = metrics.free_cash
    if (metrics.liquidity_ratio !== undefined) drrt.financial_metrics.liquidity_ratio = metrics.liquidity_ratio
    if (metrics.revenue !== undefined) drrt.financial_metrics.revenue = metrics.revenue
    if (metrics.expenses !== undefined) drrt.financial_metrics.expenses = metrics.expenses
    if (metrics.profit !== undefined) drrt.financial_metrics.profit = metrics.profit
    if (metrics.vat_compliance_ratio !== undefined) drrt.financial_metrics.vat_compliance_ratio = metrics.vat_compliance_ratio
    if (metrics.tax_compliance_ratio !== undefined) drrt.financial_metrics.tax_compliance_ratio = metrics.tax_compliance_ratio
    if (metrics.compliance_score !== undefined) drrt.financial_metrics.compliance_score = metrics.compliance_score
    if (metrics.transaction_volume_90d !== undefined) drrt.financial_metrics.transaction_volume_90d = metrics.transaction_volume_90d
    if (metrics.transaction_count_90d !== undefined) drrt.financial_metrics.transaction_count_90d = metrics.transaction_count_90d
    if (metrics.pending_transaction_ratio !== undefined) drrt.financial_metrics.pending_transaction_ratio = metrics.pending_transaction_ratio
    if (metrics.successful_transaction_ratio !== undefined) drrt.financial_metrics.successful_transaction_ratio = metrics.successful_transaction_ratio
    if (metrics.paid_invoice_ratio !== undefined) drrt.financial_metrics.paid_invoice_ratio = metrics.paid_invoice_ratio

    const fm = drrt.financial_metrics
    const liquidityScore = fm.liquidity_ratio || 0.5
    const complianceScore = fm.compliance_score || 0.8
    const revenueHealth = fm.revenue > 0 ? Math.min(1, fm.profit / fm.revenue + 0.5) : 0.5
    const balanceHealth = fm.total_balance > 0 ? Math.min(1, fm.free_cash / fm.total_balance) : 0.5

    drrt.coherence = Math.round((liquidityScore * 0.2 + complianceScore * 0.3 + revenueHealth * 0.25 + balanceHealth * 0.25) * 1000) / 1000
    drrt.contradiction = Math.round((1 - drrt.coherence) * 0.3 * 1000) / 1000
    drrt.global_coherence = drrt.coherence
    drrt.stability = Math.round((0.7 + drrt.coherence * 0.3) * 1000) / 1000

    if (drrt.dimensions) {
      drrt.dimensions = drrt.dimensions.map(d => {
        let act = d.activation
        if (d.name === 'Cash Flow') act = liquidityScore
        else if (d.name === 'Revenue') act = revenueHealth
        else if (d.name === 'Expenses') act = 1 - (fm.expenses / Math.max(fm.revenue, 1)) * 0.5
        else if (d.name === 'Compliance') act = complianceScore
        else if (d.name === 'Risk') act = 1 - drrt.coherence
        else if (d.name === 'Forecast') act = fm.transaction_count_90d > 0 ? 0.7 : 0.3
        return { ...d, activation: Math.round(Math.min(1, Math.max(0, act)) * 1000) / 1000 }
      })
    }

    store.updateDrrtState(drrt)
  }
}

module.exports = { DrrtEngine }
