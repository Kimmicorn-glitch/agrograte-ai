'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { Plus, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'

interface RuleCondition {
  field: string
  operator: 'Equals' | 'GreaterThan' | 'LessThan' | 'GreaterOrEqual' | 'LessOrEqual' | 'Contains' | 'Between'
  value: any
}

interface RuleAction {
  TransferToSavings?: { account_id: string; amount_expression: string }
  ReserveTaxFunds?: { percentage: number }
  Notify?: { channel: 'Email' | 'Sms' | 'Push' | 'Dashboard' }
  BlockTransaction?: { reason: string }
  CategorizeTransaction?: { category: string }
  CreateApprovalWorkflow?: { approvers: string[] }
}

interface BankingRule {
  id: string
  name: string
  description: string
  account_id: string
  event_type: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  is_active: boolean
  requires_approval: boolean
  drrt_coherence_score: number
  created_at: string
}

const EVENT_TYPES = [
  'TransactionPosted', 'BalanceThreshold', 'DailySummary',
  'WeeklySummary', 'MonthlySummary', 'TaxDeadline', 'VatPeriodEnd', 'InvoiceDue',
]
const OPERATORS = ['Equals', 'GreaterThan', 'LessThan', 'GreaterOrEqual', 'LessOrEqual', 'Contains', 'Between']
const ACTION_TYPES = ['TransferToSavings', 'ReserveTaxFunds', 'Notify', 'BlockTransaction', 'CategorizeTransaction', 'CreateApprovalWorkflow'] as const
const NOTIFY_CHANNELS = ['Email', 'Sms', 'Push', 'Dashboard']

function emptyCondition(): RuleCondition {
  return { field: 'amount', operator: 'GreaterThan', value: 0 }
}

const RULE_FIELD_ORDER = [
  'event_type', 'name', 'description', 'conditions', 'actions', 'created_at',
  'drrt_coherence_score', 'is_active', 'requires_approval', 'id',
];

function sortRuleKeys(a: string, b: string): number {
  const ai = RULE_FIELD_ORDER.indexOf(a);
  const bi = RULE_FIELD_ORDER.indexOf(b);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
}

function stringifyRule(r: BankingRule): string {
  const ordered = Object.keys(r).sort(sortRuleKeys);
  return JSON.stringify(ordered.reduce((acc, k) => {
    (acc as any)[k] = (r as any)[k];
    return acc;
  }, {} as Record<string, any>), null, 2);
}

