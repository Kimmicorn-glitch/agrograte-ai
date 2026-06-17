'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api, type UserResponse } from '@/lib/api'

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

  const refresh = useCallback(async () => {
    try {
      const res = await api.refresh()
      setUser(res.user)
    } catch {
      api.clearAuth()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = typeof window !== 'undefined' && window.localStorage.getItem('agrograte.access_token')
    if (!token) {
      setLoading(false)
      return
    }
    api.me()
      .then((u) => setUser(u))
      .catch(() => refresh())
      .finally(() => setLoading(false))
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const res = await api.login({ email, password })
      setUser(res.user)
    } catch (e: any) {
      setError(e.message || 'Login failed')
      throw e
    }
  }, [])

  const register = useCallback(async (email: string, password: string, full_name: string) => {
    setError(null)
    try {
      const res = await api.register({ email, password, full_name })
      setUser(res.user)
    } catch (e: any) {
      setError(e.message || 'Registration failed')
      throw e
    }
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
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
