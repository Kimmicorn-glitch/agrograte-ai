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
  liquidity: number
  risk: number
  compliance: number
  revenue?: number
  expenses?: number
  profit?: number
}

export interface BankingSummary {
  available_balance: number
  pending_transactions: number
  reserved_tax_funds: number
  programmable_rules: number
  approval_workflows: number
  accounts?: InvestecAccount[]
}

export interface InvestecAccount {
  account_id: string
  account_number: string
  account_type: string
  current_balance: number
  available_balance: number
}

export interface ComplianceSummary {
  sars_compliance_score: number
  vat_compliant: boolean
  tax_compliant: boolean
  outstanding_returns: number
}

export interface CashFlowForecast {
  projected_balance: number
  confidence: number
  drrt_coherence: number
  scenarios: CashFlowScenario[]
}

export interface CashFlowScenario {
  scenario_type: string
  projected_balance: number
  probability: number
}

export interface TaxReserve {
  vat_estimate: number
  income_tax_estimate: number
  paye_estimate: number
  total_reserve_needed: number
  monthly_allocation: number
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
