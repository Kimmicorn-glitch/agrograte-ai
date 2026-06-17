export type LayerLevel = 1 | 2 | 3 | 4

export type CategoryType =
  | 'core'
  | 'revenue' | 'expenses' | 'tax' | 'compliance' | 'banking' | 'forecasting'

export interface LayerNode {
  id: string
  label: string
  category: CategoryType
  layer: LayerLevel
  parentId: string | null
  children: string[]
  value: number
  confidence: number
  riskLevel: 0 | 1 | 2 | 3
  orbitRadius: number
  orbitSpeed: number
  orbitPhase: number
  orbitTilt: number
  breathPhase: number
  expanded: boolean
  visible: boolean
  position: [number, number, number]
}

export interface LayerEdge {
  id: string
  source: string
  target: string
  strength: number
  type: 'hierarchical' | 'financial' | 'inference'
  visible: boolean
}

export interface CameraState {
  target: [number, number, number]
  position: [number, number, number]
}

export interface SceneConfig {
  autoRotate: boolean
  autoRotateSpeed: number
  animating: boolean
  drrtLayerVisible: boolean
  searchPanelVisible: boolean
  focusMode: boolean
  focusNodeId: string | null
  activeLayer: LayerLevel
  layerPath: string[]
}

export const MAX_NODES = 12_000
export const MAX_EDGES = 50_000

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

export const NODE_RADIUS = {
  core: 1.8,
  category: 0.7,
  subcategory: 0.35,
  transaction: 0.08,
}

export const ORBIT_RADII = {
  layer2: { min: 7, max: 11 },
  layer3: { min: 1.5, max: 3.0 },
  layer4: { min: 0.4, max: 1.2 },
}
