'use client'

import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { fadeInUp } from '@/lib/motion'

interface RiskData {
  name: string
  value: number
  color: string
}

export function RiskDistributionChart({ riskBreakdown }: { riskBreakdown?: RiskData[] }) {
  const chartData = Array.isArray(riskBreakdown) ? riskBreakdown : []
  console.log('[RiskDistributionChart] Input data:', chartData)

  if (chartData.length > 0) {
    chartData.forEach((item, i) => {
      if (typeof item.value === 'undefined' || item.value === null) console.warn(`[RiskDistributionChart] item[${i}].value is undefined/null`)
      if (typeof item.name === 'undefined' || item.name === null) console.warn(`[RiskDistributionChart] item[${i}].name is undefined/null`)
      if (typeof item.value !== 'undefined' && isNaN(Number(item.value))) console.warn(`[RiskDistributionChart] item[${i}].value is NaN`)
    })
  }

  return (
    <GlassCard depth={1}>
      <motion.div variants={fadeInUp} className="space-y-4">
        <SectionTitle>Risk Distribution</SectionTitle>

        {chartData.length === 0 ? (
          <div className="chart-container flex items-center justify-center text-caption text-charcoal-400">
            No risk data available
          </div>
        ) : (
          <>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload ? (
                        <div className="glass p-2 rounded-lg text-xs font-mono">
                          <div className="text-white/80">{payload[0].name}: {payload[0].value}%</div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-[0.55rem] font-mono text-white/50">{item.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </GlassCard>
  )
}
