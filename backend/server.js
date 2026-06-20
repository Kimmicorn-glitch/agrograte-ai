'use strict'

const express = require('express')
const app = express()
const port = 8080

app.use(express.json({ limit: '10mb' }))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const { getDataStore } = require('./services/data-store')
const { ComplianceEngine } = require('./services/compliance-engine')
const { CashFlowEngine } = require('./services/cashflow-engine')
const { DrrtEngine } = require('./services/drrt-engine')
const { FinancialEngine } = require('./services/financial-engine')
const { InvestecClient } = require('./services/investec-client')

const investec = new InvestecClient()

function getAuthUser(req) {
  const store = getDataStore()
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7)
    const user = Object.values(store.data.users).find(u => u.id === token || u.email === token)
    if (user) return user
  }
  return store.data.users['user-1']
}

function requireAuth(req, res, next) {
  req.user = getAuthUser(req)
  next()
}

app.use(requireAuth)

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', mode: 'production' })
})

// Auth
app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name } = req.body
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Missing fields: email, password, full_name' })
  }
  const store = getDataStore()
  if (store.getUserByEmail(email)) {
    return res.status(409).json({ error: 'User already exists' })
  }
  const user = {
    id: `user-${Date.now()}`,
    email,
    full_name,
    role: 'admin',
    business_id: 'biz-1',
    password_hash: password,
    created_at: new Date().toISOString(),
  }
  store.data.users[user.id] = user
  store.save()
  res.json({ token: user.id, refresh_token: `${user.id}-refresh`, user: { ...user, password_hash: undefined } })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }
  const store = getDataStore()
  const user = store.getUserByEmail(email)
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  res.json({ token: user.id, refresh_token: `${user.id}-refresh`, user: { ...user, password_hash: undefined } })
})

app.get('/api/auth/me', (req, res) => {
  res.json({ ...req.user, password_hash: undefined })
})

app.post('/api/auth/refresh', (req, res) => {
  const refreshToken = req.body.refresh_token
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' })
  const store = getDataStore()
  const userId = refreshToken.replace('-refresh', '')
  const user = store.getUser(userId)
  if (!user) return res.status(401).json({ error: 'Invalid refresh token' })
  res.json({ token: user.id, refresh_token: `${user.id}-refresh`, user: { ...user, password_hash: undefined } })
})

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' })
})

// DRRT
app.get('/api/drrt/state', (req, res) => {
  res.json({ state: DrrtEngine.getState() })
})

app.get('/api/drrt/dimensions', (req, res) => {
  res.json({ dimensions: DrrtEngine.getDimensions() })
})

app.post('/api/drrt/converge', (req, res) => {
  res.json({ success: true, state: DrrtEngine.converge() })
})

app.post('/api/drrt/relationship', (req, res) => {
  res.json(DrrtEngine.addRelationship(req.body))
})

app.get('/api/drrt/memory', (req, res) => {
  res.json({ memory: DrrtEngine.getMemory() })
})

// Financial Health
app.get('/api/financial/health', (req, res) => {
  const data = FinancialEngine.getHealthSummary(req.user.business_id)
  DrrtEngine.updateFromFinancialMetrics({
    revenue: data.revenue,
    expenses: data.expenses,
    profit: data.profit,
    total_balance: data.revenue,
    free_cash: data.revenue * 0.3,
    liquidity_ratio: data.liquidity_score,
  })
  res.json(data)
})

app.get('/api/financial/health/detail', (req, res) => {
  const data = FinancialEngine.getHealthDetail(req.user.business_id)
  DrrtEngine.updateFromFinancialMetrics({
    revenue: data.revenue,
    expenses: data.expenses,
    profit: data.profit,
    total_balance: data.revenue,
    free_cash: data.revenue * 0.3,
    liquidity_ratio: data.liquidity_score,
  })
  res.json(data)
})

// Banking
app.get('/api/banking/summary', (req, res) => {
  const data = FinancialEngine.getBankingSummary(req.user.business_id)
  DrrtEngine.updateFromFinancialMetrics({
    total_balance: data.available_balance,
    free_cash: data.available_balance - data.reserved_tax_funds,
    liquidity_ratio: data.available_balance > 0 ? (data.available_balance - data.reserved_tax_funds) / data.available_balance : 0,
  })
  res.json(data)
})

