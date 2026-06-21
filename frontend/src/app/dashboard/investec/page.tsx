"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, CreditCard, TrendingUp, AlertCircle, Plus, RefreshCw } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { api } from '@/lib/api'
import { ConnectionWizard } from '@/components/investec/ConnectionWizard'

const MotionDiv = motion.div

export default function InvestecPage() {
  const [banking, setBanking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchBanking = async () => {
    try {
      const b = await api.getBankingSummary().catch(() => null)
      setBanking(b)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const b = await api.getBankingSummary().catch(() => null)
        if (mounted) setBanking(b)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  const formatMoney = (value: number | null | undefined) =>
    value == null ? '—' : `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-24"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <p className="text-body-sm text-charcoal-500">Loading Investec data...</p>
        </div>
      </MotionDiv>
    )
  }

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
            <Building2 size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary">Investec Integration</h1>
            <p className="text-body-sm text-charcoal-500 mt-0.5">Connected banking accounts and transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {banking?.accounts_linked ? (
            <div className="text-right">
              <div className="flex items-center gap-2 text-success font-medium text-body-sm">
                <div className="w-2 h-2 bg-success rounded-full" />
                Connected
              </div>
              <p className="text-caption text-charcoal-400 mt-0.5">{banking.accounts?.length || 0} accounts</p>
            </div>
          ) : null}
          <ConnectionWizard onComplete={fetchBanking} />
        </div>
      </div>

      {/* Accounts Grid */}
      {banking?.accounts && banking.accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banking.accounts.map((account: any, i: number) => (
            <div
              key={i}
              className="card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center">
                    <CreditCard size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-secondary">{account.name || 'Unnamed Account'}</p>
                    <p className="text-caption text-charcoal-500">{account.account_number || 'No account number'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-success-subtle text-success text-caption font-medium rounded">
                  Active
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-charcoal-100">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-charcoal-600">Available Balance</span>
                  <span className="text-body-md font-semibold text-secondary">{formatMoney(account.available_balance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-charcoal-600">Current Balance</span>
                  <span className="text-body-md font-semibold text-secondary">{formatMoney(account.current_balance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-charcoal-600">Account Type</span>
                  <span className="text-body-sm font-medium text-charcoal-700">{account.account_type || 'Cheque'}</span>
                </div>
              </div>

              <button className="mt-4 w-full py-2 border border-charcoal-200 rounded-lg text-body-sm font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-accent-subtle border border-accent/20 rounded-lg p-8 text-center">
          <Building2 size={32} className="text-accent mx-auto mb-3 opacity-50" />
          <p className="text-body-md text-charcoal-600 font-medium mb-2">No connected accounts</p>
          <p className="text-body-sm text-charcoal-500 mb-4">Connect your Investec account to begin tracking transactions</p>
          <ConnectionWizard onComplete={fetchBanking} />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-charcoal-200/40">
          <h2 className="text-body-sm text-secondary font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            Recent Transactions
          </h2>
        </div>
        <div className="divide-y divide-charcoal-100">
          {banking?.recent_transactions && banking.recent_transactions.length > 0 ? (
            banking.recent_transactions.slice(0, 10).map((txn: any, i: number) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-charcoal-50/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-secondary truncate">{txn.description || 'Transaction'}</p>
                  <p className="text-caption text-charcoal-500">{txn.date || 'No date'}</p>
                </div>
                <span className={`text-body-md font-semibold shrink-0 ml-4 ${txn.amount && txn.amount > 0 ? 'text-success' : 'text-error'}`}>
                  {txn.amount ? (txn.amount > 0 ? '+' : '') + formatMoney(txn.amount) : '—'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-charcoal-500">
              <p className="text-body-sm">No transactions available</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Rules */}
      <div className="card p-5">
        <h2 className="text-body-sm text-secondary font-semibold mb-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-warning" />
          Transaction Rules
        </h2>
        <p className="text-body-sm text-charcoal-600 mb-4">
          Set up programmable rules to automate transaction categorization and analysis
        </p>
        <button className="px-5 py-2 bg-accent text-white rounded-lg text-body-sm font-medium hover:bg-accent-hover transition-colors">
          Create Rule
        </button>
      </div>
    </MotionDiv>
  )
}
