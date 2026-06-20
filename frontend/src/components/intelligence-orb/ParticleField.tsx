'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useOrbStore } from './store'
import * as THREE from 'three'

const PARTICLE_COUNT = 3000

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null!)
  const metrics = useOrbStore((s) => s.metrics)

  const { positions, velocities, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    const siz = new Float32Array(PARTICLE_COUNT)
    const col = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 3 + Math.random() * 5

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.cos(phi)
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

      vel[i * 3] = (Math.random() - 0.5) * 0.005
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005

      siz[i] = 0.01 + Math.random() * 0.025

      const brightness = 0.2 + Math.random() * 0.3
      col[i * 3] = brightness
      col[i * 3 + 1] = brightness
      col[i * 3 + 2] = brightness + Math.random() * 0.1
    }

    return { positions: pos, velocities: vel, sizes: siz, colors: col }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, sizes, colors])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    const vel = metrics.transactionVelocity
    const risk = metrics.riskLevel
    const tax = metrics.taxLiability

    const speed = 0.2 + vel * 0.8
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      pos[i3] += velocities[i3] * speed + Math.sin(t * 0.5 + i * 0.01) * 0.001
      pos[i3 + 1] += velocities[i3 + 1] * speed + Math.cos(t * 0.4 + i * 0.01) * 0.001
      pos[i3 + 2] += velocities[i3 + 2] * speed + Math.sin(t * 0.6 + i * 0.01) * 0.001

      const dx = pos[i3]
      const dy = pos[i3 + 1]
      const dz = pos[i3 + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist > 9) {
        const norm = 8 / dist
        pos[i3] *= norm * 0.99
        pos[i3 + 1] *= norm * 0.99
        pos[i3 + 2] *= norm * 0.99
      }

      if (risk > 0.4) {
        const flicker = Math.sin(t * 6 + i * 0.1) * 0.15 * risk
        const colors = pointsRef.current.geometry.attributes.color.array as Float32Array
        if (flicker > 0.1) {
          colors[i3] = 1
          colors[i3 + 1] = 0.3
          colors[i3 + 2] = 0.3
        }
      }

      if (tax > 0.5 && dist < 3.5) {
        const colors = pointsRef.current.geometry.attributes.color.array as Float32Array
        const taxGlow = Math.sin(t * 2 + i * 0.05) * 0.3 * tax
        colors[i3] = Math.min(1, colors[i3] + taxGlow * 0.5)
        colors[i3 + 1] = Math.max(0.1, colors[i3 + 1] - taxGlow * 0.2)
        colors[i3 + 2] = Math.max(0.1, colors[i3 + 2] - taxGlow * 0.2)
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.color.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
