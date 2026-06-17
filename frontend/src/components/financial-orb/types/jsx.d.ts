import type { GlassSphereShader, GalaxyEdgeShader } from '../shaders/node-shader'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      glassSphereShader: React.DetailedHTMLProps<
        React.HTMLAttributes<GlassSphereShader> & { ref?: React.Ref<GlassSphereShader>; attach?: string },
        GlassSphereShader
      >
      galaxyEdgeShader: React.DetailedHTMLProps<
        React.HTMLAttributes<GalaxyEdgeShader> & { ref?: React.Ref<GalaxyEdgeShader>; attach?: string },
        GalaxyEdgeShader
      >
    }
  }
}

export {}
