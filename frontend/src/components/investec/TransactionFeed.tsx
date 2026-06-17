'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'

interface Transaction {
  transaction_id: string
  amount: number
  description: string
  transaction_type: string
  posting_date: string
  merchant?: { name: string }
}

export function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getInvestecTransactions('')
      .then((data) => setTransactions(data))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <GlassCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="section-title">Recent Transactions</div>
          {transactions.length > 0 && (
            <span className="text-[0.65rem] text-white/30">{transactions.length} items</span>
          )}
        </div>
        {loading ? (
          <p className="text-xs text-white/40">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-white/40">No transactions found.</p>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {transactions.map((txn) => (
              <div
                key={txn.transaction_id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-white/80 truncate">
                    {txn.merchant?.name || txn.description || 'Unknown'}
                  </p>
                  <p className="text-[0.6rem] text-white/30 font-mono">
                    {txn.posting_date ? new Date(txn.posting_date).toLocaleDateString() : ''}
                  </p>
                </div>
                <span className={`text-xs font-mono ml-3 ${(txn.amount || 0) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {txn.amount != null ? `R ${txn.amount.toLocaleString()}` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
