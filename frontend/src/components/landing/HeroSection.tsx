'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { MISSION } from '@/lib/constants'

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-scarlet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-scarlet-600/5 via-transparent to-white/5 blur-[100px]" />
      </div>
      <div className="page-container relative z-10">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} className="mb-6">
            <span className="pill pill-scarlet text-xs">
              <span className="w-1.5 h-1.5 bg-scarlet-600 rounded-full mr-2 inline-block animate-breathe" />
              Now in Private Beta
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-white">From </span>
            <span className="gradient-text">Transactions</span>
            <br />
            <span className="text-white">to </span>
            <span className="gradient-text">Intelligence</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/50 font-mono max-w-2xl mx-auto mb-12 leading-relaxed">{MISSION}</motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              Get Early Access <ArrowRight size={16} />
            </Link>
            <Link href="/how-it-works" className="btn-ghost text-base px-8 py-3">See How It Works</Link>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-16 flex items-center justify-center gap-8 text-xs text-white/30 font-mono">
            <span>Powered by DRRT</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Investec Integrated</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>SARS Compliant</span>
          </motion.div>
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"><ChevronDown size={20} className="text-white/30" /></div>
    </section>
  )
}
