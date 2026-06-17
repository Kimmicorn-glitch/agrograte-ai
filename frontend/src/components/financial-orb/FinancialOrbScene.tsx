'use client'

import { useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGraphStore } from './store/graph-store'
import { GalaxyLayer } from './components/GalaxyLayer'
import { GalaxyEdges } from './components/GalaxyEdges'
import { OrbitController } from './components/OrbitController'
import { ParticleField } from './components/ParticleField'
import { LayerNavigator } from './components/LayerNavigator'
import { SearchPanel } from './components/SearchPanel'
import { NodeTooltip } from './components/NodeTooltip'
import { ContextMenu } from './components/ContextMenu'
import { Brain, Search, RotateCw, Layers } from 'lucide-react'

import './shaders/register'

export function FinancialOrbScene() {
  const [mounted, setMounted] = useState(false)
  const initialize = useGraphStore((s) => s.initialize)
  const scene = useGraphStore((s) => s.scene)
  const setAutoRotate = useGraphStore((s) => s.setAutoRotate)

  useEffect(() => {
    initialize()
    setMounted(true)
  }, [initialize])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const store = useGraphStore.getState()
      if (e.key === 'd' || e.key === 'D') store.toggleDrrtLayer()
      if (e.key === '/') {
        e.preventDefault()
        store.setSearchPanelVisible(!store.scene.searchPanelVisible)
      }
      if (e.key === 'r' || e.key === 'R') store.setAutoRotate(!store.scene.autoRotate)
      if (e.key === 'Escape') {
        store.selectNode(null)
        store.setFocusMode(false)
        store.clearHighlight()
        store.setAutoRotate(true)
      }
    },
    []
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const toggleSearch = useCallback(() => {
    const state = useGraphStore.getState()
    state.setSearchPanelVisible(!state.scene.searchPanelVisible)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-carbon-950">
        <div className="flex items-center gap-3 text-white/40 font-mono text-xs">
          <div className="w-1.5 h-1.5 rounded-full animate-breathe" style={{ backgroundColor: '#1D9E75' }} />
          Initialising Financial Galaxy...
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          logarithmicDepthBuffer: true,
        }}
        camera={{ fov: 55, near: 0.01, far: 5000, position: [0, 3, 18] }}
        performance={{ min: 0.5 }}
        dpr={[1, 1.5]}
        style={{ background: '#050505' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 12, 8]} intensity={0.6} castShadow />
        <directionalLight position={[-5, -3, -8]} intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={0.15} color="#ffffff" />

        <fog attach="fog" args={['#050505', 25, 80]} />

        <OrbitController />
        <GalaxyLayer />
        <GalaxyEdges />
        <ParticleField />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial color="#050505" transparent opacity={0.3} />
        </mesh>
      </Canvas>

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggleSearch}
          className="p-2.5 glass rounded-lg hover:bg-glass-hover transition-colors text-white/60 hover:text-white"
          title="Search (/)"
        >
          <Search size={16} />
        </button>
        <button
          onClick={() => useGraphStore.getState().toggleDrrtLayer()}
          className={`p-2.5 glass rounded-lg transition-colors ${
            scene.drrtLayerVisible
              ? 'text-scarlet-400 bg-scarlet-600/20'
              : 'text-white/60 hover:text-white hover:bg-glass-hover'
          }`}
          title="Toggle DRRT layer (D)"
        >
          <Brain size={16} />
        </button>
        <button
          onClick={() => setAutoRotate(!scene.autoRotate)}
          className={`p-2.5 glass rounded-lg transition-colors ${
            scene.autoRotate ? 'text-white' : 'text-white/60 hover:text-white hover:bg-glass-hover'
          }`}
          title="Toggle auto-rotate (R)"
        >
          <RotateCw size={16} />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="glass rounded-lg px-3 py-2 border border-glass-border">
          <div className="flex items-center gap-2 text-[0.5rem] font-mono text-white/40">
            <Layers size={12} />
            <span>Layer {scene.activeLayer}/4 · {scene.layerPath.join(' › ')}</span>
          </div>
        </div>
      </div>

      <SearchPanel />
      <NodeTooltip />
      <LayerNavigator />
      <ContextMenu />

      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <span className="text-[0.55rem] text-white/20 font-mono">
          {scene.autoRotate ? 'Exploring' : 'Focused'} · L{scene.activeLayer}
        </span>
      </div>
    </div>
  )
}
