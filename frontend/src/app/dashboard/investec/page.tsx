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
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          <p className="text-sm text-slate-400">Loading Investec data...</p>
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
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Building2 size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Investec Integration</h1>
            <p className="text-xs text-slate-400 mt-0.5">Connected banking accounts and transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {banking?.accounts_linked ? (
            <div className="text-right">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                Connected
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{banking.accounts?.length || 0} accounts</p>
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
              className="bg-slate-800/50 border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <CreditCard size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{account.name || 'Unnamed Account'}</p>
                    <p className="text-[10px] text-slate-500">{account.account_number || 'No account number'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded">
                  Active
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Available Balance</span>
                  <span className="text-sm font-semibold text-white">{formatMoney(account.available_balance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Current Balance</span>
                  <span className="text-sm font-semibold text-white">{formatMoney(account.current_balance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Account Type</span>
                  <span className="text-xs font-medium text-slate-300">{account.account_type || 'Cheque'}</span>
                </div>
              </div>

              <button className="mt-4 w-full py-2 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-8 text-center">
          <Building2 size={32} className="text-indigo-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-slate-300 font-medium mb-2">No connected accounts</p>
          <p className="text-xs text-slate-500 mb-4">Connect your Investec account to begin tracking transactions</p>
          <ConnectionWizard onComplete={fetchBanking} />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-slate-800/50 border border-white/5 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-sm text-white font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Recent Transactions
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {banking?.recent_transactions && banking.recent_transactions.length > 0 ? (
            banking.recent_transactions.slice(0, 10).map((txn: any, i: number) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{txn.description || 'Transaction'}</p>
                  <p className="text-[10px] text-slate-500">{txn.date || 'No date'}</p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ml-4 ${txn.amount && txn.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {txn.amount ? (txn.amount > 0 ? '+' : '') + formatMoney(txn.amount) : '—'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p className="text-xs">No transactions available</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Rules */}
      <div className="bg-slate-800/50 border border-white/5 rounded-lg p-5">
        <h2 className="text-sm text-white font-semibold mb-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-400" />
          Transaction Rules
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Set up programmable rules to automate transaction categorization and analysis
        </p>
        <button className="px-5 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-medium hover:bg-indigo-500/20 transition-colors">
          Create Rule
        </button>
      </div>
    </MotionDiv>
  )
}
