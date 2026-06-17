import { Variants, Transition } from 'framer-motion'

export const fluidTransition: Transition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1],
}

export const glassTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
}

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 1,
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: fluidTransition,
  },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: fluidTransition,
  },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: fluidTransition,
  },
}

export const glassAppear: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    background: 'rgba(255,255,255,0)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(30px)',
    background: 'rgba(255,255,255,0.05)',
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
}

export const metricValue: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const riskPulse: Variants = {
  idle: {
    boxShadow: '0 0 10px rgba(255, 23, 68, 0.2)',
    borderColor: 'rgba(255,23,68,0.3)',
  },
  active: {
    boxShadow: '0 0 30px rgba(255, 23, 68, 0.5)',
    borderColor: 'rgba(255,23,68,0.6)',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}

export const clarityIncrease: Variants = {
  low: {
    backdropFilter: 'blur(20px)',
    background: 'rgba(255,255,255,0.03)',
  },
  high: {
    backdropFilter: 'blur(40px)',
    background: 'rgba(255,255,255,0.08)',
    transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const nodeStabilize: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
}

export const rippleExpand: Variants = {
  hidden: { scale: 1, opacity: 0.5 },
  visible: {
    scale: 3,
    opacity: 0,
    transition: { duration: 2, repeat: Infinity, ease: 'easeOut' },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
}
