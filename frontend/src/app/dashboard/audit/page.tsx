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
    } catch {
      setError('Failed to load audit logs')
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
    if (action.includes('approve') || action.includes('create')) return 'text-emerald-400'
    if (action.includes('reject') || action.includes('delete')) return 'text-scarlet-400'
    if (action.includes('update') || action.includes('toggle')) return 'text-amber-400'
    return 'text-white/60'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-mono font-semibold tracking-tight">Audit Log</h1>
        <p className="text-xs text-white/40 font-mono mt-0.5">
          Track all mutations and approvals across the platform
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs font-mono bg-scarlet-600/10 border border-scarlet-600/30 rounded">
          <AlertCircle size={12} className="text-scarlet-400" />
          <span className="text-scarlet-300">{error}</span>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px] glass border border-glass-border rounded px-2 py-1">
          <Search size={12} className="text-white/30" />
          <input value={filterEntity} onChange={e => setFilterEntity(e.target.value)} placeholder="Filter by entity type..."
            className="flex-1 bg-transparent text-xs font-mono text-white/70 placeholder-white/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px] glass border border-glass-border rounded px-2 py-1">
          <Search size={12} className="text-white/30" />
          <input value={filterAction} onChange={e => setFilterAction(e.target.value)} placeholder="Filter by action..."
            className="flex-1 bg-transparent text-xs font-mono text-white/70 placeholder-white/20 outline-none"
          />
        </div>
        <div className="text-[0.6rem] text-white/30 font-mono flex items-center">
          {filteredLogs.length} of {logs.length} entries
        </div>
      </div>

      {loading ? (
        <div className="text-xs font-mono text-white/40">Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-white/30 glass border border-glass-border rounded">
          {logs.length === 0 ? 'No audit log entries yet.' : 'No entries match your filters.'}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredLogs.map(entry => (
            <div key={entry.id} className="p-3 glass border border-glass-border rounded flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-scarlet-500 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-white/80">{entry.user}</span>
                  <span className={`text-[0.6rem] font-mono ${actionColor(entry.action)}`}>{entry.action.replace(/_/g, ' ')}</span>
                  <span className="text-[0.6rem] text-white/30 font-mono bg-carbon-800 px-1.5 py-0.5 rounded">{entry.entity_type}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[0.6rem] font-mono text-white/30">
                  <span>{new Date(entry.created_at).toLocaleString()}</span>
                  {entry.entity_id && <span>ID: {entry.entity_id.slice(0, 8)}...</span>}
                  {entry.ip_address && <span>IP: {entry.ip_address}</span>}
                </div>
                {(entry.before_state || entry.after_state) && (
                  <details className="mt-1 group">
                    <summary className="text-[0.55rem] text-white/20 font-mono cursor-pointer hover:text-white/40 transition-colors select-none">
                      State diff
                    </summary>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {entry.before_state && (
                        <div>
                          <div className="text-[0.55rem] text-scarlet-400/50 font-mono mb-0.5">Before</div>
                          <pre className="p-1.5 bg-carbon-900 rounded text-[0.5rem] font-mono text-white/20 overflow-x-auto">
                            {JSON.stringify(entry.before_state, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entry.after_state && (
                        <div>
                          <div className="text-[0.55rem] text-emerald-400/50 font-mono mb-0.5">After</div>
                          <pre className="p-1.5 bg-carbon-900 rounded text-[0.5rem] font-mono text-white/20 overflow-x-auto">
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
