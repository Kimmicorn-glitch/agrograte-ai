'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-carbon-950 via-scarlet-600/5 to-carbon-950" />
      <div className="page-container relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-6xl font-bold mb-6">Ready to transform your<br /><span className="gradient-text">financial intelligence</span>?</h2>
          <p className="text-white/40 font-mono text-sm md:text-base mb-10 max-w-xl mx-auto">Join the private beta. Connect your accounts. Get intelligence.</p>
          <Link href="/contact" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">Get Early Access <ArrowRight size={18} /></Link>
        </motion.div>
      </div>
    </section>
  )
}
