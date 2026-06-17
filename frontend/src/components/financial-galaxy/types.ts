export type NodeType =
  | 'core'
  | 'revenue' | 'expenses' | 'tax' | 'compliance' | 'banking' | 'forecasting'
  | 'sub_revenue' | 'sub_expenses' | 'sub_tax' | 'sub_compliance' | 'sub_banking' | 'sub_forecasting'
  | 'transaction'

export type LayerLevel = 1 | 2 | 3 | 4

export const LAYER_COLORS: Record<string, string> = {
  revenue: '#1D9E75',
  expenses: '#E24B4A',
  tax: '#EF9F27',
  compliance: '#378ADD',
  banking: '#C0C0C0',
  forecasting: '#8B5CF6',
  core: '#FFFFFF',
}

export const LAYER_COLORS_VEC3: Record<string, [number, number, number]> = {
  revenue: [0.114, 0.620, 0.459],
  expenses: [0.886, 0.294, 0.290],
  tax: [0.937, 0.624, 0.153],
  compliance: [0.216, 0.541, 0.867],
  banking: [0.753, 0.753, 0.753],
  forecasting: [0.545, 0.361, 0.965],
  core: [1.0, 1.0, 1.0],
}

export interface GalaxyNode {
  id: string
  label: string
  type: NodeType
  layer: LayerLevel
  value: number
  confidence: number
  riskLevel: 0 | 1 | 2 | 3
  parentId: string | null
  children: string[]
  orbitRadius: number
  orbitSpeed: number
  orbitPhase: number
  expanded: boolean
  visible: boolean
  position: [number, number, number]
  worldPosition: [number, number, number]
}

export interface GalaxyEdge {
  id: string
  source: string
  target: string
  strength: number
  type: 'financial' | 'compliance' | 'tax' | 'inference'
}

export const ORBIT_RADII = {
  core: 0,
  layer2: { min: 4, max: 7 },
  layer3: { min: 1.5, max: 3 },
  layer4: { min: 0.3, max: 1.0 },
}

export const MAX_GALAXY_NODES = 10_000

export const NODE_RADIUS = {
  core: 2.0,
  category: 0.8,
  subcategory: 0.35,
  transaction: 0.08,
}
