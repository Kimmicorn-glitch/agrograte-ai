'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, ArrowUp, ArrowDown, Layers } from 'lucide-react'
import { useGraphStore } from '../store/graph-store'
import { LAYER_COLORS } from '../types'
import type { LayerNode } from '../types'

export function SearchPanel() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LayerNode[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const nodes = useGraphStore((s) => s.nodes)
  const setSearchQuery = useGraphStore((s) => s.setSearchQuery)
  const selectNode = useGraphStore((s) => s.selectNode)
  const expandNode = useGraphStore((s) => s.expandNode)
  const setAutoRotate = useGraphStore((s) => s.setAutoRotate)
  const setSearchPanelVisible = useGraphStore((s) => s.setSearchPanelVisible)
  const scene = useGraphStore((s) => s.scene)

  useEffect(() => {
    if (scene.searchPanelVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [scene.searchPanelVisible])

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q)
      setSearchQuery(q)
      if (!q.trim()) {
        setResults([])
        return
      }
      const filtered = nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q.toLowerCase()) ||
          n.category.includes(q.toLowerCase()) ||
          n.id.includes(q)
      )
      setResults(filtered.slice(0, 30))
      setSelectedIdx(0)
    },
    [nodes, setSearchQuery]
  )

  const handleSelect = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id)
      if (!node) return

      const ancestors: string[] = []
      let current = node
      while (current.parentId) {
        const parent = nodes.find((n) => n.id === current!.parentId)
        if (parent) {
          ancestors.unshift(parent.id)
          if (!parent.visible) {
            expandNode(parent.id)
          }
          current = parent
        } else break
      }

      selectNode(id)
      setAutoRotate(false)
      setQuery('')
      setResults([])
    },
    [nodes, selectNode, expandNode, setAutoRotate]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && results[selectedIdx]) {
        handleSelect(results[selectedIdx].id)
      } else if (e.key === 'Escape') {
        setSearchPanelVisible(false)
        setQuery('')
        setResults([])
      }
    },
    [results, selectedIdx, handleSelect]
  )

  if (!scene.searchPanelVisible) return null

  const layerNames = ['', 'Core', 'Category', 'Subcategory', 'Transaction']

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg">
      <div className="glass rounded-xl border border-glass-border overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-glass-border">
          <Search size={16} className="text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search financial galaxy..."
            className="flex-1 bg-transparent text-sm font-mono text-white outline-none placeholder-white/30"
          />
          <button
            onClick={() => { setSearchPanelVisible(false); setQuery(''); setResults([]); }}
            className="text-white/40 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
        {results.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {results.map((node, i) => {
              const color = LAYER_COLORS[node.category] || '#FFFFFF'
              return (
                <button
                  key={node.id}
                  onClick={() => handleSelect(node.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors font-mono ${
                    i === selectedIdx
                      ? 'bg-glass-active text-white'
                      : 'text-white/60 hover:bg-glass-hover hover:text-white'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-white/30 shrink-0 w-16 truncate">
                    {layerNames[node.layer]}
                  </span>
                  <span className="text-sm flex-1 truncate">{node.label}</span>
                  <span className="text-[0.5rem] text-white/20 shrink-0 font-mono">
                    {node.category}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
