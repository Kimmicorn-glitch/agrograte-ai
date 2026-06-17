'use client'

import { useMemo, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DrrtNode, DrrtEdge } from '@/types'

const NODE_COUNT = 40
const CLUSTER_COUNT = 4

function generateSampleNodes(coherence: number): DrrtNode[] {
  const groups = ['coherence', 'contradiction', 'convergence', 'risk']
  const nodes: DrrtNode[] = []

  for (let i = 0; i < NODE_COUNT; i++) {
    const group = groups[i % CLUSTER_COUNT]
    const clusterIdx = Math.floor(i / (NODE_COUNT / CLUSTER_COUNT))
    const angle = ((i % (NODE_COUNT / CLUSTER_COUNT)) / (NODE_COUNT / CLUSTER_COUNT)) * Math.PI * 2
    const radius = 60 + Math.random() * 40
    const spread = 100

    nodes.push({
      id: `node-${i}`,
      label: `${group}-${i}`,
      weight: 0.3 + Math.random() * 0.7,
      activation: 0.2 + Math.random() * 0.8,
      x: Math.cos(angle + clusterIdx * 1.5) * radius + (Math.random() - 0.5) * 30,
      y: Math.sin(angle + clusterIdx * 1.5) * radius + (Math.random() - 0.5) * 30,
      z: (Math.random() - 0.5) * 40,
      group,
    })
  }

  return nodes
}

function generateSampleEdges(nodes: DrrtNode[], coherence: number): DrrtEdge[] {
  const edges: DrrtEdge[] = []

  for (let i = 0; i < nodes.length; i++) {
    const connections = 1 + Math.floor(Math.random() * 3)
    for (let c = 0; c < connections; c++) {
      const j = Math.floor(Math.random() * nodes.length)
      if (i !== j) {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          weight: 0.1 + Math.random() * 0.9,
          coherence: Math.max(0, coherence + (Math.random() - 0.5) * 0.3),
        })
      }
    }
  }

  return edges
}

function DrrtNetwork({ coherence = 0.8 }: { coherence?: number }) {
  const nodesRef = useRef<THREE.InstancedMesh>(null!)
  const edgesRef = useRef<THREE.LineSegments>(null!)
  const nodePositions = useRef<Float32Array>(null!)
  const edgePositions = useRef<Float32Array>(null!)

  const { nodes, edges } = useMemo(() => {
    const n = generateSampleNodes(coherence)
    const e = generateSampleEdges(n, coherence)
    return { nodes: n, edges: e }
  }, [coherence])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const nodePos = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3)
    nodes.forEach((node, i) => {
      pos[i * 3] = node.x
      pos[i * 3 + 1] = node.y
      pos[i * 3 + 2] = node.z
    })
    nodePositions.current = pos
    return pos
  }, [nodes])

  const edgePos = useMemo(() => {
    const pos = new Float32Array(edges.length * 6)
    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    edges.forEach((edge, i) => {
      const src = nodeMap.get(edge.source)
      const tgt = nodeMap.get(edge.target)
      if (src && tgt) {
        pos[i * 6] = src.x
        pos[i * 6 + 1] = src.y
        pos[i * 6 + 2] = src.z
        pos[i * 6 + 3] = tgt.x
        pos[i * 6 + 4] = tgt.y
        pos[i * 6 + 5] = tgt.z
      }
    })

    edgePositions.current = pos
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return geom
  }, [nodes, edges])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const nodePos = nodePositions.current
    if (!nodePos) return

    // Gentle floating animation for nodes
    for (let i = 0; i < nodes.length; i++) {
      const idx = i * 3
      const baseX = nodePos[idx]
      const baseY = nodePos[idx + 1]
      const baseZ = nodePos[idx + 2]

      dummy.position.set(
        baseX + Math.sin(time * 0.3 + i * 0.7) * 3,
        baseY + Math.cos(time * 0.2 + i * 0.5) * 3,
        baseZ + Math.sin(time * 0.15 + i * 0.3) * 2
      )
      dummy.scale.setScalar(0.5 + nodes[i].activation * 0.5)
      dummy.updateMatrix()
      nodesRef.current.setMatrixAt(i, dummy.matrix)
    }
    nodesRef.current.instanceMatrix.needsUpdate = true

    // Pulse edges based on coherence
    const edgePos = edgePositions.current
    if (edgePos) {
      const count = edgePos.length / 6
      for (let i = 0; i < count; i++) {
        const idx = i * 6
        const pulse = 0.3 + Math.sin(time * 0.5 + i * 0.1) * 0.2
        // Edges remain static but opacity varies via material
      }
    }
  })

  const nodeColor = useMemo(() => {
    const colors = new Float32Array(nodes.length * 3)
    nodes.forEach((node, i) => {
      const group = node.group
      if (group === 'coherence') {
        colors[i * 3] = 0.4; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.4 // green
      } else if (group === 'contradiction') {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.2 // red
      } else if (group === 'convergence') {
        colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.5; colors[i * 3 + 2] = 1.0 // blue
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.2 // yellow
      }
    })
    return colors
  }, [nodes])

  return (
    <group>
      <instancedMesh
        ref={nodesRef}
        args={[undefined, undefined, nodes.length]}
      >
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial
          color="#C0C0C0"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
      <lineSegments ref={edgesRef} geometry={edgePos}>
        <lineBasicMaterial
          color="#D90429"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}

function CameraController() {
  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime()
    camera.position.x = Math.sin(time * 0.1) * 180
    camera.position.y = 40 + Math.sin(time * 0.08) * 20
    camera.position.z = 180 + Math.sin(time * 0.12) * 30
    camera.lookAt(0, 0, 0)
  })

  return null
}

export function DrrtVisualization({
  coherence = 0.8,
  className = '',
}: {
  coherence?: number
  className?: string
}) {
  return (
    <div className={`rounded-lg overflow-hidden bg-carbon-950/50 ${className}`}>
      <Canvas
        camera={{ position: [0, 50, 200], fov: 50, near: 1, far: 500 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <CameraController />
        <DrrtNetwork coherence={coherence} />
      </Canvas>
    </div>
  )
}
