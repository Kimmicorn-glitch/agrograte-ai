export interface OrbMetrics {
  cashflowHealth: number       // 0-1
  taxLiability: number         // 0-1 (higher = more liability)
  complianceScore: number      // 0-1
  forecastConfidence: number   // 0-1
  transactionVelocity: number  // 0-1
  riskLevel: number            // 0-1
  revenueMomentum: number      // 0-1
  expenseRatio: number         // 0-1
}

export interface OrbState {
  metrics: OrbMetrics
  autoRotate: boolean
  selectedNode: string | null
  hoveredMetric: string | null
  expanded: boolean
  anomalyActive: boolean
  setMetrics: (m: Partial<OrbMetrics>) => void
  setAutoRotate: (v: boolean) => void
  setSelectedNode: (n: string | null) => void
  setHoveredMetric: (m: string | null) => void
  setExpanded: (v: boolean) => void
  setAnomalyActive: (v: boolean) => void
}

export interface Insight {
  id: string
  type: 'positive' | 'negative' | 'neutral' | 'warning'
  label: string
  value: string
  detail: string
}

export const METRIC_COLORS = {
  cashflow: '#FFFFFF',
  tax: '#C1121F',
  compliance: '#059669',
  forecast: '#2563EB',
  risk: '#DC2626',
} as const
