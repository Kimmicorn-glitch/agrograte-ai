'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Brain, AlertTriangle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('demo@agrograte.ai')
  const [password, setPassword] = useState('demo')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (!email || !password) {
      setLocalError('Email and password are required')
      return
    }
    try {
      await login(email, password)
      router.replace('/dashboard')
    } catch {
      setLocalError('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-charcoal-50">
      <div className="w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="text-display-sm text-secondary">Agrograte AI</h1>
          <p className="text-body-md text-charcoal-500 mt-1">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || localError) && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-mono">
              <AlertTriangle size={12} />
              {localError || error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-charcoal-600 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-charcoal-200 bg-white text-secondary placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-charcoal-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-charcoal-200 bg-white text-secondary placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors pr-10"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-charcoal-400">
            Demo: demo@agrograte.ai / demo
          </p>
        </form>
      </div>
    </div>
  )
}
