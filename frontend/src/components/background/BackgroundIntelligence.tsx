'use client'

import { useMemo, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 800
const CONNECTION_DISTANCE = 120
const FLOW_FIELD_STRENGTH = 0.0003

function ParticleField({ coherence = 0.8 }: { coherence?: number }) {
  const meshRef = useRef<THREE.Points>(null!)
  const positionsRef = useRef<Float32Array>(null!)
  const velocitiesRef = useRef<Float32Array>(null!)
  const connectionsRef = useRef<{ a: number; b: number }[]>([])

  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    const col = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 200 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)

      vel[i * 3] = (Math.random() - 0.5) * 0.2
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.2
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2

      const intensity = 0.2 + Math.random() * 0.4
      col[i * 3] = 0.85 * intensity
      col[i * 3 + 1] = 0.85 * intensity
      col[i * 3 + 2] = 0.85 * intensity
    }

    positionsRef.current = pos
    velocitiesRef.current = vel

    const conns: { a: number; b: number }[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = pos[i * 3] - pos[j * 3]
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < CONNECTION_DISTANCE && Math.random() < 0.03) {
          conns.push({ a: i, b: j })
        }
      }
    }
    connectionsRef.current = conns

    return { positions: pos, velocities: vel, colors: col }
  }, [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const pos = positionsRef.current

    if (!pos) return

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3
      const x = pos[idx]
      const y = pos[idx + 1]
      const z = pos[idx + 2]

      const flowX = Math.sin(y * FLOW_FIELD_STRENGTH + time * 0.1) * 0.1
      const flowY = Math.cos(z * FLOW_FIELD_STRENGTH + time * 0.08) * 0.1
      const flowZ = Math.sin(x * FLOW_FIELD_STRENGTH + time * 0.12) * 0.1

      pos[idx] += flowX
      pos[idx + 1] += flowY
      pos[idx + 2] += flowZ

      const dist = Math.sqrt(pos[idx] ** 2 + pos[idx + 1] ** 2 + pos[idx + 2] ** 2)
      if (dist > 600) {
        pos[idx] *= 0.99
        pos[idx + 1] *= 0.99
        pos[idx + 2] *= 0.99
      }
    }

    const geometry = meshRef.current.geometry
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        transparent
        opacity={0.6}
        color="#C0C0C0"
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function ConnectionLines({ coherence = 0.8 }: { coherence?: number }) {
  const lineRef = useRef<THREE.LineSegments>(null!)
  const positionsRef = useRef<Float32Array>(null!)

  const geometry = useMemo(() => {
    const conns: { a: number; b: number }[] = []
    for (let i = 0; i < 100; i++) {
      const a = Math.floor(Math.random() * PARTICLE_COUNT)
      const b = Math.floor(Math.random() * PARTICLE_COUNT)
      if (a !== b) conns.push({ a, b })
    }

    const pos = new Float32Array(conns.length * 6)
    for (let i = 0; i < conns.length; i++) {
      const angle1 = Math.random() * Math.PI * 2
      const angle2 = Math.random() * Math.PI * 2
      const r1 = 300 + Math.random() * 200
      const r2 = 300 + Math.random() * 200

      pos[i * 6] = Math.cos(angle1) * r1
      pos[i * 6 + 1] = Math.sin(angle1) * r1 * 0.5
      pos[i * 6 + 2] = Math.sin(angle1) * r1 * 0.3
      pos[i * 6 + 3] = Math.cos(angle2) * r2
      pos[i * 6 + 4] = Math.sin(angle2) * r2 * 0.5
      pos[i * 6 + 5] = Math.sin(angle2) * r2 * 0.3
    }

    positionsRef.current = pos

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geom
  }, [])

  useFrame(({ clock }) => {
    const pos = positionsRef.current
    if (!pos) return

    const time = clock.getElapsedTime()
    const count = pos.length / 6

    for (let i = 0; i < count; i++) {
      const idx = i * 6
      const angle1 = time * 0.02 + i * 0.1
      const angle2 = time * 0.015 + i * 0.13
      const r1 = 300 + Math.sin(time * 0.01 + i) * 50
      const r2 = 300 + Math.cos(time * 0.008 + i * 1.3) * 50

      pos[idx] = Math.cos(angle1) * r1
      pos[idx + 1] = Math.sin(angle1) * r1 * 0.5
      pos[idx + 2] = Math.sin(angle1) * r1 * 0.3
      pos[idx + 3] = Math.cos(angle2) * r2
      pos[idx + 4] = Math.sin(angle2) * r2 * 0.5
      pos[idx + 5] = Math.sin(angle2) * r2 * 0.3
    }

    lineRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color="#D90429"
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

function DataStreams() {
  const streamRef = useRef<THREE.Points>(null!)
  const positionsRef = useRef<Float32Array>(null!)

  const geometry = useMemo(() => {
    const count = 50
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 100 + Math.random() * 400
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    positionsRef.current = pos

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geom
  }, [])

  useFrame(({ clock }) => {
    const pos = positionsRef.current
    if (!pos) return

    const time = clock.getElapsedTime()
    const count = pos.length / 3

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const angle = (i / count) * Math.PI * 2 + time * 0.05
      const radius = 100 + Math.sin(time * 0.02 + i) * 200 + 200
      pos[idx] = Math.cos(angle) * radius
      pos[idx + 1] = Math.sin(time * 0.03 + i * 0.5) * 80
      pos[idx + 2] = Math.sin(angle) * radius
    }

    streamRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={streamRef} geometry={geometry}>
      <pointsMaterial
        size={2}
        color="#D90429"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function CameraController() {
  const ref = useRef<THREE.PerspectiveCamera>(null!)

  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime()
    camera.position.x = Math.sin(time * 0.015) * 50
    camera.position.y = Math.sin(time * 0.01) * 30
    camera.lookAt(0, 0, 0)
  })

  return null
}

export function BackgroundIntelligence({ coherence = 0.8 }: { coherence?: number }) {
  return (
    <div className="three-canvas">
      <Canvas
        camera={{ position: [0, 0, 500], fov: 60, near: 1, far: 2000 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <CameraController />
        <ParticleField coherence={coherence} />
        <ConnectionLines coherence={coherence} />
        <DataStreams />
      </Canvas>
    </div>
  )
}
