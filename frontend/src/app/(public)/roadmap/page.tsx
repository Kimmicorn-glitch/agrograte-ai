'use client'

import { motion } from 'framer-motion'
import { Check, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const phases = [
  {
    label: 'Current',
    period: 'Q2 2026',
    status: 'in-progress',
    items: [
      { title: 'Public Beta Launch', status: 'planned' },
      { title: 'Multi-bank support (Nedbank, Standard Bank)', status: 'planned' },
      { title: 'Mobile-responsive dashboard', status: 'planned' },
      { title: 'SARS eFiling integration', status: 'planned' },
      { title: 'Improved ML classification', status: 'planned' },
      { title: 'Custom report builder', status: 'planned' },
    ],
  },
  {
    label: 'Next',
    period: 'Q3 2026',
    status: 'upcoming',
    items: [
      { title: 'Xero integration', status: 'planned' },
      { title: 'Sage integration', status: 'planned' },
      { title: 'CaseWare integration', status: 'planned' },
      { title: 'Public API for third-party developers', status: 'planned' },
      { title: 'Advanced ML forecasting models', status: 'planned' },
      { title: 'Enterprise SSO (SAML/OIDC)', status: 'planned' },
      { title: 'Multi-currency support', status: 'planned' },
    ],
  },
  {
    label: 'Future',
    period: 'Q4 2026',
    status: 'planned',
    items: [
      { title: 'SOC2 Type II certification', status: 'planned' },
      { title: 'Multi-region deployment', status: 'planned' },
      { title: 'Audit firm partnership program', status: 'planned' },
      { title: 'Billing and tier management', status: 'planned' },
      { title: 'Advanced analytics engine', status: 'planned' },
      { title: 'Mobile app (React Native)', status: 'planned' },
      { title: 'AI-powered advisory services', status: 'planned' },
    ],
  },
  {
    label: 'Vision',
    period: '2027',
    status: 'vision',
    items: [
      { title: 'Open banking ecosystem integration', status: 'planned' },
      { title: 'Pan-African expansion', status: 'planned' },
      { title: 'Banking-as-a-Service platform', status: 'planned' },
      { title: 'Real-time consolidated financial reporting', status: 'planned' },
      { title: 'AI-driven CFO assistant', status: 'planned' },
      { title: 'Decentralized finance (DeFi) bridging', status: 'planned' },
    ],
  },
]

export default function RoadmapPage() {
  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Roadmap</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Our <span className="gradient-text">journey</span> ahead
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
              We believe in transparency. Here is what we have built, what we are building, 
              and where we are headed. Our roadmap is a living document that evolves with 
              customer feedback and market needs.
            </motion.p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-scarlet-600 via-glass-border to-transparent md:-translate-x-px" />

            {phases.map((phase, i) => (
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`relative mb-12 md:mb-16 ${i % 2 === 0 ? 'md:pr-12 md:text-right md:ml-0 md:mr-auto' : 'md:pl-12 md:ml-auto md:mr-0'} md:w-1/2`}
              >
                <div className={`absolute top-0 ${i % 2 === 0 ? 'right-0 md:-right-2' : 'left-0 md:-left-2'} w-4 h-4 rounded-full ${
                  phase.status === 'in-progress' ? 'bg-scarlet-600 shadow-lg shadow-scarlet-600/30' : 'bg-glass border border-glass-border'
                }`} />

                <div className="glass-card p-6 ml-6 md:ml-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono ${
                      phase.status === 'in-progress' ? 'text-scarlet-400' : 'text-white/40'
                    }`}>
                      {phase.period}
                    </span>
                    {phase.status === 'in-progress' && (
                      <span className="pill pill-scarlet text-[0.6rem]">Current</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold mb-3">{phase.label}</h3>
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item.title} className="flex items-center gap-2 text-xs text-white/50 font-mono">
                        <Clock size={10} className="text-white/20 shrink-0" />
                        {item.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
