'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, PlayCircle, Brain, BarChart3, Shield, ScrollText, Building2, LineChart, Sparkles, Check } from 'lucide-react'
import { useRef } from 'react'
import { staggerContainer, fadeInUp } from '@/lib/motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
}

function InViewSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }} className={className}>
      {children}
    </motion.div>
  )
}

const FEATURES = [
  { icon: Brain, title: 'DRRT Intelligence Engine', description: 'Proprietary Dynamic Recursive Relational Tensor technology for deep financial analysis.' },
  { icon: BarChart3, title: 'Real-Time Analytics', description: 'Live financial dashboards with executive-level metrics and AI-driven insights.' },
  { icon: Shield, title: 'SARS Compliance', description: 'Automated VAT returns, tax filing, and compliance deadline management.' },
  { icon: ScrollText, title: 'Smart Reports', description: 'Income statements, balance sheets, and tax summaries with PDF export.' },
  { icon: Building2, title: 'Investec Integration', description: 'Direct connection via Investec Programmable Banking for instant transaction data.' },
  { icon: LineChart, title: 'Cash Flow Forecasting', description: '90-day projections with scenario analysis and confidence scoring.' },
]

const METRICS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: 'R 2.4B+', label: 'Transactions Analyzed' },
  { value: '94%', label: 'Avg. Compliance Score' },
  { value: '15min', label: 'Setup Time' },
]

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[90vh] flex items-center pt-24 md:pt-28 overflow-hidden bg-white">
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[#C1121F]/[0.02] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#C1121F]/[0.015] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto text-center">
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-full text-xs font-medium text-[#495057]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C1121F] animate-pulse inline-block" />
                Built for Investec Programmable Banking
              </span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-[#111111] tracking-tight leading-[1.05] mb-6">
              Turn Banking Data Into{' '}
              <span className="text-[#C1121F]">SARS-Ready</span>{' '}
              Intelligence
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-[#495057] max-w-2xl mx-auto mb-10 leading-relaxed">
              Automated tax insights, financial reporting, compliance workflows, and AI-powered business intelligence powered by Investec Programmable Banking.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] text-white text-sm font-medium rounded-lg hover:bg-[#111111]/90 transition-all">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 border border-[#E9ECEF] text-[#495057] text-sm font-medium rounded-lg hover:border-[#111111]/20 hover:text-[#111111] transition-all">
                <PlayCircle className="w-4 h-4" />
                Book Demo
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-[#495057]">
              {['SARS Compliant', 'Investec Integrated', 'AI-Powered', 'POPIA Compliant'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <InViewSection>
        <section className="py-24 md:py-28 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <motion.span variants={fadeUp} className="text-xs font-semibold text-[#C1121F] uppercase tracking-widest">The Problem</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mt-3">
                Financial data is disconnected from financial decisions
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#495057] mt-4">
                South African SMEs and accounting professionals face spreadsheets sprawl, manual compliance processes, and no real-time visibility into financial health. Tax deadlines are missed. Cash flow surprises are common. Intelligence arrives too late.
              </motion.p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { title: 'Disconnected Data', description: 'Bank accounts, invoices, receipts, and tax records live in separate systems with no unified view of financial reality.' },
                { title: 'Manual Compliance', description: 'VAT returns, tax calculations, and regulatory filings require hours of manual work every month.' },
                { title: 'Reactive Decisions', description: 'Without real-time intelligence, financial decisions are based on outdated information and gut feelings.' },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="p-6 rounded-xl border border-[#E9ECEF] bg-white"
                >
                  <h3 className="text-base font-semibold text-[#111111]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#495057] leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </InViewSection>

      <section className="py-20 px-6 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-tight">{metric.value}</p>
                <p className="text-sm text-[#495057] mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InViewSection>
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-16">
              <motion.span variants={fadeUp} className="text-xs font-semibold text-[#C1121F] uppercase tracking-widest">Features</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mt-3">
                Everything you need to master your finances
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#495057] mt-4">
                From transaction intelligence to SARS compliance, Agrograte AI connects every piece of your financial ecosystem.
              </motion.p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="group p-6 rounded-xl border border-[#E9ECEF] hover:border-[#111111]/10 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#111111] transition-colors">
                    <feature.icon className="w-5 h-5 text-[#495057] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-[#111111]">{feature.title}</h3>
                  <p className="mt-2 text-sm text-[#495057] leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </InViewSection>

      <InViewSection>
        <section className="py-24 md:py-32 px-6 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-16">
              <motion.span variants={fadeUp} className="text-xs font-semibold text-[#C1121F] uppercase tracking-widest">How It Works</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mt-3">
                Minutes to set up. Years of intelligence.
              </motion.h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Connect Your Bank', description: 'Link your Investec account via secure OAuth2. No credentials stored — just instant, read-only access to your transaction data.' },
                { step: '02', title: 'AI Analyzes Everything', description: 'Our DRRT engine processes your financial data, detects patterns, calculates compliance scores, and generates actionable insights.' },
                { step: '03', title: 'Get SARS-Ready Intelligence', description: 'Access executive dashboards, automated tax reports, compliance timelines, and AI-powered forecasts — all in one place.' },
              ].map((item) => (
                <motion.div key={item.step} variants={fadeUp} className="p-8 bg-white rounded-xl border border-[#E9ECEF]">
                  <span className="text-4xl font-semibold text-[#C1121F] tracking-tight">{item.step}</span>
                  <h3 className="text-lg font-semibold text-[#111111] mt-4 mb-2">{item.title}</h3>
                  <p className="text-sm text-[#495057] leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </InViewSection>

      <InViewSection>
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-16">
              <motion.span variants={fadeUp} className="text-xs font-semibold text-[#C1121F] uppercase tracking-widest">Pricing</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mt-3">
                Simple, transparent pricing
              </motion.h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: 'R 299',
                  period: '/month',
                  features: ['Up to 5 business accounts', 'Basic financial dashboard', 'Monthly compliance reports', 'Email support'],
                  featured: false,
                },
                {
                  name: 'Professional',
                  price: 'R 799',
                  period: '/month',
                  features: ['Unlimited accounts', 'AI-powered insights', 'Real-time compliance monitoring', 'SARS filing automation', 'Priority support'],
                  featured: true,
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  period: '',
                  features: ['Custom integrations', 'Dedicated account manager', 'On-premise deployment option', 'SLA guarantees', 'White-label reporting'],
                  featured: false,
                },
              ].map((tier) => (
                <motion.div
                  key={tier.name}
                  variants={fadeUp}
                  className={`p-8 rounded-xl border transition-all ${
                    tier.featured ? 'bg-[#111111] text-white border-[#111111] shadow-lg scale-[1.02]' : 'bg-white border-[#E9ECEF]'
                  }`}
                >
                  <h3 className={`text-lg font-semibold ${tier.featured ? 'text-white' : 'text-[#111111]'}`}>{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-4xl font-semibold tracking-tight ${tier.featured ? 'text-white' : 'text-[#111111]'}`}>{tier.price}</span>
                    {tier.period && <span className={`text-sm ${tier.featured ? 'text-[#E9ECEF]' : 'text-[#495057]'}`}>{tier.period}</span>}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.featured ? 'text-white' : 'text-[#059669]'}`} />
                        <span className={tier.featured ? 'text-[#E9ECEF]' : 'text-[#495057]'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`mt-8 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      tier.featured ? 'bg-white text-[#111111] hover:bg-white/90' : 'bg-[#F8F9FA] text-[#111111] border border-[#E9ECEF] hover:border-[#111111]/20'
                    }`}
                  >
                    {tier.featured ? 'Start Free Trial' : 'Contact Sales'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </InViewSection>

      <InViewSection>
        <section className="py-24 md:py-28 px-6 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <motion.span variants={fadeUp} className="text-xs font-semibold text-[#C1121F] uppercase tracking-widest">DRRT Intelligence</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mt-3">
                The intelligence engine behind every insight
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#495057] mt-4">
                The Dynamic Recursive Relational Tensor models your entire financial ecosystem as a multi-dimensional intelligence graph.
              </motion.p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Tensor Mapping', description: 'Every financial entity occupies a unique position in a multi-dimensional relational tensor space.' },
                { title: 'Recursive Convergence', description: 'The tensor iteratively relaxes toward a coherent state of financial truth.' },
                { title: 'Coherence Scoring', description: 'K(T) and C(T) metrics provide quantitative views of financial health and contradiction detection.' },
                { title: 'Explainable Output', description: 'Every insight includes a clear, traceable explanation of contributing factors and relationships.' },
              ].map((item) => (
                <motion.div key={item.title} variants={fadeUp} className="p-6 rounded-xl border border-[#E9ECEF] bg-white">
                  <h3 className="text-base font-semibold text-[#111111]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#495057] leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </InViewSection>

      <InViewSection>
        <section className="py-24 md:py-28 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div variants={fadeUp}>
                <span className="text-xs font-semibold text-[#C1121F] uppercase tracking-widest">Security & Compliance</span>
                <h2 className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mt-3">
                  Bank-grade security. Compliance by design.
                </h2>
                <p className="text-lg text-[#495057] mt-4 leading-relaxed">
                  Every layer of Agrograte AI is built with bank-grade security standards and regulatory compliance at its core.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'AES-256 encryption at rest, TLS 1.3 in transit',
                    'Zero Trust Architecture with continuous verification',
                    'POPIA, GDPR, CCPA, and SARS compliance',
                    'OAuth2 + MFA authentication with short-lived tokens',
                    'Comprehensive audit logging with immutable trails',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-[#495057]">
                      <Check className="w-4 h-4 text-[#059669] shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link href="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#C1121F] hover:text-[#A00E18] transition-colors">
                  Learn more about our security <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Encryption', value: 'AES-256' },
                  { label: 'Transit', value: 'TLS 1.3' },
                  { label: 'Auth', value: 'OAuth2 + MFA' },
                  { label: 'Compliance', value: 'POPIA Ready' },
                ].map((item) => (
                  <div key={item.label} className="p-5 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
                    <p className="text-2xl font-semibold text-[#111111]">{item.value}</p>
                    <p className="text-sm text-[#495057] mt-1">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </InViewSection>

      <InViewSection>
        <section className="py-24 md:py-32 px-6 bg-[#111111]">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
                Ready to transform your financial operations?
              </h2>
              <p className="mt-4 text-lg text-[#E9ECEF] max-w-2xl mx-auto">
                Join hundreds of South African businesses that trust Agrograte AI for their financial intelligence.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#111111] text-sm font-medium rounded-lg hover:bg-white/90 transition-all"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  Book Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </InViewSection>
    </>
  )
}
