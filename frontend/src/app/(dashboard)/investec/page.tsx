'use client'

import { InvestecConnectCard } from '@/components/investec/InvestecConnectCard'
import { AccountListPanel } from '@/components/investec/AccountListPanel'
import { TransactionFeed } from '@/components/investec/TransactionFeed'

export default function InvestecPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-mono font-semibold tracking-tight">Investec Connection Center</h1>
        <p className="text-xs text-white/40 font-mono mt-0.5">
          Manage your Investec Programmable Banking integration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <InvestecConnectCard />
        </div>
        <div className="lg:col-span-2">
          <AccountListPanel />
        </div>
      </div>

      <TransactionFeed />
    </div>
  )
}
