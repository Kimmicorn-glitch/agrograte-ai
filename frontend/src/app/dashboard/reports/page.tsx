'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, TrendingUp, Scale, Wallet, Download, Eye, ChevronRight, Calendar, Building2 } from 'lucide-react'
import { staggerContainer, fadeInUp } from '@/lib/motion'

const reports = [
  { id: 'income-statement', title: 'Income Statement', description: 'Revenue, COGS, and operating expenses', icon: TrendingUp, date: 'Jun 2025', pages: 4 },
  { id: 'balance-sheet', title: 'Balance Sheet', description: 'Assets, liabilities, and equity overview', icon: Scale, date: 'Jun 2025', pages: 3 },
  { id: 'cash-flow', title: 'Cash Flow Statement', description: 'Operating, investing, and financing activities', icon: Wallet, date: 'Jun 2025', pages: 3 },
  { id: 'tax-summary', title: 'Tax Summary', description: 'SARS-ready tax computation and breakdown', icon: FileText, date: 'FY 2025', pages: 6 },
]

const previews: Record<string, { header: string; period: string; sections: { label: string; items: { name: string; amount: string }[]; total?: string }[]; footer?: string }> = {
  'income-statement': {
    header: 'Income Statement', period: 'For the period 1 June 2024 - 31 May 2025',
    sections: [
      { label: 'Revenue', items: [{ name: 'Client Fees', amount: 'R 3,240,000' }, { name: 'Consulting Income', amount: 'R 892,500' }, { name: 'Interest Income', amount: 'R 45,230' }], total: 'R 4,177,730' },
      { label: 'Cost of Goods Sold', items: [{ name: 'Direct Labour', amount: 'R 1,120,000' }, { name: 'Materials & Software', amount: 'R 342,800' }, { name: 'Subcontractors', amount: 'R 215,000' }], total: 'R 1,677,800' },
      { label: 'Operating Expenses', items: [{ name: 'Office & Facilities', amount: 'R 540,000' }, { name: 'Salaries & Wages', amount: 'R 890,000' }, { name: 'Marketing', amount: 'R 156,000' }, { name: 'Professional Fees', amount: 'R 98,500' }, { name: 'Technology & Infrastructure', amount: 'R 124,800' }], total: 'R 1,809,300' },
    ],
    footer: 'Net Profit: R 690,630',
  },
  'balance-sheet': {
    header: 'Balance Sheet', period: 'As at 31 May 2025',
    sections: [
      { label: 'Assets', items: [{ name: 'Cash & Cash Equivalents', amount: 'R 2,847,530' }, { name: 'Accounts Receivable', amount: 'R 425,000' }, { name: 'Equipment & Software', amount: 'R 892,000' }, { name: 'Investments', amount: 'R 500,000' }], total: 'R 4,664,530' },
      { label: 'Liabilities', items: [{ name: 'Accounts Payable', amount: 'R 184,200' }, { name: 'Tax Payable', amount: 'R 384,200' }, { name: 'VAT Payable', amount: 'R 92,450' }, { name: 'Short-term Debt', amount: 'R 250,000' }], total: 'R 910,850' },
      { label: 'Equity', items: [{ name: 'Share Capital', amount: 'R 1,000,000' }, { name: 'Retained Earnings', amount: 'R 2,753,680' }], total: 'R 3,753,680' },
    ],
    footer: 'Total Liabilities & Equity: R 4,664,530',
  },
  'cash-flow': {
    header: 'Cash Flow Statement', period: 'For the period 1 June 2024 - 31 May 2025',
    sections: [
      { label: 'Operating Activities', items: [{ name: 'Cash from Clients', amount: 'R 4,015,230' }, { name: 'Cash Paid to Suppliers', amount: 'R -1,423,500' }, { name: 'Cash Paid to Employees', amount: 'R -2,010,000' }, { name: 'Interest Received', amount: 'R 45,230' }, { name: 'Tax Paid', amount: 'R -312,000' }], total: 'R 314,960' },
      { label: 'Investing Activities', items: [{ name: 'Equipment Purchase', amount: 'R -156,000' }, { name: 'Software Acquisition', amount: 'R -89,000' }, { name: 'Investment Income', amount: 'R 22,500' }], total: 'R -222,500' },
      { label: 'Financing Activities', items: [{ name: 'Loan Repayment', amount: 'R -50,000' }, { name: 'Dividends Paid', amount: 'R -100,000' }], total: 'R -150,000' },
    ],
    footer: 'Net Cash Flow: -R 57,540 | Closing Balance: R 2,847,530',
  },
  'tax-summary': {
    header: 'Tax Summary', period: 'Year of Assessment: 1 March 2024 - 28 February 2025',
    sections: [
      { label: 'Income', items: [{ name: 'Gross Income', amount: 'R 4,177,730' }, { name: 'Exempt Income', amount: 'R -12,000' }], total: 'R 4,165,730' },
      { label: 'Allowable Deductions', items: [{ name: 'Operating Expenses', amount: 'R 1,809,300' }, { name: 'Cost of Sales', amount: 'R 1,677,800' }, { name: 'Capital Allowances (Section 12C)', amount: 'R 45,600' }, { name: 'Pension/Retirement', amount: 'R 120,000' }], total: 'R 3,652,700' },
      { label: 'Tax Computation', items: [{ name: 'Taxable Income', amount: 'R 513,030' }, { name: 'Tax at 28%', amount: 'R 143,648' }, { name: 'Provisional Tax Paid', amount: 'R -320,000' }, { name: 'Withholding Tax', amount: 'R -12,000' }], total: 'R 384,200 (Estimated Liability)' },
    ],
    footer: 'SARS Compliance Status: Up to Date',
  },
}

