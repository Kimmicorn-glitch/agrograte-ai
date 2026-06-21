'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useNeuralTwinStore } from '../store/graph-store'
import type { GraphEdge as GraphEdgeType } from '../types'

export function GraphEdge({ edge }: { edge: GraphEdgeType }) {
  const { nodes } = useNeuralTwinStore()

  const source = nodes.find((n) => n.id === edge.source)
  const target = nodes.find((n) => n.id === edge.target)

  const points = useMemo(() => {
    if (!source || !target) return null
    const start = new THREE.Vector3(source.x, source.y, source.z)
    const end = new THREE.Vector3(target.x, target.y, target.z)
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    mid.y += 5
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [source?.x, source?.y, source?.z, target?.x, target?.y, target?.z])

  if (!points) return null

  return (
    <mesh>
      <tubeGeometry args={[points, 8, 0.1 + edge.width * 0.05, 8, false]} />
      <meshBasicMaterial color={edge.color || '#334155'} transparent opacity={0.4} />
    </mesh>
  )
}
