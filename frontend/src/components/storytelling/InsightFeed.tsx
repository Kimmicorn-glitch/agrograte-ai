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
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-amber-500/30 bg-amber-500/5',
  low: 'border-emerald-500/30 bg-emerald-500/5',
}

const SEVERITY_BADGE: Record<string, string> = {
  high: 'bg-red-500/20 text-red-300',
  medium: 'bg-amber-500/20 text-amber-300',
  low: 'bg-emerald-500/20 text-emerald-300',
}

export function InsightCard({ insight }: { insight: StoryInsight }) {
  return (
    <div className={`rounded-lg border p-3 ${SEVERITY_COLORS[insight.severity]}`}>
      <div className="flex items-start gap-2.5">
        <span className="text-lg mt-0.5">{TYPE_ICONS[insight.type] || '📌'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-white">{insight.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SEVERITY_BADGE[insight.severity]}`}>
              {insight.severity}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.body}</p>
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
      <div className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">What&apos;s happening</div>
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}
