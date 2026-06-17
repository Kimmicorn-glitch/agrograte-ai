const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('agrograte.access_token')
}

function setAccessToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('agrograte.access_token', token)
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('agrograte.refresh_token')
}

function setRefreshToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('agrograte.refresh_token', token)
}

function clearTokens() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('agrograte.access_token')
  window.localStorage.removeItem('agrograte.refresh_token')
}

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export interface AuthResponse {
  token: string
  refresh_token: string
  user: {
    id: string
    email: string
    full_name: string
    role: string
    business_id: string | null
  }
}

export interface UserResponse {
  id: string
  email: string
  full_name: string
  role: string
  business_id: string | null
}

export const api = {
  register: (data: { email: string; password: string; full_name: string }) =>
    fetchJSON<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => {
      setAccessToken(res.token)
      setRefreshToken(res.refresh_token)
      return res
    }),

  login: (data: { email: string; password: string }) =>
    fetchJSON<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => {
      setAccessToken(res.token)
      setRefreshToken(res.refresh_token)
      return res
    }),

  refresh: () => {
    const refresh_token = getRefreshToken()
    if (!refresh_token) return Promise.reject(new Error('No refresh token'))
    return fetchJSON<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }).then((res) => {
      setAccessToken(res.token)
      setRefreshToken(res.refresh_token)
      return res
    })
  },

  logout: async () => {
    try {
      await fetchJSON<{ message: string }>('/api/auth/logout', { method: 'POST' })
    } finally {
      clearTokens()
    }
  },

  me: () => fetchJSON<UserResponse>('/api/auth/me'),

  clearAuth: clearTokens,
  getDrrtState: () => fetchJSON<any>('/api/drrt/state'),
  getDrrtDimensions: () => fetchJSON<any>('/api/drrt/dimensions'),
  getDrrtMemory: () => fetchJSON<any>('/api/drrt/memory'),
  convergeDrrt: () => fetchJSON<any>('/api/drrt/converge', { method: 'POST' }),
  addRelationship: (data: any) => fetchJSON<any>('/api/drrt/relationship', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getFinancialHealth: () => fetchJSON<any>('/api/financial/health'),
  getFinancialHealthDetail: () => fetchJSON<any>('/api/financial/health/detail'),
  getBankingSummary: () => fetchJSON<any>('/api/banking/summary'),
  getComplianceSummary: () => fetchJSON<any>('/api/compliance/summary'),
  getCashflowForecast: () => fetchJSON<any>('/api/cashflow/forecast'),
  getCashflowDetail: () => fetchJSON<any>('/api/cashflow/detail'),
  getTaxReserve: () => fetchJSON<any>('/api/cashflow/tax-reserve'),

  getInvestecStatus: () => fetchJSON<any>('/api/investec/status'),
  getInvestecAccounts: () => fetchJSON<any>('/api/investec/accounts'),
  getInvestecAuthUrl: () => fetchJSON<any>('/api/investec/auth-url'),
  getInvestecTransactions: (accountId: string) =>
    fetchJSON<any>(`/api/investec/accounts/${accountId}/transactions`),

  getTransactionIntelligence: () => fetchJSON<any>('/api/transactions/intelligence'),
  getTransactionCategories: () => fetchJSON<any>('/api/transactions/categories'),
  getTransactionPatterns: () => fetchJSON<any>('/api/transactions/patterns'),
  getTransactionAnomalies: () => fetchJSON<any>('/api/transactions/anomalies'),

  getComplianceReport: () => fetchJSON<any>('/api/compliance/report'),
  getVatReturns: () => fetchJSON<any>('/api/compliance/vat-returns'),
  getTaxRecords: () => fetchJSON<any>('/api/compliance/tax-records'),
  getComplianceTaxReserve: () => fetchJSON<any>('/api/compliance/tax-reserve'),

  getBankingRules: () => fetchJSON<any[]>('/api/banking/rules'),
  createBankingRule: (data: any) => fetchJSON<any>('/api/banking/rules', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleBankingRule: (id: string) => fetchJSON<any>(`/api/banking/rules/${id}/toggle`, { method: 'PUT' }),
  deleteBankingRule: (id: string) => fetchJSON<any>(`/api/banking/rules/${id}`, { method: 'DELETE' }),

  getApprovalsPending: () => fetchJSON<any[]>('/api/approval/pending'),
  getApprovalsAll: () => fetchJSON<any[]>('/api/approval/all'),
  createApproval: (data: any) => fetchJSON<any>('/api/approval/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approveApproval: (id: string, data: { approved_by: string; reason?: string }) => fetchJSON<any>(`/api/approval/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  rejectApproval: (id: string, data: { approved_by: string; reason?: string }) => fetchJSON<any>(`/api/approval/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAuditLogs: (params?: { entity_type?: string; action?: string; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.entity_type) search.set('entity_type', params.entity_type)
    if (params?.action) search.set('action', params.action)
    if (params?.limit) search.set('limit', String(params.limit))
    const qs = search.toString()
    return fetchJSON<any[]>(`/api/audit/logs${qs ? `?${qs}` : ''}`)
  },
}
