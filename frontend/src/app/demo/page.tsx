'use client'

import { ArrowRight, Sparkles, BarChart3, Shield, Brain, Building2, LineChart, ScrollText, Zap } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  {
    icon: Brain,
    title: 'Financial Intelligence Orb',
    description: 'Live 3D neural visualization of your business financial health, cashflow, compliance, and risk signals.',
  },
  {
    icon: BarChart3,
    title: 'Executive Dashboard',
    description: 'Real-time cash position, tax liability, VAT due, and SARS compliance score at a glance.',
  },
  {
    icon: Shield,
    title: 'SARS Compliance',
    description: 'Automated VAT returns, income tax tracking, and compliance deadline management.',
  },
  {
    icon: ScrollText,
    title: 'AI Command Center',
    description: 'Natural language queries about your finances. Ask anything about taxes, expenses, or forecasts.',
  },
  {
    icon: Building2,
    title: 'Investec Integration',
    description: 'Direct connection via Investec Programmable Banking for real-time transaction intelligence.',
  },
  {
    icon: LineChart,
    title: 'Smart Reports',
    description: 'Income statements, balance sheets, cash flow reports, and tax summaries with PDF export.',
  },
]

const METRICS = [
  { label: 'Cash Position', value: 'R 2.4M', trend: '+12.3%' },
  { label: 'Tax Liability', value: 'R 847K', trend: '-3.1%' },
  { label: 'VAT Due', value: 'R 124K', trend: 'Due 15 Jul' },
  { label: 'Compliance Score', value: '94%', trend: 'Excellent' },
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C1121F]" />
            <span className="text-sm font-semibold text-[#111111] tracking-tight">Agrograte AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-[#495057] hover:text-[#111111] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('agrograte.demo', 'true')
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-sm font-medium rounded-lg hover:bg-[#111111]/90 transition-all"
            >
              Start Demo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-full text-xs font-medium text-[#495057] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#C1121F]" />
            Interactive Product Demo
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] tracking-tight leading-[1.1]">
            Turn Banking Data Into
            <br />
            <span className="text-[#C1121F]">SARS-Ready Intelligence</span>
          </h1>
          <p className="mt-6 text-lg text-[#495057] max-w-2xl mx-auto leading-relaxed">
            Automated tax insights, financial reporting, compliance workflows, and AI-powered business intelligence powered by Investec Programmable Banking.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('agrograte.demo', 'true')
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white text-sm font-medium rounded-lg hover:bg-[#111111]/90 transition-all"
            >
              Launch Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 border border-[#E9ECEF] text-[#495057] text-sm font-medium rounded-lg hover:border-[#111111]/20 hover:text-[#111111] transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#111111] tracking-tight">
              Executive Dashboard Preview
            </h2>
            <p className="mt-3 text-[#495057]">
              Key financial metrics at a glance
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="bg-white rounded-xl p-6 border border-[#E9ECEF]"
              >
                <p className="text-xs font-medium text-[#495057] uppercase tracking-wider">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111111]">{metric.value}</p>
                <p className={`mt-1 text-xs font-medium ${metric.trend.startsWith('+') ? 'text-green-600' : metric.trend.startsWith('-') ? 'text-[#C1121F]' : 'text-[#495057]'}`}>
                  {metric.trend}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl border border-[#E9ECEF] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-[#111111]">30-Day Cash Flow</h3>
              <div className="flex items-center gap-4 text-xs text-[#495057]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#111111]" />
                  Projected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C1121F]/30" />
                  Actual
                </span>
              </div>
            </div>
            <div className="h-48 flex items-end gap-2">
              {[40, 55, 45, 60, 50, 65, 55, 70, 60, 75, 65, 80, 70, 85, 75, 90, 80, 95, 85, 70, 60, 75, 65, 55, 70, 60, 50, 65, 55, 45].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#111111]/10 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#111111] tracking-tight">
              Everything you need to manage financial intelligence
            </h2>
            <p className="mt-3 text-[#495057]">
              Six integrated modules working together
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-[#E9ECEF] hover:border-[#111111]/10 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center mb-4 group-hover:bg-[#111111] transition-colors">
                  <feature.icon className="w-5 h-5 text-[#495057] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-[#111111]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#495057] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#111111]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-white tracking-tight">
            Ready to transform your financial operations?
          </h2>
          <p className="mt-4 text-[#E9ECEF]">
            Experience the full platform with zero commitment. No credit card required.
          </p>
          <Link
            href="/login"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('agrograte.demo', 'true')
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 mt-8 bg-white text-[#111111] text-sm font-medium rounded-lg hover:bg-white/90 transition-all"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C1121F]" />
            <span className="text-sm font-semibold text-[#111111] tracking-tight">Agrograte AI</span>
          </div>
          <p className="text-xs text-[#495057]">
            &copy; 2026 Agrograte AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
