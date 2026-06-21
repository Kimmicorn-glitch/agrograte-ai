'use client'

import { Html } from '@react-three/drei'
import { useNeuralTwinStore } from '../store/graph-store'
import type { GraphNode } from '../types'

function NodeDetail({ node }: { node: GraphNode }) {
  switch (node.type) {
    case 'account':
      return (
        <div className="space-y-2">
          <DetailRow label="Account Name" value={node.label} />
          <DetailRow label="Balance" value={`R${Number(node.metadata.balance || node.value || 0).toLocaleString()}`} />
          <DetailRow label="Available" value={`R${Number(node.metadata.available || 0).toLocaleString()}`} />
          <DetailRow label="Monthly Inflow" value={`R${Number(node.metadata.inflow || 0).toLocaleString()}`} />
          <DetailRow label="Monthly Outflow" value={`R${Number(node.metadata.outflow || 0).toLocaleString()}`} />
          <DetailRow label="Risk Rating" value={(node.metadata.risk as string) || 'Low'} />
          <DetailRow label="Transactions" value={`${node.metadata.transactions || 0}`} />
        </div>
      )
    case 'cluster':
      return (
        <div className="space-y-2">
          <DetailRow label="Category" value={node.label} />
          <DetailRow label="Total Spend" value={`R${Math.abs(node.value || 0).toLocaleString()}`} />
          <DetailRow label="Frequency" value={`${node.metadata.frequency || 0} txns/month`} />
          <DetailRow label="Volatility" value={`${((node.metadata.volatility as number) || 0) * 100}%`} />
          <DetailRow label="Trend" value={(node.metadata.trend as string) || 'Stable'} />
        </div>
      )
    case 'merchant':
      return (
        <div className="space-y-2">
          <DetailRow label="Merchant" value={node.label} />
          <DetailRow label="Total" value={`R${Math.abs(node.value || 0).toLocaleString()}`} />
          <DetailRow label="Transactions" value={`${node.metadata.transactions || 0}`} />
        </div>
      )
    case 'risk':
      return (
        <div className="space-y-2">
          <DetailRow label="Anomaly" value={node.label} />
          <DetailRow label="Severity" value={(node.metadata.severity as string) || 'High'} />
          <DetailRow label="Detected" value={(node.metadata.detected as string) || 'N/A'} />
          <DetailRow label="Impact" value={`R${Math.abs((node.metadata.impact as number) || 0).toLocaleString()}`} />
          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
            {node.metadata.recommendation as string || 'Review this anomaly'}
          </div>
        </div>
      )
    case 'drrt':
      return (
        <div className="space-y-2">
          <DetailRow label="DRRT Node" value={node.label} />
          <DetailRow label="Coherence" value={`${((node.metadata.coherence as number) || 0) * 100}%`} />
          <DetailRow label="Entropy" value={`${((node.metadata.entropy as number) || 0) * 100}%`} />
          <DetailRow label="Memory" value={`${node.metadata.memory || 0} entries`} />
          <DetailRow label="Resolution" value={(node.metadata.resolution as string) || 'Active'} />
        </div>
      )
    default:
      return <DetailRow label="ID" value={node.id} />
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}

export function NodeInspector({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const { edges } = useNeuralTwinStore()
  const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id)

  return (
    <Html distanceFactor={30} center>
      <div className="bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl min-w-[380px] max-w-[480px] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }} />
            <span className="text-white font-semibold text-sm capitalize">{node.type}</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-sm">✕</button>
        </div>
        <div className="p-4">
          <NodeDetail node={node} />
          {connectedEdges.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="text-xs text-slate-500 mb-1.5">Relationships ({connectedEdges.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {connectedEdges.slice(0, 8).map((e) => (
                  <span key={e.id} className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded-full">
                    {e.label}
                  </span>
                ))}
                {connectedEdges.length > 8 && (
                  <span className="text-xs text-slate-500">+{connectedEdges.length - 8} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Html>
  )
}
