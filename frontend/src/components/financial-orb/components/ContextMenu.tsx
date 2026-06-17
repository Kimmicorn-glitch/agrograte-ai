'use client'

import { useState, useEffect, useCallback } from 'react'
import { Expand, Minimize2, Brain, Copy, Eye, EyeOff } from 'lucide-react'
import { useGraphStore } from '../store/graph-store'

export function ContextMenu() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [nodeId, setNodeId] = useState<string | null>(null)
  const nodes = useGraphStore((s) => s.nodes)
  const expandNode = useGraphStore((s) => s.expandNode)
  const collapseNode = useGraphStore((s) => s.collapseNode)
  const toggleDrrtLayer = useGraphStore((s) => s.toggleDrrtLayer)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault()
      const store = useGraphStore.getState()
      if (store.selectedNodeId) {
        setPos({ x: e.clientX, y: e.clientY })
        setNodeId(store.selectedNodeId)
      }
    }
    window.addEventListener('contextmenu', handler)
    return () => window.removeEventListener('contextmenu', handler)
  }, [])

  useEffect(() => {
    if (!pos) return
    const close = () => setPos(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [pos])

  const handleAction = useCallback(
    (action: string) => {
      if (!nodeId) return
      const node = nodes.find((n) => n.id === nodeId)
      switch (action) {
        case 'expand':
          if (node && !node.expanded) expandNode(nodeId)
          break
        case 'collapse':
          if (node && node.expanded) collapseNode(nodeId)
          break
        case 'drrt':
          toggleDrrtLayer()
          break
        case 'copy':
          navigator.clipboard.writeText(nodeId)
          break
      }
      setPos(null)
    },
    [nodeId, nodes, expandNode, collapseNode, toggleDrrtLayer]
  )

  if (!pos) return null

  const node = nodeId ? nodes.find((n) => n.id === nodeId) : null

  return (
    <div
      className="fixed z-[100] glass rounded-xl border border-glass-border shadow-2xl py-1 min-w-[200px]"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="px-3 py-2 border-b border-glass-border">
        <p className="text-[0.55rem] font-mono text-white/40 uppercase tracking-wider">Layer {node?.layer}</p>
        <p className="text-xs font-mono text-white/80 truncate">{node?.label}</p>
      </div>
      {[
        { id: 'expand', label: 'Expand', icon: <Expand size={12} />, hidden: node?.expanded },
        { id: 'collapse', label: 'Collapse', icon: <Minimize2 size={12} />, hidden: !node?.expanded },
        { id: 'drrt', label: 'Inspect DRRT', icon: <Brain size={12} />, hidden: false },
        { id: 'copy', label: 'Copy Node ID', icon: <Copy size={12} />, hidden: false },
      ]
        .filter((item) => !item.hidden)
        .map((item) => (
          <button
            key={item.id}
            onClick={() => handleAction(item.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-white/60 hover:text-white hover:bg-glass-hover transition-colors"
          >
            <span className="text-white/40">{item.icon}</span>
            {item.label}
          </button>
        ))}
    </div>
  )
}
