'use client'

import { Html } from '@react-three/drei'
import type { GraphNode } from '../types'

export function NodeTooltip({ node }: { node: GraphNode }) {
  return (
    <Html distanceFactor={10}>
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl px-6 py-5 shadow-2xl min-w-[400px] pointer-events-none">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: node.color }} />
          <span className="text-white text-xl font-bold">{node.label}</span>
        </div>
        <div className="text-base text-slate-400 space-y-1.5 leading-relaxed">
          <span className="capitalize text-slate-500 font-medium">{node.type}</span>
          {node.value ? <div className="text-white/90">Value: R{Math.abs(node.value).toLocaleString()}</div> : null}
          {node.metadata?.balance ? <div className="text-white/90">Balance: R{Number(node.metadata.balance).toLocaleString()}</div> : null}
          {node.metadata?.available ? <div className="text-white/90">Available: R{Number(node.metadata.available).toLocaleString()}</div> : null}
          {node.metadata?.inflow ? <div className="text-white/90">Monthly Inflow: R{Number(node.metadata.inflow).toLocaleString()}</div> : null}
          {node.metadata?.outflow ? <div className="text-white/90">Monthly Outflow: R{Number(node.metadata.outflow).toLocaleString()}</div> : null}
          {node.metadata?.risk ? <div className="text-white/90">Risk Rating: <span className="text-red-400 font-semibold">{node.metadata.risk as string}</span></div> : null}
          {node.metadata?.merchants ? <div className="text-white/90">Merchants: {node.metadata.merchants as string}</div> : null}
          {node.metadata?.transactions ? <div className="text-white/90">Transactions: {node.metadata.transactions as string}</div> : null}
        </div>
      </div>
    </Html>
  )
}
