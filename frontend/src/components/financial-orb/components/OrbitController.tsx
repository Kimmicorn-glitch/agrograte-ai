'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGraphStore } from '../store/graph-store'

export function OrbitController() {
  const controlsRef = useRef<any>(null)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const nodes = useGraphStore((s) => s.nodes)
  const sceneState = useGraphStore((s) => s.scene)

  const targetRef = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)
  const animStart = useRef(0)

  useEffect(() => {
    if (!selectedNodeId || !controlsRef.current) return
    const node = nodes.find((n) => n.id === selectedNodeId)
    if (!node) return

    const target = new THREE.Vector3(...node.position)
    targetRef.current.copy(target)
    isAnimating.current = true
    animStart.current = performance.now()
  }, [selectedNodeId, nodes])

  useFrame(() => {
    if (!controlsRef.current) return

    controlsRef.current.enableDamping = true
    controlsRef.current.dampingFactor = 0.06
    controlsRef.current.minDistance = 1.5
    controlsRef.current.maxDistance = 800

    controlsRef.current.autoRotate = sceneState.autoRotate
    controlsRef.current.autoRotateSpeed = sceneState.autoRotateSpeed

    if (isAnimating.current && controlsRef.current) {
      const elapsed = (performance.now() - animStart.current) / 1000
      const t = Math.min(elapsed / 0.6, 1)
      const ease = 1 - Math.pow(1 - t, 3)

      controlsRef.current.target.lerp(targetRef.current, ease)

      if (t >= 1) {
        isAnimating.current = false
        controlsRef.current.target.copy(targetRef.current)
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.06}
      minDistance={1.5}
      maxDistance={800}
      autoRotate={sceneState.autoRotate}
      autoRotateSpeed={sceneState.autoRotateSpeed}
    />
  )
}
