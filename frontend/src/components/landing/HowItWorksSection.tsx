'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const steps = [
  { label: 'Connect Account', desc: 'Link your bank via Investec Programmable Banking' },
  { label: 'Import Transactions', desc: 'Real-time transaction streaming and ingestion' },
  { label: 'DRRT Analysis', desc: 'Recursive tensor convergence across all financial dimensions' },
  { label: 'Classification', desc: 'AI-powered transaction classification and enrichment' },
  { label: 'Financial Intelligence', desc: 'Health scores, forecasts, and actionable insights' },
  { label: 'Compliance', desc: 'Automated SARS compliance and regulatory reporting' },
  { label: 'Reports', desc: 'Generate financial statements with DRRT audit trail' },
  { label: 'Automation', desc: 'Programmable rules for intelligent financial control' },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 md:py-32">
      <div className="page-container">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
          <motion.span variants={fadeUp} className="section-title text-scarlet-400">How It Works</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">Intelligence in eight steps</motion.h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-scarlet-600 via-glass-border to-transparent" />
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="relative pl-12 md:pl-16 pb-12 last:pb-0"
              >
                <div className={`absolute left-2 md:left-6 top-0 w-4 h-4 rounded-full border-2 ${
                  i < steps.length - 1 ? 'bg-scarlet-600 border-scarlet-600 shadow-lg shadow-scarlet-600/30' : 'bg-transparent border-scarlet-600'
                }`} />
                <div className="glass-card p-5">
                  <span className="text-xs font-mono text-scarlet-400 mb-1 block">Step {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-semibold mb-1">{step.label}</h3>
                  <p className="text-xs text-white/50 font-mono">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
