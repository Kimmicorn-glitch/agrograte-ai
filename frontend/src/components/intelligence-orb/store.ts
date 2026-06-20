import { create } from 'zustand'
import type { OrbState } from './types'

export const useOrbStore = create<OrbState>((set) => ({
  metrics: {
    cashflowHealth: 0.85,
    taxLiability: 0.35,
    complianceScore: 0.94,
    forecastConfidence: 0.78,
    transactionVelocity: 0.62,
    riskLevel: 0.12,
    revenueMomentum: 0.71,
    expenseRatio: 0.45,
  },
  autoRotate: true,
  selectedNode: null,
  hoveredMetric: null,
  expanded: false,
  anomalyActive: false,
  setMetrics: (m) => set((s) => ({ metrics: { ...s.metrics, ...m } })),
  setAutoRotate: (v) => set({ autoRotate: v }),
  setSelectedNode: (n) => set({ selectedNode: n }),
  setHoveredMetric: (m) => set({ hoveredMetric: m }),
  setExpanded: (v) => set({ expanded: v }),
  setAnomalyActive: (v) => set({ anomalyActive: v }),
}))

export function generateSimulatedMetrics(): OrbState['metrics'] {
  const jitter = (base: number, range: number) =>
    Math.max(0, Math.min(1, base + (Math.random() - 0.5) * range))

  return {
    cashflowHealth: jitter(0.85, 0.12),
    taxLiability: jitter(0.35, 0.15),
    complianceScore: jitter(0.94, 0.06),
    forecastConfidence: jitter(0.78, 0.14),
    transactionVelocity: jitter(0.62, 0.2),
    riskLevel: jitter(0.12, 0.08),
    revenueMomentum: jitter(0.71, 0.1),
    expenseRatio: jitter(0.45, 0.1),
  }
}
