export const SITE_NAME = 'Agrograte AI'
export const TAGLINE = 'Financial Intelligence for South African Business'
export const MISSION = 'Automated tax insights, financial reporting, compliance workflows, and AI-powered business intelligence powered by Investec Programmable Banking.'
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const PUBLIC_NAV = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const DASHBOARD_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/banking', label: 'Banking', icon: 'Banknote' },
  { href: '/dashboard/ai', label: 'AI', icon: 'Brain' },
  { href: '/dashboard/compliance', label: 'Compliance', icon: 'Shield' },
  { href: '/dashboard/reports', label: 'Reports', icon: 'BarChart3' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
]

export const EXECUTIVE_METRICS = [
  {
    id: 'cash-position',
    label: 'Cash Position',
    value: 'R 2,847,530',
    change: '+12.3%',
    trend: 'up',
    subtitle: 'Across 4 accounts',
  },
  {
    id: 'tax-liability',
    label: 'Tax Liability',
    value: 'R 384,200',
    change: '-8.1%',
    trend: 'down',
    subtitle: 'Estimated for FY 2025',
  },
  {
    id: 'vat-due',
    label: 'VAT Due',
    value: 'R 92,450',
    change: 'Due 25 Jul',
    trend: 'warning',
    subtitle: 'Next filing window',
  },
  {
    id: 'compliance-score',
    label: 'SARS Compliance Score',
    value: '94/100',
    change: '+2 pts',
    trend: 'up',
    subtitle: 'All filings current',
  },
  {
    id: 'ai-insight',
    label: 'AI Insight',
    value: 'Tax Optimisation',
    change: 'Actionable',
    trend: 'info',
    subtitle: 'R 12,500 in potential savings',
  },
]

export const SUGGESTED_QUERIES = [
  'What taxes are due this quarter?',
  'Show deductible expenses for May.',
  'Forecast next quarter cash flow.',
  'Explain my VAT exposure.',
  'Summary of recent transactions over R50k.',
]

export const COMPLIANCE_ITEMS = [
  {
    id: 'vat-returns',
    title: 'VAT Returns',
    deadline: '25 Jul 2025',
    status: 'in-progress',
    progress: 60,
    description: 'Bi-monthly VAT201 filing',
  },
  {
    id: 'income-tax',
    title: 'Income Tax',
    deadline: '31 Jan 2026',
    status: 'pending',
    progress: 25,
    description: 'Annual provisional tax return',
  },
  {
    id: 'payroll',
    title: 'Payroll (PAYE)',
    deadline: '07 Jul 2025',
    status: 'ready',
    progress: 100,
    description: 'Monthly EMP201 submission',
  },
  {
    id: 'cipc',
    title: 'CIPC Annual Return',
    deadline: '15 Sep 2025',
    status: 'pending',
    progress: 10,
    description: 'Annual compliance filing',
  },
  {
    id: 'sars-deadlines',
    title: 'SARS Deadlines',
    deadline: 'Various',
    status: 'attention',
    progress: 45,
    description: 'Upcoming compliance dates',
  },
]

export const PRICING_TIERS = [
  {
    name: 'Starter',
    description: 'For sole proprietors and freelancers',
    price: 0,
    currency: 'ZAR',
    interval: 'month',
    features: [
      'Connect 1 bank account',
      'Basic transaction classification',
      'Monthly financial health score',
      'Standard compliance checks',
      'Email support',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    description: 'For growing SMEs and accountants',
    price: 299,
    currency: 'ZAR',
    interval: 'month',
    features: [
      'Up to 5 bank accounts',
      'Advanced AI classification',
      'Real-time financial intelligence',
      'SARS compliance automation',
      'Cash flow forecasting',
      'Tax reserve management',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    description: 'For consultancies, family offices, and large firms',
    price: 999,
    currency: 'ZAR',
    interval: 'month',
    features: [
      'Unlimited bank accounts',
      'Custom classification models',
      'Advanced forecasting with ML',
      'Full compliance suite',
      'Custom reporting engine',
      'Programmable banking rules',
      'API access & webhooks',
      'Dedicated account manager',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
]

export const FAQ_ITEMS = [
  {
    question: 'What is Agrograte AI?',
    answer: 'Agrograte AI transforms banking data into actionable financial intelligence using AI-powered analysis, compliance automation, and SARS-ready reporting.',
  },
  {
    question: 'Do I need an Investec account?',
    answer: 'Agrograte AI is built on Investec Programmable Banking for the deepest integration, providing real-time transaction intelligence and automated compliance workflows.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Yes. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We implement zero-trust architecture with comprehensive audit logging and role-based access control.',
  },
  {
    question: 'Is Agrograte AI SARS compliant?',
    answer: 'Our compliance engine is built specifically for South African tax regulations. We automate VAT calculations, tax reserve management, and generate SARS-ready reports.',
  },
  {
    question: 'Can I connect multiple bank accounts?',
    answer: 'Yes. The Professional plan supports up to 5 accounts, and the Enterprise plan supports unlimited accounts across multiple banking providers.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'You can export all your data at any time. Upon cancellation, we retain your data for 90 days per our data retention policy, after which it is securely deleted.',
  },
]

export const FEATURES_LIST = [
  {
    title: 'AI Financial Analysis',
    description: 'Real-time transaction classification, anomaly detection, and intelligent forecasting powered by machine learning.',
    icon: 'Brain',
  },
  {
    title: 'SARS Compliance Automation',
    description: 'Automated VAT calculations, tax reserve management, and SARS-ready report generation with deadline tracking.',
    icon: 'Shield',
  },
  {
    title: 'Investec Programmable Banking',
    description: 'Deep integration with Investec for automated rules, intelligent transfers, and real-time financial control.',
    icon: 'Banknote',
  },
  {
    title: 'Cash Flow Intelligence',
    description: 'AI-powered cash flow forecasting, scenario analysis, and liquidity monitoring for informed decision-making.',
    icon: 'TrendingUp',
  },
  {
    title: 'Executive Dashboard',
    description: 'Real-time financial health scores, compliance status, and actionable insights in a single, elegant view.',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Secure Multi-Tenant Architecture',
    description: 'Enterprise-grade security with complete data isolation, role-based access control, and comprehensive audit trails.',
    icon: 'Building2',
  },
]

export const REPORT_TYPES = [
  {
    id: 'income-statement',
    title: 'Income Statement',
    description: 'Revenue, COGS, and operating expenses',
    pages: 4,
    icon: 'TrendingUp',
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    description: 'Assets, liabilities, and equity overview',
    pages: 3,
    icon: 'Scale',
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Statement',
    description: 'Operating, investing, and financing activities',
    pages: 3,
    icon: 'Wallet',
  },
  {
    id: 'tax-summary',
    title: 'Tax Summary',
    description: 'SARS-ready tax computation and breakdown',
    pages: 6,
    icon: 'FileText',
  },
]