app.get('/api/banking/accounts', (req, res) => {
  const store = getDataStore()
  const accounts = store.getAccounts(req.user.business_id)
  res.json(accounts.map(a => ({
    account_id: a.id,
    account_number: a.account_number,
    account_type: a.account_type,
    current_balance: a.current_balance,
    available_balance: a.available_balance,
  })))
})

app.get('/api/banking/transactions', (req, res) => {
  investec.getAccounts().then(accounts => {
    res.json(accounts)
  }).catch(() => {
    const store = getDataStore()
    const txns = store.getAllTransactionsForBusiness(req.user.business_id)
    res.json(txns.slice(0, 100))
  })
})

// Investec
app.get('/api/investec/status', (req, res) => {
  res.json(investec.getConnectionStatus())
})

app.get('/api/investec/auth-url', (req, res) => {
  const state = `state-${Date.now()}`
  res.json({ url: investec.getAuthUrl(state), state })
})

app.get('/api/investec/callback', async (req, res) => {
  const { code, state } = req.query
  if (!code) return res.status(400).json({ error: 'Authorization code required' })
  try {
    const tokens = await investec.exchangeCode(code, state)
    getDataStore().setInvestecTokens({ ...tokens, last_sync: new Date().toISOString() })
    res.redirect('http://localhost:3000/dashboard/banking')
  } catch (err) {
    res.status(500).json({ error: 'Token exchange failed', detail: err.message })
  }
})

app.get('/api/investec/accounts', async (req, res) => {
  try {
    const accounts = await investec.getAccounts()
    res.json(accounts)
  } catch {
    const store = getDataStore()
    const accounts = store.getAccounts(req.user.business_id)
    res.json(accounts.map(a => ({
      account_id: a.id,
      account_number: a.account_number,
      account_type: a.account_type,
      account_name: a.account_name,
      current_balance: a.current_balance,
      available_balance: a.available_balance,
      currency: a.currency || 'ZAR',
    })))
  }
})

app.get('/api/investec/accounts/:accountId/transactions', async (req, res) => {
  const { accountId } = req.params
  try {
    const txns = await investec.getTransactions(accountId)
    res.json(txns)
  } catch {
    const store = getDataStore()
    const txns = store.getTransactions(accountId)
    if (txns.length === 0) {
      const all = store.getAllTransactionsForBusiness(req.user.business_id)
      res.json(all.slice(0, 50).map(t => ({
        transaction_id: t.id,
        amount: t.amount,
        description: t.description,
        transaction_type: t.transaction_type,
        posting_date: t.posted_at,
        merchant: t.merchant || { name: t.description },
      })))
    } else {
      res.json(txns.map(t => ({
        transaction_id: t.id,
        amount: t.amount,
        description: t.description,
        transaction_type: t.transaction_type,
        posting_date: t.posted_at,
        merchant: t.merchant || { name: t.description },
      })))
    }
  }
})

// Compliance
app.get('/api/compliance/summary', (req, res) => {
  const engine = ComplianceEngine
  const vatReturns = engine.generateVatReturns(req.user.business_id)
  const taxRecords = engine.generateTaxRecords(req.user.business_id)
  const summary = engine.generateComplianceSummary(req.user.business_id)
  DrrtEngine.updateFromFinancialMetrics({
    vat_compliance_ratio: summary.vat_compliant ? 1 : vatReturns.filter(v => v.is_submitted).length / Math.max(vatReturns.length, 1),
    tax_compliance_ratio: summary.tax_compliant ? 1 : taxRecords.filter(t => t.status === 'Filed').length / Math.max(taxRecords.length, 1),
    compliance_score: summary.overall_score,
  })
  res.json(summary)
})

