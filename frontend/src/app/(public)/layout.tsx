'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { PUBLIC_NAV, SITE_NAME } from '@/lib/constants'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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
    <div className="min-h-screen bg-white">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="page-container flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-2.5 h-2.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
            <span className="font-semibold text-heading-sm text-secondary">{SITE_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {PUBLIC_NAV.slice(0, -1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-sm text-charcoal-500 hover:text-secondary hover:bg-charcoal-50 transition-all rounded-lg font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-3 px-4 py-1.5 text-sm font-semibold text-charcoal-600 hover:text-secondary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/contact"
              className="ml-2 btn-primary text-sm px-5 py-2"
            >
              Start Free Trial <ArrowRight size={14} />
            </Link>
          </nav>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2.5 text-charcoal-500 hover:text-secondary transition-colors rounded-lg hover:bg-charcoal-50"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="md:hidden bg-white border-t border-charcoal-100 overflow-hidden shadow-lg"
            >
              <nav className="page-container py-4 space-y-1">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm text-charcoal-600 hover:text-secondary hover:bg-charcoal-50 transition-all rounded-lg font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-3 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block btn-secondary text-sm text-center py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="block btn-primary text-sm text-center py-2.5"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      <footer className="bg-secondary border-t border-charcoal-800">
        <div className="page-container py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-semibold text-heading-sm text-white">{SITE_NAME}</span>
              </Link>
              <p className="text-sm text-charcoal-400 leading-relaxed">
                Financial Intelligence for South African Business
              </p>
            </div>

            <div>
              <h4 className="text-overline text-charcoal-400 mb-4">Product</h4>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'How It Works', 'Technology', 'Integrations'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-charcoal-300 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-overline text-charcoal-400 mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Contact', 'Security', 'Status'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-sm text-charcoal-300 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-overline text-charcoal-400 mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-charcoal-300 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-charcoal-500">
              &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-charcoal-500">
                Built on Investec Programmable Banking
              </span>
              <span className="text-xs text-charcoal-600 px-2 py-0.5 border border-charcoal-700 rounded-md">
                v0.2.0
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
