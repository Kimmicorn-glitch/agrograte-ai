'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, Activity, TrendingUp, Shield, Banknote, Search, Heart, Building2 } from 'lucide-react'
import { FEATURES_LIST } from '@/lib/constants'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain size={20} />, Activity: <Activity size={20} />, TrendingUp: <TrendingUp size={20} />,
  Shield: <Shield size={20} />, Banknote: <Banknote size={20} />, Search: <Search size={20} />,
  Heart: <Heart size={20} />, Building2: <Building2 size={20} />,
}

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 md:py-32">
      <div className="page-container">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
          <motion.span variants={fadeUp} className="section-title text-scarlet-400">Features</motion.span>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mb-6">Everything you need to master your finances</motion.h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES_LIST.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card group cursor-default"
            >
              <div className="w-10 h-10 glass flex items-center justify-center mb-4 text-scarlet-400 group-hover:bg-scarlet-600/10 transition-all">
                {iconMap[feature.icon] || <Brain size={20} />}
              </div>
              <h3 className="text-sm font-semibold mb-2">{feature.title}</h3>
              <p className="text-xs text-white/50 font-mono leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
