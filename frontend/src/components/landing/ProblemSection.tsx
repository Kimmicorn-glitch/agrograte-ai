'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const problems = [
  'Spreadsheet chaos across disconnected bank accounts',
  'Tax compliance complexity that costs time and money',
  'No real-time visibility into financial health',
  'Reactive instead of proactive financial decisions',
  'Manual data entry that is error-prone and exhausting',
  'No explainable AI — just black box predictions',
]

export function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 md:py-32 relative">
      <div className="page-container">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={stagger} className="max-w-3xl">
          <motion.span variants={fadeUp} className="section-title text-scarlet-400">The Problem</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">Financial data is broken</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed mb-12">
            SMEs, accountants, and financial professionals are drowning in disconnected data, manual processes, and compliance burdens.
          </motion.p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem, i) => (
            <motion.div
              key={problem}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="glass-card flex items-start gap-3"
            >
              <div className="w-1.5 h-1.5 bg-error rounded-full mt-2 shrink-0 shadow-lg shadow-error/30" />
              <p className="text-sm text-white/70 font-mono leading-relaxed">{problem}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
