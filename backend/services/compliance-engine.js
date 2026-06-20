'use strict'

const { getDataStore } = require('./data-store')

const VAT_RATE = 0.15
const VAT_PERIODS_PER_YEAR = 6
const INCOME_TAX_RATE_SMALL = 0.07
const INCOME_TAX_RATE_MEDIUM = 0.21
const INCOME_TAX_RATE_LARGE = 0.28
const INCOME_TAX_THRESHOLD_MEDIUM = 550000
const INCOME_TAX_THRESHOLD_LARGE = 2000000
const PAYE_RATE = 0.18
const UIF_RATE = 0.01
const SDL_RATE = 0.01
const SDL_THRESHOLD = 500000

class ComplianceEngine {
  static generateComplianceSummary(businessId) {
    const store = getDataStore()
    const vatReturns = store.getVatReturns(businessId)
    const taxRecords = store.getTaxRecords(businessId)
    const transactions = store.getAllTransactionsForBusiness(businessId)
    const accounts = store.getAccounts(businessId)
    const invoices = store.getInvoices(businessId)

    const vatCompliance = this.checkVatCompliance(vatReturns, transactions)
    const taxCompliance = this.checkTaxCompliance(taxRecords)
    const payrollCompliance = this.checkPayrollCompliance(transactions)

    const vatScore = vatCompliance.score
    const taxScore = taxCompliance.score
    const payrollScore = payrollCompliance.score

    const overallScore = Math.round((vatScore * 0.35 + taxScore * 0.40 + payrollScore * 0.25) * 100) / 100
    const outstandingReturns = vatReturns.filter(v => !v.is_submitted).length +
      taxRecords.filter(t => t.status !== 'Filed' && t.status !== 'Approved').length

    const totalBalance = accounts.reduce((s, a) => s + (a.available_balance || 0), 0)
    const totalRevenue = transactions
      .filter(t => t.transaction_type === 'credit' && t.status === 'posted')
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'debit' && t.status === 'posted')
      .reduce((s, t) => s + Math.abs(t.amount), 0)

    const totalVatPaid = transactions
      .filter(t => t.category === 'tax' && t.status === 'posted')
      .reduce((s, t) => s + Math.abs(t.amount), 0)

    const recommendations = []
    if (vatScore < 1) recommendations.push('Review outstanding VAT returns to avoid penalties')
    if (taxScore < 0.8) recommendations.push('Consider provisional tax payment to reduce interest')
    if (payrollScore < 0.9) recommendations.push('Verify PAYE/UIF/SDL calculations for accuracy')
    if (outstandingReturns > 2) recommendations.push('Multiple filings overdue - prioritize compliance')
    if (totalRevenue > 0 && totalExpenses > totalRevenue * 0.8) {
      recommendations.push('Expense ratio is high - review cost optimization opportunities')
    }

    const vatLiability = this.calculateVatLiability(transactions, invoices)

