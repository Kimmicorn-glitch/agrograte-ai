'use client'

import { motion } from 'framer-motion'
import { Check, FileText, Shield, RefreshCw, Users, Database, Clock, AlertTriangle } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const regulations = [
  { icon: Shield, name: 'POPIA', description: 'Protection of Personal Information Act', items: ['Data subject access requests', 'Consent management and withdrawal', 'Purpose limitation and data minimization', 'Breach notification within 72 hours', 'Data Protection Officer (DPO) support', 'Cross-border data transfer safeguards'] },
  { icon: FileText, name: 'GDPR', description: 'General Data Protection Regulation', items: ['Right to erasure (right to be forgotten)', 'Data portability in machine-readable format', 'Privacy Impact Assessments (PIA)', 'Data Processing Agreements (DPA)', 'Lawful basis for processing', 'International data transfer mechanisms'] },
  { icon: Users, name: 'CCPA', description: 'California Consumer Privacy Act', items: ['Right to know what data is collected', 'Right to delete personal information', 'Right to opt-out of data sales', 'Non-discrimination for exercising rights', 'Category-level data disclosure', 'Annual compliance certification'] },
  { icon: Database, name: 'SARS', description: 'South African Revenue Service', items: ['VAT 201 return preparation and filing', 'Income tax calculation and withholding', 'Tax reserve management and allocation', '5-year record retention compliance', 'Audit trail for all tax-related data', 'Real-time compliance status monitoring'] },
  { icon: RefreshCw, name: 'Data Governance', description: 'Internal data management', items: ['Automated data classification and tagging', 'Retention policy enforcement', 'Secure data deletion with verification', 'Data quality monitoring and remediation', 'Access certification and review cycles', 'Data inventory and mapping'] },
  { icon: Clock, name: 'Reporting', description: 'Compliance automation', items: ['Automated compliance report generation', 'Real-time compliance dashboard', 'Quarterly compliance review reports', 'Audit-ready evidence collection', 'Regulatory change monitoring', 'Compliance metric trending'] },
]

export default function CompliancePage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Compliance</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Compliance <span className="gradient-text">automated</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
              Regulatory compliance is built into the fabric of the platform — not bolted on. 
              From POPIA to SARS, every requirement is automated, monitored, and reported.
            </motion.p>
          </motion.div>

          <div className="space-y-6">
            {regulations.map((reg, i) => (
              <motion.div
                key={reg.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <reg.icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{reg.name}</h2>
                    <p className="text-xs text-white/40 font-mono">{reg.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {reg.items.map((item) => (
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Compliance by Design</h2>
            <div className="glass-panel p-8 text-left">
              <p className="text-sm text-white/60 font-mono leading-relaxed mb-4">
                Compliance is not about checking boxes after the fact. It is a continuous process 
                embedded in every layer of the platform:
              </p>
              <ul className="space-y-3">
                {[
                  'DRRT coherence scores validate compliance data integrity',
                  'Every data mutation is logged with actor, timestamp, and context',
                  'Data classification happens automatically on ingestion',
                  'Retention policies execute on schedule with verification',
                  'Compliance status is real-time and always accessible',
                  'Regulatory changes trigger automated review workflows',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-white/50 font-mono">
                    <span className="w-1.5 h-1.5 bg-scarlet-600 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
