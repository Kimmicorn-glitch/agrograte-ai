'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useOrbStore } from './store'
import * as THREE from 'three'

const MAX_NODES = 6

export function RiskNodes() {
  const groupRef = useRef<THREE.Group>(null!)
  const metrics = useOrbStore((s) => s.metrics)

  const nodes = useMemo(() => {
    return Array.from({ length: MAX_NODES }).map((_, i) => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 2.6 + Math.random() * 1.5
      return {
        position: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 2,
        id: i,
      }
    })
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const risk = metrics.riskLevel
    const tax = metrics.taxLiability

    const anomalyLevel = Math.max(risk, tax * 0.6)

    groupRef.current.children.forEach((child, i) => {
      const node = nodes[i]
      if (!node) return

      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshBasicMaterial


      const flicker = Math.sin(t * node.speed + node.phase)
      const intensity = Math.max(0, flicker) * anomalyLevel

      mesh.visible = anomalyLevel > 0.1
      mat.opacity = intensity * 0.7
      const scale = 0.05 + intensity * 0.12
      mesh.scale.setScalar(scale)
    })
  })

  if (metrics.riskLevel < 0.05 && metrics.taxLiability < 0.1) return null

  return (
    <group ref={groupRef}>
      {nodes.map((node) => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial
            color="#DC2626"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
