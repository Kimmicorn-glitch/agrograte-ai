'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, RotateCcw, Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import { AIInsightsPanel } from './AIInsightsPanel'
import { AnalyticsGrid } from './AnalyticsGrid'
import { useOrbStore } from './store'

const OrbScene = dynamic(
  () => import('./OrbScene').then((m) => m.OrbScene),
  { ssr: false }
)

export function IntelligenceOrbPage() {
  const [expanded, setExpanded] = useState(false)
  const autoRotate = useOrbStore((s) => s.autoRotate)
  const setAutoRotate = useOrbStore((s) => s.setAutoRotate)
  const setExpandedStore = useOrbStore((s) => s.setExpanded)

  const toggleExpand = () => {
    setExpanded((v) => {
      setExpandedStore(!v)
      return !v
    })
  }

  return (
    <div className="min-h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
            <Brain size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="text-display-sm text-secondary">Financial Intelligence</h1>
            <p className="text-body-md text-charcoal-500">
              Live neural representation of your business financial state
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`btn-ghost btn-sm ${!autoRotate ? 'text-accent bg-accent-subtle' : ''}`}
            title={autoRotate ? 'Pause rotation' : 'Auto-rotate'}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={toggleExpand}
            className="btn-ghost btn-sm"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </motion.div>

      <div className={`flex-1 grid gap-6 ${expanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'}`}>
        <div className={`${expanded ? 'min-h-[70vh]' : 'lg:col-span-3 min-h-[55vh]'} card overflow-hidden relative`}>
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.01] to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
            <span className="text-caption text-charcoal-400 font-medium">Live</span>
          </div>
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-3 text-caption text-charcoal-400">
            <span>Drag to rotate</span>
            <span>Scroll to zoom</span>
          </div>
          <OrbScene />
        </div>

        {!expanded && (
          <div className="lg:col-span-2 overflow-y-auto">
            <AIInsightsPanel />
          </div>
        )}
      </div>

      {!expanded && (
        <div className="mt-6">
          <AnalyticsGrid />
        </div>
      )}
    </div>
  )
}
