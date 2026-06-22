'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, MapPin, Clock, ArrowRight, Loader2, Headphones, Users, Code, Building2 } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    const form = e.currentTarget as HTMLFormElement
    const data = {
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value,
      lastName: (form.elements.namedItem('lastName') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }
    try {
      await api.post('/api/contact', data)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mb-16">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">Contact</motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6">
              Get in <span className="gradient-text">touch</span>
            </motion.h1>
              <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm md:text-base leading-relaxed">
                Want early access? Have a question? Interested in partnering? We would love to hear from you.
              </motion.p>
            </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {submitted ? (
                <div className="glass-panel p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-success">✓</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Message Received</h2>
                  <p className="text-sm text-white/50 font-mono mb-6">
                    Thank you for reaching out. Our team will respond within 24 hours.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-ghost text-sm">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-white/50 block mb-1.5">First Name</label>
                      <input type="text" name="firstName" required className="glass-input" placeholder="John" />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-white/50 block mb-1.5">Last Name</label>
                      <input type="text" name="lastName" required className="glass-input" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/50 block mb-1.5">Email</label>
                    <input type="email" name="email" required className="glass-input" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/50 block mb-1.5">Company</label>
                    <input type="text" name="company" className="glass-input" placeholder="Your company name" />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/50 block mb-1.5">Subject</label>
                    <select name="subject" className="glass-select">
                      <option>Early Access Request</option>
                      <option>General Inquiry</option>
                      <option>Partnership Opportunity</option>
                      <option>Technical Support</option>
                      <option>Business Enquiry</option>
                      <option>Press / Media</option>
                      <option>Security Report</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-white/50 block mb-1.5">Message</label>
                    <textarea name="message" required className="glass-textarea" rows={5} placeholder="Tell us about yourself and what you are looking for..." />
                  </div>
                  {error && (
                    <div className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</div>
                  )}
                  <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Email Us</h3>
                    <p className="text-xs text-white/40 font-mono">Kimberly.Buzuidenhout@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <Headphones size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Technical Support</h3>
                    <p className="text-xs text-white/40 font-mono">Kimberly.Buzuidenhout@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Business Enquiries</h3>
                    <p className="text-xs text-white/40 font-mono">Kimberly.Buzuidenhout@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Partnership Opportunities</h3>
                    <p className="text-xs text-white/40 font-mono">Kimberly.Buzuidenhout@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <Code size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Developer Community</h3>
                    <p className="text-xs text-white/40 font-mono">Kimberly.Buzuidenhout@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Location</h3>
                    <p className="text-xs text-white/40 font-mono">South Africa</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 glass flex items-center justify-center text-scarlet-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Response Time</h3>
                    <p className="text-xs text-white/40 font-mono">We aim to respond within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className="text-sm font-semibold mb-2">Report a Security Issue</h3>
                <p className="text-xs text-white/50 font-mono mb-4">
                  If you have discovered a security vulnerability, please use our responsible disclosure program.
                </p>
                <Link href="/security-disclosure" className="text-xs text-scarlet-400 font-mono hover:underline inline-flex items-center gap-1">
                  Security Disclosure <ArrowRight size={10} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
