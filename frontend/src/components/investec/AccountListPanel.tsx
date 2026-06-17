'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'

interface Account {
  account_id: string
  account_number: string
  account_type: string
  current_balance: number
  available_balance: number
}

export function AccountListPanel() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getInvestecAccounts()
      .then((data) => setAccounts(data))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <GlassCard>
      <div className="space-y-4">
        <div className="section-title">Linked Accounts</div>
        {loading ? (
          <p className="text-xs text-white/40">Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p className="text-xs text-white/40">No accounts linked. Connect Investec to get started.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.account_id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div>
                  <p className="text-xs font-mono text-white/80">{account.account_type}</p>
                  <p className="text-[0.65rem] text-white/40 font-mono">
                    {account.account_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-white/80">
                    R {account.available_balance?.toLocaleString() ?? '0.00'}
                  </p>
                  <p className="text-[0.65rem] text-white/40">available</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
