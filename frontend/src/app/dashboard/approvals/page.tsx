'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { CheckCircle, XCircle, Clock, AlertCircle, Plus } from 'lucide-react'

interface ApprovalWorkflow {
  id: string
  rule_id: string | null
  trigger_type: string
  entity_type: string
  entity_id: string | null
  requester: string
  approver_ids: string[]
  approved_by: string[]
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
  reason: string | null
  drrt_coherence: number
  created_at: string
  updated_at: string
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'text-amber-400 bg-amber-400/10',
  Approved: 'text-emerald-400 bg-emerald-400/10',
  Rejected: 'text-scarlet-400 bg-scarlet-400/10',
  Cancelled: 'text-white/30 bg-white/5',
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [showForm, setShowForm] = useState(false)

  const [requester, setRequester] = useState('')
  const [triggerType, setTriggerType] = useState('rule_execution')
  const [entityType, setEntityType] = useState('banking_rule')
  const [approverIds, setApproverIds] = useState('')
  const [approveReason, setApproveReason] = useState('')

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true)
      const data = tab === 'pending' ? await api.getApprovalsPending() : await api.getApprovalsAll()
      setApprovals(data || [])
      setError('')
    } catch {
      setError('Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchApprovals() }, [fetchApprovals])

  const handleApprove = async (id: string) => {
    try {
      await api.approveApproval(id, { approved_by: 'admin', reason: approveReason || undefined })
      setApproveReason('')
      await fetchApprovals()
    } catch {
      setError('Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await api.rejectApproval(id, { approved_by: 'admin', reason: approveReason || undefined })
      setApproveReason('')
      await fetchApprovals()
    } catch {
      setError('Failed to reject')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createApproval({
        trigger_type: triggerType,
        entity_type: entityType,
        requester,
        approver_ids: approverIds.split(',').map(s => s.trim()).filter(Boolean),
        reason: null,
      })
      setShowForm(false)
      setRequester('')
      setTriggerType('rule_execution')
      setEntityType('banking_rule')
      setApproverIds('')
      await fetchApprovals()
    } catch {
      setError('Failed to create approval request')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-semibold tracking-tight">Approval Workflows</h1>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            Review and manage pending approval requests
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono glass border border-glass-border hover:bg-glass-hover transition-all"
        >
          <Plus size={12} />
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs font-mono bg-scarlet-600/10 border border-scarlet-600/30 rounded">
          <AlertCircle size={12} className="text-scarlet-400" />
          <span className="text-scarlet-300">{error}</span>
        </div>
      )}

      <div className="flex gap-1 glass border border-glass-border rounded p-1 w-fit">
        <button onClick={() => setTab('pending')}
          className={`px-3 py-1 text-xs font-mono rounded transition-colors ${tab === 'pending' ? 'bg-scarlet-600 text-white' : 'text-white/60 hover:text-white'}`}
        >Pending</button>
        <button onClick={() => setTab('all')}
          className={`px-3 py-1 text-xs font-mono rounded transition-colors ${tab === 'all' ? 'bg-scarlet-600 text-white' : 'text-white/60 hover:text-white'}`}
        >All</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 glass border border-glass-border rounded space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Requester</label>
              <input value={requester} onChange={e => setRequester(e.target.value)} required
                className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Trigger Type</label>
              <select value={triggerType} onChange={e => setTriggerType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
              >
                <option value="rule_execution">Rule Execution</option>
                <option value="transaction_alert">Transaction Alert</option>
                <option value="compliance_review">Compliance Review</option>
                <option value="tax_reserve">Tax Reserve</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Entity Type</label>
              <select value={entityType} onChange={e => setEntityType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
              >
                <option value="banking_rule">Banking Rule</option>
                <option value="transaction">Transaction</option>
                <option value="compliance">Compliance</option>
                <option value="tax_reserve">Tax Reserve</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.6rem] text-white/40 font-mono mb-1">Approvers (comma-separated)</label>
              <input value={approverIds} onChange={e => setApproverIds(e.target.value)} placeholder="admin, cfo, compliance"
                className="w-full px-2 py-1.5 text-xs font-mono bg-carbon-800 border border-glass-border rounded focus:outline-none focus:border-scarlet-500"
              />
            </div>
          </div>
          <button type="submit"
            className="px-4 py-1.5 text-xs font-mono bg-scarlet-600 hover:bg-scarlet-500 text-white rounded transition-colors"
          >Submit Request</button>
        </form>
      )}

      {loading ? (
        <div className="text-xs font-mono text-white/40">Loading approvals...</div>
      ) : approvals.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-white/30 glass border border-glass-border rounded">
          {tab === 'pending' ? 'No pending approval requests.' : 'No approval requests found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {approvals.map(a => (
            <div key={a.id} className="p-4 glass border border-glass-border rounded space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {a.status === 'Pending' ? <Clock size={14} className="text-amber-400" /> :
                   a.status === 'Approved' ? <CheckCircle size={14} className="text-emerald-400" /> :
                   a.status === 'Rejected' ? <XCircle size={14} className="text-scarlet-400" /> :
                   <AlertCircle size={14} className="text-white/30" />}
                  <span className={`text-[0.6rem] font-mono px-1.5 py-0.5 rounded ${STATUS_COLORS[a.status] || ''}`}>
                    {a.status}
                  </span>
                  <span className="text-sm font-mono font-semibold">{a.trigger_type.replace(/_/g, ' ')}</span>
                  <span className="text-[0.6rem] text-white/30 font-mono bg-carbon-800 px-1.5 py-0.5 rounded">
                    {a.entity_type}
                  </span>
                </div>
                <span className="text-[0.6rem] text-white/30 font-mono">DRRT {a.drrt_coherence.toFixed(3)}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[0.65rem] font-mono text-white/50">
                <div>Requester: <span className="text-white/70">{a.requester}</span></div>
                <div>Approvers: <span className="text-white/70">{a.approver_ids.join(', ') || '—'}</span></div>
                <div>Approved by: <span className="text-white/70">{a.approved_by.join(', ') || '—'}</span></div>
                <div>Created: <span className="text-white/70">{new Date(a.created_at).toLocaleDateString()}</span></div>
              </div>

              {a.reason && (
                <div className="text-[0.6rem] text-white/40 font-mono italic bg-carbon-800/50 px-2 py-1 rounded">
                  &ldquo;{a.reason}&rdquo;
                </div>
              )}

              {a.status === 'Pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <input value={approveReason} onChange={e => setApproveReason(e.target.value)} placeholder="Reason (optional)"
                    className="flex-1 px-2 py-1 text-[0.65rem] font-mono bg-carbon-800 border border-glass-border rounded"
                  />
                  <button onClick={() => handleApprove(a.id)}
                    className="flex items-center gap-1 px-3 py-1 text-[0.65rem] font-mono bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                  ><CheckCircle size={10} /> Approve</button>
                  <button onClick={() => handleReject(a.id)}
                    className="flex items-center gap-1 px-3 py-1 text-[0.65rem] font-mono bg-scarlet-600 hover:bg-scarlet-500 text-white rounded transition-colors"
                  ><XCircle size={10} /> Reject</button>
                </div>
              )}

              {a.status === 'Approved' && a.approved_by.length > 0 && (
                <div className="flex items-center gap-1 text-[0.6rem] text-emerald-400/60 font-mono">
                  <CheckCircle size={10} />
                  Approved by {a.approved_by.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
