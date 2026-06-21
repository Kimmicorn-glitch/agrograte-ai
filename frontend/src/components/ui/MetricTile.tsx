'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motion'

interface MetricTileProps {
  label: string
  value: string | number
  description?: string
  change?: string
  trend?: 'up' | 'down' | 'neutral' | 'stable'
  status?: string
  timestamp?: string
  className?: string
}

export function MetricTile({ label, value, description, change, trend, status, timestamp, className = '' }: MetricTileProps) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className={`card ${className}`}>
      <span className="metric-label">{label}</span>
      <p className="metric-value text-display-sm text-secondary my-1">{value}</p>
      {description && (
        <p className="text-caption text-charcoal-500 mt-1">{description}</p>
      )}
      {change && (
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-charcoal-500'}`}>
          {change}
        </span>
      )}
      {status && (
        <span className="text-sm text-charcoal-500">{status}</span>
      )}
      {timestamp && (
        <p className="text-caption text-charcoal-400 mt-2">{timestamp}</p>
      )}
    </motion.div>
  )
}
