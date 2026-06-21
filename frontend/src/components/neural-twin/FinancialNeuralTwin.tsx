'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useNeuralTwinStore } from './store/graph-store'
import { AccountNode } from './nodes/AccountNode'
import { TransactionCluster } from './nodes/TransactionCluster'
import { MerchantNode } from './nodes/MerchantNode'
import { RiskNode } from './nodes/RiskNode'
import { DrrtNode } from './nodes/DrrtNode'
import { GraphEdge } from './edges/GraphEdge'
import { NodeTooltip } from './ui/NodeTooltip'
import { NodeInspector } from './ui/NodeInspector'
import type { GraphNode } from './types'

function GraphScene() {
  const { nodes, edges, hoveredNode, selectedNode, selectNode, hoverNode, simulationRunning, runSimulation, time, tick } = useNeuralTwinStore()
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useEffect(() => {
    if (!simulationRunning && nodes.length > 0) {
      runSimulation()
    }
  }, [nodes.length, simulationRunning, runSimulation])

  useFrame(() => {
    tick()
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005
    }
  })

  const nodeComponents = useMemo(() => {
    return nodes.map((node: GraphNode) => {
      switch (node.type) {
        case 'account':
          return <AccountNode key={node.id} node={node} />
        case 'cluster':
          return <TransactionCluster key={node.id} node={node} />
        case 'merchant':
          return <MerchantNode key={node.id} node={node} />
        case 'risk':
          return <RiskNode key={node.id} node={node} />
        case 'drrt':
          return <DrrtNode key={node.id} node={node} />
        default:
          return <AccountNode key={node.id} node={node} />
      }
    })
  }, [nodes])

  return (
    <group ref={groupRef}>
      {edges.map((edge) => (
        <GraphEdge key={edge.id} edge={edge} />
      ))}
      {nodeComponents}
      {hoveredNode && <NodeTooltip node={hoveredNode} />}
      {selectedNode && <NodeInspector node={selectedNode} onClose={() => selectNode(null)} />}
    </group>
  )
}

function SceneBackground() {
  return (
    <>
      <color attach="background" args={['#050510']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#4f46e5" />
      <pointLight position={[0, 10, -10]} intensity={0.5} color="#06b6d4" />
      <fog attach="fog" args={['#050510', 80, 200]} />
    </>
  )
}

export function FinancialNeuralTwin() {
  return (
    <div className="w-full h-[700px] rounded-xl overflow-hidden border border-white/10 bg-[#0a0a1a]">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 80], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 80]} fov={50} />
        <SceneBackground />
        <GraphScene />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={200}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
