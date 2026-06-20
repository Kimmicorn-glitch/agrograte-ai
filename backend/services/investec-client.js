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
    const tokens = getDataStore().getInvestecTokens()
    if (!this.isConfigured() || !tokens?.access_token) return []
    const data = await this._get(`${INVESTEC_API_BASE}/za/pb/v1/accounts`, {
      Authorization: `Bearer ${tokens.access_token}`,
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
    store.setInvestecTokens({ ...(tokens || {}), last_sync: new Date().toISOString() })
    return accounts
  }

  async getTransactions(accountId, fromDate, toDate) {
    const tokens = getDataStore().getInvestecTokens()
    if (!this.isConfigured() || !tokens?.access_token || !accountId) return []
    let url = `${INVESTEC_API_BASE}/za/pb/v1/accounts/${accountId}/transactions`
    const params = new URLSearchParams()
    if (fromDate) params.set('fromDate', fromDate)
    if (toDate) params.set('toDate', toDate)
    const qs = params.toString()
    if (qs) url += `?${qs}`
    const data = await this._get(url, {
      Authorization: `Bearer ${tokens.access_token}`,
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
    store.setInvestecTokens({ ...(tokens || {}), last_sync: new Date().toISOString() })
    return txns
  }

  getConnectionStatus() {
    const tokens = getDataStore().getInvestecTokens()
    const accounts = getDataStore().getAccounts('biz-1')
    return {
      connected: !!(tokens && tokens.access_token && this.isConfigured()),
      accounts_linked: accounts.length,
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
