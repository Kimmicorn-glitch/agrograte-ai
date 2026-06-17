'use client'

import { useCallback } from 'react'
import { ChevronRight, ChevronLeft, Expand, Minimize2 } from 'lucide-react'
import { useGraphStore } from '../store/graph-store'
import { LAYER_COLORS } from '../types'
import type { LayerLevel, CategoryType } from '../types'

const LAYER_NAMES: Record<number, string> = {
  1: 'Business Core',
  2: 'Categories',
  3: 'Subcategories',
  4: 'Transactions',
}

export function LayerNavigator() {
  const scene = useGraphStore((s) => s.scene)
  const nodes = useGraphStore((s) => s.nodes)
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const expandNode = useGraphStore((s) => s.expandNode)
  const collapseNode = useGraphStore((s) => s.collapseNode)
  const navigateToLayer = useGraphStore((s) => s.navigateToLayer)
  const setAutoRotate = useGraphStore((s) => s.setAutoRotate)

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null

  const handleBreadcrumb = useCallback(
    (idx: number) => {
      navigateToLayer((idx + 1) as LayerLevel)
    },
    [navigateToLayer]
  )

  const handleExpandCollapse = useCallback(() => {
    if (!selectedNode) return
    if (selectedNode.expanded) {
      collapseNode(selectedNode.id)
    } else {
      expandNode(selectedNode.id)
    }
  }, [selectedNode, expandNode, collapseNode])

  const categoryColor = selectedNode
    ? LAYER_COLORS[selectedNode.category] || '#FFFFFF'
    : '#FFFFFF'

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
      <div className="glass rounded-full border border-glass-border px-5 py-2.5 flex items-center gap-2 shadow-2xl">
        {scene.layerPath.map((name, i) => (
          <button
            key={`${name}-${i}`}
            onClick={() => handleBreadcrumb(i)}
            className={`text-[0.6rem] font-mono tracking-wider uppercase transition-colors ${
              i === scene.layerPath.length - 1
                ? 'text-white font-semibold'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {name}
            {i < scene.layerPath.length - 1 && (
              <ChevronRight size={10} className="inline ml-1.5 -mt-0.5 text-white/20" />
            )}
          </button>
        ))}

        {scene.activeLayer < 4 && (
          <span className="text-white/15 text-[0.5rem] font-mono ml-1">
            L{scene.activeLayer}/4
          </span>
        )}
      </div>

      {selectedNode && selectedNode.layer >= 2 && (
        <button
          onClick={handleExpandCollapse}
          className="glass rounded-full border border-glass-border p-2.5 hover:bg-glass-hover transition-colors shadow-2xl"
          title={selectedNode.expanded ? 'Collapse' : 'Expand'}
        >
          {selectedNode.expanded ? (
            <Minimize2 size={12} className="text-white/60" />
          ) : (
            <Expand size={12} className="text-white/60" />
          )}
        </button>
      )}
    </div>
  )
}
