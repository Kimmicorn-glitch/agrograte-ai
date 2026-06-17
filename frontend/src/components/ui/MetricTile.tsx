'use client'

import { motion } from 'framer-motion'
import { type StatusType, type TrendDirection } from '@/types'
import { metricValue } from '@/lib/motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricTileProps {
  label: string
  value: string | number
  status?: StatusType
  trend?: TrendDirection
  trendValue?: string
  prefix?: string
  suffix?: string
  animated?: boolean
  className?: string
}

const statusColors: Record<StatusType, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-white/60',
  info: 'text-info',
}

const statusDotColors: Record<StatusType, string> = {
  success: 'status-dot-success',
  warning: 'status-dot-warning',
  error: 'status-dot-error',
  neutral: 'status-dot-neutral',
  info: 'status-dot-info',
}

export function MetricTile({
  label,
  value,
  status,
  trend,
  trendValue,
  prefix = '',
  suffix = '',
  animated = true,
  className = '',
}: MetricTileProps) {
  const displayValue = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`

  return (
    <motion.div
      variants={animated ? metricValue : undefined}
      className={`flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {status && <span className={`status-dot ${statusDotColors[status]}`} />}
        <span className="metric-label truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {trend && (
          <span className={
            trend === 'up' ? 'text-success' :
            trend === 'down' ? 'text-error' :
            'text-white/30'
          }>
            {trend === 'up' ? <TrendingUp size={10} /> :
             trend === 'down' ? <TrendingDown size={10} /> :
             <Minus size={10} />}
          </span>
        )}
        {trendValue && (
          <span className={`text-[0.6rem] font-mono ${
            trend === 'up' ? 'text-success' :
            trend === 'down' ? 'text-error' :
            'text-white/30'
          }`}>
            {trendValue}
          </span>
        )}
        <span className={`metric-value text-xs sm:text-sm ${
          status ? statusColors[status] : 'text-white/80'
        }`}>
          {displayValue}
        </span>
      </div>
    </motion.div>
  )
}
