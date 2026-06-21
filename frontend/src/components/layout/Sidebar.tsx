'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Banknote,
  Zap,
  Shield,
  FileText,
  Building2,
  Settings,
  Menu,
  X,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react'
import { SITE_NAME } from '@/lib/constants'
import { overlayAnimation } from '@/lib/motion'

const SIDEBAR_WIDTH = 320

const navSections = [
  {
    label: 'EXECUTIVE',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/health', label: 'Business Health', icon: TrendingUp },
    ]
  },
  {
    label: 'OPERATIONS',
    items: [
      { href: '/dashboard/banking', label: 'Banking', icon: Banknote },
      { href: '/dashboard/cashflow', label: 'Cash Flow', icon: TrendingUp },
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { href: '/dashboard/intelligence', label: 'Financial Intelligence', icon: Sparkles },
      { href: '/dashboard/drrt', label: 'DRRT Tensor', icon: Zap },
    ]
  },
  {
    label: 'COMPLIANCE',
    items: [
      { href: '/dashboard/compliance', label: 'SARS Compliance', icon: Shield },
      { href: '/dashboard/audit', label: 'Audit Timeline', icon: Clock },
    ]
  },
  {
    label: 'INTEGRATION',
    items: [
      { href: '/dashboard/investec', label: 'Investec', icon: Building2 },
    ]
  },
  {
    label: 'GOVERNANCE',
    items: [
      { href: '/dashboard/reports', label: 'Reports', icon: FileText },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  },
]

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const pathname = usePathname()

  const close = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      {/* Logo & Branding */}
      <div className="px-5 py-5 border-b border-white/5 flex items-center">
        <Link href="/dashboard" onClick={isDesktop ? undefined : close} className="flex items-center gap-3 flex-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shadow-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base text-white leading-tight truncate">
              {SITE_NAME}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
              Financial OS
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-5 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <h3 className="px-3 py-1 text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
              {section.label}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isDesktop ? undefined : close}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      active
                        ? 'bg-[#6366f1]/10 text-[#818cf8] font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#6366f1] rounded-r-md" />
                    )}
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        active
                          ? 'text-[#818cf8]'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span className="text-sm truncate">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-white/5 bg-slate-900/50">
        <div className="rounded-lg bg-slate-800/50 border border-white/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">
              System Online
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            Investec Connected &middot; Live
          </p>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
        className="fixed top-4 left-4 z-50 p-2.5 bg-slate-900 border border-white/10 rounded-lg shadow-sm lg:hidden hover:bg-slate-800 transition-colors"
      >
        {mobileOpen ? <X size={18} className="text-slate-400" /> : <Menu size={18} className="text-slate-400" />}
      </button>

      {/* Desktop sidebar - always visible, persistent */}
      {isDesktop && (
        <aside
          style={{ width: SIDEBAR_WIDTH }}
          className="fixed left-0 top-0 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-40 flex flex-col shadow-xl overflow-y-auto"
        >
          {sidebarContent}
        </aside>
      )}

      {/* Mobile/tablet overlay */}
      <AnimatePresence>
        {!isDesktop && mobileOpen && (
          <motion.div
            key="sidebar-overlay"
            variants={overlayAnimation}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-30"
            onClick={close}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile/tablet sidebar drawer */}
      <AnimatePresence>
        {!isDesktop && mobileOpen && (
          <motion.aside
            key="sidebar-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{ width: SIDEBAR_WIDTH }}
            className="fixed left-0 top-0 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-40 flex flex-col shadow-xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <main
        style={{ marginLeft: isDesktop ? SIDEBAR_WIDTH : 0 }}
        className="min-h-screen bg-slate-950 transition-all duration-300"
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
