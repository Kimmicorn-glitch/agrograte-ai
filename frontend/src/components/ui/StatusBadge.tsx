'use client'

import { type StatusType } from '@/types'

interface StatusBadgeProps {
  label: string
  status: StatusType
  pulse?: boolean
  ring?: boolean
}

export function StatusBadge({ label, status, pulse = false, ring = false }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      {ring ? (
        <span className={`status-ring status-ring-${status} ${pulse ? 'animate-breathe' : ''}`} />
      ) : (
        <span className={`status-dot status-dot-${status} ${pulse ? 'animate-breathe' : ''}`} />
      )}
      <span className="text-[0.6rem] font-mono text-white/40">{label}</span>
    </div>
  )
}
