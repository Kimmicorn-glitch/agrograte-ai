'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login, register, error, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setLocalError(null)
    try {
      if (isRegister) {
        await register(email, password, fullName)
      } else {
        await login(email, password)
      }
      router.push('/dashboard')
    } catch {
      setLocalError(isRegister ? 'Registration failed' : 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white/60 font-mono text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-mono font-semibold tracking-tight text-white">
            Agrograte AI
          </h1>
          <p className="text-xs text-white/40 font-mono mt-1">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="fullName" className="block text-xs font-mono text-white/60 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-mono text-white/60 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono text-white/60 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              placeholder="••••••••"
            />
          </div>

          {(localError || error) && (
            <p className="text-xs font-mono text-red-400">{localError || error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 rounded text-sm font-mono text-white transition-colors"
          >
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs font-mono text-white/40">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setLocalError(null) }}
            className="text-white/60 hover:text-white underline"
          >
            {isRegister ? 'Sign in' : 'Register'}
          </button>
        </p>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-black px-2 text-white/30 font-mono">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('agrograte.demo', 'true')
            }
            window.location.href = '/dashboard'
          }}
          className="w-full py-2 border border-white/10 hover:bg-white/5 rounded text-sm font-mono text-white/60 hover:text-white transition-colors"
        >
          Continue as Demo
        </button>
      </div>
    </div>
  )
}
