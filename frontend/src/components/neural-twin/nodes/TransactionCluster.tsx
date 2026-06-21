'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useNeuralTwinStore } from '../store/graph-store'
import type { GraphNode } from '../types'

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return { r, g, b }
}

export function TransactionCluster({ node }: { node: GraphNode }) {
  const meshRef = useRef<THREE.Group>(null)
  const { selectNode, hoverNode } = useNeuralTwinStore()
  const size = Math.max(1, Math.min(3.5, Math.abs(node.value) / 100000))
  const color = new THREE.Color(node.color || '#8b5cf6')
  const rgb = hexToRgb(node.color || '#8b5cf6')
  const particleCount = Math.min(Math.floor(Math.abs(node.value) / 5000), 20)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.position.y = node.y + Math.sin(state.clock.elapsedTime * 0.5 + node.x) * 0.3
    }
  })

  return (
    <group ref={meshRef} position={[node.x, node.y, node.z]}>
      {/* Cluster center */}
      <mesh
        onClick={(e) => { e.stopPropagation(); selectNode(node) }}
        onPointerOver={(e) => { e.stopPropagation(); hoverNode(node) }}
        onPointerOut={() => hoverNode(null)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshPhysicalMaterial color={color} metalness={0.1} roughness={0.4} transparent opacity={0.9} emissive={color} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {/* Orbiting particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const radius = size + 1.5 + Math.random() * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle * 1.3) * radius * 0.6, Math.sin(angle) * radius * 0.4]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
        )
      })}
      <Text position={[0, -size - 2.5, 0]} fontSize={2} color="#94a3b8" anchorX="center" anchorY="top">
        {node.label}
      </Text>
    </group>
  )
}
