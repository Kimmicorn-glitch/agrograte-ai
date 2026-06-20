'use client'

import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'chart' | 'circle'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse-soft rounded-md bg-charcoal-100/50',
        variant === 'text' && 'h-4 w-full',
        variant === 'card' && 'h-32 w-full',
        variant === 'chart' && 'h-48 w-full',
        variant === 'circle' && 'h-10 w-10 rounded-full',
        className,
      )}
    />
  )
}

export function MetricTileSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton variant="text" className="w-24" />
      <Skeleton variant="text" className="w-32 h-6" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton variant="chart" className="col-span-2 h-64" />
        <Skeleton variant="card" className="h-64" />
      </div>
    </div>
  )
}
