'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { PRICING_TIERS } from '@/lib/constants'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 md:py-32">
      <div className="page-container">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="text-center max-w-3xl mx-auto mb-16">
          <motion.span variants={fadeUp} className="section-title text-scarlet-400">Pricing</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm">No hidden fees. No surprise charges. Cancel anytime.</motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`glass-panel p-8 flex flex-col ${tier.highlighted ? 'gradient-border glow-scarlet' : ''}`}
            >
              {tier.highlighted && <span className="pill pill-scarlet text-xs self-start mb-4">Most Popular</span>}
              <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
              <p className="text-xs text-white/50 font-mono mb-6">{tier.description}</p>
              <div className="mb-6"><span className="text-4xl font-bold">R{tier.price}</span><span className="text-sm text-white/40 font-mono ml-1">/{tier.interval}</span></div>
              <ul className="space-y-3 mb-8 flex-1">{tier.features.map((f) => <li key={f} className="flex items-center gap-2 text-xs text-white/70 font-mono"><Check size={12} className="text-success shrink-0" />{f}</li>)}</ul>
              <Link href="/contact" className={`text-center text-sm py-3 ${tier.highlighted ? 'btn-primary' : 'btn-ghost'}`}>{tier.cta}</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
