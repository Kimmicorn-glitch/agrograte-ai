'use client'

import dynamic from 'next/dynamic'

const IntelligenceOrbPage = dynamic(
  () => import('@/components/intelligence-orb/IntelligenceOrbPage').then((m) => m.IntelligenceOrbPage),
  { ssr: false }
)

export default function FinancialOrbPage() {
  return (
    <main className="min-h-screen bg-carbon-950 p-6">
      <IntelligenceOrbPage />
    </main>
  )
}
