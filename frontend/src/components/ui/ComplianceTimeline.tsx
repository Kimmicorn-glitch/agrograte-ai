'use client'

import { useEffect, useState } from 'react'

export default function ComplianceTimeline() {
  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/compliance/report')
      .then((r) => r.json())
      .then((data) => { if (mounted) setReport(data) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  function exportPdf() {
    // Open a printable report in a new window and call print()
    const html = `
      <html>
      <head>
        <title>Compliance Report</title>
        <style>body{font-family: Arial, sans-serif;padding:24px;color:#111} .h{font-size:20px;font-weight:700}</style>
      </head>
      <body>
        <div class="h">Compliance Report — Score: ${report?.overall_score ?? '—'}</div>
        <div>VAT compliant: ${report?.vat_compliant ?? '—'}</div>
        <div>Tax compliant: ${report?.tax_compliant ?? '—'}</div>
        <hr />
        <h3>Recommendations</h3>
        <ul>${(report?.recommendations || []).map((r: any) => `<li>${r}</li>`).join('')}</ul>
      </body>
      </html>`
    const w = window.open('', '_blank')
    if (!w) return alert('Please allow popups to export PDF')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 500)
  }

  if (loading) return <div className="text-caption text-charcoal-400">Loading compliance...</div>
  if (!report) return <div className="text-caption text-charcoal-400">No compliance data</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">Compliance Score</div>
          <div className="text-heading-sm font-bold">{report.overall_score}/100</div>
        </div>
        <div>
          <button onClick={exportPdf} className="px-3 py-2 bg-accent text-white rounded-md">Export PDF</button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm">VAT compliant: {String(report.vat_compliant)}</div>
        <div className="text-sm">Tax compliant: {String(report.tax_compliant)}</div>
        <div className="text-sm">Violations: {(report.violations || []).length}</div>
      </div>
    </div>
  )
}
