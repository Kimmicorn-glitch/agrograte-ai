'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { glassAppear } from '@/lib/motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  depth?: 1 | 2 | 3 | 4
  glow?: 'scarlet' | 'white' | 'success' | 'warning' | 'error' | 'none'
  hover?: boolean
  shimmer?: boolean
  onClick?: () => void
}

const depthClasses: Record<number, string> = {
  1: 'glass-card-depth-1',
  2: 'glass-card-depth-2',
  3: 'glass-card-depth-3',
  4: 'glass-card-depth-4',
}

const glowClasses: Record<string, string> = {
  scarlet: 'glow-scarlet',
  white: 'glow-white',
  success: 'glow-success',
  warning: 'glow-warning',
  error: 'glow-error',
  none: '',
}

export function GlassCard({
  children,
  className = '',
  depth = 1,
  glow = 'none',
  hover = true,
  shimmer = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      variants={glassAppear}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className={`
        glass-card rounded-lg
        ${depthClasses[depth]}
        ${hover ? 'cursor-pointer' : ''}
        ${glowClasses[glow]}
        ${className}
      `}
    >
      {shimmer && <div className="glass-shine" />}
      <div className="glass-reflection" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
