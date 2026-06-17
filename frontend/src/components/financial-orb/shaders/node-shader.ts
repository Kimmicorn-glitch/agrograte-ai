import { ShaderMaterial, Color } from 'three'

export class GlassSphereShader extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1 },
        uGlowIntensity: { value: 0.8 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aConfidence;
        attribute float aSize;
        attribute float aPhase;
        attribute float aLayer;

        uniform float uTime;
        uniform float uPixelRatio;

        varying vec3 vColor;
        varying float vConfidence;
        varying float vFresnel;
        varying float vPhase;
        varying float vLayer;

        void main() {
          vec4 worldPos = instanceMatrix * vec4(position, 1.0);
          vec3 worldNormal = normalize(mat3(instanceMatrix) * normal);
          vec3 viewDir = normalize(cameraPosition - worldPos.xyz);

          float fresnel = 1.0 - max(dot(viewDir, worldNormal), 0.0);
          fresnel = pow(fresnel, 3.0);

          float breathe = 1.0 + 0.02 * sin(uTime * 1.5 + aPhase * 6.28);
          float drift = 0.04 * sin(uTime * 0.7 + aPhase * 3.14);

          vec3 scaledPos = position * aSize * breathe;
          vec4 finalPos = instanceMatrix * vec4(scaledPos, 1.0);
          finalPos.y += drift;

          vColor = aColor;
          vConfidence = aConfidence;
          vFresnel = fresnel;
          vPhase = aPhase;
          vLayer = aLayer;

          gl_Position = projectionMatrix * viewMatrix * finalPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uGlowIntensity;

        varying vec3 vColor;
        varying float vConfidence;
        varying float vFresnel;
        varying float vPhase;
        varying float vLayer;

        void main() {
          float rim = vFresnel * 0.85;
          vec3 rimColor = vec3(1.0, 1.0, 1.0) * rim;

          float pulse = 0.5 + 0.5 * sin(uTime * 0.5 + vPhase * 6.28);
          float innerGlow = vConfidence * (0.15 + 0.2 * pulse);
          vec3 glowColor = vColor * innerGlow * uGlowIntensity;

          float alpha = mix(0.1, 0.55, vFresnel);
          vec3 baseColor = vColor * (0.25 + 0.75 * vConfidence);

          float glassOpacity = 1.0 - (1.0 - vFresnel) * 0.75;

          vec3 finalColor = baseColor + rimColor * 1.2 + glowColor;
          float finalAlpha = clamp(alpha * glassOpacity * (0.4 + 0.6 * vConfidence), 0.05, 0.8);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: 2,
    })
  }
}

export class GalaxyEdgeShader extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.8 },
      },
      vertexShader: `
        attribute float aStrength;
        attribute float aType;
        attribute float aVisibility;

        uniform float uTime;

        varying float vStrength;
        varying float vType;
        varying float vVisibility;

        void main() {
          vStrength = aStrength;
          vType = aType;
          vVisibility = aVisibility;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;

        varying float vStrength;
        varying float vType;
        varying float vVisibility;

        void main() {
          float alpha = vStrength * uOpacity * vVisibility;
          if (alpha < 0.01) discard;

          vec3 color;
          if (vType < 0.5) color = vec3(0.4, 0.4, 0.4);
          else if (vType < 1.5) color = vec3(0.3, 0.7, 0.5);
          else color = vec3(0.7, 0.4, 0.9);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: 2,
    })
  }
}
