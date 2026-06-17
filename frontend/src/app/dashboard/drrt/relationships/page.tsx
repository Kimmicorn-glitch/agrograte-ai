'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { Network, Plus, Zap, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

const DIMENSION_OPTIONS = [
  'transaction_value', 'account_balance', 'customer_trust', 'supplier_reliability',
  'invoice_validity', 'tax_compliance', 'vat_alignment', 'cash_flow_liquidity',
  'regulatory_risk', 'payment_velocity', 'credit_exposure', 'audit_trail',
]

const RELATION_TYPES = ['financial_flow', 'trust_link', 'compliance_dependency', 'temporal_sequence', 'causal_dependency', 'audit_trail']
const SIGNS = ['positive', 'negative', 'neutral']

export default function DrrtRelationshipsPage() {
  const [state, setState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)

  const [form, setForm] = useState({
    source: '',
    target: '',
    relation_type: '',
    strength: 0.5,
    sign: '',
  })

  const load = () => {
    api.getDrrtState().then(d => { setState(d); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.source || !form.target || !form.relation_type || !form.sign) {
      setMessage({ type: 'error', text: 'All fields required' })
      return
    }
    if (form.source === form.target) {
      setMessage({ type: 'error', text: 'Source and target must differ' })
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const result = await api.addRelationship(form)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: `Relationship added — ${result.convergence}` })
        setState(result)
        setForm({ source: '', target: '', relation_type: '', strength: 0.5, sign: '' })
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    }
    setSubmitting(false)
  }

  const relationships = state?.relationships ?? []
  const dims = state?.dimensions ?? []
  const dimName = (id: string) => dims.find((d: any) => d.id === id)?.name ?? id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Tensor Relationships</h1>
        <p className="text-[0.65rem] text-white/40 font-mono mt-0.5">
          Define and manage relationships between financial dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <MetricTile label="Active Relationships" value={relationships.length} status={relationships.length > 0 ? 'success' : 'neutral'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Tensor Coherence" value={`${((state?.state?.coherence ?? 0) * 100).toFixed(1)}%`} status={(state?.state?.coherence ?? 0) > 0.8 ? 'success' : (state?.state?.coherence ?? 0) > 0.5 ? 'warning' : 'error'} />
        </GlassCard>
        <GlassCard>
          <MetricTile label="Convergence Iterations" value={state?.state?.convergence_iterations ?? 0} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Plus size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Add Relationship</h2>
          </div>

          {message && (
            <div className={`flex items-center gap-1.5 text-[0.6rem] mb-3 px-3 py-2 rounded-lg ${
              message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>
              {message.type === 'success' ? <CheckCircle size={10} /> : <XCircle size={10} />}
              {message.text}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-[0.55rem] text-white/40 font-mono block mb-1">Source Dimension</label>
              <select
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 font-mono"
              >
                <option value="">Select...</option>
                {DIMENSION_OPTIONS.map(d => (
                  <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[0.55rem] text-white/40 font-mono block mb-1">Target Dimension</label>
              <select
                value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 font-mono"
              >
                <option value="">Select...</option>
                {DIMENSION_OPTIONS.map(d => (
                  <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[0.55rem] text-white/40 font-mono block mb-1">Relation Type</label>
              <select
                value={form.relation_type}
                onChange={e => setForm(f => ({ ...f, relation_type: e.target.value }))}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 font-mono"
              >
                <option value="">Select...</option>
                {RELATION_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[0.55rem] text-white/40 font-mono block mb-1">
                Strength: {form.strength.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.strength}
                onChange={e => setForm(f => ({ ...f, strength: parseFloat(e.target.value) }))}
                className="w-full accent-scarlet-400"
              />
            </div>

            <div>
              <label className="text-[0.55rem] text-white/40 font-mono block mb-1">Sign</label>
              <div className="flex gap-2">
                {SIGNS.map(s => (
                  <button
                    key={s}
                    onClick={() => setForm(f => ({ ...f, sign: s }))}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                      form.sign === s
                        ? 'bg-scarlet-400/20 border-scarlet-400/40 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full text-xs flex items-center justify-center gap-1.5"
            >
              <Zap size={12} className={submitting ? 'animate-pulse' : ''} />
              {submitting ? 'Adding & Converging...' : 'Add Relationship'}
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Network size={14} className="text-scarlet-400" />
            <h2 className="section-title mb-0">Active Relationships</h2>
          </div>
          {relationships.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/30 font-mono">
              No relationships yet. Use the form to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {relationships.map((r: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-lg px-4 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.6rem] font-mono text-white/80">{dimName(r.source_id)}</span>
                    <span className={`text-[0.55rem] font-mono ${r.sign === 'Positive' ? 'text-success' : r.sign === 'Negative' ? 'text-error' : 'text-white/40'}`}>
                      &rarr;
                    </span>
                    <span className="text-[0.6rem] font-mono text-white/80">{dimName(r.target_id)}</span>
                  </div>
                  <div className="flex justify-between text-[0.5rem] text-white/30 font-mono">
                    <span>{r.relation_type.replace(/_/g, ' ')}</span>
                    <span>strength: {r.strength.toFixed(2)}</span>
                    <span>sign: {r.sign}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-glass-border flex items-center gap-2 text-[0.55rem] text-white/30 font-mono">
            <Zap size={10} /> Auto-converges after each relationship
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
