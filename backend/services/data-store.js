'use strict'

const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '..', 'data-store.json')

const INITIAL_DATA = {
  version: 1,
  businesses: {
    'biz-1': {
      id: 'biz-1',
      name: 'Demo Business Pty Ltd',
      created_at: '2025-01-01T00:00:00Z',
    },
  },
  accounts: {},
  transactions: {},
  invoices: {},
  customers: {},
  suppliers: {},
  tax_records: {},
  vat_returns: {},
  financial_statements: {},
  cash_flow_forecasts: {},
  programmable_rules: {},
  approval_workflows: {},
  audit_logs: {},
  users: {
    'user-1': {
      id: 'user-1',
      email: 'demo@agrograte.ai',
      full_name: 'Demo User',
      role: 'admin',
      business_id: 'biz-1',
      password_hash: 'demo',
      created_at: '2025-01-01T00:00:00Z',
    },
  },
  drrt_state: {
    coherence: 0,
    contradiction: 1,
    frustration_index: 1,
    global_coherence: 0,
    stability: 0,
    entropy: 1,
    convergence_iterations: 0,
    trend: 'stable',
    dimensions: [
      { id: 'dim-1', name: 'Cash Flow', weight: 0.25, activation: 0 },
      { id: 'dim-2', name: 'Revenue', weight: 0.20, activation: 0 },
      { id: 'dim-3', name: 'Expenses', weight: 0.15, activation: 0 },
      { id: 'dim-4', name: 'Compliance', weight: 0.20, activation: 0 },
      { id: 'dim-5', name: 'Risk', weight: 0.10, activation: 0 },
      { id: 'dim-6', name: 'Forecast', weight: 0.10, activation: 0 },
    ],
    relationships: [],
    memory: [],
    financial_metrics: {
      total_balance: 0,
      free_cash: 0,
      liquidity_ratio: 0,
      revenue: 0,
      expenses: 0,
      profit: 0,
      vat_compliance_ratio: 0,
      tax_compliance_ratio: 0,
      compliance_score: 0,
      transaction_volume_90d: 0,
      transaction_count_90d: 0,
      pending_transaction_ratio: 0,
      successful_transaction_ratio: 0,
      paid_invoice_ratio: 0,
    },
  },
  investec_tokens: null,
}

