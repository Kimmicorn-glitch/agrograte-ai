import { create } from 'zustand'
import type { OrbState } from './types'

export const useOrbStore = create<OrbState>((set) => ({
  metrics: {
    cashflowHealth: 0,
    taxLiability: 0,
    complianceScore: 0,
    forecastConfidence: 0,
    transactionVelocity: 0,
    riskLevel: 0,
    revenueMomentum: 0,
    expenseRatio: 0,
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