export default function ReportsExperience() {
  const [active, setActive] = useState<string | null>(null)
  const p = active ? previews[active] : null

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
          <FileText size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-display-sm text-secondary">Reports</h1>
          <p className="text-body-md text-charcoal-500">Financial statements and tax summaries</p>
        </div>
      </motion.div>

      {!active ? (
        <>
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {reports.map((r) => (
              <button key={r.id} onClick={() => setActive(r.id)} className="card card-hover text-left group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                    <r.icon size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-heading-sm text-secondary mb-1">{r.title}</h3>
                    <p className="text-body-sm text-charcoal-500 mb-2">{r.description}</p>
                    <div className="flex items-center gap-3 text-sm text-charcoal-400">
                      <span className="flex items-center gap-1"><Calendar size={12} />{r.date}</span>
                      <span>{r.pages} pages</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-charcoal-300 group-hover:text-accent transition-colors shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="card bg-accent-subtle border-accent/10">
            <div className="flex items-start gap-3">
              <FileText size={16} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-secondary mb-1">SARS-Ready Reports</h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  All reports are formatted to SARS submission standards. Tax summaries include full audit trails and are ready for e-Filing upload.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setActive(null)} className="btn-ghost mb-6">&larr; Back to reports</button>
          <div className="card card-elevated">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-charcoal-100">
              <div>
                <h2 className="text-heading-xl text-secondary">{p?.header}</h2>
                <p className="text-body-sm text-charcoal-500 mt-1">{p?.period}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary btn-sm"><Eye size={14} /> Full View</button>
                <button className="btn-primary btn-sm"><Download size={14} /> Download PDF</button>
              </div>
            </div>
            <div className="space-y-8">
              {p?.sections.map((s) => (
                <div key={s.label}>
                  <h3 className="text-overline text-accent mb-3">{s.label}</h3>
                  <div className="space-y-2">
                    {s.items.map((i) => (
                      <div key={i.name} className="flex items-center justify-between py-1">
                        <span className="text-sm text-charcoal-700">{i.name}</span>
                        <span className="text-sm font-medium text-secondary">{i.amount}</span>
                      </div>
                    ))}
                  </div>
                  {s.total && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-charcoal-200">
                      <span className="text-sm font-semibold text-secondary">Total {s.label}</span>
                      <span className="text-sm font-bold text-secondary">{s.total}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {p?.footer && (
              <div className="mt-8 pt-4 border-t border-charcoal-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-secondary">{p.footer}</span>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-charcoal-400" />
                    <span className="text-caption text-charcoal-400">Agrograte AI &bull; SARS Compliant</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
