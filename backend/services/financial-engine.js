'use strict'

const { getDataStore } = require('./data-store')

class FinancialEngine {
  static getHealthSummary(businessId) {
    const store = getDataStore()
    const accounts = store.getAccounts(businessId)
    const transactions = store.getAllTransactionsForBusiness(businessId)
    const drrt = store.getDrrtState()

    const totalBalance = accounts.reduce((s, a) => s + (a.available_balance || 0), 0)
    const reserved = accounts.reduce((s, a) => s + (a.reserved_tax_funds || 0), 0)
    const freeCash = totalBalance - reserved
    const liquidityRatio = totalBalance > 0 ? freeCash / totalBalance : 0
    const coherence = drrt.global_coherence || 0.82

    const postedRevenue = transactions
      .filter(t => t.transaction_type === 'credit' && t.status === 'posted')
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    const postedExpenses = transactions
      .filter(t => t.transaction_type === 'debit' && t.status === 'posted')
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    const revenue = Math.round(postedRevenue * 100) / 100
    const expenses = Math.round(postedExpenses * 100) / 100
    const profit = Math.round((revenue - expenses) * 100) / 100

    const liquidityStr = liquidityRatio > 0.3 ? 'Strong' : liquidityRatio > 0.15 ? 'Moderate' : 'Weak'
    const liquidityScore = Math.min(1, liquidityRatio * 1.5)

    const riskRaw = 1 - coherence
    const riskStr = riskRaw < 0.2 ? 'Low' : riskRaw < 0.5 ? 'Medium' : 'High'
    const riskScore = riskRaw < 0.2 ? 0.9 : riskRaw < 0.5 ? 0.5 : 0.2

    const complianceScore = Math.round(coherence * 100)
    const healthScore = Math.round(((liquidityScore + riskScore + coherence) / 3) * 100)

    return {
      health_score: healthScore,
      liquidity: liquidityStr,
      liquidity_score: Math.round(liquidityScore * 100) / 100,
      risk: riskStr,
      risk_score: Math.round(riskScore * 100) / 100,
      compliance: complianceScore,
      revenue,
      expenses,
      profit,
      drrt_coherence: Math.round(coherence * 1000) / 1000,
    }
  }

  static getHealthDetail(businessId) {
    const summary = this.getHealthSummary(businessId)
    const store = getDataStore()
    const drrt = store.getDrrtState()
    const coherence = drrt.global_coherence || 0.82
    const contradiction = drrt.contradiction || 0.15
    const margin = summary.revenue > 0 ? Math.round((summary.profit / summary.revenue) * 10000) / 100 : 0

    const dimensions = [
      ['TransactionValue', coherence * 0.9],
      ['AccountBalance', coherence * 0.85],
      ['CashFlowLiquidity', summary.liquidity_score],
      ['CustomerTrust', coherence * 0.75],
      ['SupplierReliability', coherence * 0.7],
      ['InvoiceValidity', coherence * 0.8],
      ['TaxCompliance', (1 - contradiction) * 0.9],
      ['VatAlignment', (1 - contradiction) * 0.85],
      ['RegulatoryRisk', summary.risk_score],
      ['PaymentVelocity', coherence * 0.65],
      ['CreditExposure', (1 - contradiction) * 0.75],
      ['AuditTrail', coherence * 0.7],
    ]

    const breakdown = dimensions.map(([name, score]) => ({
      dimension: name,
      score: Math.round(score * 100) / 100,
      weight: 1.0,
      status: score > 0.7 ? 'healthy' : score > 0.4 ? 'warning' : 'critical',
    }))

    return {
      ...summary,
      compliance_score: summary.compliance / 100,
      profit_margin: margin,
      breakdown,
    }
  }

  static getBankingSummary(businessId) {
    const store = getDataStore()
    const accounts = store.getAccounts(businessId)
    const transactions = store.getAllTransactionsForBusiness(businessId)
    const drrt = store.getDrrtState()
    const rules = store.getProgrammableRules(businessId)
    const workflows = store.getApprovalWorkflows(businessId)

    const totalBalance = accounts.reduce((s, a) => s + (a.available_balance || 0), 0)
    const reserved = accounts.reduce((s, a) => s + (a.reserved_tax_funds || 0), 0)
    const pendingCount = transactions.filter(t => t.status === 'pending').length

    return {
      available_balance: Math.round(totalBalance * 100) / 100,
      pending_transactions: pendingCount,
      reserved_tax_funds: Math.round(reserved * 100) / 100,
      programmable_rules: rules.length,
      approval_workflows: workflows.length,
      drrt_coherence: drrt.global_coherence || 0.82,
      accounts: accounts.map(a => ({
        account_id: a.id,
        account_number: a.account_number,
        account_type: a.account_type,
        account_name: a.account_name,
        current_balance: a.current_balance,
        available_balance: a.available_balance,
        currency: a.currency || 'ZAR',
      })),
    }
  }

  static getTransactionIntelligence(businessId) {
    const store = getDataStore()
    const transactions = store.getAllTransactionsForBusiness(businessId)
    const posted = transactions.filter(t => t.status === 'posted')

    const byCategory = {}
    posted.forEach(t => {
      const cat = t.category || 'uncategorized'
      if (!byCategory[cat]) byCategory[cat] = { count: 0, total: 0, credits: 0, debits: 0 }
      byCategory[cat].count++
      byCategory[cat].total += Math.abs(t.amount)
      if (t.transaction_type === 'credit') byCategory[cat].credits += Math.abs(t.amount)
      else byCategory[cat].debits += Math.abs(t.amount)
    })

    const totalInflow = posted.filter(t => t.transaction_type === 'credit').reduce((s, t) => s + Math.abs(t.amount), 0)
    const totalOutflow = posted.filter(t => t.transaction_type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0)

    const topMerchants = [...new Set(posted.map(t => t.description).filter(Boolean))]
      .map(desc => ({
        name: desc,
        count: posted.filter(t => t.description === desc).length,
        total: Math.round(posted.filter(t => t.description === desc).reduce((s, t) => s + Math.abs(t.amount), 0) * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    return {
      total_transactions: posted.length,
      total_inflow: Math.round(totalInflow * 100) / 100,
      total_outflow: Math.round(totalOutflow * 100) / 100,
      net_flow: Math.round((totalInflow - totalOutflow) * 100) / 100,
      category_breakdown: Object.entries(byCategory).map(([cat, data]) => ({
        category: cat,
        ...data,
        total: Math.round(data.total * 100) / 100,
      })),
      top_merchants: topMerchants,
      avg_transaction: posted.length > 0 ? Math.round(posted.reduce((s, t) => s + Math.abs(t.amount), 0) / posted.length * 100) / 100 : 0,
    }
  }
}

module.exports = { FinancialEngine }
