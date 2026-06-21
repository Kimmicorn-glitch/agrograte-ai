'use strict'

const https = require('https')
const { getDataStore } = require('./data-store')

const INVESTEC_PROD_AUTH_URL = 'https://openapi.investec.com/identity/v2/oauth2/authorize'
const INVESTEC_PROD_TOKEN_URL = 'https://openapi.investec.com/identity/v2/oauth2/token'
const INVESTEC_PROD_API_BASE = 'https://openapi.investec.com'

const INVESTEC_SANDBOX_AUTH_URL = 'https://openapisandbox.investec.com/identity/v2/oauth2/authorize'
const INVESTEC_SANDBOX_TOKEN_URL = 'https://openapisandbox.investec.com/identity/v2/oauth2/token'
const INVESTEC_SANDBOX_API_BASE = 'https://openapisandbox.investec.com'

class InvestecClient {
  constructor() {
    this.clientId = process.env.INVESTEC_CLIENT_ID || ''
    this.clientSecret = process.env.INVESTEC_CLIENT_SECRET || ''
    this.apiKey = process.env.INVESTEC_API_KEY || ''
    this.redirectUri = process.env.INVESTEC_REDIRECT_URI || 'http://localhost:8080/api/investec/callback'
    this.useSandbox = process.env.INVESTEC_USE_SANDBOX === 'true'
    this.authenticated = false
    this.accessToken = null
    this.tokenExpiry = 0
  }

  get authUrl() { return this.useSandbox ? INVESTEC_SANDBOX_AUTH_URL : INVESTEC_PROD_AUTH_URL }
  get tokenUrl() { return this.useSandbox ? INVESTEC_SANDBOX_TOKEN_URL : INVESTEC_PROD_TOKEN_URL }
  get apiBase() { return this.useSandbox ? INVESTEC_SANDBOX_API_BASE : INVESTEC_PROD_API_BASE }

  isConfigured() {
    return !!(this.clientId && this.clientSecret && this.clientId !== 'your_client_id')
  }

  getCommonHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey
    }
    return headers
  }

  async authenticate() {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken
    if (!this.isConfigured()) return null
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })
    try {
      const result = await this._post(this.tokenUrl, body.toString(), {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
      })
      if (result.access_token) {
        this.accessToken = result.access_token
        this.tokenExpiry = Date.now() + (result.expires_in || 3600) * 1000
        this.authenticated = true
        const store = getDataStore()
        store.setInvestecTokens({ access_token: this.accessToken, token_type: result.token_type || 'Bearer', expires_in: result.expires_in || 3600, last_sync: new Date().toISOString() })
        console.log('[InvestecClient] Authenticated successfully via client_credentials')
      }
      return this.accessToken
    } catch (err) {
      console.error('[InvestecClient] Authentication failed:', err.message)
      this.authenticated = false
      return null
    }
  }

  getAuthUrl(state) {
    if (!this.isConfigured()) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: 'sandbox',
      redirect_uri: this.redirectUri,
      state: state,
      scope: 'accounts transactions',
    })
    return `${this.authUrl}?${params.toString()}`
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: 'accounts transactions',
    })
    return `${this.authUrl}?${params.toString()}`
  }

  async exchangeCode(code, state) {
    if (!this.isConfigured() || this.useSandbox) {
      return {
        access_token: 'sandbox-token',
        refresh_token: 'sandbox-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      }
    }
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    if (this.apiKey) headers['x-api-key'] = this.apiKey
    return this._post(this.tokenUrl, body.toString(), headers)
  }

  async refreshAccessToken(refreshToken) {
    if (!this.isConfigured() || this.useSandbox) {
      return {
        access_token: 'sandbox-token',
        refresh_token: 'sandbox-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      }
    }
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    if (this.apiKey) headers['x-api-key'] = this.apiKey
    return this._post(this.tokenUrl, body.toString(), headers)
  }

  isSandbox() {
    return this.useSandbox || !this.isConfigured()
  }

  async getAccounts() {
    const token = await this.authenticate()
    if (!token && this.isSandbox()) {
      const sampleAccounts = [
        {
          account_id: 'sandbox-1',
          account_number: '92000000001',
          account_type: 'current',
          account_name: 'Sandbox Primary Account',
          current_balance: 250000,
          available_balance: 230000,
          currency: 'ZAR',
        },
      ]
      const store = getDataStore()
      for (const account of sampleAccounts) {
        const id = account.account_id
        if (!store.getAccount(id)) {
          store.data.accounts[id] = {
            id,
            business_id: 'biz-1',
            account_number: account.account_number,
            account_name: account.account_name,
            account_type: account.account_type,
            current_balance: Number(account.current_balance || 0),
            available_balance: Number(account.available_balance || 0),
            reserved_tax_funds: 0,
            is_active: true,
            currency: account.currency || 'ZAR',
            created_at: new Date().toISOString(),
          }
        }
      }
      store.save()
      const tokens = getDataStore().getInvestecTokens()
      store.setInvestecTokens({ ...(tokens || {}), last_sync: new Date().toISOString() })
      return sampleAccounts
    }
    if (!token) return []
    try {
      const data = await this._get(`${this.apiBase}/za/pb/v1/accounts`, {
        Authorization: `Bearer ${token}`,
        ...this.getCommonHeaders(),
      })
      const accounts = data.data?.accounts || []
      const store = getDataStore()
      for (const account of accounts) {
        const id = account.account_id || account.accountId || account.id
        if (!id) continue
        store.data.accounts[id] = {
          id,
          business_id: 'biz-1',
          account_number: account.account_number || account.accountNumber || '',
          account_name: account.account_name || account.accountName || '',
          account_type: account.account_type || account.accountType || 'current',
          current_balance: Number(account.current_balance ?? account.currentBalance ?? 0),
          available_balance: Number(account.available_balance ?? account.availableBalance ?? 0),
          reserved_tax_funds: Number(account.reserved_tax_funds ?? 0),
          is_active: true,
          currency: account.currency || 'ZAR',
          created_at: new Date().toISOString(),
        }
      }
      store.save()
      const tokens = getDataStore().getInvestecTokens()
      store.setInvestecTokens({ ...(tokens || {}), last_sync: new Date().toISOString() })
      return accounts
    } catch (err) {
      console.warn('[InvestecClient] Failed to fetch accounts from API, using seed data:', err.message)
      return []
    }
  }

  async getTransactions(accountId, fromDate, toDate) {
    const token = await this.authenticate()
    if (!token && this.isSandbox()) {
      const store = getDataStore()
      const existing = store.getTransactions(accountId)
      if (existing.length > 0) {
        return existing
      }
      const descriptions = [
        'Sandbox Deposit',
        'Sandbox Payroll',
        'Sandbox Supplier Payment',
        'Sandbox VAT Payment',
        'Sandbox Fee',
      ]
      const txns = []
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const isCredit = i % 2 === 0
        const amount = Math.round((2500 + Math.random() * 15000) * 100) / 100
        const txn = {
          id: `sandbox-${accountId}-${i}`,
          account_id: accountId,
          amount: isCredit ? amount : -amount,
          balance: 0,
          description: descriptions[i % descriptions.length],
          category: isCredit ? 'revenue' : 'expenses',
          transaction_type: isCredit ? 'credit' : 'debit',
          status: 'posted',
          posted_at: date.toISOString(),
          created_at: date.toISOString(),
          merchant: { name: descriptions[i % descriptions.length] },
        }
        store.data.transactions[txn.id] = txn
        txns.push(txn)
      }
      store.save()
      const tokens = getDataStore().getInvestecTokens()
      store.setInvestecTokens({ ...(tokens || {}), last_sync: new Date().toISOString() })
      return txns
    }
    if (!token || !accountId) return []
    try {
      let url = `${this.apiBase}/za/pb/v1/accounts/${accountId}/transactions`
      const params = new URLSearchParams()
      if (fromDate) params.set('fromDate', fromDate)
      if (toDate) params.set('toDate', toDate)
      const qs = params.toString()
      if (qs) url += `?${qs}`
      const data = await this._get(url, {
        Authorization: `Bearer ${token}`,
        ...this.getCommonHeaders(),
      })
      const txns = data.data?.transactions || []
      const store = getDataStore()
      for (const txn of txns) {
        const id = txn.transaction_id || txn.transactionId || txn.id
        if (!id) continue
        store.data.transactions[id] = {
          id,
          account_id: accountId,
          amount: Number(txn.amount ?? 0),
          balance: Number(txn.balance ?? 0),
          description: txn.description || txn.merchant?.name || 'Investec transaction',
          category: txn.category || 'banking',
          transaction_type: txn.transaction_type || txn.transactionType || (Number(txn.amount ?? 0) >= 0 ? 'credit' : 'debit'),
          status: txn.status || 'posted',
          posted_at: txn.posting_date || txn.transactionDate || txn.posted_at || new Date().toISOString(),
          created_at: new Date().toISOString(),
          merchant: txn.merchant || { name: txn.description || 'Investec transaction' },
        }
      }
      store.save()
      const tokens = getDataStore().getInvestecTokens()
      store.setInvestecTokens({ ...(tokens || {}), last_sync: new Date().toISOString() })
      return txns
    } catch (err) {
      console.warn('[InvestecClient] Failed to fetch transactions from API, using seed data:', err.message)
      return []
    }
  }

  getConnectionStatus() {
    const tokens = getDataStore().getInvestecTokens()
    const connected = this.authenticated || !!(tokens?.access_token && this.isSandbox())
    const accounts = connected ? getDataStore().getAccounts('biz-1') : []
    return {
      connected,
      accounts_linked: connected ? accounts.length : 0,
      last_sync: tokens?.last_sync || null,
    }
  }

  _get(url, headers) {
    return new Promise((resolve, reject) => {
      const options = { method: 'GET', headers: { ...headers } }
      const req = https.request(url, options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try { resolve(JSON.parse(data)) }
          catch { reject(new Error('Invalid JSON response')) }
        })
      })
      req.on('error', reject)
      req.end()
    })
  }

  _post(url, body, headers) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...headers,
        },
      }
      const req = https.request(url, options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try { resolve(JSON.parse(data)) }
          catch { reject(new Error('Invalid JSON response')) }
        })
      })
      req.on('error', reject)
      req.write(body)
      req.end()
    })
  }
}

module.exports = { InvestecClient }
