'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const stack = [
  { category: 'Backend', items: ['Rust', 'Axum Web Framework', 'Tokio Async Runtime', 'SQLx ORM', 'PostgreSQL', 'Redis', 'NATS Messaging'] },
  { category: 'Intelligence', items: ['DRRT Tensor Engine', 'Recursive Convergence', 'Signed Graph Theory', 'ML Forecasting', 'SHAP/LIME Explainability', 'Pattern Detection'] },
  { category: 'Frontend', items: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'GSAP'] },
  { category: 'Infrastructure', items: ['Kubernetes', 'Docker', 'Helm', 'Terraform', 'Azure (South Africa North)', 'Cloudflare'] },
  { category: 'Security', items: ['HashiCorp Vault', 'Falco Runtime Security', 'OPA Policy Engine', 'Kyverno', 'Cosign Container Signing', 'Trivy Scanning'] },
  { category: 'Compliance', items: ['POPIA Framework', 'GDPR Controls', 'CCPA Readiness', 'SARS Compliance Engine', 'Audit Logging', 'Data Subject Rights'] },
  { category: 'Banking', items: ['Investec Programmable Banking', 'OAuth2', 'OpenAPI 3.0', 'Webhook Processing', 'Multi-Bank Abstraction'] },
  { category: 'Monitoring', items: ['Prometheus', 'Grafana', 'OpenTelemetry', 'Structured JSON Logging', 'Health Checks', 'SLA Tracking'] },
]

export default function TechnologyPage() {
  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Technology</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Built on a modern <span className="gradient-text">technology stack</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
              We chose every component of our stack for performance, security, and reliability. 
              From Rust for backend safety to DRRT for financial intelligence, every layer is engineered for scale.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {stack.map((group, i) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card"
              >
                <h3 className="text-sm font-semibold mb-4 text-scarlet-400">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="pill pill-ghost text-xs">{item}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-carbon-950 via-scarlet-600/3 to-carbon-950" />
        <div className="page-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Architecture Overview</h2>
            <div className="glass-panel p-8">
              <pre className="text-xs font-mono text-white/60 leading-relaxed whitespace-pre-wrap">
{`┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  Financial Health │ DRRT State │ Banking │ Compliance       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                   Backend (Rust/Axum)                        │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │  DRRT   │ │ Investec │ │  SARS    │ │ CashFlow      │   │
│  │ Engine  │ │ Client   │ │ Engine   │ │ Forecasting   │   │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘   │
└───────┼────────────┼────────────┼───────────────┼───────────┘
        │            │            │               │
┌───────▼────────────▼────────────▼───────────────▼───────────┐
│              Data Layer                                      │
│  PostgreSQL │ Redis │ NATS │ HashiCorp Vault                 │
└─────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
