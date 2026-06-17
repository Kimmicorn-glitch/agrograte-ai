'use client'

import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motion'

interface SectionTitleProps {
  children: string
  accent?: boolean
  className?: string
}

export function SectionTitle({ children, accent = false, className = '' }: SectionTitleProps) {
  const Comp = accent ? motion.h3 : motion.h3
  return (
    <Comp
      variants={fadeInUp}
      className={`${accent ? 'section-title-accent' : 'section-title'} ${className}`}
    >
      {children}
    </Comp>
  )
}
