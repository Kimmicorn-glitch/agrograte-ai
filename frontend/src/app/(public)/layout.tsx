'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS, SITE_NAME } from '@/lib/constants'

const mobileMenuVariants = {
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
  closed: { height: 0, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-carbon-950">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-glass-border' : 'bg-transparent'
      }`}>
        <div className="page-container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-scarlet-600 glow-scarlet" />
            <span className="font-mono font-bold text-sm tracking-tight">{SITE_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-glass-hover transition-all rounded font-mono"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="ml-4 btn-primary text-xs py-1.5 px-4 rounded">
              Get Early Access
            </Link>
          </nav>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-3 text-white/60 hover:text-white transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden glass border-b border-glass-border overflow-hidden"
            >
              <nav className="page-container py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-glass-hover transition-all rounded font-mono"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-3 btn-primary text-center text-sm py-3"
                >
                  Get Early Access
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      <footer className="border-t border-glass-border">
        <div className="page-container py-12 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-scarlet-600" />
                <span className="font-mono font-bold text-sm tracking-tight">{SITE_NAME}</span>
              </div>
              <p className="text-xs text-white/40 font-mono leading-relaxed">
                From Transactions to Intelligence
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold text-white/60 mb-3 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'How It Works', 'Technology', 'DRRT Intelligence'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs text-white/40 hover:text-white transition-colors font-mono">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold text-white/60 mb-3 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Roadmap', 'Contact', 'Status'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-xs text-white/40 hover:text-white transition-colors font-mono">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold text-white/60 mb-3 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs text-white/40 hover:text-white transition-colors font-mono">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30 font-mono">
              &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/30 font-mono">
                Built on Investec Programmable Banking
              </span>
              <span className="text-xs text-white/20 font-mono">
                v0.1.0
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
