import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Agrograte AI | Financial Intelligence OS',
  description: 'Transform banking data into financial intelligence using Investec Programmable Banking, DRRT, AI forecasting, compliance automation, and explainable reasoning.',
  keywords: ['fintech', 'DRRT', 'Investec', 'financial intelligence', 'AI forecasting', 'compliance automation', 'South Africa'],
  openGraph: {
    title: 'Agrograte AI | Financial Intelligence OS',
    description: 'Transform banking data into financial intelligence using DRRT technology.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="noise-overlay" />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
