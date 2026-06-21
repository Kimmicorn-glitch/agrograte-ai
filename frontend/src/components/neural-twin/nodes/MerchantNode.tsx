'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box } from '@react-three/drei'
import * as THREE from 'three'
import { useNeuralTwinStore } from '../store/graph-store'
import type { GraphNode } from '../types'

export function MerchantNode({ node }: { node: GraphNode }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { selectNode, hoverNode } = useNeuralTwinStore()
  const size = Math.max(0.8, Math.min(2.5, Math.abs(node.value) / 20000))

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + node.x) * 0.1
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3 + node.z) * 0.1
    }
  })

  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); selectNode(node) }}
        onPointerOver={(e) => { e.stopPropagation(); hoverNode(node) }}
        onPointerOut={() => hoverNode(null)}
      >
        <boxGeometry args={[size * 1.5, size * 1.5, size * 1.5]} />
        <meshPhysicalMaterial color={node.color || '#f97316'} metalness={0.1} roughness={0.3} transparent opacity={0.9} emissive={node.color || '#f97316'} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      <Text position={[0, -size - 2.5, 0]} fontSize={2} color="#94a3b8" anchorX="center" anchorY="top">
        {node.label}
      </Text>
    </group>
  )
}
