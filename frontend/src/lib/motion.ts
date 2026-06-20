import { type Variants } from 'framer-motion'

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
}

export const slideUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
}

export const sidebarAnimation: Variants = {
  open: { x: 0, transition: { type: 'spring', damping: 28, stiffness: 280 } },
  closed: { x: '-100%', transition: { type: 'spring', damping: 28, stiffness: 280 } },
}

export const overlayAnimation: Variants = {
  open: { opacity: 1, transition: { duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.15 } },
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  hover: {
    y: -2,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06), 0 4px 10px rgba(0, 0, 0, 0.04)',
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
}

export const listItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}

export const chatMessage: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
}
