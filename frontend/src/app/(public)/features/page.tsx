'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, Brain, Activity, TrendingUp, Shield, Banknote, Search, Heart, Building2, Zap, Lock, GitBranch, BarChart3, FileText, Clock, Bell, Users } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }

const features = [
  { icon: Brain, title: 'DRRT Intelligence Engine', desc: 'Proprietary Dynamic Recursive Relational Tensor technology that models your entire financial ecosystem as a coherent intelligence graph.' },
  { icon: Activity, title: 'Real-Time Transaction Analysis', desc: 'Every transaction is analyzed through the DRRT tensor for instant classification, anomaly detection, and risk assessment.' },
  { icon: TrendingUp, title: 'AI-Powered Forecasting', desc: 'ML models trained on your data provide accurate cash flow forecasts, revenue predictions, and multi-scenario analysis.' },
  { icon: Shield, title: 'Compliance Automation', desc: 'Automated SARS compliance checks, VAT calculations, tax reserve management, and regulatory reporting.' },
  { icon: Banknote, title: 'Investec Integration', desc: 'Deep Programmable Banking integration for automated rules, intelligent transfers, and real-time financial control.' },
  { icon: Search, title: 'Explainable Reasoning', desc: 'Every insight includes a clear explanation of how it was derived, building trust and enabling informed decisions.' },
  { icon: Heart, title: 'Financial Health Scoring', desc: 'DRRT-validated financial health score tracking liquidity, risk exposure, compliance status, and wellness.' },
  { icon: Building2, title: 'Multi-Tenant Architecture', desc: 'Enterprise-grade isolation with RBAC, ABAC, and complete data separation per business entity.' },
  { icon: Zap, title: 'Programmable Banking Rules', desc: 'Create automated financial rules that trigger on transactions, balances, deadlines, and compliance events.' },
  { icon: Lock, title: 'Bank-Grade Security', desc: 'AES-256 encryption, TLS 1.3, Zero Trust architecture, Vault secrets management, and comprehensive audit logging.' },
  { icon: GitBranch, title: 'Multi-Bank Abstraction', desc: 'Single integration layer that works across multiple banking providers with a unified data model.' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Interactive dashboards, custom reports, and real-time visualizations of your financial intelligence.' },
  { icon: FileText, title: 'Automated Reporting', desc: 'Generate SARS-compliant financial statements, VAT returns, and management reports with one click.' },
  { icon: Clock, title: 'Real-Time Sync', desc: 'Continuous synchronization with your bank accounts ensures you always have up-to-the-minute financial data.' },
  { icon: Bell, title: 'Intelligent Alerts', desc: 'Proactive notifications for anomalies, compliance deadlines, cash flow risks, and optimization opportunities.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Role-based access for your team, accountants, and advisors with granular permission controls.' },
]

export default function FeaturesPage() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Features</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Everything you need for
              <br />
              <span className="gradient-text">financial intelligence</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
              From transaction ingestion to compliance automation, Agrograte AI provides a complete 
              financial intelligence operating system for modern businesses.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section ref={ref} className="pb-24">
        <div className="page-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.05 + i * 0.03 }}
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
        <div className="page-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to experience the <span className="gradient-text">difference</span>?
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
