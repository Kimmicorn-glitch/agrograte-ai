'use client'

import { useNeuralTwinStore } from '../neural-twin/store/graph-store'
import { useCallback, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

function SliderControl({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  const color = value >= 0 ? '#059669' : '#dc2626'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-body-sm">
        <span className="text-charcoal-600">{label}</span>
        <span className="font-mono" style={{ color }}>{value >= 0 ? '+' : ''}{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-charcoal-200 rounded-full appearance-none cursor-pointer accent-accent"
      />
    </div>
  )
}

export function ForecastEngine() {
  const { cashflowHistory, cashflowProjection, forecastParams, updateForecastParam } = useNeuralTwinStore()

  const chartData = useMemo(() => {
    const data: any[] = []
    const multiplier = 1 + (forecastParams.revenueGrowth - forecastParams.expenseGrowth + forecastParams.taxImpact - forecastParams.riskWeighting) / 100

    for (const h of cashflowHistory) {
      data.push({ date: h.date.slice(5), actual: h.actual })
    }
    for (const p of cashflowProjection) {
      data.push({ date: p.date.slice(5), projected: (p.projected || 0) * multiplier, confidenceUpper: (p.confidenceUpper || 0) * multiplier, confidenceLower: (p.confidenceLower || 0) * multiplier })
    }
    return data
  }, [cashflowHistory, cashflowProjection, forecastParams])

  const latest = chartData[chartData.length - 1]
  const projectionEnd = latest?.projected || 0
  const startBal = cashflowHistory[cashflowHistory.length - 1]?.actual || 0
  const netChange = projectionEnd - startBal

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="card p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C1121F" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#C1121F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="confUpperGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C1121F" stopOpacity={0.06} />
                <stop offset="95%" stopColor="#C1121F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
            <XAxis dataKey="date" tick={{ fill: '#6C757D', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6C757D', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid #DEE2E6', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#6C757D' }}
              formatter={(value: any) => typeof value === 'number' ? [`R${value.toLocaleString()}`, undefined] : [value, undefined]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#6C757D' }} />
            <Area type="monotone" dataKey="actual" stroke="#059669" strokeWidth={2} fill="none" name="Actual" dot={false} />
            <Area type="monotone" dataKey="projected" stroke="#C1121F" strokeWidth={2} fill="url(#projectedGrad)" name="Projected" dot={false} />
            <Area type="monotone" dataKey="confidenceUpper" stroke="#C1121F" strokeWidth={0} fill="url(#confUpperGrad)" name="Confidence Band" dot={false} />
            <Area type="monotone" dataKey="confidenceLower" stroke="#C1121F" strokeWidth={0} fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div className="card p-4">
        <div className="text-caption text-charcoal-500 uppercase tracking-wider mb-3">Scenario Controls</div>
        <div className="grid grid-cols-2 gap-4">
          <SliderControl label="Revenue Growth" value={forecastParams.revenueGrowth} onChange={(v) => updateForecastParam('revenueGrowth', v)} min={-20} max={30} step={1} />
          <SliderControl label="Expense Growth" value={forecastParams.expenseGrowth} onChange={(v) => updateForecastParam('expenseGrowth', v)} min={-20} max={30} step={1} />
          <SliderControl label="Tax Impact" value={forecastParams.taxImpact} onChange={(v) => updateForecastParam('taxImpact', v)} min={-15} max={15} step={1} />
          <SliderControl label="Risk Weighting" value={forecastParams.riskWeighting} onChange={(v) => updateForecastParam('riskWeighting', v)} min={0} max={30} step={1} />
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t border-charcoal-100">
          <div className="text-body-sm text-charcoal-600">
            <span className="text-charcoal-500">Starting:</span> R{startBal.toLocaleString()}
          </div>
          <div className="text-body-sm">
            <span className="text-charcoal-500">Projected:</span>{' '}
            <span className={netChange >= 0 ? 'text-success' : 'text-error'}>
              R{projectionEnd.toLocaleString()} ({netChange >= 0 ? '+' : ''}{netChange.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Scenario cards */}
      <ScenarioCards />
    </div>
  )
}

function ScenarioCards() {
  const scenarios = useNeuralTwinStore((s) => s.scenarios)
  const cashflowData = useNeuralTwinStore((s) => s.cashflowProjection)
  const baseProjection = cashflowData[cashflowData.length - 1]?.projected || 0

  return (
    <div className="grid grid-cols-4 gap-3">
      {scenarios.map((s) => {
        const projected = baseProjection * s.inflowMultiplier / (s.outflowMultiplier || 1)
        return (
          <div key={s.name} className="card p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-body-sm text-secondary font-medium">{s.label}</span>
            </div>
            <div className="text-lg font-bold font-mono" style={{ color: s.color }}>R{(projected / 1e6).toFixed(1)}M</div>
            <div className="text-caption text-charcoal-500">{(s.probability * 100).toFixed(0)}% probability</div>
          </div>
        )
      })}
    </div>
  )
}
