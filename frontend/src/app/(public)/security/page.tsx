'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Key, Eye, Activity, FileText, AlertTriangle, Network, Server, Check } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const sections = [
  { icon: Shield, title: 'Security Architecture', items: ['Zero Trust Architecture — never trust, always verify', 'Defense in depth across all layers', 'Principle of least privilege enforced', 'Immutable infrastructure with signed containers', 'Network segmentation and micro-perimeters', 'All access logged and audited'] },
  { icon: Lock, title: 'Encryption', items: ['AES-256 encryption at rest for all data', 'TLS 1.3 for all data in transit', 'End-to-end encryption for sensitive fields', 'Encrypted backups with separate key management', 'Hardware Security Module (HSM) support', 'Automated key rotation via HashiCorp Vault'] },
  { icon: Key, title: 'Authentication', items: ['OAuth2 with PKCE for public clients', 'JWT with RS256 signing and short expiry (15min)', 'Refresh token rotation with revocation', 'Argon2 password hashing', 'Multi-factor authentication (TOTP)', 'Session management with Redis backend'] },
  { icon: Eye, title: 'Audit Logging', items: ['Every DRRT mutation logged with actor, timestamp, before/after', 'Immutable audit trail for compliance reporting', 'Real-time log aggregation and alerting', 'Tamper-evident log storage', 'Retention policies per data classification', 'Quarterly log review process'] },
  { icon: Activity, title: 'Monitoring', items: ['24/7 system monitoring with Prometheus/Grafana', 'Real-time anomaly detection for security events', 'Distributed tracing with OpenTelemetry', 'Automated incident response workflows', 'Weekly vulnerability scanning', 'Monthly penetration testing'] },
  { icon: FileText, title: 'Compliance Strategy', items: ['POPIA compliance — data subject rights, consent, breach notification', 'GDPR readiness — data portability, right to erasure', 'CCPA compliance — opt-out, deletion, disclosure', 'SARS requirements — 5-year record retention', 'SOC2 controls — security, availability, confidentiality', 'Quarterly compliance audits'] },
  { icon: AlertTriangle, title: 'Incident Response', items: ['Structured IR plan aligned with NIST framework', 'Severity-based escalation matrix (P1-P5)', '< 15min initial response for critical incidents', 'Forensic data collection and preservation', 'Customer notification within 24 hours', 'Post-incident reviews with corrective actions'] },
  { icon: Network, title: 'Supply Chain Security', items: ['Signed and verified container images (Cosign)', 'SBOM generation for all dependencies', 'Dependency scanning (cargo audit, trivy, npm audit)', 'Vulnerability disclosure program', 'Vendor security assessments', 'License compliance audits'] },
  { icon: Server, title: 'Zero Trust Architecture', items: ['All requests authenticated and authorized', 'Micro-segmentation with Kubernetes network policies', 'Continuous verification — no implicit trust', 'Data plane and control plane separation', 'Runtime security with Falco behavioral monitoring', 'Policy enforcement with OPA and Kyverno'] },
]

export default function SecurityPage() {
  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Security</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Bank-grade security
              <br />
              <span className="gradient-text">by design</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
              Security is not a feature — it is the foundation. Every layer of Agrograte AI is built 
              with the same security standards we would demand for our own financial data.
            </motion.p>
          </motion.div>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <section.icon size={20} />
                  </div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {section.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/60 font-mono">
                      <Check size={12} className="text-success shrink-0" />
                      {item}
                    </div>
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
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Security Scorecard</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Encryption at Rest', score: 'AES-256' },
                { label: 'Encryption in Transit', score: 'TLS 1.3' },
                { label: 'Auth Security', score: 'OAuth2 + MFA' },
                { label: 'Container Security', score: 'Signed + Scanned' },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4">
                  <div className="text-lg font-bold text-success font-mono">{item.score}</div>
                  <div className="text-xs text-white/40 font-mono mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
