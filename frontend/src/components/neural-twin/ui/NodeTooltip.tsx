'use client'

import { Html } from '@react-three/drei'
import type { GraphNode } from '../types'

export function NodeTooltip({ node }: { node: GraphNode }) {
  return (
    <Html distanceFactor={15}>
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg px-5 py-4 shadow-2xl min-w-[280px] pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }} />
          <span className="text-white text-base font-semibold">{node.label}</span>
        </div>
        <div className="text-sm text-slate-400 space-y-1">
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
