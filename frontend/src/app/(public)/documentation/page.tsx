'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Book, Terminal, FileText, Cpu, Shield, Zap, ArrowRight } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const sections = [
  { icon: Book, title: 'Getting Started', desc: 'Learn how to set up your account, connect your bank, and view your first financial intelligence dashboard.', items: ['Quick start guide', 'Account setup', 'Bank connection', 'First dashboard view'] },
  { icon: Cpu, title: 'DRRT Engine', desc: 'Understand the DRRT tensor engine, coherence scoring, convergence, and interpretation of results.', items: ['Tensor basics', 'Dimension reference', 'Coherence scores', 'Convergence tuning'] },
  { icon: Shield, title: 'Compliance', desc: 'Documentation for SARS compliance, VAT automation, tax reserve management, and regulatory reporting.', items: ['SARS setup', 'VAT automation', 'Tax reserves', 'Compliance reports'] },
  { icon: Terminal, title: 'API Reference', desc: 'Full API documentation for the Agrograte REST API, webhooks, and programmable banking rules.', items: ['Authentication', 'Endpoints', 'Webhooks', 'Rate limits'] },
  { icon: Zap, title: 'Programmable Rules', desc: 'Create and manage programmable banking rules for automated financial workflows.', items: ['Rule types', 'Conditions', 'Actions', 'Approval workflows'] },
  { icon: FileText, title: 'Tutorials', desc: 'Step-by-step tutorials for common workflows and advanced features.', items: ['Cash flow forecasting', 'Compliance automation', 'Custom reports', 'Multi-account management'] },
]

export default function DocumentationPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Documentation</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Everything you need to
              <br />
              <span className="gradient-text">get started</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
              Comprehensive guides, API references, tutorials, and documentation for the 
              Agrograte AI platform.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card group"
              >
                <div className="w-10 h-10 glass flex items-center justify-center mb-4 text-scarlet-400">
                  <section.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold mb-2">{section.title}</h3>
                <p className="text-xs text-white/50 font-mono leading-relaxed mb-4">{section.desc}</p>
                <ul className="space-y-1 mb-4">
                  {section.items.map((item) => (
                    <li key={item} className="text-xs text-white/40 font-mono flex items-center gap-2">
                      <span className="w-1 h-1 bg-scarlet-600 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <span className="text-xs text-scarlet-400 font-mono group-hover:underline inline-flex items-center gap-1">
                  Browse docs <ArrowRight size={10} />
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 glass-card p-6 text-center">
            <p className="text-sm text-white/60 font-mono mb-4">
              Documentation is being expanded. Have a specific question?
            </p>
            <Link href="/contact" className="btn-ghost text-sm">
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
