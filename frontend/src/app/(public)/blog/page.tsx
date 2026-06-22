'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, ArrowRight, Clock } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const posts = [
  { title: 'Programmable Banking 2.0: What Investec\'s API Platform Means for Developers', excerpt: 'Investec Programmable Banking changed how developers interact with bank data. We explore the evolution of card-issuing APIs, programmable rules, and what the roadmap signals for the next wave of fintech builders in South Africa.', date: '2026-01-15', author: 'Engineering Team', readTime: '7 min', category: 'Technology' },
  { title: 'API-Driven Banking: How Open Finance Is Reshaping South Africa', excerpt: 'From SARB directives to market-led innovation, open banking is gaining momentum. We break down the regulatory landscape and how API-first banks like Investec are setting the standard for secure data sharing.', date: '2026-03-10', author: 'Product Team', readTime: '5 min', category: 'Open Banking' },
  { title: 'Automating SARS Compliance for SMEs with Transaction Intelligence', excerpt: 'South African businesses face mounting tax complexity. By layering AI over programmable banking data streams, automated reconciliation and real-time compliance reporting are becoming practical for the first time.', date: '2026-04-22', author: 'Compliance Team', readTime: '6 min', category: 'Compliance' },
  { title: 'Cash Flow Forecasting for SA Businesses Using DRRT', excerpt: 'Accurate cash flow prediction remains the top pain point for SMEs. We show how combining Investec\'s real-time transaction feeds with DRRT coherence scoring produces forecasts that adapt to South Africa\'s unique economic cycles.', date: '2026-06-05', author: 'Data Science Team', readTime: '8 min', category: 'Product' },
  { title: 'The Developer Ecosystem Around Programmable Banking', excerpt: 'A growing community of developers, startups, and agencies are building on Investec\'s programmable platform. We map the ecosystem, highlight emerging use cases, and discuss what it takes to launch a fintech on open banking rails.', date: '2026-08-18', author: 'Agrograte Team', readTime: '6 min', category: 'FinTech' },
  { title: 'Why DRRT and Programmable Banking Are a Natural Fit', excerpt: 'Dynamic Recursive Relational Tensor technology thrives on rich, real-time data. When paired with Investec\'s programmable infrastructure, DRRT uncovers relational patterns that batch-processing models simply cannot see.', date: '2026-10-01', author: 'Engineering Team', readTime: '7 min', category: 'Integration' },
]

export default function BlogPage() {
  return (
    <div className="pt-24 bg-secondary text-white">
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
            <p className="text-xs text-white/30 font-mono">Follow our blog for the latest on programmable banking, financial intelligence, and South African fintech innovation.</p>
            <Link href="/contact" className="inline-flex items-center gap-1 text-xs text-scarlet-400 font-mono hover:underline mt-3">
              Subscribe for updates <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
