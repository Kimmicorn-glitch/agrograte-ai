import * as d3Force from 'd3-force'
import type { LayerNode, LayerEdge } from '../types'

export class HierarchicalForceSimulation {
  private simulation: any = null
  private simNodes: any[] = []
  private nodeMap = new Map<string, number>()

  initialize(nodes: LayerNode[], edges: LayerEdge[]) {
    this.nodeMap.clear()
    nodes.forEach((n, i) => this.nodeMap.set(n.id, i))

    this.simNodes = nodes.map((n) => ({
      id: n.id,
      layer: n.layer,
      parentId: n.parentId,
      x: n.position[0],
      y: n.position[1],
      z: n.position[2],
      vx: 0,
      vy: 0,
      vz: 0,
      fx: 0,
      fy: 0,
      fz: 0,
    }))

    const links = edges
      .filter((e) => this.nodeMap.has(e.source) && this.nodeMap.has(e.target))
      .map((e) => ({
        source: this.nodeMap.get(e.source)!,
        target: this.nodeMap.get(e.target)!,
        strength: e.strength,
      }))

    const sim = d3Force.forceSimulation(this.simNodes) as any
    sim.force('charge', d3Force.forceManyBody().strength(-20))
    sim.force('center', d3Force.forceCenter(0, 0))
    sim.force('collision', d3Force.forceCollide(0.3))

    const linkForce = d3Force.forceLink(links as any)
    linkForce.id((d: any) => d.id)
    linkForce.strength(0.15)
    sim.force('link', linkForce)

    sim.alpha(0.3)
    sim.alphaMin(0.01)

    for (let i = 0; i < 50; i++) sim.tick()
    sim.stop()

    this.simulation = sim
  }
}
