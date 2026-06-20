'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react'
import { cardVariants } from '@/lib/motion'

interface ExecutiveSummaryCardProps {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'warning' | 'info'
  subtitle?: string
  index?: number
  onClick?: () => void
}

const trendIcons: Record<string, React.ReactNode> = {
  up: <TrendingUp size={14} className="text-success" />,
  down: <TrendingDown size={14} className="text-error" />,
  warning: <AlertTriangle size={14} className="text-warning" />,
  info: <Info size={14} className="text-info" />,
}

const trendColors: Record<string, string> = {
  up: 'text-success',
  down: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
}

export function ExecutiveSummaryCard({
  label,
  value,
  change,
  trend,
  subtitle,
  index = 0,
  onClick,
}: ExecutiveSummaryCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="card card-hover cursor-pointer"
      onClick={onClick}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="metric-label">{label}</span>
        {trend && (
          <span className={clsx('flex items-center gap-1 text-xs font-medium', trendColors[trend])}>
            {trendIcons[trend]}
            {change}
          </span>
        )}
      </div>
      <div className="metric-value text-display-sm mb-2 text-secondary">
        {value}
      </div>
      {subtitle && (
        <p className="text-caption text-charcoal-500">{subtitle}</p>
      )}
    </motion.div>
  )
}
