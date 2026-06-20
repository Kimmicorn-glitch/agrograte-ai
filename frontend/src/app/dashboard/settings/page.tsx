'use client'

import { motion } from 'framer-motion'
import { Settings, User, Bell, Shield, CreditCard, ChevronRight } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'
import { StatusBadge } from '@/components/ui/StatusBadge'

const sections = [
  { icon: User, label: 'Profile', description: 'Personal information and preferences' },
  { icon: Bell, label: 'Notifications', description: 'Email, SMS, and in-app alerts' },
  { icon: Shield, label: 'Security', description: 'Two-factor authentication, sessions' },
  { icon: CreditCard, label: 'Billing', description: 'Subscription and payment methods' },
]

export default function SettingsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
          <Settings size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-display-sm text-secondary">Settings</h1>
          <p className="text-body-md text-charcoal-500">Manage your account and preferences</p>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {sections.map((s) => (
          <button key={s.label} className="card card-hover text-left flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-charcoal-50 flex items-center justify-center shrink-0">
              <s.icon size={18} className="text-charcoal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-heading-sm text-secondary">{s.label}</h3>
              <p className="text-body-sm text-charcoal-500">{s.description}</p>
            </div>
            <ChevronRight size={16} className="text-charcoal-300 shrink-0" />
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-heading-sm text-secondary mb-1">Plan</h2>
            <p className="text-body-sm text-charcoal-500">Professional Plan &middot; R 299/month</p>
          </div>
          <StatusBadge status="success" label="Active" dot={false} />
        </div>
      </motion.div>
    </motion.div>
  )
}
