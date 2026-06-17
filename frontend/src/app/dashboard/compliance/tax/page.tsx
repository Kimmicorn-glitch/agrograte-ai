'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { FileText, Clock, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

interface TaxRecordItem {
  tax_period: string
  tax_type: string
  amount_due: number
  amount_paid: number
  balance: number
  status: string
}

export default function TaxRecordsPage() {
  const [records, setRecords] = useState<TaxRecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getTaxRecords()
      .then(setRecords)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (s: string) => {
    if (s === 'Filed' || s === 'Approved') return 'text-success'
    if (s === 'Overdue' || s === 'Rejected') return 'text-error'
    return 'text-warning'
  }
  const statusDot = (s: string) => {
    if (s === 'Filed' || s === 'Approved') return 'success' as const
    if (s === 'Overdue' || s === 'Rejected') return 'error' as const
    return 'warning' as const
  }

  const totalDue = records.reduce((s, r) => s + r.amount_due, 0)
  const totalPaid = records.reduce((s, r) => s + r.amount_paid, 0)
  const totalBalance = records.reduce((s, r) => s + r.balance, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Tax Records</h1>
          <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">Income tax, VAT, PAYE, UIF, and SDL records</p>
        </div>
        <div className="flex items-center justify-center py-16 text-white/40 font-mono text-xs gap-2">
          <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          Loading tax records...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Tax Records</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">Income tax, VAT, PAYE, UIF, and SDL records</p>
      </div>

      {error && (
        <div className="text-xs text-red-400/80 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <MetricTile label="Total Due" value={`R${totalDue.toLocaleString()}`} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Total Paid" value={`R${totalPaid.toLocaleString()}`} status="success" />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Outstanding" value={`R${totalBalance.toLocaleString()}`} status={totalBalance > 0 ? 'warning' : 'success'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Records" value={records.length} />
        </GlassCard>
      </div>

      {records.length === 0 && !error ? (
        <GlassCard>
          <div className="flex flex-col items-center gap-2 py-10 text-xs text-white/40 font-mono">
            <FileText size={20} className="text-white/20" />
            No tax records found
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Tax Record History</h2>
          </div>
          <div className="space-y-2">
            {records.map((r, i) => (
              <div key={i} className="bg-white/5 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/80">{r.tax_type}</span>
                    <span className={`text-[0.55rem] ${statusColor(r.status)} flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(r.status) === 'success' ? 'bg-success' : statusDot(r.status) === 'error' ? 'bg-error' : 'bg-warning'}`} />
                      {r.status}
                    </span>
                  </div>
                  <div className="text-[0.55rem] text-white/30 font-mono">Period: {r.tax_period}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-white/80">R {r.amount_due.toLocaleString()}</div>
                  <div className="text-[0.55rem] text-white/30">Paid: R {r.amount_paid.toLocaleString()}</div>
                  {r.balance > 0 && <div className="text-[0.55rem] text-error">Balance: R {r.balance.toLocaleString()}</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-glass-border flex items-center gap-2 text-[0.6rem] text-white/30 font-mono">
            <Clock size={10} /> Income Tax Act 58 of 1962
          </div>
        </GlassCard>
      )}
    </div>
  )
}
