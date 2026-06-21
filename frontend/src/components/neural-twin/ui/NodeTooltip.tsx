'use client'

import { Html } from '@react-three/drei'
import type { GraphNode } from '../types'

export function NodeTooltip({ node }: { node: GraphNode }) {
  return (
    <Html distanceFactor={20}>
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 shadow-2xl min-w-[200px] pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
          <span className="text-white text-sm font-medium">{node.label}</span>
        </div>
        <div className="text-xs text-slate-400 space-y-0.5">
          <span className="capitalize">{node.type}</span>
          {node.value ? <div>Value: R{Math.abs(node.value).toLocaleString()}</div> : null}
          {node.metadata?.balance ? <div>Balance: R{Number(node.metadata.balance).toLocaleString()}</div> : null}
          {node.metadata?.available ? <div>Available: R{Number(node.metadata.available).toLocaleString()}</div> : null}
          {node.metadata?.inflow ? <div>Monthly Inflow: R{Number(node.metadata.inflow).toLocaleString()}</div> : null}
          {node.metadata?.outflow ? <div>Monthly Outflow: R{Number(node.metadata.outflow).toLocaleString()}</div> : null}
          {node.metadata?.risk ? <div>Risk Rating: {node.metadata.risk as string}</div> : null}
          {node.metadata?.merchants ? <div>Merchants: {node.metadata.merchants as string}</div> : null}
          {node.metadata?.transactions ? <div>Transactions: {node.metadata.transactions as string}</div> : null}
        </div>
      </div>
    </Html>
  )
}
