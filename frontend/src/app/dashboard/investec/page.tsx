"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, CreditCard, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { api } from '@/lib/api'

const MotionDiv = motion.div

export default function InvestecPage() {
  const [banking, setBanking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      try {
        const b = await api.getBankingSummary().catch(() => null)
        if (mounted) setBanking(b)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [])

  const formatMoney = (value: number | null | undefined) =>
    value == null ? '—' : `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <MotionDiv initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <p className="text-body-sm text-charcoal-500">Loading Investec data...</p>
          </div>
        </div>
      </MotionDiv>
    )
  }

  return (
    <MotionDiv initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8">
      {/* Header */}
      <MotionDiv variants={fadeInUp}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-display-md text-secondary">Investec Integration</h1>
              <p className="text-body-md text-charcoal-500 mt-1">Connected banking accounts and transactions</p>
            </div>
          </div>
          {banking?.accounts_linked ? (
            <div className="text-right">
              <div className="flex items-center gap-2 text-success font-medium text-body-sm">
                <div className="w-2 h-2 bg-success rounded-full" />
                Connected
              </div>
              <p className="text-caption text-charcoal-400 mt-1">{banking.accounts?.length || 0} accounts</p>
            </div>
          ) : (
            <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium text-body-sm hover:bg-accent-hover">
              <Plus size={16} />
              Connect Account
            </button>
          )}
        </div>
      </MotionDiv>

      {/* Accounts Grid */}
      {banking?.accounts && banking.accounts.length > 0 ? (
        <MotionDiv variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banking.accounts.map((account: any, i: number) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-white rounded-lg border border-charcoal-200 p-6 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <CreditCard size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-secondary">{account.name || 'Unnamed Account'}</p>
                    <p className="text-caption text-charcoal-500">{account.account_number || 'No account number'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-success/10 text-success text-caption font-medium rounded">
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
            </motion.div>
          ))}
        </MotionDiv>
      ) : (
        <MotionDiv variants={fadeInUp} className="bg-accent/5 border border-accent/20 rounded-lg p-8 text-center">
          <Building2 size={32} className="text-accent mx-auto mb-3 opacity-50" />
          <p className="text-body-md text-charcoal-600 font-medium mb-2">No connected accounts</p>
          <p className="text-body-sm text-charcoal-500 mb-4">Connect your Investec account to begin tracking transactions</p>
          <button className="px-6 py-2 bg-accent text-white rounded-lg font-medium text-body-sm hover:bg-accent-hover">
            Connect Investec
          </button>
        </MotionDiv>
      )}

      {/* Recent Transactions */}
      <MotionDiv variants={fadeInUp} className="bg-white rounded-lg border border-charcoal-200 overflow-hidden shadow-card">
        <div className="p-6 border-b border-charcoal-200/50">
          <h2 className="text-heading-lg text-secondary flex items-center gap-2">
            <TrendingUp size={20} className="text-accent" />
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
      </MotionDiv>

      {/* Bank Rules */}
      <MotionDiv variants={fadeInUp} className="bg-white rounded-lg border border-charcoal-200 p-6 shadow-card">
        <h2 className="text-heading-lg text-secondary mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-accent" />
          Transaction Rules
        </h2>
        <p className="text-body-sm text-charcoal-600 mb-4">
          Set up programmable rules to automate transaction categorization and analysis
        </p>
        <button className="px-6 py-2 bg-accent text-white rounded-lg font-medium text-body-sm hover:bg-accent-hover">
          Create Rule
        </button>
      </MotionDiv>
    </MotionDiv>
  )
}
