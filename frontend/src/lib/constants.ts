export const SITE_NAME = 'Agrograte AI'
export const TAGLINE = 'From Transactions to Intelligence'
export const MISSION = 'Transform banking data into financial intelligence using Investec Programmable Banking, DRRT, AI forecasting, compliance automation, and explainable reasoning.'
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/technology', label: 'Technology' },
  { href: '/about', label: 'About' },
  { href: '/security', label: 'Security' },
  { href: '/documentation', label: 'Docs' },
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
      'DRRT core intelligence',
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
      'Full DRRT convergence engine',
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
      'Multi-tensor DRRT architecture',
      'Advanced forecasting with ML',
      'Full compliance suite (POPIA, GDPR)',
      'Custom reporting engine',
      'Programmable banking rules',
      'API access & webhooks',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
]

export const FAQ_ITEMS = [
  {
    question: 'What is Agrograte AI?',
    answer: 'Agrograte AI is a relational financial intelligence platform that transforms banking data into actionable insights using DRRT (Dynamic Recursive Relational Tensor) technology, AI forecasting, and compliance automation.'
  },
  {
    question: 'How does DRRT technology work?',
    answer: 'DRRT models your financial ecosystem as a signed relational tensor space. Transactions, accounts, customers, suppliers, invoices, and compliance requirements are represented as interconnected dimensions that recursively converge toward a coherent state.'
  },
  {
    question: 'Do I need an Investec account?',
    answer: 'Agrograte AI is built on Investec Programmable Banking technology for the deepest integration, but we support multiple banking providers through our abstraction layer.'
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Yes. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We implement zero-trust architecture with HashiCorp Vault for secrets management, RBAC/ABAC for access control, and comprehensive audit logging.'
  },
  {
    question: 'Is Agrograte AI SARS compliant?',
    answer: 'Our compliance engine is built specifically for South African tax regulations. We automate VAT calculations, tax reserve management, and generate SARS-compliant reports. However, we recommend review by a qualified tax professional.'
  },
  {
    question: 'Can I connect multiple bank accounts?',
    answer: 'Yes. The Professional plan supports up to 5 accounts, and the Enterprise plan supports unlimited accounts across multiple banking providers.'
  },
  {
    question: 'Does Agrograte AI support accounting software integration?',
    answer: 'We are building integrations with CaseWare, Xero, and Sage. Enterprise customers get priority access to these integrations.'
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'You can export all your data at any time. Upon cancellation, we retain your data for 90 days per our data retention policy, after which it is securely deleted.'
  },
]

export const FEATURES_LIST = [
  {
    title: 'DRRT Intelligence Engine',
    description: 'Our proprietary Dynamic Recursive Relational Tensor technology models your entire financial ecosystem as a coherent, self-converging intelligence graph.',
    icon: 'Brain',
  },
  {
    title: 'Real-Time Transaction Analysis',
    description: 'Every transaction is analyzed in real-time through the DRRT tensor, providing instant classification, anomaly detection, and risk assessment.',
    icon: 'Activity',
  },
  {
    title: 'AI-Powered Forecasting',
    description: 'Machine learning models trained on your financial data provide accurate cash flow forecasts, revenue predictions, and scenario analysis.',
    icon: 'TrendingUp',
  },
  {
    title: 'Compliance Automation',
    description: 'Automated SARS compliance checks, VAT calculations, tax reserve management, and regulatory reporting powered by DRRT coherence validation.',
    icon: 'Shield',
  },
  {
    title: 'Investec Programmable Banking',
    description: 'Deep integration with Investec Programmable Banking for automated rules, intelligent transfers, and real-time financial control.',
    icon: 'Banknote',
  },
  {
    title: 'Explainable Reasoning',
    description: 'Every insight, prediction, and recommendation includes a clear explanation of how it was derived, building trust and enabling informed decisions.',
    icon: 'Search',
  },
  {
    title: 'Financial Health Scoring',
    description: 'A comprehensive, DRRT-validated financial health score that tracks liquidity, risk exposure, compliance status, and overall financial wellness.',
    icon: 'Heart',
  },
  {
    title: 'Multi-Tenant Architecture',
    description: 'Enterprise-grade multi-tenancy with complete data isolation, role-based access control, and attribute-based security policies.',
    icon: 'Building2',
  },
]

export const GRADIENT_ENGINE = 'linear-gradient(135deg, rgba(217,4,41,0.25), rgba(255,255,255,0.12), rgba(192,192,192,0.15))'