class DataStore {
  constructor() {
    this.data = null
    this.load()
    this.seedSampleAccounts()
    this.seedSampleTransactions()
    this.seedSampleInvoices()
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8')
        const parsed = JSON.parse(raw)
        this.data = this.deepMerge(this.clone(INITIAL_DATA), parsed)
        console.log(`[DataStore] Loaded from ${DATA_FILE}`)
      } else {
        this.data = this.clone(INITIAL_DATA)
        this.save()
        console.log('[DataStore] Created new data store')
      }
    } catch (err) {
      console.error('[DataStore] Load error, using defaults:', err.message)
      this.data = this.clone(INITIAL_DATA)
    }
  }

  save() {
    try {
      const dir = path.dirname(DATA_FILE)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8')
    } catch (err) {
      console.error('[DataStore] Save error:', err.message)
    }
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  deepMerge(target, source) {
    const result = this.clone(target)
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = this.clone(source[key])
      }
    }
    return result
  }

  getBusiness(id) { return this.data.businesses[id] || null }
  getUser(id) { return this.data.users[id] || null }
  getUserByEmail(email) {
    return Object.values(this.data.users).find(u => u.email === email) || null
  }
  getAccounts(businessId) {
    return Object.values(this.data.accounts).filter(a => a.business_id === businessId)
  }
  getAccount(id) { return this.data.accounts[id] || null }
  getTransactions(accountId) {
    return Object.values(this.data.transactions).filter(t => t.account_id === accountId)
  }
  getAllTransactionsForBusiness(businessId) {
    const accountIds = new Set(
      Object.values(this.data.accounts)
        .filter(a => a.business_id === businessId)
        .map(a => a.id)
    )
    return Object.values(this.data.transactions).filter(t => accountIds.has(t.account_id))
  }

  addTransaction(txn) {
    const id = txn.id || `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.data.transactions[id] = { ...txn, id, created_at: new Date().toISOString() }
    this.save()
    return this.data.transactions[id]
  }

  getVatReturns(businessId) {
    return Object.values(this.data.vat_returns).filter(v => v.business_id === businessId)
  }
  addVatReturn(vr) {
    const id = vr.id || `vat-${Date.now()}`
    this.data.vat_returns[id] = { ...vr, id }
    this.save()
    return this.data.vat_returns[id]
  }

  getTaxRecords(businessId) {
    return Object.values(this.data.tax_records).filter(t => t.business_id === businessId)
  }
  addTaxRecord(tr) {
    const id = tr.id || `tax-${Date.now()}`
    this.data.tax_records[id] = { ...tr, id }
    this.save()
    return this.data.tax_records[id]
  }

  getFinancialStatements(businessId) {
    return Object.values(this.data.financial_statements).filter(f => f.business_id === businessId)
  }
  addFinancialStatement(fs) {
    const id = fs.id || `fs-${Date.now()}`
    this.data.financial_statements[id] = { ...fs, id }
    this.save()
    return this.data.financial_statements[id]
  }

  getInvoices(businessId) {
    return Object.values(this.data.invoices).filter(i => i.business_id === businessId)
  }

  getProgrammableRules(businessId) {
    return Object.values(this.data.programmable_rules).filter(r => r.business_id === businessId)
  }
  addProgrammableRule(rule) {
    const id = rule.id || `rule-${Date.now()}`
    this.data.programmable_rules[id] = { ...rule, id, created_at: new Date().toISOString() }
    this.save()
    return this.data.programmable_rules[id]
  }
  updateProgrammableRule(id, updates) {
    if (this.data.programmable_rules[id]) {
      this.data.programmable_rules[id] = { ...this.data.programmable_rules[id], ...updates }
      this.save()
      return this.data.programmable_rules[id]
    }
    return null
  }
  deleteProgrammableRule(id) {
    delete this.data.programmable_rules[id]
    this.save()
  }

  getApprovalWorkflows(businessId) {
    return Object.values(this.data.approval_workflows).filter(a => {
      const rule = this.data.programmable_rules[a.rule_id]
      return rule && rule.business_id === businessId
    })
  }
  addApprovalWorkflow(wf) {
    const id = wf.id || `wf-${Date.now()}`
    this.data.approval_workflows[id] = { ...wf, id, created_at: new Date().toISOString() }
    this.save()
    return this.data.approval_workflows[id]
  }
  updateApprovalWorkflow(id, updates) {
    if (this.data.approval_workflows[id]) {
      this.data.approval_workflows[id] = { ...this.data.approval_workflows[id], ...updates }
      this.save()
      return this.data.approval_workflows[id]
    }
    return null
  }

  getAuditLogs(businessId, filters = {}) {
    let logs = Object.values(this.data.audit_logs)
      .filter(l => {
        const rule = this.data.programmable_rules[l.rule_id]
        return rule && rule.business_id === businessId
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (filters.entity_type) logs = logs.filter(l => l.entity_type === filters.entity_type)
    if (filters.action) logs = logs.filter(l => l.action === filters.action)
    if (filters.limit) logs = logs.slice(0, filters.limit)
    return logs
  }
  addAuditLog(log) {
    const id = log.id || `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.data.audit_logs[id] = { ...log, id, created_at: new Date().toISOString() }
    this.save()
    return this.data.audit_logs[id]
  }

  getDrrtState() { return this.clone(this.data.drrt_state) }
  updateDrrtState(updates) {
    this.data.drrt_state = { ...this.data.drrt_state, ...updates }
    this.save()
    return this.data.drrt_state
  }

  getInvestecTokens() { return this.data.investec_tokens }
  setInvestecTokens(tokens) {
    this.data.investec_tokens = tokens
    this.save()
  }

  seedSampleAccounts() {
    if (Object.keys(this.data.accounts).length > 0) return
    const now = new Date().toISOString()
    this.data.accounts['acct-1'] = {
      id: 'acct-1',
      business_id: 'biz-1',
      account_number: '92000000001',
      account_name: 'Agrograte Primary Account',
      account_type: 'current',
      current_balance: 520000.0,
      available_balance: 500000.0,
      reserved_tax_funds: 60000.0,
      is_active: true,
      currency: 'ZAR',
      created_at: now,
    }
    this.save()
  }

  seedSampleTransactions() {
    if (Object.keys(this.data.transactions).length > 0) return
    if (Object.keys(this.data.accounts).length === 0) this.seedSampleAccounts()
    const now = new Date()
    const categories = ['revenue', 'expenses', 'tax', 'compliance', 'banking']
    const descriptions = {
      revenue: ['Client Payment - AgriGroup', 'Product Sale - Wholesale', 'Service Fee - Consulting', 'Recurring Subscription', 'Commission Received'],
      expenses: ['Office Rent - Waterfront', 'AWS Cloud Infrastructure', 'Employee Salaries', 'Marketing - Digital Ads', 'Supplier Payment - TechCorp'],
      tax: ['SARS VAT Refund', 'PAYE Payment', 'Provisional Tax Payment', 'VAT Output'],
      compliance: ['CIPC Annual Fee', 'SARS Penalty', 'Audit Service Fee', 'Compliance Software'],
      banking: ['Interest Earned', 'Bank Charges', 'Forex Conversion', 'Transfer to Savings'],
    }
    const txnTypes = ['credit', 'debit']
    const statuses = ['posted', 'pending']
    const amounts = {
      revenue: [450000, 182500, 95000, 42000, 28000],
      expenses: [45000, 12847, 156000, 35000, 82000],
      tax: [28430, 45000, 120000, 32000],
      compliance: [1500, 5000, 28000, 12000],
      banking: [3200, 850, 15000, 50000],
    }

    for (let i = 0; i < 90; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const cat = categories[Math.floor(Math.random() * categories.length)]
      const desc = descriptions[cat][Math.floor(Math.random() * descriptions[cat].length)]
      const isCredit = cat === 'revenue' || (cat === 'tax' && Math.random() > 0.6)
      const amt = amounts[cat][Math.floor(Math.random() * amounts[cat].length)]
      const acctKeys = Object.keys(this.data.accounts)
      const acctId = acctKeys[Math.floor(Math.random() * acctKeys.length)]

      this.data.transactions[`seed-txn-${i}`] = {
        id: `seed-txn-${i}`,
        account_id: acctId,
        amount: isCredit ? amt : -amt,
        balance: 0,
        description: desc,
        category: cat,
        transaction_type: isCredit ? 'credit' : 'debit',
        status: Math.random() > 0.1 ? 'posted' : 'pending',
        posted_at: date.toISOString(),
        created_at: date.toISOString(),
        merchant: { name: desc },
      }
    }
    this.save()
    console.log(`[DataStore] Seeded ${Object.keys(this.data.transactions).length} sample transactions`)
  }

  seedSampleInvoices() {
    if (Object.keys(this.data.invoices).length > 0) return
    const statuses = ['paid', 'pending', 'overdue']
    for (let i = 0; i < 20; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i * 5)
      const total = Math.round((5000 + Math.random() * 95000) * 100) / 100
      const vat = Math.round(total * 0.15 * 100) / 100
      this.data.invoices[`inv-${i}`] = {
        id: `inv-${i}`,
        business_id: 'biz-1',
        invoice_number: `INV-2025-${String(i + 1).padStart(4, '0')}`,
        customer_id: `cust-${i % 5}`,
        total,
        vat_amount: vat,
        status: statuses[i % 3],
        issued_at: date.toISOString(),
        due_date: new Date(date.getTime() + 30 * 86400000).toISOString(),
        paid_at: i % 3 === 0 ? date.toISOString() : null,
      }
    }
    this.save()
  }
}

let instance = null
function getDataStore() {
  if (!instance) {
    instance = new DataStore()
  }
  return instance
}

module.exports = { getDataStore, DataStore }
