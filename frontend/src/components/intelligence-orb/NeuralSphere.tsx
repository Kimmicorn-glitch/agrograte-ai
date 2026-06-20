'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useOrbStore } from './store'
import * as THREE from 'three'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function NeuralSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const metrics = useOrbStore((s) => s.metrics)

  const vertexCount = 2048
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.2, 4)
    return geo
  }, [])

  const basePositions = useMemo(() => {
    const pos = geometry.attributes.position.array.slice() as Float32Array
    return pos
  }, [geometry])

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return

    const t = clock.getElapsedTime()
    const pos = meshRef.current.geometry.attributes.position
    const array = pos.array as Float32Array

    const compliance = metrics.complianceScore
    const cashflow = metrics.cashflowHealth
    const risk = metrics.riskLevel
    const tax = metrics.taxLiability

    const distortion = 1 - compliance
    const pulse = Math.sin(t * 0.6) * 0.04
    const breathe = 1 + Math.sin(t * 0.3) * 0.015

    for (let i = 0; i < array.length; i += 3) {
      const bx = basePositions[i]
      const by = basePositions[i + 1]
      const bz = basePositions[i + 2]

      const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1
      const nx = bx / len
      const ny = by / len
      const nz = bz / len

      const angle = Math.atan2(bz, bx)
      const lat = Math.asin(by / len)

      const wave1 = Math.sin(angle * 6 + t * 0.8) * 0.04 * (1 - compliance)
      const wave2 = Math.sin(lat * 8 + t * 0.5) * 0.03 * risk
      const taxWave = Math.sin(angle * 4 + t * 0.3) * 0.06 * tax
      const cashPulse = Math.sin(t * 1.2 + angle * 3 + lat * 4) * 0.03 * (1 - cashflow)

      const deform = distortion * 0.12 + wave1 + wave2 + taxWave + cashPulse + pulse
      const scale = breathe * (1 + deform)

      array[i] = bx * scale
      array[i + 1] = by * scale
      array[i + 2] = bz * scale
    }

    pos.needsUpdate = true
    geometry.computeVertexNormals()

    const innerGlow = 0.3 + cashflow * 0.4
    const redPulse = tax * 0.5 + Math.sin(t * 1.5) * 0.1 * tax
    const riskFlash = risk > 0.4 ? Math.sin(t * 4) * 0.15 * risk : 0

    materialRef.current.uniforms.uInnerGlow.value = innerGlow
    materialRef.current.uniforms.uRedIntensity.value = redPulse + riskFlash
    materialRef.current.uniforms.uCompliance.value = compliance
    materialRef.current.uniforms.uTime.value = t
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uInnerGlow: { value: 0.6 },
          uRedIntensity: { value: 0 },
          uCompliance: { value: 1 },
        }}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uInnerGlow;
          uniform float uRedIntensity;
          uniform float uCompliance;

          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vec3 viewDir = normalize(-vPosition);
            float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
            rim = pow(rim, 2.5);

            vec3 baseColor = vec3(0.95, 0.95, 0.98);
            vec3 redAccent = vec3(0.757, 0.071, 0.122);
            vec3 glowColor = mix(vec3(1.0), redAccent, uRedIntensity);

            float alpha = rim * uInnerGlow * 0.7 + 0.15;
            alpha += uRedIntensity * 0.15;

            vec3 color = mix(baseColor, glowColor, rim * 0.8);
            color = mix(color, redAccent, uRedIntensity * 0.4);

            float edgeGlow = rim * uInnerGlow;
            color += vec3(1.0, 0.95, 0.95) * edgeGlow * 0.3;

            gl_FragColor = vec4(color, alpha);
          }
        `}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
