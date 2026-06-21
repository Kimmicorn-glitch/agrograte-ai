'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useNeuralTwinStore } from '../store/graph-store'
import type { GraphNode } from '../types'

export function RiskNode({ node }: { node: GraphNode }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const { selectNode, hoverNode } = useNeuralTwinStore()
  const size = 2.5

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1
      meshRef.current.scale.setScalar(pulse)
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7
      glowRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* Glow aura */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2.5, 16, 16]} />
        <meshBasicMaterial color={node.color || '#ef4444'} transparent opacity={0.2} />
      </mesh>
      {/* Core */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); selectNode(node) }}
        onPointerOver={(e) => { e.stopPropagation(); hoverNode(node) }}
        onPointerOut={() => hoverNode(null)}
      >
        <octahedronGeometry args={[size, 0]} />
        <meshPhysicalMaterial color={node.color || '#ef4444'} metalness={0.1} roughness={0.2} emissive={node.color || '#ef4444'} emissiveIntensity={1.0} transparent opacity={0.95} toneMapped={false} />
      </mesh>
      {/* Pulsing ring */}
      <mesh>
        <ringGeometry args={[size * 1.2, size * 2, 32]} />
        <meshBasicMaterial color={node.color || '#ef4444'} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, -size - 3, 0]} fontSize={2} color="#94a3b8" anchorX="center" anchorY="top">
        {node.label}
      </Text>
    </group>
  )
}
