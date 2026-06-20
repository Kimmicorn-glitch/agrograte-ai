'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight, Sparkles } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#C1121F]/30 border-t-[#C1121F] rounded-full animate-spin" />
          <p className="text-sm text-[#495057]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#C1121F]" />
              <span className="text-sm font-semibold text-[#111111] tracking-tight">Agrograte AI</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-[#495057] mt-1">
              {isRegister ? 'Start your financial intelligence journey' : 'Sign in to your financial intelligence dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#495057] mb-1.5">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-sm text-[#111111] placeholder-[#495057]/50 focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 transition-colors"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#495057] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-sm text-[#111111] placeholder-[#495057]/50 focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 transition-colors"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#495057] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-sm text-[#111111] placeholder-[#495057]/50 focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {(localError || error) && (
              <p className="text-sm text-[#C1121F]">{localError || error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111111] hover:bg-[#111111]/90 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-all"
            >
              {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E9ECEF]" />
            <span className="text-xs text-[#495057] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E9ECEF]" />
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('agrograte.demo', 'true')
              }
              window.location.href = '/dashboard'
            }}
            className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 border border-[#E9ECEF] hover:border-[#111111]/20 rounded-lg text-sm font-medium text-[#495057] hover:text-[#111111] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Continue as Demo
          </button>

          <p className="mt-6 text-center text-sm text-[#495057]">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setLocalError(null) }}
              className="text-[#111111] font-medium hover:underline"
            >
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-[#F8F9FA] items-center justify-center p-8">
        <div className="max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-[#111111] flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-[#111111] tracking-tight mb-3">
            Financial Intelligence OS
          </h2>
          <p className="text-sm text-[#495057] leading-relaxed">
            Transform banking data into SARS-ready intelligence. Automated tax insights, compliance workflows, and AI-powered business analytics.
          </p>
          <div className="mt-8 space-y-4">
            {[
              'Real-time compliance monitoring',
              'AI-powered financial forecasting',
              'Investec Programmable Banking integration',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C1121F]" />
                <span className="text-sm text-[#495057]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
