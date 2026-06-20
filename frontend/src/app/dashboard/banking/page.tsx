'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Banknote, Plus, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { api } from '@/lib/api'

export default function BankingPage() {
  const [banking, setBanking] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const [b, t] = await Promise.all([
          api.getBankingSummary().catch(() => null),
          api.getTransactionIntelligence().catch(() => null),
        ])
        if (!mounted) return
        if (b) setBanking(b)
        if (t) setTransactions(t.top_merchants || [])
      } catch (e: any) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const accounts = banking?.accounts || [
    { account_name: 'Investec Business Account', account_number: '****4521', available_balance: banking?.available_balance || 1842530 },
    { account_name: 'Investec Savings Account', account_number: '****7893', available_balance: 650000 },
  ]

  const trend = (balance: number) => balance > 1000000 ? { change: '+2.3%', trend: 'up' as const } : { change: '+5.1%', trend: 'up' as const }

  if (loading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center justify-center py-24 text-charcoal-400 font-mono text-sm gap-2">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          Loading banking data...
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-mono">
          <AlertTriangle size={14} /> {error}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
            <Banknote size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="text-display-sm text-secondary">Banking</h1>
            <p className="text-body-md text-charcoal-500">Connected accounts & transactions</p>
          </div>
        </div>
        <button className="btn-primary btn-sm"><Plus size={14} /> Connect Account</button>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {accounts.map((a: any) => {
          const t = trend(a.available_balance || 0)
          return (
            <div key={a.account_number || a.account_id} className="card card-hover">
              <div className="flex items-center justify-between mb-4">
                <span className="metric-label">{a.account_name || a.account_type}</span>
                <span className={`flex items-center gap-1 text-xs font-medium ${t.trend === 'up' ? 'text-success' : 'text-error'}`}>
                  {t.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {t.change}
                </span>
              </div>
              <p className="metric-value text-heading-xl text-secondary mb-1">
                R {(a.available_balance || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-caption text-charcoal-400">{a.account_number}</p>
            </div>
          )
        })}
      </motion.div>

      <motion.div variants={fadeInUp} className="card">
        <h2 className="text-heading-md text-secondary mb-4">Transaction Intelligence</h2>
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-charcoal-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${t.total > 0 ? 'bg-success' : 'bg-error'}`} />
                  <span className="text-sm text-secondary">{t.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-charcoal-400">{t.count} txns</span>
                  <span className={`text-sm font-medium ${t.total > 0 ? 'text-success' : 'text-error'}`}>
                    R {Math.abs(t.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-charcoal-500">Your Investec Programmable Banking data is being synchronized.</p>
        )}
      </motion.div>
    </motion.div>
  )
}
