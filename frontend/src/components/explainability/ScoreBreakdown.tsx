'use client'

import { ScoreContributor } from '../neural-twin/types'

function ContributorBar({ contributor }: { contributor: ScoreContributor }) {
  const pct = Math.abs(contributor.impact)
  const barColor = contributor.direction === 'positive' ? 'bg-success' : contributor.direction === 'negative' ? 'bg-error' : 'bg-charcoal-400'

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-32 text-sm text-charcoal-700 text-right shrink-0">{contributor.label}</div>
      <div className="flex-1 h-2 bg-charcoal-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.min(100, pct * (contributor.direction === 'positive' ? 6 : 6))}%` }}
        />
      </div>
      <div className={`text-sm font-mono w-16 text-right shrink-0 ${contributor.direction === 'positive' ? 'text-success' : contributor.direction === 'negative' ? 'text-error' : 'text-charcoal-500'}`}>
        {contributor.direction === 'positive' ? '+' : contributor.direction === 'negative' ? '' : ''}{contributor.impact}
      </div>
    </div>
  )
}

export function ScoreBreakdown({ score, label, contributors }: { score: number; label: string; contributors: ScoreContributor[] }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-caption text-charcoal-500 uppercase tracking-wider">{label}</div>
          <div className={`text-3xl font-bold mt-0.5 ${score >= 70 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-error'}`}>
            {score}
          </div>
        </div>
        <div className="text-right">
          <div className="text-caption text-charcoal-500 uppercase">Net Impact</div>
          <div className={`text-lg font-bold ${contributors.reduce((s, c) => s + c.impact, 0) >= 0 ? 'text-success' : 'text-error'}`}>
            {contributors.reduce((s, c) => s + c.impact, 0) >= 0 ? '+' : ''}{contributors.reduce((s, c) => s + c.impact, 0)}
          </div>
        </div>
      </div>
      <div className="space-y-0.5">
        {contributors.map((c, i) => (
          <ContributorBar key={i} contributor={c} />
        ))}
      </div>
    </div>
  )
}
