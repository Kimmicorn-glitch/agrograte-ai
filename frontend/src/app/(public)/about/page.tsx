'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Target, Eye, Cpu, GitBranch, Shield, TrendingUp, Building2, Database, Network } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

export default function AboutPage() {
  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">About</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Bridging the gap between
              <br />
              <span className="gradient-text">data and decisions</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm text-white/50 font-mono leading-relaxed max-w-2xl">
              South African businesses run on banking data but make decisions on instinct. 
              We built Agrograte AI to close that gap — transforming raw transactions into 
              actionable financial intelligence.
            </motion.p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8 mb-16">
            <Building2 size={24} className="text-scarlet-400 mb-4" />
            <h2 className="text-xl font-bold mb-3">What We Do</h2>
            <p className="text-sm text-white/60 font-mono leading-relaxed mb-4">
              Agrograte AI is a financial intelligence platform purpose-built for the South African market. 
              We connect directly to Investec Programmable Banking to stream real-time transaction data, 
              then apply our proprietary DRRT engine — Dynamic Recursive Relational Tensor — to analyse, 
              forecast, and explain financial patterns that traditional tools miss.
            </p>
            <p className="text-sm text-white/60 font-mono leading-relaxed">
              From automated cash flow forecasting and anomaly detection to compliance-ready reporting 
              and what-if scenario modelling, we give finance teams the clarity they need without 
              requiring a data science degree.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel p-8 mb-16">
            <Database size={24} className="text-scarlet-400 mb-4" />
            <h2 className="text-xl font-bold mb-3">Why We Built It</h2>
            <p className="text-sm text-white/60 font-mono leading-relaxed mb-4">
              Every business generates thousands of transactions. Bank feeds, payment gateways, 
              accounting exports — data pours in from every direction. Yet the tools to make sense 
              of it have not evolved. Spreadsheets are brittle. Accounting packages look backward. 
              Dashboards show pretty charts but no actionable insight.
            </p>
            <p className="text-sm text-white/60 font-mono leading-relaxed mb-4">
              In South Africa, the problem is amplified. With multiple banks, complex compliance 
              requirements from SARS and IFRS, and few affordable AI-driven solutions, SMEs and 
              mid-market businesses are left managing finances reactively rather than strategically.
            </p>
            <p className="text-sm text-white/60 font-mono leading-relaxed">
              Agrograte AI was born from a simple belief: the gap between raw banking data and 
              intelligent financial decision-making should not exist. By combining Investec 
              Programmable Banking's real-time API access with our DRRT reasoning engine, 
              we make financial intelligence continuous, explainable, and accessible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8">
              <Target size={24} className="text-scarlet-400 mb-4" />
              <h2 className="text-xl font-bold mb-3">Our Mission</h2>
              <p className="text-sm text-white/60 font-mono leading-relaxed">
                Transform banking data into financial intelligence using Investec Programmable Banking, 
                DRRT, AI forecasting, compliance automation, and explainable reasoning. We believe every 
                business — from a 10-person consultancy to a 500-person enterprise — deserves the same 
                quality of financial intelligence historically reserved for organisations with dedicated 
                finance teams and expensive ERP systems.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-8">
              <Eye size={24} className="text-scarlet-400 mb-4" />
              <h2 className="text-xl font-bold mb-3">Our Vision</h2>
              <p className="text-sm text-white/60 font-mono leading-relaxed">
                A world where financial intelligence is as continuous and accessible as banking itself. 
                Where every transaction is understood in context, every cash flow risk is anticipated 
                before it materialises, every compliance requirement is automated in real-time, and 
                every financial decision — big or small — is backed by explainable AI reasoning.
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-8 mb-16">
            <h2 className="text-lg font-bold mb-4">Our Technology Stack</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Cpu, label: 'DRRT Engine', items: ['Rust Implementation', 'Recursive Convergence', 'N-Dimensional Tensors', 'Coherence Scoring'] },
                { icon: Network, label: 'Investec Connect', items: ['OAuth2 Integration', 'Real-time Transaction Streaming', 'Programmable Banking API', 'Webhook Event Processing'] },
                { icon: GitBranch, label: 'Architecture', items: ['Axum Framework', 'Microservices', 'Event-Driven Design', 'PostgreSQL + Redis'] },
                { icon: TrendingUp, label: 'Intelligence', items: ['ML Forecasting', 'Explainable AI', 'Anomaly Detection', 'Pattern Recognition'] },
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
            <h2 className="text-lg font-bold mb-2">DRRT Intelligence</h2>
            <p className="text-xs text-white/50 font-mono leading-relaxed mb-4">
              The Dynamic Recursive Relational Tensor is not a classifier or a simple scoring model. 
              It is a recursive relational framework that evaluates coherence across all financial 
              dimensions simultaneously. Every entity — transactions, accounts, customers, suppliers, 
              invoices, compliance requirements — maps to tensor dimensions with weighted, signed 
              relationships that converge toward stable states of financial truth.
            </p>
            <p className="text-xs text-white/50 font-mono leading-relaxed">
              Unlike traditional ML models that require months of training data, DRRT reasons about 
              financial health from day one. It detects anomalies in real-time, surfaces hidden 
              correlations between spending patterns and revenue cycles, and provides explainable 
              outputs — every insight includes the chain of reasoning that produced it, so you can 
              trust what the system recommends and understand why.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card p-8 mb-16">
            <h2 className="text-lg font-bold mb-2">Investec Integration</h2>
            <p className="text-xs text-white/50 font-mono leading-relaxed mb-4">
              Agrograte AI is purpose-built on Investec Programmable Banking, South Africa's most 
              innovative banking API platform. Through a secure OAuth2 integration, we stream 
              real-time account data, transaction history, and balance information — no manual 
              exports, no CSV uploads, no stale data.
            </p>
            <p className="text-xs text-white/50 font-mono leading-relaxed">
              This connection unlocks capabilities that traditional accounting tools cannot match: 
              programmable banking rules that trigger automated actions based on transaction patterns, 
              webhook-driven event processing that responds to account activity in milliseconds, and 
              intelligent cash flow automation that adapts as your business evolves. Because we sit 
              directly on the banking API, every insight in Agrograte AI is built from live data — 
              not yesterday's snapshot.
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
