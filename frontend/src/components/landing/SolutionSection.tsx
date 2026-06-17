'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const steps = [
  { number: '01', title: 'Connect', description: 'Link your bank accounts via Investec Programmable Banking or our secure API layer.' },
  { number: '02', title: 'Analyze', description: 'DRRT recursively converges all financial dimensions into a coherent intelligence state.' },
  { number: '03', title: 'Act', description: 'Get real-time insights, forecasts, compliance reports, and automated financial controls.' },
]

export function SolutionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-carbon-950 via-scarlet-600/3 to-carbon-950" />
      <div className="page-container relative z-10">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={stagger} className="max-w-3xl mb-16">
          <motion.span variants={fadeUp} className="section-title text-scarlet-400">The Solution</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">An intelligence layer for your finances</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
            Agrograte AI connects to your bank accounts, applies the DRRT intelligence engine, and transforms raw transaction data into actionable financial intelligence.
          </motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="glass-panel p-8"
            >
              <span className="text-4xl font-bold text-white/10 font-mono block mb-4">{step.number}</span>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-white/50 font-mono leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
