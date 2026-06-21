'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { AlertCircle, Search } from 'lucide-react'

interface AuditLogEntry {
  id: string
  user: string
  action: string
  entity_type: string
  entity_id: string | null
  before_state: any
  after_state: any
  ip_address: string | null
  created_at: string
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterEntity, setFilterEntity] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getAuditLogs({ limit: 100 })
      setLogs(data || [])
      setError('')
    } catch (err: any) {
      setError(err?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  useEffect(() => {
    let result = logs
    if (filterEntity) {
      result = result.filter(l => l.entity_type.toLowerCase().includes(filterEntity.toLowerCase()))
    }
    if (filterAction) {
      result = result.filter(l => l.action.toLowerCase().includes(filterAction.toLowerCase()))
    }
    setFilteredLogs(result)
  }, [logs, filterEntity, filterAction])

  const actionColor = (action: string) => {
    if (action.includes('approve') || action.includes('create')) return 'text-success'
    if (action.includes('reject') || action.includes('delete')) return 'text-error'
    if (action.includes('update') || action.includes('toggle')) return 'text-warning'
    return 'text-charcoal-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-xl text-secondary">Audit Log</h1>
        <p className="text-body-sm text-charcoal-500 mt-1">
          Track all mutations and approvals across the platform
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-caption bg-error/10 border border-error/20 rounded-lg">
          <AlertCircle size={14} className="text-error shrink-0" />
          <span className="text-error">{error}</span>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px] bg-white border border-charcoal-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-charcoal-400 shrink-0" />
          <input value={filterEntity} onChange={e => setFilterEntity(e.target.value)} placeholder="Filter by entity type..."
            className="flex-1 bg-transparent text-body-sm text-secondary placeholder-charcoal-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px] bg-white border border-charcoal-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-charcoal-400 shrink-0" />
          <input value={filterAction} onChange={e => setFilterAction(e.target.value)} placeholder="Filter by action..."
            className="flex-1 bg-transparent text-body-sm text-secondary placeholder-charcoal-400 outline-none"
          />
        </div>
        <div className="text-caption text-charcoal-500 flex items-center">
          {filteredLogs.length} of {logs.length} entries
        </div>
      </div>

      {loading ? (
        <div className="text-body-sm text-charcoal-500 py-8 text-center">Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-body-sm text-charcoal-400 bg-white border border-charcoal-200 rounded-lg">
          {logs.length === 0 ? (
            <div className="space-y-2">
              <p>No audit log entries yet.</p>
              <p className="text-caption">Audit entries are created automatically when you perform actions like creating rules, approving workflows, or updating compliance records.</p>
            </div>
          ) : 'No entries match your filters.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(entry => (
            <div key={entry.id} className="p-4 bg-white border border-charcoal-200 rounded-lg flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-body-sm font-semibold text-secondary">{entry.user}</span>
                  <span className={`text-caption font-medium ${actionColor(entry.action)}`}>{entry.action.replace(/_/g, ' ')}</span>
                  <span className="text-caption text-charcoal-500 bg-charcoal-100 px-1.5 py-0.5 rounded">{entry.entity_type}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-caption text-charcoal-500 flex-wrap">
                  <span>{new Date(entry.created_at).toLocaleString()}</span>
                  {entry.entity_id && <span>ID: {entry.entity_id.slice(0, 8)}...</span>}
                  {entry.ip_address && <span>IP: {entry.ip_address}</span>}
                </div>
                {(entry.before_state || entry.after_state) && (
                  <details className="mt-2 group">
                    <summary className="text-caption text-charcoal-400 cursor-pointer hover:text-charcoal-600 transition-colors select-none">
                      State diff
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {entry.before_state && (
                        <div>
                          <div className="text-caption text-error/70 font-mono mb-0.5">Before</div>
                          <pre className="p-2 bg-charcoal-50 rounded text-caption text-charcoal-500 overflow-x-auto">
                            {JSON.stringify(entry.before_state, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entry.after_state && (
                        <div>
                          <div className="text-caption text-success/70 font-mono mb-0.5">After</div>
                          <pre className="p-2 bg-charcoal-50 rounded text-caption text-charcoal-500 overflow-x-auto">
                            {JSON.stringify(entry.after_state, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
