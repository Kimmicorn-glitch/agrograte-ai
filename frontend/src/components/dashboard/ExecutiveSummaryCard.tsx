'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react'
import { cardVariants } from '@/lib/motion'

interface ExecutiveSummaryCardProps {
  label: string
  value: string
  description?: string
  change?: string
  trend?: 'up' | 'down' | 'warning' | 'info' | 'neutral'
  subtitle?: string
  timestamp?: string
  index?: number
  onClick?: () => void
}

const trendIcons: Record<string, React.ReactNode> = {
  up: <TrendingUp size={14} className="text-success" />,
  down: <TrendingDown size={14} className="text-error" />,
  warning: <AlertTriangle size={14} className="text-warning" />,
  info: <Info size={14} className="text-info" />,
  neutral: <Info size={14} className="text-charcoal-400" />,
}

const trendColors: Record<string, string> = {
  up: 'text-success',
  down: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
  neutral: 'text-charcoal-400',
}

export function ExecutiveSummaryCard({
  label,
  value,
  description,
  change,
  trend,
  subtitle,
  timestamp,
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
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <span className="metric-label text-caption sm:text-caption">{label}</span>
        {trend && (
          <span className={clsx('flex items-center gap-1 text-caption sm:text-xs font-medium shrink-0', trendColors[trend])}>
            {trendIcons[trend]}
            <span className="hidden xs:inline">{change}</span>
          </span>
        )}
      </div>
      <div className="metric-value text-heading-md sm:text-metric-md lg:text-display-sm mb-1 sm:mb-2 text-secondary break-words">
        {value}
      </div>
      {description && (
        <p className="text-body-sm text-charcoal-500 mb-1">{description}</p>
      )}
      {subtitle && (
        <p className="text-caption text-charcoal-500">{subtitle}</p>
      )}
      {timestamp && (
        <p className="text-caption text-charcoal-400 mt-2">{timestamp}</p>
      )}
    </motion.div>
  )
}
