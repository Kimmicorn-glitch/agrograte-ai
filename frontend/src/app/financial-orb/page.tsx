'use client'

import dynamic from 'next/dynamic'

const FinancialOrbScene = dynamic(
  () => import('@/components/financial-orb/FinancialOrbScene').then((m) => m.FinancialOrbScene),
  { ssr: false }
)

export default function FinancialOrbPage() {
  return (
    <main className="fixed inset-0 bg-carbon-950">
      <FinancialOrbScene />
    </main>
  )
}
