'use client'

import { useNeuralTwinStore } from '../neural-twin/store/graph-store'
import type { StoryInsight } from '../neural-twin/types'

const TYPE_ICONS: Record<string, string> = {
  alert: '⚠',
  trend: '📈',
  forecast: '🔮',
  opportunity: '💡',
  risk: '🚨',
}

const SEVERITY_COLORS: Record<string, string> = {
  high: 'border-error/30 bg-error-subtle',
  medium: 'border-warning/30 bg-warning-subtle',
  low: 'border-success/30 bg-success-subtle',
}

const SEVERITY_BADGE: Record<string, string> = {
  high: 'bg-error/10 text-error',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-success/10 text-success',
}

export function InsightCard({ insight }: { insight: StoryInsight }) {
  return (
    <div className={`rounded-lg border p-3 ${SEVERITY_COLORS[insight.severity]}`}>
      <div className="flex items-start gap-2.5">
        <span className="text-lg mt-0.5">{TYPE_ICONS[insight.type] || '📌'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-body-sm font-medium text-secondary">{insight.title}</span>
            <span className={`text-caption px-1.5 py-0.5 rounded-full font-medium ${SEVERITY_BADGE[insight.severity]}`}>
              {insight.severity}
            </span>
          </div>
          <p className="text-body-sm text-charcoal-600 leading-relaxed">{insight.body}</p>
        </div>
      </div>
    </div>
  )
}

export function InsightFeed() {
  const insights = useNeuralTwinStore((s) => s.insights)

  if (!insights.length) return null

  return (
    <div className="space-y-2">
      <div className="text-caption text-charcoal-500 uppercase tracking-wider font-medium mb-3">What&apos;s happening</div>
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}
