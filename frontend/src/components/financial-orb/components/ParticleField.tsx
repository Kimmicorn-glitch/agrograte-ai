'use client'

import { useMemo } from 'react'
import { Sparkles } from '@react-three/drei'

export function ParticleField() {
  return (
    <Sparkles
      count={1200}
      scale={35}
      size={0.12}
      speed={0.2}
      color="#C0C0C0"
      opacity={0.25}
      noise={0.4}
    />
  )
}
