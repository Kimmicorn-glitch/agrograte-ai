'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Banknote,
  Brain,
  Shield,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { SITE_NAME } from '@/lib/constants'
import { sidebarAnimation, overlayAnimation } from '@/lib/motion'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/banking', label: 'Banking', icon: Banknote },
  { href: '/dashboard/ai', label: 'AI Command Center', icon: Brain },
  { href: '/dashboard/compliance', label: 'Compliance', icon: Shield },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="min-h-screen bg-primary-off">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
        className="fixed top-4 left-4 z-50 p-2.5 bg-white border border-charcoal-200 rounded-lg shadow-sm lg:hidden hover:bg-charcoal-50 transition-colors"
      >
        {open ? <X size={18} className="text-charcoal-700" /> : <Menu size={18} className="text-charcoal-700" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-overlay"
            variants={overlayAnimation}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={close}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.aside
          key="sidebar"
          variants={sidebarAnimation}
          initial="closed"
          animate={open ? 'open' : 'closed'}
          exit="closed"
          className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-charcoal-100 z-40 flex flex-col shadow-sidebar"
        >
          <div className="p-6 border-b border-charcoal-100">
            <Link href="/dashboard" onClick={close} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="font-semibold text-heading-sm text-secondary tracking-tight">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-caption text-charcoal-400 mt-1 ml-5">
              Financial Intelligence OS
            </p>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-accent-subtle text-accent'
                      : 'text-charcoal-500 hover:text-secondary hover:bg-charcoal-50'
                  }`}
                >
                  <item.icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-accent' : 'text-charcoal-400 group-hover:text-charcoal-600'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="ml-auto text-accent" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-5 border-t border-charcoal-100">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="status-dot status-dot-success" />
              <span className="text-caption font-medium text-charcoal-500">System Online</span>
            </div>
            <p className="text-caption text-charcoal-400 ml-[18px]">
              Investec Connected
            </p>
          </div>
        </motion.aside>
      </AnimatePresence>

      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
