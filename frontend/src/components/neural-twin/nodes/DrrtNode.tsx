'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useNeuralTwinStore } from '../store/graph-store'
import type { GraphNode } from '../types'

export function DrrtNode({ node }: { node: GraphNode }) {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const { selectNode, hoverNode } = useNeuralTwinStore()
  const coherence = (node.metadata?.coherence as number) || 0.5
  const size = 3 + coherence * 3

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
    if (innerRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05
      innerRef.current.scale.setScalar(pulse)
    }
  })

  const color = coherence > 0.7 ? '#22c55e' : coherence > 0.4 ? '#f59e0b' : '#ef4444'

  return (
    <group ref={groupRef} position={[node.x, node.y, node.z]}>
      {/* Outer frame */}
      <mesh>
        <torusGeometry args={[size, 0.3, 16, 48]} />
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.3} transparent opacity={0.6} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Inner sphere */}
      <mesh
        ref={innerRef}
        onClick={(e) => { e.stopPropagation(); selectNode(node) }}
        onPointerOver={(e) => { e.stopPropagation(); hoverNode(node) }}
        onPointerOut={() => hoverNode(null)}
      >
        <sphereGeometry args={[size * 0.4, 24, 24]} />
        <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.4} emissive={color} emissiveIntensity={0.3} transparent opacity={0.8} />
      </mesh>
      {/* Orbital ring 2 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 0.7, 0.15, 12, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      {/* Coherence value */}
      <Text position={[0, -size - 3, 0]} fontSize={2.5} color={color} anchorX="center" anchorY="top">
        {`DRRT ${(coherence * 100).toFixed(0)}%`}
      </Text>
    </group>
  )
}
