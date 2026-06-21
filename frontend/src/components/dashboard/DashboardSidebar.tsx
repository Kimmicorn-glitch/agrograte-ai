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
    <div className="min-h-screen bg-charcoal-950">
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        className="fixed top-4 left-4 z-50 p-3 bg-charcoal-900/80 backdrop-blur-xl rounded-xl border border-charcoal-700/30 lg:hidden hover:bg-charcoal-800 transition-colors"
      >
        {sidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm z-30 lg:hidden"
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
          className="fixed left-0 top-0 h-full w-72 lg:w-60 xl:w-64 bg-charcoal-900 border-r border-charcoal-800 z-40 flex flex-col"
        >
          <div className="p-5 lg:p-4 xl:p-5 border-b border-charcoal-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
            <Link href="/dashboard" onClick={closeSidebar} className="flex items-center gap-2 relative z-10">
              <div className="w-2 h-2 bg-accent rounded-full shadow-lg shadow-accent/50" />
              <span className="font-mono font-bold text-sm lg:text-xs xl:text-sm tracking-tight text-white">AGROGRATE</span>
            </Link>
            <span className="text-[0.55rem] lg:text-[0.5rem] xl:text-[0.55rem] text-white/35 font-mono block mt-1 relative z-10 tracking-wider">
              Financial Intelligence OS
            </span>
          </div>

          <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-charcoal-700">
            {navSections.map((section) => (
              <div key={section.title} className="px-2 lg:px-1.5 xl:px-2">
                <div className="px-3 pt-4 pb-1 text-[0.55rem] lg:text-[0.5rem] xl:text-[0.55rem] text-white/25 font-mono tracking-[0.15em] uppercase">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebar}
                      className={`flex items-center gap-2.5 px-3 py-2.5 lg:py-2 xl:py-2.5 text-sm lg:text-xs xl:text-sm font-mono transition-all rounded-lg ${
                        isActive
                          ? 'text-white bg-charcoal-800 border border-charcoal-700/50'
                          : 'text-white/50 hover:text-white hover:bg-charcoal-800/50'
                      }`}
                    >
                      <item.icon size={14} className={`shrink-0 ${isActive ? 'text-accent' : ''}`} />
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-accent shadow-lg shadow-accent/50 shrink-0" />}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="p-4 lg:p-3 xl:p-4 border-t border-charcoal-800">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[0.6rem] lg:text-[0.55rem] xl:text-[0.6rem] text-white/45 font-mono">System Nominal</span>
            </div>
            <span className="text-[0.5rem] lg:text-[0.45rem] xl:text-[0.5rem] text-white/25 font-mono block mt-1">
              v0.2.0 &middot; DRRT Active
            </span>
          </div>
        </motion.aside>
      </AnimatePresence>

      <main className="lg:ml-60 xl:ml-64 min-h-screen">
        <div className="pl-16 lg:pl-6 xl:pl-8 pr-4 sm:pr-6 md:pr-8 lg:pr-6 xl:pr-8 pt-4 sm:pt-6 md:pt-8 lg:pt-6 xl:pt-8 pb-4 sm:pb-6 md:pb-8 lg:pb-6 xl:pb-8 max-w-7xl 2xl:max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
