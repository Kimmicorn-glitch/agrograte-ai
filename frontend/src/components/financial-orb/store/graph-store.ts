import { create } from 'zustand'
import Fuse from 'fuse.js'
import type { LayerNode, LayerEdge, LayerLevel, SceneConfig, CategoryType } from '../types'
import { LAYER_COLORS_VEC3, NODE_RADIUS, ORBIT_RADII } from '../types'

interface HierarchyConfig {
  category: CategoryType
  subcategories: string[]
  txPerSubcategory: [number, number]
}

const HIERARCHY: HierarchyConfig[] = [
  {
    category: 'revenue',
    subcategories: ['product-sales', 'services', 'recurring', 'commissions', 'other-revenue'],
    txPerSubcategory: [80, 300],
  },
  {
    category: 'expenses',
    subcategories: ['payroll', 'rent-utilities', 'supplies', 'marketing', 'travel', 'software', 'contractors', 'other-expenses'],
    txPerSubcategory: [60, 250],
  },
  {
    category: 'tax',
    subcategories: ['vat', 'corporate-tax', 'payroll-tax'],
    txPerSubcategory: [40, 120],
  },
  {
    category: 'compliance',
    subcategories: ['regulatory', 'reporting', 'audit', 'legal'],
    txPerSubcategory: [30, 100],
  },
  {
    category: 'banking',
    subcategories: ['accounts', 'loans', 'credit', 'investments', 'cash-management', 'forex'],
    txPerSubcategory: [50, 200],
  },
  {
    category: 'forecasting',
    subcategories: ['short-term', 'medium-term', 'long-term'],
    txPerSubcategory: [20, 80],
  },
]

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1))
}

function generateHierarchicalData(): { nodes: LayerNode[]; edges: LayerEdge[] } {
  const nodes: LayerNode[] = []
  const edges: LayerEdge[] = []
  let nodeId = 0

  const coreId = `core-0`
  nodeId++

  nodes.push({
    id: coreId,
    label: 'Business Core',
    category: 'core',
    layer: 1,
    parentId: null,
    children: [],
    value: rand(5000000, 50000000),
    confidence: 0.7 + Math.random() * 0.3,
    riskLevel: 0,
    orbitRadius: 0,
    orbitSpeed: 0,
    orbitPhase: 0,
    orbitTilt: 0,
    breathPhase: Math.random() * Math.PI * 2,
    expanded: false,
    visible: true,
    position: [0, 0, 0],
  })

  const categoryIds: string[] = []

  for (const cfg of HIERARCHY) {
    const catId = `${cfg.category}-0`
    const catOrbitRadius = rand(ORBIT_RADII.layer2.min, ORBIT_RADII.layer2.max)

    nodes.push({
      id: catId,
      label: cfg.category.charAt(0).toUpperCase() + cfg.category.slice(1),
      category: cfg.category,
      layer: 2,
      parentId: coreId,
      children: [],
      value: rand(500000, 10000000),
      confidence: 0.5 + Math.random() * 0.5,
      riskLevel: cfg.category === 'expenses' ? 2 : cfg.category === 'tax' ? 1 : 0,
      orbitRadius: catOrbitRadius,
      orbitSpeed: 0.08 + Math.random() * 0.04,
      orbitPhase: Math.random() * Math.PI * 2,
      orbitTilt: rand(-0.15, 0.15),
      breathPhase: Math.random() * Math.PI * 2,
      expanded: false,
      visible: true,
      position: [catOrbitRadius, 0, 0],
    })

    categoryIds.push(catId)
    edges.push({
      id: `edge-core-${cfg.category}`,
      source: coreId,
      target: catId,
      strength: 1.0,
      type: 'hierarchical',
      visible: false,
    })

    for (const sub of cfg.subcategories) {
      const subId = `${cfg.category}-${sub}`
      const subOrbitRadius = rand(ORBIT_RADII.layer3.min, ORBIT_RADII.layer3.max)

      nodes.push({
        id: subId,
        label: sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category: cfg.category,
        layer: 3,
        parentId: catId,
        children: [],
        value: rand(10000, 2000000),
        confidence: 0.3 + Math.random() * 0.7,
        riskLevel: (Math.floor(Math.random() * 3)) as 0 | 1 | 2 | 3,
        orbitRadius: subOrbitRadius,
        orbitSpeed: 0.3 + Math.random() * 0.2,
        orbitPhase: Math.random() * Math.PI * 2,
        orbitTilt: rand(-0.3, 0.3),
        breathPhase: Math.random() * Math.PI * 2,
        expanded: false,
        visible: false,
        position: [catOrbitRadius + subOrbitRadius, 0, 0],
      })

      edges.push({
        id: `edge-${cfg.category}-${sub}`,
        source: catId,
        target: subId,
        strength: 0.8 + Math.random() * 0.2,
        type: 'hierarchical',
        visible: false,
      })

      const txCount = randInt(cfg.txPerSubcategory[0], cfg.txPerSubcategory[1])

      for (let t = 0; t < txCount; t++) {
        const txId = `tx-${cfg.category}-${sub}-${t}`
        const txOrbitRadius = rand(ORBIT_RADII.layer4.min, ORBIT_RADII.layer4.max)

        nodes.push({
          id: txId,
          label: `Tx #${nodeId}`,
          category: cfg.category,
          layer: 4,
          parentId: subId,
          children: [],
          value: rand(10, 50000),
          confidence: 0.2 + Math.random() * 0.8,
          riskLevel: (Math.floor(Math.random() * 4)) as 0 | 1 | 2 | 3,
          orbitRadius: txOrbitRadius,
          orbitSpeed: 0.8 + Math.random() * 0.6,
          orbitPhase: Math.random() * Math.PI * 2,
          orbitTilt: rand(-0.5, 0.5),
          breathPhase: Math.random() * Math.PI * 2,
          expanded: false,
          visible: false,
          position: [catOrbitRadius + subOrbitRadius + txOrbitRadius, 0, 0],
        })

        edges.push({
          id: `edge-${sub}-tx-${t}`,
          source: subId,
          target: txId,
          strength: 0.4 + Math.random() * 0.6,
          type: 'hierarchical',
          visible: false,
        })

        nodeId++
      }
    }
  }

  const crossEdges = Math.min(2000, nodes.length * 0.15)
  for (let i = 0; i < crossEdges; i++) {
    const si = Math.floor(Math.random() * nodes.length)
    let ti = Math.floor(Math.random() * nodes.length)
    if (ti === si) ti = (ti + 1) % nodes.length
    const sn = nodes[si]
    const tn = nodes[ti]
    if (sn.layer === tn.layer && sn.parentId !== tn.id && tn.parentId !== sn.id) {
      edges.push({
        id: `cross-edge-${i}`,
        source: sn.id,
        target: tn.id,
        strength: 0.1 + Math.random() * 0.5,
        type: Math.random() > 0.5 ? 'financial' : 'inference',
        visible: false,
      })
    }
  }

  return { nodes, edges }
}