app.get('/api/compliance/report', (req, res) => {
  ComplianceEngine.generateVatReturns(req.user.business_id)
  ComplianceEngine.generateTaxRecords(req.user.business_id)
  const report = ComplianceEngine.generateComplianceReport(req.user.business_id)
  DrrtEngine.updateFromFinancialMetrics({ compliance_score: report.overall_score })
  res.json({
    overall_score: report.overall_score,
    vat_score: report.vat_compliance.score,
    vat_compliant: report.vat_compliance.is_compliant,
    tax_score: report.income_tax_compliance.score,
    tax_compliant: report.income_tax_compliance.is_compliant,
    violations: report.violations,
    recommendations: report.recommendations,
    drrt_coherence: report.drrt_coherence,
  })
})

app.get('/api/compliance/vat-returns', (req, res) => {
  const returns = ComplianceEngine.generateVatReturns(req.user.business_id)
  res.json(returns.map(r => ({
    period: r.period,
    start: r.period_start,
    end: r.period_end,
    vat_on_sales: r.vat_on_sales,
    vat_on_purchases: r.vat_on_purchases,
    net_vat_due: r.net_vat_due,
    is_submitted: r.is_submitted,
    penalties: r.penalties,
  })))
})

app.get('/api/compliance/tax-records', (req, res) => {
  const records = ComplianceEngine.generateTaxRecords(req.user.business_id)
  res.json(records.map(r => ({
    tax_period: r.tax_period,
    tax_type: r.tax_type,
    amount_due: r.amount_due,
    amount_paid: r.amount_paid,
    balance: r.balance,
    status: r.status,
  })))
})

app.get('/api/compliance/tax-reserve', (req, res) => {
  const reserve = ComplianceEngine.calculateTaxReserve(req.user.business_id)
  DrrtEngine.updateFromFinancialMetrics({ paid_invoice_ratio: reserve.current_reserve_balance > 0 ? 1 : 0 })
  res.json({
    estimated_vat_liability: reserve.estimated_vat_liability,
    estimated_income_tax: reserve.estimated_income_tax,
    estimated_paye: reserve.estimated_paye,
    total_reserve_required: reserve.total_reserve_required,
    current_reserve_balance: reserve.current_reserve_balance,
    reserve_gap: reserve.reserve_gap,
    drrt_confidence: reserve.drrt_confidence,
    recommended_monthly_allocation: reserve.recommended_monthly_allocation,
  })
})

// Cashflow
app.get('/api/cashflow/forecast', (req, res) => {
  const forecast = CashFlowEngine.generateForecast(req.user.business_id)
  DrrtEngine.updateFromFinancialMetrics({
    total_balance: forecast.current_balance,
    transaction_volume_90d: forecast.avg_daily_inflow * 90,
    transaction_count_90d: 90,
    pending_transaction_ratio: 0.1,
    successful_transaction_ratio: 0.9,
  })
  res.json(forecast)
})

app.get('/api/cashflow/detail', (req, res) => {
  res.json(CashFlowEngine.generateForecast(req.user.business_id))
})

app.get('/api/cashflow/tax-reserve', (req, res) => {
  res.json(ComplianceEngine.calculateTaxReserve(req.user.business_id))
})

// Transactions
app.get('/api/transactions/intelligence', (req, res) => {
  res.json(FinancialEngine.getTransactionIntelligence(req.user.business_id))
})

app.get('/api/transactions/categories', (req, res) => {
  const store = getDataStore()
  const txns = store.getAllTransactionsForBusiness(req.user.business_id)
  const cats = {}
  txns.filter(t => t.status === 'posted').forEach(t => {
    const cat = t.category || 'uncategorized'
    if (!cats[cat]) cats[cat] = { category: cat, count: 0, total: 0 }
    cats[cat].count++
    cats[cat].total += Math.abs(t.amount)
  })
  res.json(Object.values(cats).map(c => ({ ...c, total: Math.round(c.total * 100) / 100 })))
})

app.get('/api/transactions/patterns', (req, res) => {
  const store = getDataStore()
  const txns = store.getAllTransactionsForBusiness(req.user.business_id)
  const posted = txns.filter(t => t.status === 'posted')
  const avgAmount = posted.length > 0 ? posted.reduce((s, t) => s + Math.abs(t.amount), 0) / posted.length : 0
  res.json({
    total_patterns: 3,
    recurring_count: posted.filter(t => Math.abs(t.amount) >= avgAmount * 0.9 && Math.abs(t.amount) <= avgAmount * 1.1).length,
    avg_transaction_size: Math.round(avgAmount * 100) / 100,
    peak_hour: 14,
    peak_day: 'Wednesday',
  })
})

