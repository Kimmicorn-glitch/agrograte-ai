'use client'

type Stat = { label: string; value: string | number; tone?: 'neutral' | 'warning' | 'error' | 'success' }

export function DashboardCards({ stats = [] }: { stats?: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-smooth">
          <div className="flex items-center justify-between mb-2">
            <div className="text-caption text-secondary/60">{s.label}</div>
            <div className={`text-sm font-medium ${s.tone === 'warning' ? 'text-warning' : s.tone === 'error' ? 'text-error' : 'text-secondary'}`}></div>
          </div>
          <div className="text-metric-lg font-bold text-secondary">{s.value}</div>
        </div>
      ))}
    </div>
  )
}
