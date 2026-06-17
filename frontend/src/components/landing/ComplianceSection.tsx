'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const groups = [
  { label: 'SARS', items: ['VAT 201 returns', 'Income Tax calculations', 'Tax reserve management', 'Audit trail generation'] },
  { label: 'POPIA', items: ['Data subject rights', 'Consent management', 'Data retention policies', 'Breach notification'] },
  { label: 'Global', items: ['GDPR readiness', 'CCPA compliance', 'PCI-DSS scope reduction', 'SOC2 controls'] },
]

export function ComplianceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 md:py-32">
      <div className="page-container">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
          <motion.span variants={fadeUp} className="section-title text-scarlet-400">Compliance</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">Built for South African regulations</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">SARS compliance, POPIA data protection, and international regulatory standards are built into the fabric of the platform.</motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {groups.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-panel p-6"
            >
              <h3 className="text-lg font-semibold mb-4">{group.label}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-white/60 font-mono">
                    <Check size={12} className="text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
