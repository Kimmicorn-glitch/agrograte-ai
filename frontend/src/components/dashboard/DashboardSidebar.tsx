'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, LayoutDashboard, TrendingUp, Brain, Banknote,
  Shield, BarChart3, Activity, Search, ClipboardCheck, FileText, Globe,
} from 'lucide-react'

const navSections = [
  {
    title: 'Financial',
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/dashboard/health', label: 'Business Health', icon: Activity },
      { href: '/dashboard/cashflow', label: 'Cash Flow', icon: TrendingUp },
      { href: '/financial-orb', label: 'Financial Galaxy', icon: Globe },
    ],
  },
  {
    title: 'DRRT Intelligence',
    items: [
      { href: '/dashboard/drrt', label: 'Tensor State', icon: Brain },
      { href: '/dashboard/drrt/memory', label: 'Memory', icon: Brain },
      { href: '/dashboard/drrt/relationships', label: 'Relationships', icon: Search },
    ],
  },
  {
    title: 'Investec Banking',
    items: [
      { href: '/dashboard/banking', label: 'Accounts', icon: Banknote },
      { href: '/dashboard/banking/rules', label: 'Programmable Rules', icon: Banknote },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { href: '/dashboard/compliance', label: 'SARS Status', icon: Shield },
      { href: '/dashboard/compliance/vat', label: 'VAT Returns', icon: Shield },
      { href: '/dashboard/compliance/tax', label: 'Tax Records', icon: Shield },
    ],
  },
  {
    title: 'Governance',
    items: [
      { href: '/dashboard/approvals', label: 'Approvals', icon: ClipboardCheck },
      { href: '/dashboard/audit', label: 'Audit Timeline', icon: FileText },
    ],
  },
]

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring' as const, damping: 30, stiffness: 300 } },
  closed: { x: '-100%', transition: { type: 'spring' as const, damping: 30, stiffness: 300 } },
}

const overlayVariants = {
  open: { opacity: 1, transition: { duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
}

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen bg-carbon-950">
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        className="fixed top-4 left-4 z-50 p-3 glass rounded-lg lg:hidden hover:bg-glass-hover transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.aside
          key="sidebar"
          variants={sidebarVariants}
          initial="closed"
          animate={sidebarOpen ? 'open' : 'closed'}
          exit="closed"
          className="fixed left-0 top-0 h-screen w-64 lg:w-56 glass border-r border-glass-border z-40 flex flex-col"
        >
          <div className="p-5 border-b border-glass-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-accent opacity-20" />
            <Link href="/dashboard" onClick={closeSidebar} className="flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 bg-scarlet-600 rounded-full shadow-lg shadow-scarlet-600/50 animate-breathe" />
              <span className="font-mono font-bold text-sm tracking-tight text-white">AGROGRATE</span>
            </Link>
            <span className="text-[0.55rem] text-white/35 font-mono block mt-1 relative z-10 tracking-wider">
              Financial Intelligence OS
            </span>
          </div>

          <nav className="flex-1 py-2 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.title} className="px-2">
                <div className="px-3 pt-4 pb-1 text-[0.55rem] text-white/25 font-mono tracking-[0.15em] uppercase">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebar}
                      className={`flex items-center gap-2.5 px-3 py-2 lg:py-1.5 text-sm lg:text-xs font-mono transition-all rounded-md ${
                        isActive
                          ? 'text-white bg-glass-active border border-glass-border'
                          : 'text-white/50 hover:text-white hover:bg-glass-hover'
                      }`}
                    >
                      <item.icon size={14} className={`shrink-0 ${isActive ? 'text-scarlet-400' : ''}`} />
                      {item.label}
                      {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-scarlet-500 shadow-lg shadow-scarlet-500/50" />}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-glass-border">
            <div className="flex items-center gap-2">
              <span className="status-ring status-ring-success animate-breathe" />
              <span className="text-[0.6rem] text-white/45 font-mono">System Nominal</span>
            </div>
            <span className="text-[0.5rem] text-white/25 font-mono block mt-1">
              v0.2.0 &middot; DRRT Active
            </span>
          </div>
        </motion.aside>
      </AnimatePresence>

      <main className="lg:ml-56 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
