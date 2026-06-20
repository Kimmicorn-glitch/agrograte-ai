'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useOrbStore } from './store'
import * as THREE from 'three'

export function EnergyPulses() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const metrics = useOrbStore((s) => s.metrics)

  const geometry = useMemo(() => new THREE.SphereGeometry(2.4, 32, 32), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const cashflow = metrics.cashflowHealth
    const tax = metrics.taxLiability
    const risk = metrics.riskLevel

    const pulse = (Math.sin(t * 0.8) * 0.5 + 0.5) * (0.4 + cashflow * 0.3)
    const taxPulse = Math.sin(t * 0.5) * 0.15 * tax
    const riskPulse = risk > 0.3 ? Math.sin(t * 3) * 0.1 * risk : 0

    meshRef.current.scale.setScalar(1 + pulse * 0.08 + taxPulse + riskPulse)
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = pulse * 0.12 + taxPulse * 0.3 + riskPulse * 0.2
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        color="#C1121F"
        transparent
        opacity={0.08}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  )
}