interface VisibleEdgeSet {
  edgeIds: Set<string>
  nodeIds: Set<string>
}

interface GraphStore {
  nodes: LayerNode[]
  edges: LayerEdge[]
  selectedNodeId: string | null
  hoveredNodeId: string | null
  highlightedNodeIds: Set<string>
  highlightedEdgeIds: Set<string>
  searchResults: string[]
  scene: SceneConfig
  fuse: Fuse<LayerNode> | null
  activeEdges: VisibleEdgeSet

  initialize: () => void
  selectNode: (id: string | null) => void
  hoverNode: (id: string | null) => void
  expandNode: (id: string) => void
  collapseNode: (id: string) => void
  toggleDrrtLayer: () => void
  setSearchQuery: (query: string) => void
  setSearchPanelVisible: (v: boolean) => void
  setAutoRotate: (v: boolean) => void
  setFocusMode: (v: boolean) => void
  setFocusNodeId: (id: string | null) => void
  highlightConnected: (id: string) => void
  clearHighlight: () => void
  navigateToLayer: (layer: LayerLevel) => void
}

function updateChildrenVisibility(nodes: LayerNode[], parentId: string, visible: boolean) {
  return nodes.map((n) => {
    if (n.parentId === parentId) {
      return { ...n, visible }
    }
    return n
  })
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  highlightedNodeIds: new Set(),
  highlightedEdgeIds: new Set(),
  searchResults: [],
  activeEdges: { edgeIds: new Set(), nodeIds: new Set() },
  scene: {
    autoRotate: true,
    autoRotateSpeed: 0.12,
    animating: false,
    drrtLayerVisible: false,
    searchPanelVisible: false,
    focusMode: false,
    focusNodeId: null,
    activeLayer: 2,
    layerPath: ['Core'],
  },
  fuse: null,

  initialize: () => {
    const { nodes, edges } = generateHierarchicalData()
    const fuse = new Fuse(nodes, {
      keys: ['label', 'category', 'id', 'layer'],
      threshold: 0.4,
    })
    set({ nodes, edges, fuse })
  },

  selectNode: (id) => {
    const s = get()
    if (id === s.selectedNodeId) {
      set({ selectedNodeId: null, activeEdges: { edgeIds: new Set(), nodeIds: new Set() } })
      s.setAutoRotate(true)
      return
    }
    set({ selectedNodeId: id })
    if (id) {
      s.highlightConnected(id)
      s.setAutoRotate(false)
    }
  },

  hoverNode: (id) => {
    const s = get()
    set({ hoveredNodeId: id })
    if (id && !s.selectedNodeId) {
      const edgeIds = new Set<string>()
      const nodeIds = new Set<string>([id])
      const node = s.nodes.find((n) => n.id === id)
      if (node) {
        s.edges.forEach((e) => {
          if (e.source === id || e.target === id) {
            const other = e.source === id ? e.target : e.source
            edgeIds.add(e.id)
            nodeIds.add(other)
          }
        })
        const parent = node.parentId
        if (parent) {
          s.edges.forEach((e) => {
            if ((e.source === id && e.target === parent) || (e.target === id && e.source === parent)) {
              edgeIds.add(e.id)
            }
          })
        }
      }
      set({ activeEdges: { edgeIds, nodeIds } })
    } else if (!id && !s.selectedNodeId) {
      set({ activeEdges: { edgeIds: new Set(), nodeIds: new Set() } })
    }
  },

  expandNode: (id) => {
    const s = get()
    const node = s.nodes.find((n) => n.id === id)
    if (!node) return

    const updatedNodes = s.nodes.map((n) => {
      if (n.id === id) return { ...n, expanded: true }
      if (n.parentId === id) {
        return { ...n, visible: true }
      }
      return n
    })

    const layerPath = [...s.scene.layerPath]
    if (node.layer === 2) {
      layerPath.push(node.label)
    } else if (node.layer === 3) {
      if (layerPath.length < 3) layerPath.push(node.label)
      else layerPath[2] = node.label
    }

    set({
      nodes: updatedNodes,
      scene: {
        ...s.scene,
        autoRotate: false,
        layerPath,
        activeLayer: Math.min(node.layer + 1, 4) as LayerLevel,
      },
    })
  },

  collapseNode: (id) => {
    const s = get()
    const node = s.nodes.find((n) => n.id === id)
    if (!node) return

    const collapseRecursive = (parentId: string): string[] => {
      const toHide: string[] = [parentId]
      s.nodes.filter((n) => n.parentId === parentId).forEach((child) => {
        toHide.push(...collapseRecursive(child.id))
      })
      return toHide
    }

    const toHide = new Set(collapseRecursive(id))
    toHide.delete(id)

    const updatedNodes = s.nodes.map((n) => {
      if (n.id === id) return { ...n, expanded: false }
      if (toHide.has(n.id)) return { ...n, visible: false, expanded: false }
      return n
    })

    const layerPath = s.scene.layerPath.slice(0, node.layer - 1)

    set({
      nodes: updatedNodes,
      scene: {
        ...s.scene,
        autoRotate: layerPath.length <= 1,
        layerPath,
        activeLayer: Math.max(node.layer - 1, 1) as LayerLevel,
      },
      activeEdges: { edgeIds: new Set(), nodeIds: new Set() },
    })
  },

  toggleDrrtLayer: () =>
    set((s) => ({ scene: { ...s.scene, drrtLayerVisible: !s.scene.drrtLayerVisible } })),

  setSearchQuery: (query) => {
    const { fuse } = get()
    if (!query) {
      set({ searchResults: [] })
      return
    }
    if (!fuse) return
    const results = fuse.search(query).map((r) => r.item.id)
    set({ searchResults: results })
  },

  setSearchPanelVisible: (v) =>
    set((s) => ({ scene: { ...s.scene, searchPanelVisible: v } })),

  setAutoRotate: (v) =>
    set((s) => ({ scene: { ...s.scene, autoRotate: v } })),

  setFocusMode: (v) =>
    set((s) => ({ scene: { ...s.scene, focusMode: v } })),

  setFocusNodeId: (id) =>
    set((s) => ({ scene: { ...s.scene, focusNodeId: id } })),

  highlightConnected: (id) => {
    const { nodes, edges } = get()
    const edgeIds = new Set<string>()
    const nodeIds = new Set<string>([id])
    edges.forEach((e) => {
      if (e.source === id) { edgeIds.add(e.id); nodeIds.add(e.target) }
      if (e.target === id) { edgeIds.add(e.id); nodeIds.add(e.source) }
    })
    set({
      activeEdges: { edgeIds, nodeIds },
    })
  },

  clearHighlight: () => {
    set({
      activeEdges: { edgeIds: new Set(), nodeIds: new Set() },
    })
  },

  navigateToLayer: (layer) => {
    const s = get()
    const layerPath = s.scene.layerPath.slice(0, layer)
    set({
      scene: { ...s.scene, activeLayer: layer, layerPath, autoRotate: layer <= 2 },
      selectedNodeId: null,
      hoveredNodeId: null,
      activeEdges: { edgeIds: new Set(), nodeIds: new Set() },
    })
  },
}))
