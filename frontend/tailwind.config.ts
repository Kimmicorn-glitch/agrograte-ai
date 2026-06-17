import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        scarlet: {
          50: '#fff0f0', 100: '#ffdddd', 200: '#ffc0c0', 300: '#ff9494',
          400: '#ff5757', 500: '#ff2323', 600: '#D90429', 700: '#b80000',
          800: '#980000', 900: '#7f0000',
        },
        carbon: {
          50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0',
          400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f',
          800: '#1A1A1A', 900: '#0A0A0A', 950: '#050505',
        },
        silver: {
          50: '#f8f8f8', 100: '#f0f0f0', 200: '#e0e0e0', 300: '#C0C0C0',
          400: '#a0a0a0', 500: '#808080',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.08)',
          active: 'rgba(255,255,255,0.12)',
          border: 'rgba(255,255,255,0.1)',
          'border-hover': 'rgba(255,255,255,0.2)',
          reflection: 'rgba(255,255,255,0.03)',
          shine: 'rgba(255,255,255,0.06)',
        },
        success: '#00C853',
        warning: '#FFAB00',
        error: '#FF1744',
        info: '#2979FF',
      },
      backdropBlur: {
        glass: '30px',
        heavy: '60px',
        extreme: '120px',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'fade-in-left': 'fadeInLeft 0.6s ease forwards',
        'fade-in-right': 'fadeInRight 0.6s ease forwards',
        'scale-in': 'scaleIn 0.4s ease forwards',
        'glass-appear': 'glassAppear 0.8s ease forwards',
        'glass-shimmer': 'glassShimmer 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-risk': 'pulseRisk 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
        'ripple-expand': 'rippleExpand 2s ease-out infinite',
        'clarity-pulse': 'clarityPulse 3s ease-in-out infinite',
        'node-stabilize': 'nodeStabilize 0.8s ease-out',
        'depth-shift': 'depthShift 10s ease-in-out infinite',
        'reflection-slide': 'reflectionSlide 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glassAppear: {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)', background: 'rgba(255,255,255,0)' },
          '100%': { opacity: '1', backdropFilter: 'blur(30px)', background: 'rgba(255,255,255,0.05)' },
        },
        glassShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '50%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(217, 4, 41, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(217, 4, 41, 0.4)' },
        },
        pulseRisk: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 23, 68, 0.2)', borderColor: 'rgba(255,23,68,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 23, 68, 0.5)', borderColor: 'rgba(255,23,68,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.2)' },
          '100%': { boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)' },
        },
        rippleExpand: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        clarityPulse: {
          '0%, 100%': { backdropFilter: 'blur(30px)', background: 'rgba(255,255,255,0.05)' },
          '50%': { backdropFilter: 'blur(40px)', background: 'rgba(255,255,255,0.08)' },
        },
        nodeStabilize: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        depthShift: {
          '0%, 100%': { transform: 'translateZ(0px)' },
          '50%': { transform: 'translateZ(20px)' },
        },
        reflectionSlide: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      transitionTimingFunction: {
        'fluid': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'glass': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      transitionDuration: {
        'fluid': '0.4s',
        'glass': '0.3s',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, rgba(217,4,41,0.15), rgba(255,255,255,0.08), rgba(192,192,192,0.10))',
        'gradient-scarlet': 'linear-gradient(135deg, rgba(217,4,41,0.4), rgba(217,4,41,0.1))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent, rgba(255,255,255,0.04))',
        'reflection-top': 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
        'reflection-edge': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      },
    },
  },
  plugins: [],
}

export default config
