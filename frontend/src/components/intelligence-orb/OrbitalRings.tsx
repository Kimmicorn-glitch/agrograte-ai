'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useOrbStore } from './store'
import * as THREE from 'three'

const RING_COUNT = 5

export function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null!)
  const metrics = useOrbStore((s) => s.metrics)

  const rings = useMemo(() => {
    return Array.from({ length: RING_COUNT }).map((_, i) => {
      const radius = 2.8 + i * 0.6
      const speed = 0.15 + i * 0.05
      const tiltX = (i / RING_COUNT) * Math.PI * 0.4
      const tiltZ = (i / RING_COUNT) * Math.PI * 0.3
      const opacity = 0.08 + i * 0.03
      const segments = 80 + i * 20

      return { radius, speed, tiltX, tiltZ, opacity, segments }
    })
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const vel = metrics.transactionVelocity
    const health = metrics.cashflowHealth

    groupRef.current.children.forEach((ring, i) => {
      const r = rings[i]
      if (!r) return

      ring.rotation.x = r.tiltX + Math.sin(t * 0.2 + i) * 0.05
      ring.rotation.z = r.tiltZ + Math.cos(t * 0.15 + i) * 0.05
      ring.rotation.y += r.speed * (0.8 + vel * 0.4) * 0.01

      const mesh = ring as THREE.Mesh
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = r.opacity * (0.6 + health * 0.4)
    })
  })

  return (
    <group ref={groupRef}>
      {rings.map((r, i) => (
        <mesh key={i} rotation={[r.tiltX, 0, r.tiltZ]}>
          <ringGeometry args={[r.radius - 0.02, r.radius, r.segments]} />
          <meshBasicMaterial
            color="#111111"
            transparent
            opacity={r.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
