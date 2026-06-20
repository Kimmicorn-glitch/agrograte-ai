'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { UserResponse } from '@/lib/api'

const DEMO_USER: UserResponse = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'demo@agrograte.ai',
  full_name: 'Demo User',
  role: 'admin',
  business_id: null,
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
  const [user, setUser] = useState<UserResponse | null>(DEMO_USER)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (_email: string, _password: string) => {
    setError(null)
    setUser(DEMO_USER)
  }, [])

  const register = useCallback(async (_email: string, _password: string, _full_name: string) => {
    setError(null)
    setUser(DEMO_USER)
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    setUser(DEMO_USER)
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
