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
