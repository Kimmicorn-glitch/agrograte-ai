'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowRight, Clock } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const posts = [
  { title: 'Introducing Agrograte AI: From Transactions to Intelligence', excerpt: 'Why we built a relational financial intelligence platform powered by DRRT and Investec Programmable Banking.', date: '2026-06-01', author: 'Agrograte Team', readTime: '5 min', category: 'Product' },
  { title: 'Understanding DRRT: The Intelligence Engine Behind Agrograte', excerpt: 'A deep dive into the Dynamic Recursive Relational Tensor technology that powers financial coherence scoring.', date: '2026-06-15', author: 'Engineering Team', readTime: '8 min', category: 'Technology' },
  { title: 'SARS Compliance in the Age of AI', excerpt: 'How automated compliance transforms tax management for South African SMEs and accounting professionals.', date: '2026-07-01', author: 'Compliance Team', readTime: '6 min', category: 'Compliance' },
  { title: 'Building with Rust: Why We Chose Performance and Safety', excerpt: 'Our engineering rationale for building the Agrograte backend in Rust with the Axum web framework.', date: '2026-07-15', author: 'Engineering Team', readTime: '7 min', category: 'Technology' },
  { title: 'The Investec Programmable Banking Advantage', excerpt: 'How our deep integration with Investec unlocks financial intelligence capabilities unavailable anywhere else.', date: '2026-08-01', author: 'Product Team', readTime: '4 min', category: 'Integration' },
  { title: 'Financial Health Scoring with DRRT Coherence', excerpt: 'Understanding how the DRRT coherence score translates into a meaningful financial health metric.', date: '2026-08-15', author: 'Data Science Team', readTime: '6 min', category: 'Product' },
]

export default function BlogPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Blog</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Insights from the
              <br />
              <span className="gradient-text">frontier</span>
            </motion.h1>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, i) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-card group cursor-pointer"
              >
                <span className="pill pill-ghost text-[0.6rem] mb-3 inline-block">{post.category}</span>
                <h3 className="text-sm font-semibold mb-2 group-hover:text-scarlet-400 transition-colors">{post.title}</h3>
                <p className="text-xs text-white/50 font-mono leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-[0.6rem] text-white/30 font-mono">
                  <div className="flex items-center gap-2">
                    <Calendar size={10} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    {post.readTime}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-white/30 font-mono">More articles coming soon.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
