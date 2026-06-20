'use client'

import dynamic from 'next/dynamic'

const IntelligenceOrbPage = dynamic(
  () => import('@/components/intelligence-orb/IntelligenceOrbPage').then((m) => m.IntelligenceOrbPage),
  { ssr: false }
)

export default function IntelligencePage() {
  return <IntelligenceOrbPage />
}
