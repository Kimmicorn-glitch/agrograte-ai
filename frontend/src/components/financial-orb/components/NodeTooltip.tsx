'use client'

import { useGraphStore } from '../store/graph-store'
import { LAYER_COLORS, NODE_RADIUS } from '../types'

export function NodeTooltip() {
  const hoveredNodeId = useGraphStore((s) => s.hoveredNodeId)
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const nodes = useGraphStore((s) => s.nodes)

  const activeId = hoveredNodeId || selectedNodeId
  const node = activeId ? nodes.find((n) => n.id === activeId) : null

  if (!node) return null

  const color = LAYER_COLORS[node.category] || '#FFFFFF'
  const layerNames = ['', 'Core', 'Category', 'Subcategory', 'Transaction']

  return (
    <div className="fixed pointer-events-none z-40 bottom-20 left-1/2 -translate-x-1/2">
      <div className="glass rounded-xl border border-glass-border px-4 py-3 shadow-2xl min-w-[260px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
            />
            <span className="text-sm font-mono font-semibold text-white">{node.label}</span>
          </div>
          <span
            className="pill text-[0.5rem] font-mono"
            style={{
              backgroundColor: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            L{node.layer}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <span className="text-[0.5rem] text-white/30 font-mono uppercase">Layer</span>
            <p className="text-[0.65rem] text-white/60 font-mono">{layerNames[node.layer]}</p>
          </div>
          <div>
            <span className="text-[0.5rem] text-white/30 font-mono uppercase">Category</span>
            <p className="text-[0.65rem] text-white/60 font-mono capitalize">{node.category}</p>
          </div>
          <div>
            <span className="text-[0.5rem] text-white/30 font-mono uppercase">Value</span>
            <p className="text-[0.65rem] text-white/60 font-mono">
              R{node.value >= 1_000_000 ? `${(node.value / 1_000_000).toFixed(2)}M` : node.value.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-[0.5rem] text-white/30 font-mono uppercase">Confidence</span>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color, width: `${node.confidence * 100}%` }}
                />
              </div>
              <span className="text-[0.55rem] text-white/40 font-mono">
                {(node.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
