'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGraphStore } from '../store/graph-store'
import { GalaxyEdgeShader } from '../shaders/node-shader'
import { MAX_EDGES } from '../types'

export function GalaxyEdges() {
  const lineRef = useRef<THREE.LineSegments>(null)
  const shaderRef = useRef<GalaxyEdgeShader>(null)

  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const activeEdges = useGraphStore((s) => s.activeEdges)
  const scene = useGraphStore((s) => s.scene)

  const nodeIndex = useMemo(() => {
    const idx = new Map<string, number>()
    nodes.forEach((n, i) => idx.set(n.id, i))
    return idx
  }, [nodes])

  const positions = useMemo(() => new Float32Array(MAX_EDGES * 6), [])
  const strengths = useMemo(() => new Float32Array(MAX_EDGES * 2), [])
  const types = useMemo(() => new Float32Array(MAX_EDGES * 2), [])
  const visibility = useMemo(() => new Float32Array(MAX_EDGES * 2), [])

  useFrame(() => {
    if (!lineRef.current || !shaderRef.current) return

    const count = Math.min(edges.length, MAX_EDGES)
    let drawCount = 0

    for (let i = 0; i < count; i++) {
      const edge = edges[i]
      const si = nodeIndex.get(edge.source)
      const ti = nodeIndex.get(edge.target)
      if (si === undefined || ti === undefined) continue

      const sn = nodes[si]
      const tn = nodes[ti]
      const isActive = activeEdges.edgeIds.has(edge.id)

      let vertCount = 0
      if (isActive && sn.visible && tn.visible) {
        positions[drawCount * 6] = sn.position[0]
        positions[drawCount * 6 + 1] = sn.position[1]
        positions[drawCount * 6 + 2] = sn.position[2]
        positions[drawCount * 6 + 3] = tn.position[0]
        positions[drawCount * 6 + 4] = tn.position[1]
        positions[drawCount * 6 + 5] = tn.position[2]
        strengths[drawCount * 2] = edge.strength
        strengths[drawCount * 2 + 1] = edge.strength
        const t = ['hierarchical', 'financial', 'inference'].indexOf(edge.type)
        types[drawCount * 2] = t
        types[drawCount * 2 + 1] = t
        visibility[drawCount * 2] = 1.0
        visibility[drawCount * 2 + 1] = 1.0
        vertCount = 1
      }

      if (vertCount > 0) drawCount++
    }

    const geo = lineRef.current.geometry as THREE.BufferGeometry
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setDrawRange(0, drawCount * 2)
    geo.attributes.position.needsUpdate = true

    geo.setAttribute('aStrength', new THREE.BufferAttribute(strengths, 1))
    geo.setAttribute('aType', new THREE.BufferAttribute(types, 1))
    geo.setAttribute('aVisibility', new THREE.BufferAttribute(visibility, 1))
    geo.attributes.aStrength.needsUpdate = true
    geo.attributes.aType.needsUpdate = true
    geo.attributes.aVisibility.needsUpdate = true
  })

  return (
    <lineSegments ref={lineRef} frustumCulled={true}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={0}
          itemSize={3}
        />
      </bufferGeometry>
      <galaxyEdgeShader attach="material" ref={shaderRef} />
    </lineSegments>
  )
}
