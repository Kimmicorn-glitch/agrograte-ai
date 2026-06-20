'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import dynamic from 'next/dynamic'

const DiagnosticsPanel = dynamic(
  () => import('@/components/dashboard/DiagnosticsPanel').then((m) => m.DiagnosticsPanel),
  { ssr: false }
)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Sidebar>
        {children}
      </Sidebar>
      <DiagnosticsPanel />
    </ErrorBoundary>
  )
}
