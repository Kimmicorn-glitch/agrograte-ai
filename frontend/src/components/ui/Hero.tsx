'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="w-full max-w-6xl mx-auto py-20 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-display-sm text-secondary">Turn Banking Data Into SARS-Ready Intelligence</h1>
          <p className="text-body-lg text-secondary/80 max-w-xl">Automated tax insights, financial reporting, compliance workflows, and AI-powered business intelligence powered by Investec Programmable Banking.</p>
          <div className="flex gap-4 items-center">
            <Link href="/signup" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent text-white font-semibold shadow-accent hover:shadow-accent-hover transition duration-200">Start Free Trial</Link>
            <Link href="/demo" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white border border-gray-200 text-secondary font-medium">Book Demo</Link>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-2xl bg-gradient-hero p-8 border border-gray-100 shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-caption text-secondary/60">Cash Position</div>
                <div className="text-metric-xl text-secondary">R 2,812,340</div>
              </div>
              <div className="text-right">
                <div className="text-caption text-secondary/60">SARS Compliance</div>
                <div className="text-heading-sm font-semibold">92%</div>
              </div>
            </div>
            <div className="h-44 bg-white/40 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  )
}
