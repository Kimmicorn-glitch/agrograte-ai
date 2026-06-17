'use client'

import { motion } from 'framer-motion'
import { Brain, Activity, GitBranch, AlertTriangle, TrendingUp, Layers, Target, Eye } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const concepts = [
  { icon: Layers, title: 'Relational Tensor Space', desc: 'A multi-dimensional mathematical space where every financial entity occupies a position. Dimensions include transaction value, account balance, customer trust, supplier reliability, and more.' },
  { icon: GitBranch, title: 'Signed Relational Edges', desc: 'Relationships between dimensions have direction, strength, and sign (positive/negative/neutral). A positive transaction strengthens the account balance relationship while potentially weakening the risk dimension.' },
  { icon: Activity, title: 'Recursive Convergence', desc: 'The tensor iteratively relaxes toward a coherent state. Each iteration propagates activations through edges using a sigmoid function until the system stabilizes or reaches maximum iterations.' },
  { icon: Target, title: 'Coherence Metrics', desc: 'K(T) measures overall tensor coherence. C(T) detects contradictions. The frustration index identifies cyclical inconsistencies. These metrics provide a quantitative view of financial health.' },
  { icon: AlertTriangle, title: 'Collapse Detection', desc: 'The system continuously monitors for tensor collapse — states where relationships become too contradictory or unstable. Early warning alerts enable proactive intervention.' },
  { icon: Eye, title: 'Explainable Reasoning', desc: 'Every DRRT state is fully explainable. You can trace exactly why a particular coherence score was computed, which relationships contributed, and what changed between states.' },
  { icon: Brain, title: 'Pattern Detection', desc: 'The DRRT memory subsystem analyzes historical states to detect patterns like coherence growth trends, contradiction spikes, and frustration cycles.' },
  { icon: TrendingUp, title: 'Predictive Intelligence', desc: 'Tensor state trends feed ML forecasting models, with coherence scores serving as confidence weights for predictions and recommendations.' },
]

export default function DrrtIntelligencePage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-4xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">DRRT Intelligence</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Dynamic Recursive Relational <span className="gradient-text">Tensor</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed mb-8">
              DRRT is the core intelligence engine of Agrograte AI. It models your entire financial ecosystem 
              as a signed relational tensor space that recursively converges toward a coherent state of 
              financial truth.
            </motion.p>
            <motion.p variants={fadeUp} className="text-white/30 font-mono text-xs leading-relaxed">
              Unlike traditional financial analysis tools that treat transactions as isolated events, 
              DRRT understands the complex web of relationships between every financial dimension — 
              and how changes in one dimension ripple through the entire system.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {concepts.map((concept, i) => (
              <motion.div
                key={concept.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card group"
              >
                <div className="w-10 h-10 glass flex items-center justify-center mb-4 text-scarlet-400 group-hover:bg-scarlet-600/10 transition-all">
                  <concept.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold mb-2">{concept.title}</h3>
                <p className="text-xs text-white/50 font-mono leading-relaxed">{concept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-carbon-950 via-scarlet-600/3 to-carbon-950" />
        <div className="page-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">The 12 Dimensions of DRRT</h2>
            <div className="glass-panel p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {['Transaction Value', 'Account Balance', 'Customer Trust', 'Supplier Reliability', 'Invoice Validity', 'Tax Compliance', 'VAT Alignment', 'Cash Flow Liquidity', 'Regulatory Risk', 'Payment Velocity', 'Credit Exposure', 'Audit Trail'].map((dim, i) => (
                  <div key={dim} className="flex items-center gap-3 text-xs font-mono text-white/60">
                    <span className="text-scarlet-400">{String(i + 1).padStart(2, '0')}</span>
                    {dim}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
