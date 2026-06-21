export type NodeType = 'account' | 'merchant' | 'transaction' | 'tax' | 'compliance' | 'forecast' | 'risk' | 'drrt' | 'cluster'

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  value: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  color: string
  size: number
  pulse: boolean
  glow: boolean
  parentId?: string
  metadata: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  strength: number
  label: string
  color: string
  width: number
}

export interface GraphState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNode: GraphNode | null
  hoveredNode: GraphNode | null
  highlightedNodes: string[]
  simulationRunning: boolean
  time: number
}

export interface ScoreContributor {
  label: string
  value: number
  impact: number
  direction: 'positive' | 'negative' | 'neutral'
  detail: string
}

export interface StoryInsight {
  id: string
  type: 'alert' | 'trend' | 'forecast' | 'opportunity' | 'risk'
  title: string
  body: string
  severity: 'high' | 'medium' | 'low'
  timestamp: string
  relatedNodeIds: string[]
}

export interface ForecastScenario {
  name: string
  label: string
  probability: number
  projectedBalance: number
  inflowMultiplier: number
  outflowMultiplier: number
  color: string
}

export interface CashflowPoint {
  date: string
  actual?: number
  projected?: number
  confidenceUpper?: number
  confidenceLower?: number
}
