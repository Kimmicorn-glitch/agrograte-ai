'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useNeuralTwinStore } from '../store/graph-store'
import type { GraphNode } from '../types'

const BALANCE_TO_SIZE = (v: number) => Math.max(2, Math.min(8, Math.abs(v) / 500000))

const HEALTH_COLORS: Record<string, string> = {
  healthy: '#22c55e',
  warning: '#f59e0b',
  risk: '#ef4444',
}

export function AccountNode({ node }: { node: GraphNode }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { selectNode, hoverNode } = useNeuralTwinStore()
  const size = BALANCE_TO_SIZE(node.value)
  const color = node.color || HEALTH_COLORS.healthy

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = node.pulse ? Math.sin(state.clock.elapsedTime * 2) * 0.15 + 1 : 1
      meshRef.current.scale.setScalar(pulse)
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
        <sphereGeometry args={[size, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.9}
          emissive={color}
          emissiveIntensity={node.glow ? 0.3 : 0.1}
        />
      </mesh>
      {node.glow && (
        <mesh>
          <sphereGeometry args={[size * 1.4, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} />
        </mesh>
      )}
      <Text
        position={[0, -size - 3, 0]}
        fontSize={2.5}
        color="#94a3b8"
        anchorX="center"
        anchorY="top"
      >
        {node.label.length > 20 ? node.label.slice(0, 18) + '..' : node.label}
      </Text>
    </group>
  )
}
