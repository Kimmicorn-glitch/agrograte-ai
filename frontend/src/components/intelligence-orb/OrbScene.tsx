'use client'

import { Canvas } from '@react-three/fiber'
import { NeuralSphere } from './NeuralSphere'
import { OrbitalRings } from './OrbitalRings'
import { ParticleField } from './ParticleField'
import { NeuralConnections } from './NeuralConnections'
import { EnergyPulses } from './EnergyPulses'
import { RiskNodes } from './RiskNodes'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 8]} intensity={0.3} color="#ffffff" />
      <pointLight position={[0, -3, -5]} intensity={0.1} color="#C1121F" />

      <NeuralSphere />
      <EnergyPulses />
      <OrbitalRings />
      <NeuralConnections />
      <ParticleField />
      <RiskNodes />
    </>
  )
}

export function OrbScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 45, near: 0.1, far: 50, position: [0, 1.5, 6] }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Scene />
      </Canvas>
    </div>
  )
}
