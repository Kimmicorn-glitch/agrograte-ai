'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useOrbStore } from './store'
import * as THREE from 'three'

const NODE_COUNT = 48
const CONNECTION_THRESHOLD = 3.8

export function NeuralConnections() {
  const linesRef = useRef<THREE.LineSegments>(null!)
  const metrics = useOrbStore((s) => s.metrics)

  const nodePositions = useMemo(() => {
    const positions: THREE.Vector3[] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 1.8 + Math.random() * 1.2
      positions.push(
        new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        )
      )
    }
    return positions
  }, [])

  const { geometry, nodeColors } = useMemo(() => {
    const pairs: number[][] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j])
        if (dist < CONNECTION_THRESHOLD && Math.random() > 0.35) {
          pairs.push([i, j])
        }
      }
    }

    const positions = new Float32Array(pairs.length * 6)
    const colors = new Float32Array(pairs.length * 6)
    const colArray = new Float32Array(NODE_COUNT * 3)

    for (let i = 0; i < NODE_COUNT; i++) {
      colArray[i * 3] = 0.7 + Math.random() * 0.3
      colArray[i * 3 + 1] = 0.7 + Math.random() * 0.3
      colArray[i * 3 + 2] = 0.8 + Math.random() * 0.2
    }

    pairs.forEach(([a, b], idx) => {
      const i6 = idx * 6
      positions[i6] = nodePositions[a].x
      positions[i6 + 1] = nodePositions[a].y
      positions[i6 + 2] = nodePositions[a].z
      positions[i6 + 3] = nodePositions[b].x
      positions[i6 + 4] = nodePositions[b].y
      positions[i6 + 5] = nodePositions[b].z

      colors[i6] = colArray[a * 3]
      colors[i6 + 1] = colArray[a * 3 + 1]
      colors[i6 + 2] = colArray[a * 3 + 2]
      colors[i6 + 3] = colArray[b * 3]
      colors[i6 + 4] = colArray[b * 3 + 1]
      colors[i6 + 5] = colArray[b * 3 + 2]
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    return { geometry: geo, nodeColors: colArray }
  }, [nodePositions])

  useFrame(({ clock }) => {
    if (!linesRef.current) return
    const t = clock.getElapsedTime()
    const confidence = metrics.forecastConfidence

    const baseOpacity = 0.15 + confidence * 0.35
    const pulse = Math.sin(t * 0.8) * 0.05
    const mat = linesRef.current.material as THREE.LineBasicMaterial
    mat.opacity = baseOpacity + pulse

    const size = 0.003 + confidence * 0.004
    mat.linewidth = size
  })

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}
