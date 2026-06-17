'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import type { DrrtState } from '@/types'

export function DrrtStatePanel({
  drrt,
  error,
  loading,
}: {
  drrt: DrrtState | null
  error?: string | null
  loading?: boolean
}) {
  if (loading && !drrt) {
    return (
      <GlassCard>
        <SectionTitle accent>DRRT Tensor State</SectionTitle>
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
          <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
          Loading tensor state...
        </div>
      </GlassCard>
    )
  }

  if (error && !drrt) {
    return (
      <GlassCard>
        <SectionTitle accent>DRRT Tensor State</SectionTitle>
        <div className="text-xs text-red-400/80 font-mono">Unable to load DRRT state</div>
      </GlassCard>
    )
  }

  const d = drrt ?? {
    coherence: 0,
    contradiction: 0,
    frustration_index: 0,
    stability: 0,
    entropy: 0,
    convergence_iterations: 0,
    trend: 'stable' as const,
    dimensions: [],
  }

  const trendStatus = d.trend === 'improving' ? 'success' : d.trend === 'degrading' ? 'error' : 'warning'

  return (
    <GlassCard depth={2} glow="scarlet">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <SectionTitle accent>DRRT Tensor State</SectionTitle>
          <StatusBadge
            label={`Trend: ${d.trend}`}
            status={trendStatus}
            pulse
            ring
          />
        </div>

        <motion.div variants={fadeInUp} className="space-y-1">
          <MetricTile
            label="Coherence K(T)"
            value={`${(d.coherence * 100).toFixed(1)}%`}
            status={d.coherence > 0.8 ? 'success' : d.coherence > 0.5 ? 'warning' : 'error'}
            trend={d.trend === 'improving' ? 'up' : d.trend === 'degrading' ? 'down' : 'stable'}
          />
          <MetricTile
            label="Contradiction C(T)"
            value={`${(d.contradiction * 100).toFixed(1)}%`}
            status={d.contradiction < 0.2 ? 'success' : d.contradiction < 0.5 ? 'warning' : 'error'}
          />
          <MetricTile
            label="Frustration Index"
            value={`${(d.frustration_index * 100).toFixed(1)}%`}
            status={d.frustration_index < 0.3 ? 'success' : d.frustration_index < 0.6 ? 'warning' : 'error'}
          />
          <MetricTile
            label="Tensor Stability"
            value={`${(d.stability * 100).toFixed(1)}%`}
            status={d.stability > 0.8 ? 'success' : d.stability > 0.5 ? 'warning' : 'error'}
          />
          <MetricTile label="H_R(T) Entropy" value={`${(d.entropy * 100).toFixed(1)}%`} />
          <MetricTile label="Convergence Iterations" value={d.convergence_iterations} />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-2 pt-3 border-t border-glass-border"
        >
          <StatusBadge
            label="Recursive convergence active"
            status="success"
            pulse
          />
        </motion.div>
      </motion.div>
    </GlassCard>
  )
}
