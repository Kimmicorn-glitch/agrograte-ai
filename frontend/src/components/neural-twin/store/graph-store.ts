'use client'

import { create } from 'zustand'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { GraphNode, GraphEdge, GraphState, ScoreContributor, StoryInsight, ForecastScenario, CashflowPoint } from '../types'

interface NeuralTwinStore extends GraphState {
  contributors: ScoreContributor[]
  insights: StoryInsight[]
  scenarios: ForecastScenario[]
  cashflowHistory: CashflowPoint[]
  cashflowProjection: CashflowPoint[]
  forecastParams: {
    revenueGrowth: number
    expenseGrowth: number
    taxImpact: number
    riskWeighting: number
  }

  setNodes: (nodes: GraphNode[]) => void
  setEdges: (edges: GraphEdge[]) => void
  selectNode: (node: GraphNode | null) => void
  hoverNode: (node: GraphNode | null) => void
  highlightNodes: (ids: string[]) => void
  runSimulation: () => void
  tick: () => void
  setContributors: (c: ScoreContributor[]) => void
  setInsights: (i: StoryInsight[]) => void
  setCashflowData: (history: CashflowPoint[], projection: CashflowPoint[]) => void
  updateForecastParam: (key: string, value: number) => void
  addNode: (node: GraphNode) => void
  removeNode: (id: string) => void
  updateNode: (id: string, updates: Partial<GraphNode>) => void
}

let sim: any = null

export const useNeuralTwinStore = create<NeuralTwinStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  hoveredNode: null,
  highlightedNodes: [],
  simulationRunning: false,
  time: 0,
  contributors: [],
  insights: [],
  scenarios: [
    { name: 'optimistic', label: 'Optimistic', probability: 0.2, projectedBalance: 0, inflowMultiplier: 1.2, outflowMultiplier: 0.9, color: '#22c55e' },
    { name: 'base', label: 'Base', probability: 0.5, projectedBalance: 0, inflowMultiplier: 1.0, outflowMultiplier: 1.0, color: '#3b82f6' },
    { name: 'pessimistic', label: 'Pessimistic', probability: 0.2, projectedBalance: 0, inflowMultiplier: 0.85, outflowMultiplier: 1.15, color: '#f59e0b' },
    { name: 'stress', label: 'Stress Test', probability: 0.1, projectedBalance: 0, inflowMultiplier: 0.6, outflowMultiplier: 1.3, color: '#ef4444' },
  ],
  cashflowHistory: [],
  cashflowProjection: [],
  forecastParams: { revenueGrowth: 0, expenseGrowth: 0, taxImpact: 0, riskWeighting: 0 },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (node) => set({ selectedNode: node }),
  hoverNode: (node) => set({ hoveredNode: node }),
  highlightNodes: (ids) => set({ highlightedNodes: ids }),

  runSimulation: () => {
    const { nodes, edges } = get()
    if (!nodes.length) return

    sim = forceSimulation(nodes as any)
      .force('link', forceLink(edges as any).id((d: any) => d.id).distance(25).strength(0.5))
      .force('charge', forceManyBody().strength(-60))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide(8))

    sim.on('tick', () => {
      set({ nodes: [...get().nodes] })
    })

    set({ simulationRunning: true })
  },

  tick: () => {
    set((s) => ({ time: s.time + 0.016 }))
  },

  setContributors: (contributors) => set({ contributors }),
  setInsights: (insights) => set({ insights }),

  setCashflowData: (history, projection) => set({ cashflowHistory: history, cashflowProjection: projection }),

  updateForecastParam: (key, value) =>
    set((s) => ({ forecastParams: { ...s.forecastParams, [key]: value } })),

  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  removeNode: (id) => set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),
  updateNode: (id, updates) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
}))
