'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 md:pt-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-accent/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-accent/[0.015] rounded-full blur-[100px] pointer-events-none" />

      <div className="page-container relative z-10 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="pill pill-accent text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft inline-block" />
              Built for Investec Programmable Banking
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-display-lg md:text-display-xl text-secondary font-bold tracking-tight mb-6 text-balance"
          >
            Turn Banking Data Into{' '}
            <span className="gradient-text">SARS-Ready</span>{' '}
            Intelligence
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-body-lg md:text-heading-sm text-charcoal-500 max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
          >
            Automated tax insights, financial reporting, compliance workflows, and AI-powered
            business intelligence powered by Investec Programmable Banking.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/contact"
              className="btn-primary btn-lg"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link
              href="/demo"
              className="btn-secondary btn-lg"
            >
              <PlayCircle size={18} />
              Book Demo
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-charcoal-400"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              SARS Compliant
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-info" />
              Investec Integrated
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              AI-Powered
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              POPIA Compliant
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
