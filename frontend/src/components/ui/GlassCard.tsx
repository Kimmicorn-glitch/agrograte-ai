'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { fadeInUp } from '@/lib/motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  depth?: number
  glow?: string
  hover?: boolean
  shimmer?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className = '',
  depth,
  glow,
  hover = true,
  shimmer,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className={`${hover ? 'card card-hover' : 'card'} ${className}`}
    >
      {shimmer && <div className="glass-shine" />}
      {children}
    </motion.div>
  )
}
