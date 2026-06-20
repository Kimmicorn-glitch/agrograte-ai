'use client'

import { motion } from 'framer-motion'
import { Banknote, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'

const accounts = [
  { name: 'Investec Business Account', number: '**** 4521', balance: 'R 1,842,530', change: '+2.3%', trend: 'up' as const },
  { name: 'Investec Savings Account', number: '**** 7893', balance: 'R 650,000', change: '+5.1%', trend: 'up' as const },
  { name: 'Investec Forex Account', number: '**** 1122', balance: 'R 355,000', change: '-1.2%', trend: 'down' as const },
]

export default function BankingPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
            <Banknote size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="text-display-sm text-secondary">Banking</h1>
            <p className="text-body-md text-charcoal-500">Connected accounts & transactions</p>
          </div>
        </div>
        <button className="btn-primary btn-sm"><Plus size={14} /> Connect Account</button>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {accounts.map((a) => (
          <div key={a.number} className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="metric-label">{a.name}</span>
              <span className={`flex items-center gap-1 text-xs font-medium ${a.trend === 'up' ? 'text-success' : 'text-error'}`}>
                {a.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {a.change}
              </span>
            </div>
            <p className="metric-value text-heading-xl text-secondary mb-1">{a.balance}</p>
            <p className="text-caption text-charcoal-400">{a.number}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="card">
        <h2 className="text-heading-md text-secondary mb-4">Recent Transactions</h2>
        <p className="text-body-sm text-charcoal-500">Your Investec Programmable Banking data is being synchronized.</p>
      </motion.div>
    </motion.div>
  )
}
