'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { PRICING_TIERS } from '@/lib/constants'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }

export default function PricingPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-3xl mx-auto mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Pricing</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Simple, transparent <span className="gradient-text">pricing</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base">
              No hidden fees. No surprise charges. Cancel anytime. All plans include a 14-day free trial.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`glass-panel p-8 flex flex-col ${tier.highlighted ? 'gradient-border glow-scarlet' : ''}`}
              >
                {tier.highlighted && <span className="pill pill-scarlet text-xs self-start mb-4">Most Popular</span>}
                <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
                <p className="text-xs text-white/50 font-mono mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">R{tier.price}</span>
                  <span className="text-sm text-white/40 font-mono ml-1">/{tier.interval}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-white/70 font-mono">
                      <Check size={12} className="text-success shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`text-center text-sm py-3 ${tier.highlighted ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-xs text-white/30 font-mono mb-6">
              All prices in South African Rand (ZAR). VAT may apply.
            </p>
            <div className="glass-card p-6 max-w-2xl mx-auto">
              <h4 className="text-sm font-semibold mb-2">Need something different?</h4>
              <p className="text-xs text-white/50 font-mono mb-4">
                We offer custom plans for family offices, consultancies, and enterprise organizations 
                requiring dedicated infrastructure, custom integrations, or SLA guarantees.
              </p>
              <Link href="/contact" className="btn-ghost text-sm">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-carbon-950 via-scarlet-600/3 to-carbon-950" />
        <div className="page-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Start your <span className="gradient-text">14-day free trial</span>
            </h2>
            <p className="text-white/40 font-mono text-sm mb-8 max-w-xl mx-auto">
              No credit card required. Full access to all Professional features. Cancel anytime.
            </p>
            <Link href="/contact" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