export default function BankingRulesPage() {
  const [rules, setRules] = useState<BankingRule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [accountId, setAccountId] = useState('')
  const [eventType, setEventType] = useState('TransactionPosted')
  const [conditions, setConditions] = useState<RuleCondition[]>([emptyCondition()])
  const [actions, setActions] = useState<RuleAction[]>([{}])
  const [requiresApproval, setRequiresApproval] = useState(false)

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getBankingRules()
      setRules(data || [])
      setError('')
    } catch (e) {
      setError('Failed to load rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRules() }, [fetchRules])

  const resetForm = () => {
    setName('')
    setDescription('')
    setAccountId('')
    setEventType('TransactionPosted')
    setConditions([emptyCondition()])
    setActions([{}])
    setRequiresApproval(false)
    setError('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createBankingRule({
        name,
        description,
        account_id: accountId,
        event_type: eventType,
        conditions,
        actions,
        requires_approval: requiresApproval,
      })
      resetForm()
      setShowForm(false)
      await fetchRules()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create rule')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await api.toggleBankingRule(id)
      await fetchRules()
    } catch {
      setError('Failed to toggle rule')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBankingRule(id)
      await fetchRules()
    } catch {
      setError('Failed to delete rule')
    }
  }

  const actionTypeLabel = (action: RuleAction) => {
    for (const key of ACTION_TYPES) {
      if (key in action) return key.replace(/([A-Z])/g, ' $1').trim()
    }
    return 'Unknown'
  }

  const actionSummary = (action: RuleAction) => {
    if ('TransferToSavings' in action) return `→ ${action.TransferToSavings!.account_id} (${action.TransferToSavings!.amount_expression})`
    if ('ReserveTaxFunds' in action) return `${action.ReserveTaxFunds!.percentage}% tax reserve`
    if ('Notify' in action) return `Notify via ${action.Notify!.channel}`
    if ('BlockTransaction' in action) return `Block: ${action.BlockTransaction!.reason}`
    if ('CategorizeTransaction' in action) return `Categorize as ${action.CategorizeTransaction!.category}`
    if ('CreateApprovalWorkflow' in action) return `Approval: ${action.CreateApprovalWorkflow!.approvers.join(', ')}`
    return 'Unknown action'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-semibold tracking-tight">Programmable Banking Rules</h1>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            Create and manage automated banking rules
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono glass border border-glass-border hover:bg-glass-hover transition-all"
        >
          <Plus size={12} />
          {showForm ? 'Cancel' : 'New Rule'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs font-mono bg-scarlet-600/10 border border-scarlet-600/30 rounded">
          <AlertCircle size={12} className="text-scarlet-400" />
          <span className="text-scarlet-300">{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 glass border border-glass-border rounded space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Rule Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Account ID</label>
              <input value={accountId} onChange={e => setAccountId(e.target.value)} required
                className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Event Type</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
              >
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Requires Approval</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={requiresApproval} onChange={e => setRequiresApproval(e.target.checked)}
                  className="accent-scarlet-500"
                />
                <span className="text-xs font-mono text-white/60">{requiresApproval ? 'Yes' : 'No'}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.6rem] text-white/40 font-mono">Conditions</span>
              <button type="button" onClick={() => setConditions([...conditions, emptyCondition()])}
                className="text-[0.6rem] text-scarlet-400 hover:text-scarlet-300 font-mono"
              >+ Add Condition</button>
            </div>
            <div className="space-y-2">
              {conditions.map((cond, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input value={cond.field} onChange={e => {
                    const c = [...conditions]; c[i] = { ...c[i], field: e.target.value }; setConditions(c)
                  }} placeholder="field" className="w-28 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                  <select value={cond.operator} onChange={e => {
                    const c = [...conditions]; c[i] = { ...c[i], operator: e.target.value as any }; setConditions(c)
                  }} className="w-28 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded">
                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input value={String(cond.value)} onChange={e => {
                    const c = [...conditions]; c[i] = { ...c[i], value: e.target.value }; setConditions(c)
                  }} placeholder="value" className="flex-1 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                  <button type="button" onClick={() => setConditions(conditions.filter((_, j) => j !== i))}
                    className="p-1 text-scarlet-400 hover:text-scarlet-300"
                  ><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.6rem] text-white/40 font-mono">Actions</span>
              <button type="button" onClick={() => setActions([...actions, {}])}
                className="text-[0.6rem] text-scarlet-400 hover:text-scarlet-300 font-mono"
              >+ Add Action</button>
            </div>
            <div className="space-y-2">
              {actions.map((action, i) => {
                const actionType = ACTION_TYPES.find(k => k in action) || 'TransferToSavings'
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <select value={actionType} onChange={e => {
                      const a = [...actions]; a[i] = { [e.target.value]: {} as any }; setActions(a)
                    }} className="w-36 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded">
                      {ACTION_TYPES.map(t => <option key={t} value={t}>{t.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                    </select>
                    {actionType === 'TransferToSavings' && (
                      <>
                        <input placeholder="account_id" value={action.TransferToSavings?.account_id || ''} onChange={e => {
                          const a = [...actions]; a[i] = { TransferToSavings: { ...a[i].TransferToSavings!, account_id: e.target.value, amount_expression: a[i].TransferToSavings?.amount_expression || '' } }; setActions(a)
                        }} className="w-28 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                        <input placeholder="expression" value={action.TransferToSavings?.amount_expression || ''} onChange={e => {
                          const a = [...actions]; a[i] = { TransferToSavings: { ...a[i].TransferToSavings!, amount_expression: e.target.value, account_id: a[i].TransferToSavings?.account_id || '' } }; setActions(a)
                        }} className="w-28 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                      </>
                    )}
                    {actionType === 'ReserveTaxFunds' && (
                      <input type="number" step="0.01" placeholder="percentage" value={action.ReserveTaxFunds?.percentage || ''} onChange={e => {
                        const a = [...actions]; a[i] = { ReserveTaxFunds: { percentage: parseFloat(e.target.value) || 0 } }; setActions(a)
                      }} className="w-28 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                    )}
                    {actionType === 'Notify' && (
                      <select value={action.Notify?.channel || 'Email'} onChange={e => {
                        const a = [...actions]; a[i] = { Notify: { channel: e.target.value as any } }; setActions(a)
                      }} className="w-28 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded">
                        {NOTIFY_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                    {actionType === 'BlockTransaction' && (
                      <input placeholder="reason" value={action.BlockTransaction?.reason || ''} onChange={e => {
                        const a = [...actions]; a[i] = { BlockTransaction: { reason: e.target.value } }; setActions(a)
                      }} className="w-40 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                    )}
                    {actionType === 'CategorizeTransaction' && (
                      <input placeholder="category" value={action.CategorizeTransaction?.category || ''} onChange={e => {
                        const a = [...actions]; a[i] = { CategorizeTransaction: { category: e.target.value } }; setActions(a)
                      }} className="w-28 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                    )}
                    {actionType === 'CreateApprovalWorkflow' && (
                      <input placeholder="approver1, approver2" value={action.CreateApprovalWorkflow?.approvers.join(', ') || ''} onChange={e => {
                        const a = [...actions]; a[i] = { CreateApprovalWorkflow: { approvers: e.target.value.split(',').map(s => s.trim()) } }; setActions(a)
                      }} className="w-40 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded" />
                    )}
                    <button type="button" onClick={() => setActions(actions.filter((_, j) => j !== i))}
                      className="p-1 text-scarlet-400 hover:text-scarlet-300"
                    ><Trash2 size={12} /></button>
                  </div>
                )
              })}
            </div>
          </div>

          <button type="submit"
            className="px-4 py-1.5 text-xs font-mono bg-scarlet-600 hover:bg-scarlet-500 text-white rounded transition-colors"
          >Create Rule</button>
        </form>
      )}

      {loading ? (
        <div className="text-xs font-mono text-white/40">Loading rules...</div>
      ) : rules.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-white/30 glass border border-glass-border rounded">
          No programmable banking rules yet. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 glass border border-glass-border rounded space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${rule.is_active ? 'bg-success shadow-lg shadow-success/30' : 'bg-white/20'}`} />
                  <span className="text-sm font-mono font-semibold">{rule.name}</span>
                  <span className="text-[0.6rem] text-white/30 font-mono bg-carbon-800 px-1.5 py-0.5 rounded">
                    {rule.event_type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {rule.requires_approval && (
                    <span className="text-[0.6rem] text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded">Requires Approval</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[0.6rem] text-white/30 font-mono">DRRT {rule.drrt_coherence_score.toFixed(3)}</span>
                  <button onClick={() => handleToggle(rule.id)}
                    className="p-1 text-white/40 hover:text-scarlet-400 transition-colors"
                    title={rule.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {rule.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  <button onClick={() => handleDelete(rule.id)}
                    className="p-1 text-white/40 hover:text-scarlet-400 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-white/50 font-mono">{rule.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {rule.conditions.map((c, i) => (
                  <span key={i} className="text-[0.6rem] text-white/40 font-mono bg-carbon-800 px-1.5 py-0.5 rounded">
                    {c.field} {c.operator} {JSON.stringify(c.value)}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rule.actions.map((a, i) => (
                  <span key={i} className="text-[0.6rem] text-emerald-400/70 font-mono bg-emerald-400/5 px-1.5 py-0.5 rounded">
                    {actionTypeLabel(a)}: {actionSummary(a)}
                  </span>
                ))}
              </div>
              <details className="group">
                <summary className="text-[0.55rem] text-white/20 font-mono cursor-pointer hover:text-white/40 transition-colors select-none">
                  Raw Rule JSON
                </summary>
                <pre className="mt-1 p-2 text-[0.55rem] font-mono text-white/20 bg-carbon-900 rounded overflow-x-auto leading-relaxed">
                  {stringifyRule(rule)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
