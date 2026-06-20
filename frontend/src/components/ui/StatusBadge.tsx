import { clsx } from 'clsx'

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'neutral' | 'active' | 'info'
  label?: string
  dot?: boolean
  pulse?: boolean
  ring?: boolean
  className?: string
}

const dotClasses: Record<string, string> = {
  success: 'status-dot-success',
  warning: 'status-dot-warning',
  error: 'status-dot-error',
  neutral: 'status-dot-neutral',
  active: 'status-dot-active',
  info: 'bg-info',
}

const pillClasses: Record<string, string> = {
  success: 'pill-success',
  warning: 'pill-warning',
  error: 'pill-error',
  neutral: 'pill-neutral',
  active: 'pill-accent',
  info: 'pill-accent',
}

const statusLabels: Record<string, string> = {
  success: 'All Good',
  warning: 'Attention Needed',
  error: 'Action Required',
  neutral: 'No Data',
  active: 'Active',
  info: 'Info',
}

export function StatusBadge({ status, label, dot = true, pulse, ring, className }: StatusBadgeProps) {
  if (dot && !label) {
    return (
      <span className={clsx(ring ? 'status-ring' : 'status-dot', dotClasses[status], pulse && 'animate-pulse-soft', className)} />
    )
  }

  if (label && dot) {
    return (
      <span className={clsx('pill', pillClasses[status], className)}>
        <span className={clsx('status-dot', dotClasses[status])} />
        {label}
      </span>
    )
  }

  return (
    <span className={clsx('pill', pillClasses[status], className)}>
      {label || statusLabels[status]}
    </span>
  )
}
