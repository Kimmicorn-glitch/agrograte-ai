'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

type WizardStep = 'welcome' | 'credentials' | 'discovery' | 'select' | 'syncing' | 'complete'

interface WizardState {
  show: boolean
  step: WizardStep
  accounts: any[]
  selectedAccounts: string[]
  status: any
}

export function ConnectionWizard({ onComplete }: { onComplete?: () => void }) {
  const [wizard, setWizard] = useState<WizardState>({
    show: false,
    step: 'welcome',
    accounts: [],
    selectedAccounts: [],
    status: null,
  })

  const open = () => setWizard((s) => ({ ...s, show: true, step: 'welcome' }))
  const close = () => setWizard((s) => ({ ...s, show: false }))
  const go = (step: WizardStep) => setWizard((s) => ({ ...s, step }))

  const startDiscovery = async () => {
    go('discovery')
    try {
      const accounts = await api.getInvestecAccounts()
      setWizard((s) => ({
        ...s,
        accounts: Array.isArray(accounts) ? accounts : [],
        step: 'select',
      }))
    } catch {
      setWizard((s) => ({ ...s, step: 'credentials' }))
    }
  }

  const toggleAccount = (id: string) => {
    setWizard((s) => ({
      ...s,
      selectedAccounts: s.selectedAccounts.includes(id)
        ? s.selectedAccounts.filter((a) => a !== id)
        : [...s.selectedAccounts, id],
    }))
  }

  const startSync = async () => {
    go('syncing')
    setTimeout(() => {
      go('complete')
      if (onComplete) onComplete()
    }, 2000)
  }

  if (!wizard.show) {
    return (
      <button onClick={open} className="px-5 py-2.5 bg-accent text-white text-body-sm font-medium rounded-lg hover:bg-accent-hover transition-all flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        Connect Bank Account
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold">I</div>
            <span className="text-secondary font-semibold">Investec Connection</span>
          </div>
          <button onClick={close} className="text-charcoal-400 hover:text-charcoal-700 text-lg">✕</button>
        </div>

        {/* Steps */}
        <div className="p-5">
          {wizard.step === 'welcome' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent-subtle flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M3 10v11M21 10v11" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Connect Your Bank</h3>
              <p className="text-body-sm text-charcoal-600 mb-6 max-w-sm mx-auto">
                Securely connect your Investec account to populate your Financial Neural Twin with real transaction data.
              </p>
              <button onClick={startDiscovery} className="w-full px-5 py-2.5 bg-accent text-white text-body-sm font-medium rounded-lg hover:bg-accent-hover transition-all">
                Connect Investec
              </button>
            </div>
          )}

          {wizard.step === 'credentials' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-warning-subtle flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔑</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Sandbox Credentials</h3>
              <p className="text-body-sm text-charcoal-600 mb-4">
                Using sandbox mode with pre-configured credentials.
              </p>
              <div className="bg-charcoal-50 rounded-lg p-3 mb-4 text-left text-body-sm text-charcoal-600 space-y-1">
                <div><span className="text-charcoal-500">Client ID:</span> yAxzQRFX****</div>
                <div><span className="text-charcoal-500">Environment:</span> Sandbox</div>
                <div><span className="text-charcoal-500">Status:</span> <span className="text-success">Configured</span></div>
              </div>
              <button onClick={startDiscovery} className="w-full px-5 py-2.5 bg-accent text-white text-body-sm font-medium rounded-lg hover:bg-accent-hover transition-all">
                Discover Accounts
              </button>
            </div>
          )}

          {wizard.step === 'discovery' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-body-sm text-charcoal-600">Discovering accounts...</h3>
            </div>
          )}

          {wizard.step === 'select' && (
            <div>
              <h3 className="text-body-sm font-semibold text-secondary mb-3">Select Accounts</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {wizard.accounts.map((acct: any) => {
                  const id = acct.account_id || acct.accountId || acct.id
                  const selected = wizard.selectedAccounts.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleAccount(id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        selected ? 'border-accent/50 bg-accent-subtle' : 'border-charcoal-200/40 bg-white hover:bg-charcoal-50/50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'border-accent bg-accent' : 'border-charcoal-400'
                      }`}>
                        {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm text-secondary truncate">{acct.account_name || acct.accountName || 'Account'}</div>
                        <div className="text-caption text-charcoal-500">{acct.account_number || acct.accountNumber} · {acct.product_name || acct.productName || acct.account_type || 'Current'}</div>
                      </div>
                      {acct.current_balance || acct.currentBalance ? (
                        <div className="text-caption text-success font-mono">R{Number(acct.current_balance ?? acct.currentBalance ?? 0).toLocaleString()}</div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={startSync}
                disabled={wizard.selectedAccounts.length === 0}
                className="w-full mt-4 px-5 py-2.5 bg-accent text-white text-body-sm font-medium rounded-lg hover:bg-accent-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sync {wizard.selectedAccounts.length} Account{wizard.selectedAccounts.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {wizard.step === 'syncing' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-body-sm text-charcoal-600 mb-1">Synchronising financial data...</h3>
              <p className="text-caption text-charcoal-500">Populating your Financial Neural Twin</p>
            </div>
          )}

          {wizard.step === 'complete' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success-subtle flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-secondary mb-2">Connected!</h3>
              <p className="text-body-sm text-charcoal-600 mb-6">
                {wizard.selectedAccounts.length} account{wizard.selectedAccounts.length !== 1 ? 's' : ''} synchronised. Your Financial Neural Twin is live.
              </p>
              <button onClick={close} className="px-5 py-2.5 bg-charcoal-100 text-charcoal-700 text-body-sm font-medium rounded-lg hover:bg-charcoal-200 transition-all">
                View Twin
              </button>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 pb-5">
          {(['welcome', 'credentials', 'discovery', 'select', 'syncing', 'complete'] as WizardStep[]).map((s) => (
            <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all ${
              wizard.step === s ? 'bg-accent w-3' : 'bg-charcoal-300'
            }`} />
          ))}
        </div>
      </div>
    </div>
  )
}
