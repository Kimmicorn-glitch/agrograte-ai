'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Target, Eye, Cpu, GitBranch, Shield, TrendingUp } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">About</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Why we built
              <br />
              <span className="gradient-text">Agrograte AI</span>
            </motion.h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8">
              <Target size={24} className="text-scarlet-400 mb-4" />
              <h2 className="text-xl font-bold mb-3">Our Mission</h2>
              <p className="text-sm text-white/60 font-mono leading-relaxed">
                Transform banking data into financial intelligence using Investec Programmable Banking, 
                DRRT, AI forecasting, compliance automation, and explainable reasoning. We believe every 
                business deserves the same quality of financial intelligence that was historically reserved 
                for large enterprises with dedicated finance teams.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-8">
              <Eye size={24} className="text-scarlet-400 mb-4" />
              <h2 className="text-xl font-bold mb-3">Our Vision</h2>
              <p className="text-sm text-white/60 font-mono leading-relaxed">
                A world where financial intelligence is as accessible as banking itself. Where every 
                transaction is understood, every risk is anticipated, every compliance requirement 
                is automated, and every financial decision is backed by explainable AI.
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-8 mb-16">
            <h2 className="text-lg font-bold mb-4">Our Technology Stack</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Cpu, label: 'DRRT Engine', items: ['Rust', 'Recursive Convergence', 'Tensor Mathematics'] },
                { icon: Shield, label: 'Security', items: ['Zero Trust', 'AES-256', 'HashiCorp Vault'] },
                { icon: GitBranch, label: 'Architecture', items: ['Axum Framework', 'Microservices', 'Event-Driven'] },
                { icon: TrendingUp, label: 'Intelligence', items: ['ML Forecasting', 'Explainable AI', 'Pattern Detection'] },
              ].map((group) => (
                <div key={group.label}>
                  <div className="w-8 h-8 glass flex items-center justify-center mb-2 text-scarlet-400">
                    <group.icon size={16} />
                  </div>
                  <h3 className="text-xs font-semibold mb-2">{group.label}</h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item} className="text-xs text-white/40 font-mono">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-8 mb-16">
            <h2 className="text-lg font-bold mb-4">Architecture</h2>
            <pre className="text-xs font-mono text-white/50 leading-relaxed whitespace-pre-wrap">
{`┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │    Backend    │    │  Intelligence│
│   Next.js    │◄──►│   Rust/Axum  │◄──►│   DRRT       │
│   Dashboard  │    │   API Layer  │    │   Engine     │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │Investec  │ │PostgreSQL│ │  Redis   │
       │Client    │ │          │ │  Cache   │
       └──────────┘ └──────────┘ └──────────┘`}
            </pre>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-8 mb-16">
            <h2 className="text-lg font-bold mb-2">DRRT — The Core</h2>
            <p className="text-xs text-white/50 font-mono leading-relaxed mb-4">
              The Dynamic Recursive Relational Tensor is not a classifier or a simple scoring model. 
              It is a recursive relational framework that evaluates coherence across all financial 
              dimensions simultaneously. Every entity — transactions, accounts, customers, suppliers, 
              invoices, compliance requirements — maps to tensor dimensions with weighted, signed 
              relationships that converge toward stable states of financial truth.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card p-8 mb-16">
            <h2 className="text-lg font-bold mb-2">Investec Integration</h2>
            <p className="text-xs text-white/50 font-mono leading-relaxed mb-4">
              Agrograte AI is built on Investec Programmable Banking, providing real-time access to 
              accounts, transactions, and balances through a secure OAuth2 integration. The partnership 
              enables programmable banking rules, webhook-driven event processing, and intelligent 
              financial automation that adapts to your business needs.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-panel p-8">
            <h2 className="text-lg font-bold mb-4">Future Roadmap</h2>
            <div className="space-y-4">
              {[
                { phase: 'Q2 2026', items: ['Public Beta Launch', 'Multi-bank support (Nedbank, Standard Bank)', 'Mobile-responsive dashboard', 'SARS eFiling integration'] },
                { phase: 'Q3 2026', items: ['Accounting software integration (Xero, Sage, CaseWare)', 'API for third-party developers', 'Advanced ML forecasting models', 'Enterprise SSO (SAML/OIDC)'] },
                { phase: 'Q4 2026', items: ['SOC2 certification', 'Multi-region deployment', 'Audit firm partnership program', 'Billing and tier management'] },
              ].map((phase) => (
                <div key={phase.phase}>
                  <h3 className="text-xs font-semibold text-scarlet-400 mb-2">{phase.phase}</h3>
                  <ul className="space-y-1">
                    {phase.items.map((item) => (
                      <li key={item} className="text-xs text-white/50 font-mono flex items-center gap-2">
                        <span className="w-1 h-1 bg-scarlet-600 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
