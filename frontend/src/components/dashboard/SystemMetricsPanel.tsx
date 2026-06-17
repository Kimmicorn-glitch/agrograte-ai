'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricTile } from '@/components/ui/MetricTile'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { staggerContainer, fadeInUp } from '@/lib/motion'

interface SystemMetrics {
  apiLatency: number
  tensorUpdates: number
  memoryStates: string
  activeRelationships: number
  uptime: string
}

export function SystemMetricsPanel({
  metrics,
  drrtActive,
}: {
  metrics: SystemMetrics | null
  drrtActive?: boolean
}) {
  return (
    <GlassCard depth={1}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <SectionTitle>System Health</SectionTitle>
          <StatusBadge label={drrtActive ? 'DRRT Active' : 'Standby'} status={drrtActive ? 'success' : 'neutral'} pulse={drrtActive} ring />
        </div>

        {metrics ? (
          <motion.div variants={fadeInUp} className="space-y-0">
            <MetricTile label="API Latency" value={`${metrics.apiLatency}ms`} status={metrics.apiLatency < 10 ? 'success' : metrics.apiLatency < 50 ? 'warning' : 'error'} />
            <MetricTile label="Tensor Updates" value={metrics.tensorUpdates} />
            <MetricTile label="Memory States" value={metrics.memoryStates} />
            <MetricTile label="Relationships" value={metrics.activeRelationships} />
            <MetricTile label="Uptime" value={metrics.uptime} />
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
            Loading metrics...
          </div>
        )}
      </motion.div>
    </GlassCard>
  )
}