    return {
      overall_score: Math.min(100, Math.max(0, overallScore)),
      sars_compliance_score: Math.min(100, Math.max(0, Math.round(overallScore * 100))),
      vat_compliant: vatScore >= 0.8,
      vat_score: vatScore,
      tax_compliant: taxScore >= 0.7,
      tax_score: taxScore,
      payroll_compliant: payrollScore >= 0.85,
      outstanding_returns: outstandingReturns,
      drrt_coherence: store.getDrrtState().global_coherence || 0.82,
      vat_liability_estimate: vatLiability,
      tax_liability_estimate: this.calculateIncomeTax(totalRevenue, totalExpenses),
      paye_estimate: this.calculatePaye(totalExpenses),
      total_reserve_needed: vatLiability + this.calculateIncomeTax(totalRevenue, totalExpenses) + this.calculatePaye(totalExpenses),
      current_reserve_balance: accounts.reduce((s, a) => s + (a.reserved_tax_funds || 0), 0),
      violations: [],
      recommendations,
    }
  }

  static checkVatCompliance(vatReturns, transactions) {
    if (vatReturns.length === 0) {
      const postedTxns = transactions.filter(t => t.status === 'posted')
      if (postedTxns.length > 0) return { score: 0.5, is_compliant: false, outstanding_returns: [] }
      return { score: 1.0, is_compliant: true, outstanding_returns: [] }
    }
    const submitted = vatReturns.filter(v => v.is_submitted)
    const outstanding = vatReturns.filter(v => !v.is_submitted)
    const score = vatReturns.length > 0 ? submitted.length / vatReturns.length : 1.0
    return {
      score: Math.min(1, score),
      is_compliant: score >= 0.8,
      outstanding_returns: outstanding,
    }
  }

  static checkTaxCompliance(taxRecords) {
    if (taxRecords.length === 0) return { score: 0.5, is_compliant: false }
    const compliant = taxRecords.filter(t => {
      if (t.status === 'Filed' || t.status === 'Approved') return true
      if (t.status === 'Paid') return true
      return false
    })
    const score = compliant.length / taxRecords.length
    return {
      score: Math.min(1, score),
      is_compliant: score >= 0.7,
    }
  }

  static checkPayrollCompliance(transactions) {
    const payrollTxns = transactions.filter(t => t.category === 'expenses' && t.description.toLowerCase().includes('salary'))
    if (payrollTxns.length === 0) return { score: 1.0, is_compliant: true }
    const posted = payrollTxns.filter(t => t.status === 'posted')
    const score = posted.length / payrollTxns.length
    return {
      score: Math.min(1, score),
      is_compliant: score >= 0.85,
    }
  }

  static calculateVatLiability(transactions, invoices) {
    const totalSales = transactions
      .filter(t => t.transaction_type === 'credit' && t.status === 'posted')
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    const totalPurchases = transactions
      .filter(t => t.transaction_type === 'debit' && t.status === 'posted')
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    const invoiceVat = invoices
      .filter(i => i.status === 'paid')
      .reduce((s, i) => s + (i.vat_amount || 0), 0)
    const vatOnSales = totalSales * VAT_RATE
    const vatOnPurchases = totalPurchases * VAT_RATE * 0.6
    return Math.max(0, Math.round((vatOnSales - vatOnPurchases + invoiceVat) * 100) / 100)
  }

  static calculateIncomeTax(revenue, expenses) {
    const profit = Math.max(0, revenue - expenses)
    if (profit <= 0) return 0
    if (profit <= INCOME_TAX_THRESHOLD_MEDIUM) {
      return Math.round(profit * INCOME_TAX_RATE_SMALL * 100) / 100
    }
    if (profit <= INCOME_TAX_THRESHOLD_LARGE) {
      return Math.round(profit * INCOME_TAX_RATE_MEDIUM * 100) / 100
    }
    return Math.round(profit * INCOME_TAX_RATE_LARGE * 100) / 100
  }

  static calculatePaye(totalPayroll) {
    if (totalPayroll <= 0) return 0
    const paye = totalPayroll * PAYE_RATE
    const uif = totalPayroll * UIF_RATE
    const sdl = totalPayroll > SDL_THRESHOLD ? totalPayroll * SDL_RATE : 0
    return Math.round((paye + uif + sdl) * 100) / 100
  }

  static generateComplianceReport(businessId) {
    const summary = this.generateComplianceSummary(businessId)
    const store = getDataStore()
    const vatReturns = store.getVatReturns(businessId)
    const taxRecords = store.getTaxRecords(businessId)

    const violations = []
    vatReturns.filter(v => !v.is_submitted).forEach(v => {
      const daysOverdue = Math.floor((Date.now() - new Date(v.period_end).getTime()) / 86400000)
      if (daysOverdue > 30) {
        violations.push({
          code: 'VAT-LATE-001',
          severity: 'High',
          description: `VAT return for period ending ${new Date(v.period_end).toLocaleDateString()} is overdue by ${daysOverdue} days`,
          regulation_ref: 'VAT Act 89 of 1991, Section 28',
          remediation: 'Submit outstanding VAT201 return immediately to avoid penalties',
        })
      }
    })

    taxRecords.filter(t => t.status === 'Overdue').forEach(t => {
      violations.push({
        code: 'TAX-OVERDUE-001',
        severity: 'Critical',
        description: `${t.tax_type} payment of R${t.amount_due.toLocaleString()} is overdue`,
        regulation_ref: 'Income Tax Act 58 of 1962, Section 34',
        remediation: 'Arrange payment plan with SARS or settle immediately',
      })
    })

    const accounts = store.getAccounts(businessId)
    const totalReserve = accounts.reduce((s, a) => s + (a.reserved_tax_funds || 0), 0)
    if (summary.total_reserve_needed > totalReserve) {
      violations.push({
        code: 'RESERVE-SHORTFALL-001',
        severity: 'Medium',
        description: `Tax reserve of R${totalReserve.toLocaleString()} is below estimated liability of R${summary.total_reserve_needed.toLocaleString()}`,
        regulation_ref: 'Prudential requirement',
        remediation: 'Increase monthly tax reserve allocation',
      })
    }

    return {
      overall_score: summary.overall_score,
      vat_compliance: { score: summary.vat_score, is_compliant: summary.vat_compliant, outstanding_returns: vatReturns.filter(v => !v.is_submitted) },
      income_tax_compliance: { score: summary.tax_score, is_compliant: summary.tax_compliant },
      payroll_compliance: { score: summary.payroll_compliant ? 1 : 0, is_compliant: summary.payroll_compliant },
      violations,
      recommendations: summary.recommendations,
      drrt_coherence: summary.drrt_coherence,
    }
  }

  static calculateTaxReserve(businessId) {
    const summary = this.generateComplianceSummary(businessId)
    const store = getDataStore()
    const accounts = store.getAccounts(businessId)
    const currentReserve = accounts.reduce((s, a) => s + (a.reserved_tax_funds || 0), 0)
    const totalRequired = summary.total_reserve_needed
    const gap = Math.max(0, totalRequired - currentReserve)
    const monthlyAllocation = gap > 0 ? Math.round(gap / 12 * 100) / 100 : Math.round(totalRequired / 12 * 100) / 100
    return {
      estimated_vat_liability: summary.vat_liability_estimate,
      estimated_income_tax: summary.tax_liability_estimate,
      estimated_paye: summary.paye_estimate,
      total_reserve_required: totalRequired,
      current_reserve_balance: currentReserve,
      reserve_gap: gap,
      drrt_confidence: summary.drrt_coherence,
      recommended_monthly_allocation: monthlyAllocation,
    }
  }

  static getVatPeriods(year) {
    const periods = []
    for (let i = 0; i < 6; i++) {
      const startMonth = i * 2 + 1
      const endMonth = startMonth + 1
      const endDay = endMonth === 2 ? 28 : endMonth === 8 ? 31 : 30
      periods.push([
        new Date(year, startMonth - 1, 1),
        new Date(year, endMonth - 1, Math.min(endDay, 30)),
      ])
    }
    return periods
  }

  static generateVatReturns(businessId) {
    const store = getDataStore()
    const existing = store.getVatReturns(businessId)
    if (existing.length > 0) return existing

    const now = new Date()
    const year = now.getFullYear()
    const periods = this.getVatPeriods(year)
    const sample = periods.map(([start, end], i) => {
      const vatOnSales = Math.round((500000 + Math.random() * 300000) * 100) / 100
      const vatOnPurchases = Math.round((300000 + Math.random() * 150000) * 100) / 100
      const netVatDue = Math.max(0, Math.round((vatOnSales - vatOnPurchases) * 100) / 100)
      return {
        id: `vat-${i}`,
        business_id: businessId,
        period: `${start.toLocaleString('default', { month: 'short' })}-${end.toLocaleString('default', { month: 'short' })} ${year}`,
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        vat_on_sales: vatOnSales,
        vat_on_purchases: vatOnPurchases,
        net_vat_due: netVatDue,
        is_submitted: i < 3,
        penalties: 0,
        created_at: new Date().toISOString(),
      }
    })
    sample.forEach(v => store.addVatReturn(v))
    return store.getVatReturns(businessId)
  }

  static generateTaxRecords(businessId) {
    const store = getDataStore()
    const existing = store.getTaxRecords(businessId)
    if (existing.length > 0) return existing

    const now = new Date()
    const year = now.getFullYear()
    const taxTypes = ['Provisional Tax', 'Income Tax', 'Capital Gains Tax']
    const sample = taxTypes.map((type, i) => ({
      id: `tax-${i}`,
      business_id: businessId,
      tax_type: type,
      tax_period: `${year}`,
      amount_due: Math.round((100000 + Math.random() * 400000) * 100) / 100,
      amount_paid: i === 0 ? Math.round((80000 + Math.random() * 50000) * 100) / 100 : 0,
      balance: 0,
      status: i < 2 ? 'Filed' : 'Pending',
      created_at: new Date().toISOString(),
    }))
    sample.forEach(t => store.addTaxRecord(t))
    return store.getTaxRecords(businessId)
  }
}

module.exports = { ComplianceEngine, VAT_RATE }
