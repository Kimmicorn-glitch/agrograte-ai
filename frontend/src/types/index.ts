export interface DrrtState {
  coherence: number
  contradiction: number
  frustration_index: number
  stability: number
  entropy: number
  convergence_iterations: number
  trend: 'improving' | 'degrading' | 'stable'
  dimensions: TensorDimension[]
}

export interface TensorDimension {
  id: string
  name: string
  weight: number
  activation: number
}

export interface FinancialHealth {
  health_score: number
  liquidity: string
  liquidity_score: number
  risk: string
  risk_score: number
  compliance: number
  compliance_score?: number
  revenue: number
  expenses: number
  profit: number
  profit_margin?: number
  drrt_coherence: number
  breakdown?: HealthBreakdown[]
}

export interface HealthBreakdown {
  dimension: string
  score: number
  weight: number
  status: 'healthy' | 'warning' | 'critical'
}

export interface BankingSummary {
  available_balance: number
  pending_transactions: number
  reserved_tax_funds: number
  programmable_rules: number
  approval_workflows: number
  drrt_coherence?: number
  accounts?: InvestecAccount[]
}

export interface InvestecAccount {
  account_id: string
  account_number: string
  account_type: string
  account_name?: string
  current_balance: number
  available_balance: number
  currency?: string
}

export interface ComplianceSummary {
  overall_score: number
  sars_compliance_score: number
  vat_compliant: boolean
  vat_score: number
  tax_compliant: boolean
  tax_score: number
  payroll_compliant?: boolean
  outstanding_returns: number
  drrt_coherence: number
  vat_liability_estimate: number
  tax_liability_estimate: number
  paye_estimate: number
  total_reserve_needed: number
  current_reserve_balance: number
  violations: ComplianceViolation[]
  recommendations: string[]
}

export interface ComplianceViolation {
  code: string
  severity: string
  description: string
  regulation_ref: string
  remediation: string
}

export interface CashFlowForecast {
  projected_balance: number
  confidence: number
  drrt_coherence: number
  avg_daily_inflow: number
  avg_daily_outflow: number
  inflow_volatility: number
  outflow_volatility: number
  current_balance: number
  net_daily_flow: number
  forecast_date: string
  scenarios: CashFlowScenario[]
}

export interface CashFlowScenario {
  scenario_type: string
  projected_balance: number
  probability: number
}

export interface TaxReserve {
  estimated_vat_liability: number
  estimated_income_tax: number
  estimated_paye: number
  total_reserve_required: number
  current_reserve_balance: number
  reserve_gap: number
  drrt_confidence: number
  recommended_monthly_allocation: number
}

export interface TransactionIntelligence {
  total_transactions: number
  total_inflow: number
  total_outflow: number
  net_flow: number
  category_breakdown: TransactionCategory[]
  top_merchants: MerchantSummary[]
  avg_transaction: number
}

export interface TransactionCategory {
  category: string
  count: number
  total: number
  credits: number
  debits: number
}

export interface MerchantSummary {
  name: string
  count: number
  total: number
}

export interface NavItem {
  href: string
  label: string
  icon?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export type StatusType = 'success' | 'warning' | 'error' | 'neutral' | 'info'
export type DepthLayer = 1 | 2 | 3 | 4
export type TrendDirection = 'up' | 'down' | 'stable'

export interface ChartDataPoint {
  label: string
  value: number
  forecast?: boolean
}

export interface RevenueChartPoint extends ChartDataPoint {
  revenue: number
  expenses: number
  profit: number
}

export interface DrrtNode {
  id: string
  label: string
  weight: number
  activation: number
  x: number
  y: number
  z: number
  group: string
}

export interface DrrtEdge {
  source: string
  target: string
  weight: number
  coherence: number
}
