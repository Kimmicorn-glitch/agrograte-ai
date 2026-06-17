'use client'

import { motion } from 'framer-motion'
import { Banknote, Shield, Zap, Code, RefreshCw, Lock, GitBranch, Webhook } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const features = [
  { icon: Banknote, title: 'Account Aggregation', desc: 'Connect all your Investec accounts — Cheque, Savings, Business, and Programmable — in a single unified view with real-time balance synchronization.' },
  { icon: Shield, title: 'Secure OAuth2 Authentication', desc: 'Industry-standard OAuth2 client credentials flow ensures your banking credentials are never shared with or stored by Agrograte AI.' },
  { icon: Zap, title: 'Programmable Banking Rules', desc: 'Create intelligent rules that trigger on transaction events, balance thresholds, compliance deadlines, and DRRT state changes.' },
  { icon: Webhook, title: 'Real-Time Webhook Events', desc: 'Subscribe to real-time webhook notifications for new transactions, balance changes, and account events with automatic retry and deduplication.' },
  { icon: RefreshCw, title: 'Automatic Sync', desc: 'Continuous background synchronization keeps your financial data current without manual intervention. Historical data import supported.' },
  { icon: Code, title: 'OpenAPI Based Integration', desc: 'Built on the official Investec Programmable Banking OpenAPI 3.0 specification with full type safety and comprehensive error handling.' },
  { icon: Lock, title: 'Token Management', desc: 'Secure token storage with automatic refresh rotation. Tokens are encrypted at rest in HashiCorp Vault and never exposed to application code.' },
  { icon: GitBranch, title: 'Multi-Bank Ready', desc: 'Although Investec is our primary integration, the banking abstraction layer is designed to support additional South African banks.' },
]

export default function InvestecIntegrationPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Investec Integration</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Powered by Investec
              <br />
              <span className="gradient-text">Programmable Banking</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed mb-8">
              Agrograte AI is built on Investec Programmable Banking — South Africa&apos;s most 
              innovative banking platform. Our deep integration unlocks capabilities that 
              traditional financial tools cannot match.
            </motion.p>
            <motion.p variants={fadeUp} className="text-white/30 font-mono text-xs leading-relaxed">
              From real-time transaction streaming to programmable rules that execute automatically, 
              the Investec partnership enables a level of financial intelligence and control that 
              was previously only available to the largest financial institutions.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card group"
              >
                <div className="w-10 h-10 glass flex items-center justify-center mb-4 text-scarlet-400 group-hover:bg-scarlet-600/10 transition-all">
                  <feature.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs text-white/50 font-mono leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-carbon-950 via-scarlet-600/3 to-carbon-950" />
        <div className="page-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Integration Architecture</h2>
            <div className="glass-panel p-8 text-left">
              <pre className="text-xs font-mono text-white/60 leading-relaxed whitespace-pre-wrap">
{`Agrograte AI                    Investec
     │                              │
     │  1. OAuth2 Client Creds      │
     │ ──────────────────────────►  │
     │  ◄───────────────────────    │
     │       Access + Refresh Token │
     │                              │
     │  2. GET /accounts            │
     │ ──────────────────────────►  │
     │  ◄───────────────────────    │
     │       Account List           │
     │                              │
     │  3. GET /transactions        │
     │ ──────────────────────────►  │
     │  ◄───────────────────────    │
     │       Transaction Data       │
     │                              │
     │  4. Webhook Registration     │
     │ ──────────────────────────►  │
     │  ◄───────────────────────    │
     │       Webhook Events         │
     │       (real-time)            │
     │                              │
     │  5. Token Refresh            │
     │ ──────────────────────────►  │
     │  ◄───────────────────────    │
     │       New Access Token       │`}
              </pre>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
