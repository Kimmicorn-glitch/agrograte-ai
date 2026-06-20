'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motion'

interface MetricTileProps {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral' | 'stable'
  status?: string
  className?: string
}

export function MetricTile({ label, value, change, trend, status, className = '' }: MetricTileProps) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className={`card ${className}`}>
      <span className="metric-label">{label}</span>
      <p className="metric-value text-display-sm text-secondary my-1">{value}</p>
      {change && (
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-charcoal-500'}`}>
          {change}
        </span>
      )}
      {status && (
        <span className="text-sm text-charcoal-500">{status}</span>
      )}
    </motion.div>
  )
}
