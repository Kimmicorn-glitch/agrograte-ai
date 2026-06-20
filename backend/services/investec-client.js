'use strict'

const https = require('https')
const { getDataStore } = require('./data-store')

const INVESTEC_AUTH_URL = 'https://openapi.investec.com/identity/v2/oauth2/authorize'
const INVESTEC_TOKEN_URL = 'https://openapi.investec.com/identity/v2/oauth2/token'
const INVESTEC_API_BASE = 'https://openapi.investec.com'

class InvestecClient {
  constructor() {
    this.clientId = process.env.INVESTEC_CLIENT_ID || ''
    this.clientSecret = process.env.INVESTEC_CLIENT_SECRET || ''
    this.apiKey = process.env.INVESTEC_API_KEY || ''
    this.redirectUri = process.env.INVESTEC_REDIRECT_URI || 'http://localhost:8080/api/investec/callback'
    this.authenticated = false
  }

  isConfigured() {
    return !!(this.clientId && this.clientSecret && this.clientId !== 'your_client_id')
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
      return `${INVESTEC_AUTH_URL}?${params.toString()}`
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
      scope: 'accounts transactions',
    })
    return `${INVESTEC_AUTH_URL}?${params.toString()}`
  }

  async exchangeCode(code, state) {
    if (!this.isConfigured()) {
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
    return this._post(INVESTEC_TOKEN_URL, body.toString(), {
      'Content-Type': 'application/x-www-form-urlencoded',
    })
  }

  async refreshAccessToken(refreshToken) {
    if (!this.isConfigured()) {
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
    return this._post(INVESTEC_TOKEN_URL, body.toString(), {
      'Content-Type': 'application/x-www-form-urlencoded',
    })
  }

  async getAccounts() {
    if (!this.isConfigured()) {
      return this._sandboxAccounts()
    }
    const tokens = getDataStore().getInvestecTokens()
    if (!tokens) return []
    const data = await this._get(`${INVESTEC_API_BASE}/za/pb/v1/accounts`, {
      Authorization: `Bearer ${tokens.access_token}`,
    })
    return data.data?.accounts || []
  }

  async getTransactions(accountId, fromDate, toDate) {
    if (!this.isConfigured()) {
      return this._sandboxTransactions(accountId)
    }
    const tokens = getDataStore().getInvestecTokens()
    if (!tokens) return []
    let url = `${INVESTEC_API_BASE}/za/pb/v1/accounts/${accountId}/transactions`
    const params = new URLSearchParams()
    if (fromDate) params.set('fromDate', fromDate)
    if (toDate) params.set('toDate', toDate)
    const qs = params.toString()
    if (qs) url += `?${qs}`
    const data = await this._get(url, {
      Authorization: `Bearer ${tokens.access_token}`,
    })
    return data.data?.transactions || []
  }

  getConnectionStatus() {
    const tokens = getDataStore().getInvestecTokens()
    const accounts = getDataStore().getAccounts('biz-1')
    return {
      connected: !!(tokens && tokens.access_token) || this.isConfigured(),
      accounts_linked: accounts.length,
      last_sync: tokens?.last_sync || null,
    }
  }

  _sandboxAccounts() {
    const store = getDataStore()
    const accounts = store.getAccounts('biz-1')
    return accounts.map(a => ({
      accountId: a.id,
      accountNumber: a.account_number,
      accountName: a.account_name,
      accountType: a.account_type,
      currentBalance: a.current_balance,
      availableBalance: a.available_balance,
      currency: a.currency || 'ZAR',
    }))
  }

  _sandboxTransactions(accountId) {
    const store = getDataStore()
    const transactions = store.getTransactions(accountId)
    if (transactions.length === 0) {
      const allTxns = store.getAllTransactionsForBusiness('biz-1')
      return allTxns.slice(0, 50).map(t => ({
        transactionId: t.id,
        amount: t.amount,
        description: t.description,
        transactionType: t.transaction_type,
        transactionDate: t.posted_at,
        merchant: t.merchant || { name: t.description },
        status: t.status,
      }))
    }
    return transactions.slice(0, 50).map(t => ({
      transactionId: t.id,
      amount: t.amount,
      description: t.description,
      transactionType: t.transaction_type,
      transactionDate: t.posted_at,
      merchant: t.merchant || { name: t.description },
      status: t.status,
    }))
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
