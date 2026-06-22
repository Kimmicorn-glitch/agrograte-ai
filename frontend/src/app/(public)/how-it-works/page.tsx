'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ArrowDown, Check, ChevronRight } from 'lucide-react'
import { TAGLINE } from '@/lib/constants'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const journeySteps = [
  { title: 'Connect Account', description: 'Securely link your bank accounts through Investec Programmable Banking or our secure API integration layer. OAuth2 authentication ensures your credentials are never stored.', details: ['OAuth2 authentication', 'No credential storage', 'Multi-bank support', 'Real-time sync', 'Sandbox testing available'] },
  { title: 'Import Transactions', description: 'Transactions stream in real-time via webhook notifications and API polling. Every transaction is normalized, enriched, and prepared for DRRT analysis.', details: ['Real-time webhook streaming', 'Automatic enrichment', 'Duplicate detection', 'Historical import', 'Category inference'] },
  { title: 'DRRT Analysis', description: 'The Dynamic Recursive Relational Tensor engine maps every transaction into a multi-dimensional financial intelligence space. Relationships form between accounts, transactions, customers, suppliers, and compliance requirements.', details: ['Multi-dimensional mapping', 'Relationship inference', 'Anomaly detection', 'Pattern recognition', 'Coherence scoring'] },
  { title: 'Classification', description: 'AI-powered classification categorizes every transaction with explainable reasoning. Machine learning models continuously improve based on your corrections and feedback.', details: ['Explainable AI classification', 'Continuous learning', 'Custom categories', 'Rule-based overrides', 'Confidence scoring'] },
  { title: 'Financial Intelligence', description: 'The system computes comprehensive financial health scores, detects risks, identifies opportunities, and generates actionable intelligence across all connected dimensions.', details: ['Financial health scoring', 'Risk detection', 'Opportunity identification', 'Trend analysis', 'Benchmark comparison'] },
  { title: 'Compliance', description: 'Automated compliance checks against SARS regulations, POPIA requirements, and your internal policies. Every check is logged with full audit trail and DRRT coherence validation.', details: ['SARS compliance checks', 'VAT calculation automation', 'Tax reserve management', 'Audit trail generation', 'Regulatory reporting'] },
  { title: 'Reports', description: 'Generate financial statements, compliance reports, and management dashboards with one click. Every report includes DRRT coherence scores as an auditability metric.', details: ['Automated statements', 'Compliance reports', 'Custom dashboards', 'Export to PDF/CSV', 'DRRT audit trail'] },
  { title: 'Automation', description: 'Programmable banking rules automate financial workflows. Set conditions based on transactions, balances, compliance status, and DRRT state for intelligent financial control.', details: ['Programmable rules engine', 'Condition-based triggers', 'Multi-step workflows', 'Approval chains', 'DRRT-aware automation'] },
]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">How It Works</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              From connection to
              <br />
              <span className="gradient-text">intelligence</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
              Eight steps transform your banking data into actionable financial intelligence. 
              Each step builds on the last, creating a continuous cycle of analysis and insight.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section ref={ref} className="pb-24">
        <div className="page-container">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-1">
                {journeySteps.map((step, i) => (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(i)}
                    className={`w-full text-left px-4 py-3 transition-all font-mono text-xs flex items-center gap-3 ${
                      activeStep === i
                        ? 'glass-active text-white'
                        : 'text-white/40 hover:text-white/70 hover:bg-glass-hover'
                    }`}
                  >
                    <span className={`w-6 h-6 flex items-center justify-center text-xs ${
                      activeStep === i ? 'bg-scarlet-600 text-white' : 'glass text-white/50'
                    }`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step.title}
                    {activeStep === i && <ChevronRight size={14} className="ml-auto text-scarlet-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel p-8 md:p-12"
                >
                  <span className="text-6xl font-bold text-white/5 font-mono block mb-4">
                    {String(activeStep + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{journeySteps[activeStep].title}</h2>
                  <p className="text-sm text-white/60 font-mono leading-relaxed mb-8">
                    {journeySteps[activeStep].description}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {journeySteps[activeStep].details.map((detail) => (
                      <div key={detail} className="flex items-center gap-2 text-xs text-white/50 font-mono">
                        <Check size={12} className="text-success shrink-0" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="btn-ghost text-xs disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={() => setActiveStep(Math.min(journeySteps.length - 1, activeStep + 1))}
                  disabled={activeStep === journeySteps.length - 1}
                  className="btn-primary text-xs disabled:opacity-30"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-carbon-950 via-scarlet-600/3 to-carbon-950" />
        <div className="page-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to start your <span className="gradient-text">journey</span>?
            </h2>
            <Link href="/contact" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
              Get Early Access <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
