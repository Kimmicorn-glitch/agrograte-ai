'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Sidebar>
        {children}
      </Sidebar>
    </ErrorBoundary>
  )
}
