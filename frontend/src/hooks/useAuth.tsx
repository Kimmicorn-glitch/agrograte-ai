'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { api, type UserResponse } from '@/lib/api'

const DEMO_USER: UserResponse = {
  id: 'user-1',
  email: 'demo@agrograte.ai',
  full_name: 'Demo User',
  role: 'admin',
  business_id: 'biz-1',
}

interface AuthContextValue {
  user: UserResponse | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('agrograte.access_token') : null
    if (token) {
      api.me()
        .then(setUser)
        .catch(() => {
          setUser(DEMO_USER)
        })
        .finally(() => setLoading(false))
    } else {
      setUser(DEMO_USER)
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.login({ email, password })
      setUser(res.user)
    } catch (e: any) {
      setError(e.message)
      setUser(DEMO_USER)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, full_name: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.register({ email, password, full_name })
      setUser(res.user)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      api.clearAuth()
    }
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await api.refresh()
      setUser(res.user)
    } catch {
      setUser(DEMO_USER)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