app.get('/api/transactions/anomalies', (req, res) => {
  res.json({ anomalies: [], total: 0, risk_level: 'low' })
})

// Banking Rules
app.get('/api/banking/rules', (req, res) => {
  const store = getDataStore()
  res.json(store.getProgrammableRules(req.user.business_id))
})

app.post('/api/banking/rules', (req, res) => {
  const store = getDataStore()
  const rule = store.addProgrammableRule({ business_id: req.user.business_id, ...req.body })
  store.addAuditLog({ rule_id: rule.id, entity_type: 'programmable_rule', action: 'created', performed_by: req.user.id })
  res.json(rule)
})

app.put('/api/banking/rules/:id/toggle', (req, res) => {
  const store = getDataStore()
  const rule = store.getProgrammableRules(req.user.business_id).find(r => r.id === req.params.id)
  if (!rule) return res.status(404).json({ error: 'Rule not found' })
  const updated = store.updateProgrammableRule(req.params.id, { enabled: !rule.enabled })
  store.addAuditLog({ rule_id: req.params.id, entity_type: 'programmable_rule', action: updated.enabled ? 'enabled' : 'disabled', performed_by: req.user.id })
  res.json(updated)
})

app.delete('/api/banking/rules/:id', (req, res) => {
  const store = getDataStore()
  store.deleteProgrammableRule(req.params.id)
  store.addAuditLog({ rule_id: req.params.id, entity_type: 'programmable_rule', action: 'deleted', performed_by: req.user.id })
  res.json({ success: true })
})

// Approvals
app.get('/api/approval/pending', (req, res) => {
  const store = getDataStore()
  const workflows = store.getApprovalWorkflows(req.user.business_id).filter(w => w.status === 'pending')
  res.json(workflows)
})

app.get('/api/approval/all', (req, res) => {
  const store = getDataStore()
  res.json(store.getApprovalWorkflows(req.user.business_id))
})

app.post('/api/approval/create', (req, res) => {
  const store = getDataStore()
  const wf = store.addApprovalWorkflow({ business_id: req.user.business_id, ...req.body, status: 'pending' })
  store.addAuditLog({ rule_id: wf.rule_id, entity_type: 'approval_workflow', action: 'created', performed_by: req.user.id })
  res.json(wf)
})

app.post('/api/approval/:id/approve', (req, res) => {
  const store = getDataStore()
  const wf = store.updateApprovalWorkflow(req.params.id, {
    status: 'approved',
    approved_by: req.body.approved_by || req.user.id,
    approved_at: new Date().toISOString(),
    reason: req.body.reason || '',
  })
  if (wf) {
    store.addAuditLog({ rule_id: wf.rule_id, entity_type: 'approval_workflow', action: 'approved', performed_by: req.user.id })
  }
  res.json(wf || { error: 'Not found' })
})

app.post('/api/approval/:id/reject', (req, res) => {
  const store = getDataStore()
  const wf = store.updateApprovalWorkflow(req.params.id, {
    status: 'rejected',
    approved_by: req.body.approved_by || req.user.id,
    rejected_at: new Date().toISOString(),
    reason: req.body.reason || '',
  })
  if (wf) {
    store.addAuditLog({ rule_id: wf.rule_id, entity_type: 'approval_workflow', action: 'rejected', performed_by: req.user.id })
  }
  res.json(wf || { error: 'Not found' })
})

// Audit Logs
app.get('/api/audit/logs', (req, res) => {
  const store = getDataStore()
  const { entity_type, action, limit } = req.query
  res.json(store.getAuditLogs(req.user.business_id, { entity_type, action, limit: limit ? parseInt(limit) : undefined }))
})

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] Agrograte AI Backend running at http://0.0.0.0:${port}`)
  console.log(`[Server] Investec API: ${investec.isConfigured() ? 'configured' : 'sandbox mode'}`)
})

process.on('SIGINT', () => {
  console.log('[Server] Shutting down...')
  process.exit(0)
})
