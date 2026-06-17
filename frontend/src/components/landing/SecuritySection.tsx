'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const items = [
  'AES-256 encryption at rest — all data encrypted',
  'TLS 1.3 in transit — enterprise-grade transport security',
  'Zero Trust Architecture — verify every access request',
  'HashiCorp Vault — secrets management with rotation',
  'RBAC + ABAC — granular access control per user',
  'Comprehensive audit logging — every mutation recorded',
  'SOC2-ready controls — built for compliance from day one',
]

export function SecuritySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 md:py-32">
      <div className="page-container">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
          <motion.span variants={fadeUp} className="section-title text-scarlet-400">Security</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">Bank-grade security by design</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">Your financial data is the most sensitive asset you have. We protect it with the same standards we would demand for our own.</motion.p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-3 glass-card py-3 px-4"
            >
              <Check size={14} className="text-success shrink-0" />
              <span className="text-xs font-mono text-white/70">{item}</span>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="mt-8 text-center">
          <Link href="/security" className="btn-ghost text-sm">View Full Security Architecture</Link>
        </motion.div>
      </div>
    </section>
  )
}
