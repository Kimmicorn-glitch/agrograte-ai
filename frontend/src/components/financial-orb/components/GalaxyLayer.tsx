'use client'

import { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGraphStore } from '../store/graph-store'
import { GlassSphereShader } from '../shaders/node-shader'
import { MAX_NODES, LAYER_COLORS_VEC3, NODE_RADIUS } from '../types'

const CATEGORY_COLORS: Record<string, [number, number, number]> = LAYER_COLORS_VEC3

function computeOrbitPosition(
  parentPos: [number, number, number],
  orbitRadius: number,
  orbitSpeed: number,
  orbitPhase: number,
  orbitTilt: number,
  time: number
): [number, number, number] {
  const angle = time * orbitSpeed + orbitPhase
  const x = parentPos[0] + orbitRadius * Math.cos(angle) * Math.cos(orbitTilt)
  const z = parentPos[2] + orbitRadius * Math.sin(angle) * Math.cos(orbitTilt)
  const y = parentPos[1] + orbitRadius * Math.sin(angle) * Math.sin(orbitTilt)
  return [x, y, z]
}

export function GalaxyLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const shaderRef = useRef<GlassSphereShader>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const camera = useThree((s) => s.camera)

  const nodes = useGraphStore((s) => s.nodes)
  const hoveredNodeId = useGraphStore((s) => s.hoveredNodeId)
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const activeEdges = useGraphStore((s) => s.activeEdges)
  const selectNode = useGraphStore((s) => s.selectNode)
  const hoverNode = useGraphStore((s) => s.hoverNode)
  const expandNode = useGraphStore((s) => s.expandNode)

  const visibleNodes = useMemo(
    () => nodes.filter((n) => n.visible),
    [nodes]
  )

  const instanceColor = useMemo(() => new Float32Array(MAX_NODES * 3), [])
  const instanceConfidence = useMemo(() => new Float32Array(MAX_NODES), [])
  const instanceSize = useMemo(() => new Float32Array(MAX_NODES), [])
  const instancePhase = useMemo(() => new Float32Array(MAX_NODES), [])
  const instanceLayer = useMemo(() => new Float32Array(MAX_NODES), [])

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 24, 16), [])

  const colorAttr = useMemo(() => new THREE.InstancedBufferAttribute(instanceColor, 3), [instanceColor])
  const confidenceAttr = useMemo(() => new THREE.InstancedBufferAttribute(instanceConfidence, 1), [instanceConfidence])
  const sizeAttr = useMemo(() => new THREE.InstancedBufferAttribute(instanceSize, 1), [instanceSize])
  const phaseAttr = useMemo(() => new THREE.InstancedBufferAttribute(instancePhase, 1), [instancePhase])
  const layerAttr = useMemo(() => new THREE.InstancedBufferAttribute(instanceLayer, 1), [instanceLayer])

  const geomWithAttrs = useMemo(() => {
    const g = geometry.clone()
    g.setAttribute('aColor', colorAttr)
    g.setAttribute('aConfidence', confidenceAttr)
    g.setAttribute('aSize', sizeAttr)
    g.setAttribute('aPhase', phaseAttr)
    g.setAttribute('aLayer', layerAttr)
    return g
  }, [geometry, colorAttr, confidenceAttr, sizeAttr, phaseAttr, layerAttr])

  const nodePositions = useRef<[number, number, number][]>([])
  const prevExpandMap = useRef<Set<string>>(new Set())

  useFrame((state) => {
    if (!meshRef.current || !shaderRef.current) return

    const elapsed = state.clock.elapsedTime
    const drawCount = Math.min(visibleNodes.length, MAX_NODES)
    meshRef.current.count = drawCount
    meshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    const expandMap = new Set<string>()
    visibleNodes.forEach((n) => { if (n.expanded) expandMap.add(n.id) })

    const nodePositionsArr: [number, number, number][] = []

    for (let i = 0; i < drawCount; i++) {
      const n = visibleNodes[i]
      let pos: [number, number, number]

      if (n.layer === 1) {
        pos = [0, 0, 0]
      } else if (n.layer === 2) {
        pos = computeOrbitPosition([0, 0, 0], n.orbitRadius, n.orbitSpeed, n.orbitPhase, n.orbitTilt, elapsed)
      } else {
        const parent = nodes.find((p) => p.id === n.parentId)
        if (parent && parent.visible) {
          const parentPos = nodePositionsArr[nodes.indexOf(parent)] || parent.position
          pos = computeOrbitPosition(parentPos, n.orbitRadius, n.orbitSpeed, n.orbitPhase, n.orbitTilt, elapsed)
        } else {
          pos = n.position
        }
      }

      nodePositionsArr.push(pos)

      n.position[0] = pos[0]
      n.position[1] = pos[1]
      n.position[2] = pos[2]

      dummy.position.set(pos[0], pos[1], pos[2])

      const isHovered = n.id === hoveredNodeId
      const isSelected = n.id === selectedNodeId
      const highlightScale = isHovered || isSelected ? 1.4 : 1.0

      const radiusMap: Record<number, number> = {
        1: NODE_RADIUS.core,
        2: NODE_RADIUS.category,
        3: NODE_RADIUS.subcategory,
        4: NODE_RADIUS.transaction,
      }

      const baseRadius = radiusMap[n.layer] || 0.1
      const valueScale = 0.5 + (n.value / 50000000) * 0.5
      const radius = baseRadius * valueScale * highlightScale

      dummy.scale.set(radius, radius, radius)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      const catColors = CATEGORY_COLORS[n.category] || [0.5, 0.5, 0.5]
      instanceColor[i * 3] = catColors[0]
      instanceColor[i * 3 + 1] = catColors[1]
      instanceColor[i * 3 + 2] = catColors[2]

      instanceConfidence[i] = n.confidence
      instanceSize[i] = 1
      instancePhase[i] = n.breathPhase
      instanceLayer[i] = n.layer
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    colorAttr.needsUpdate = true
    confidenceAttr.needsUpdate = true
    sizeAttr.needsUpdate = true
    phaseAttr.needsUpdate = true
    layerAttr.needsUpdate = true

    shaderRef.current.uniforms.uTime.value = elapsed

    prevExpandMap.current = expandMap
    nodePositions.current = nodePositionsArr
  })

  const getInstanceId = useCallback(
    (e: any) => {
      if (e.instanceId !== undefined && e.instanceId < visibleNodes.length) {
        return visibleNodes[e.instanceId]
      }
      return null
    },
    [visibleNodes]
  )

  const handlePointerMove = useCallback(
    (e: any) => {
      const node = getInstanceId(e)
      if (node) hoverNode(node.id)
      else hoverNode(null)
    },
    [getInstanceId, hoverNode]
  )

  const handlePointerOut = useCallback(() => {
    hoverNode(null)
  }, [hoverNode])

  const handleClick = useCallback(
    (e: any) => {
      const node = getInstanceId(e)
      if (!node) return
      selectNode(node.id)
      if (node.expanded) return
      expandNode(node.id)
    },
    [getInstanceId, selectNode, expandNode]
  )

  return (
    <instancedMesh
      ref={meshRef}
      args={[geomWithAttrs, undefined, MAX_NODES]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      frustumCulled={true}
    >
      <glassSphereShader attach="material" ref={shaderRef} />
    </instancedMesh>
  )
}
