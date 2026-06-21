'use client'

import { BarChart3 } from 'lucide-react'

interface ChartFallbackProps {
  message?: string
  height?: 'sm' | 'md' | 'lg'
}

const heights = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64',
}

export function ChartFallback({ message = 'No forecast data available', height = 'lg' }: ChartFallbackProps) {
  return (
    <div className={`${heights[height]} w-full flex items-center justify-center bg-charcoal-50/50 rounded-lg border border-dashed border-charcoal-200`}>
      <div className="text-center space-y-2">
        <BarChart3 size={24} className="mx-auto text-charcoal-300" />
        <p className="text-body-sm text-charcoal-400">{message}</p>
      </div>
    </div>
  )
}
