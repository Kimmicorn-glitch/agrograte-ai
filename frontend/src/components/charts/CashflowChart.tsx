'use client'

import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { fadeInUp } from '@/lib/motion'

type CashflowPoint = { label: string; revenue: number; expenses: number }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="glass p-3 rounded-lg text-xs font-mono">
      <div className="text-white/60 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-white/80">{p.name}: R {p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function CashflowChart({ data }: { data?: CashflowPoint[] }) {
  const chartData = Array.isArray(data) ? data : []

  return (
    <GlassCard depth={2}>
      <motion.div variants={fadeInUp} className="space-y-4">
        <SectionTitle>Cashflow Forecast</SectionTitle>

        {chartData.length === 0 ? (
          <div className="chart-container-lg flex items-center justify-center text-caption text-charcoal-400">
            No cashflow data available
          </div>
        ) : (
          <div className="chart-container-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D90429" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D90429" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C0C0C0" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#C0C0C0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#D90429" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#C0C0C0" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </GlassCard>
  )
}
