use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub use super::value_objects::{
    AccountType, ComplianceStatus, InvoiceStatus, Money, Role, TaxRate, TransactionStatus,
    VatCategory,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub full_name: String,
    pub role: Role,
    pub business_id: Option<Uuid>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Business {
    pub id: Uuid,
    pub legal_name: String,
    pub trading_name: Option<String>,
    pub registration_number: String,
    pub tax_number: String,
    pub vat_number: Option<String>,
    pub directors: Vec<Director>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Director {
    pub id: Uuid,
    pub full_name: String,
    pub id_number: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: Uuid,
    pub business_id: Uuid,
    pub account_type: AccountType,
    pub account_number: String,
    pub account_name: String,
    pub bank: BankProvider,
    pub currency: String,
    pub available_balance: Money,
    pub pending_balance: Money,
    pub reserved_tax_funds: Money,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BankProvider {
    Investec,
    StandardBank,
    Nedbank,
    Absa,
    FNB,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub account_id: Uuid,
    pub transaction_id: String,
    pub amount: Money,
    pub balance: Money,
    pub description: String,
    pub category: Option<String>,
    pub transaction_type: TransactionType,
    pub status: TransactionStatus,
    pub posted_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionType {
    Debit,
    Credit,
    Fee,
    Interest,
    Transfer,
    Payment,
    Refund,
    TaxReserve,
    ProgrammableAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Invoice {
    pub id: Uuid,
    pub business_id: Uuid,
    pub invoice_number: String,
    pub customer_id: Uuid,
    pub supplier_id: Option<Uuid>,
    pub issue_date: DateTime<Utc>,
    pub due_date: DateTime<Utc>,
    pub line_items: Vec<InvoiceLineItem>,
    pub subtotal: Money,
    pub vat_amount: Money,
    pub total: Money,
    pub status: InvoiceStatus,
    pub vat_category: VatCategory,
    pub is_sars_compliant: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvoiceLineItem {
    pub description: String,
    pub quantity: f64,
    pub unit_price: Money,
    pub vat_rate: TaxRate,
    pub line_total: Money,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Customer {
    pub id: Uuid,
    pub business_id: Uuid,
    pub customer_code: String,
    pub legal_name: String,
    pub tax_number: Option<String>,
    pub vat_number: Option<String>,
    pub credit_limit: Option<Money>,
    pub payment_terms_days: i32,
    pub is_active: bool,
    pub trusted: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Supplier {
    pub id: Uuid,
    pub business_id: Uuid,
    pub supplier_code: String,
    pub legal_name: String,
    pub tax_number: Option<String>,
    pub vat_number: Option<String>,
    pub payment_terms_days: i32,
    pub is_active: bool,
    pub reliability: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxRecord {
    pub id: Uuid,
    pub business_id: Uuid,
    pub tax_period: String,
    pub tax_type: TaxType,
    pub amount_due: Money,
    pub amount_paid: Money,
    pub balance: Money,
    pub due_date: DateTime<Utc>,
    pub status: ComplianceStatus,
    pub filed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum TaxType {
    IncomeTax,
    Vat,
    Paye,
    Uif,
    Sdl,
    DividendsTax,
    CapitalGains,
}

impl std::fmt::Display for TaxType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TaxType::IncomeTax => write!(f, "Income Tax"),
            TaxType::Vat => write!(f, "VAT"),
            TaxType::Paye => write!(f, "PAYE"),
            TaxType::Uif => write!(f, "UIF"),
            TaxType::Sdl => write!(f, "SDL"),
            TaxType::DividendsTax => write!(f, "Dividends Tax"),
            TaxType::CapitalGains => write!(f, "Capital Gains"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VatReturn {
    pub id: Uuid,
    pub business_id: Uuid,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub total_sales: Money,
    pub total_purchases: Money,
    pub vat_on_sales: Money,
    pub vat_on_purchases: Money,
    pub net_vat_due: Money,
    pub is_submitted: bool,
    pub submission_date: Option<DateTime<Utc>>,
    pub sars_reference: Option<String>,
    pub penalties: Money,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialStatement {
    pub id: Uuid,
    pub business_id: Uuid,
    pub statement_type: StatementType,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub total_revenue: Money,
    pub total_expenses: Money,
    pub net_profit: Money,
    pub total_assets: Money,
    pub total_liabilities: Money,
    pub equity: Money,
    pub cash_flow_operating: Money,
    pub cash_flow_investing: Money,
    pub cash_flow_financing: Money,
    pub drrt_coherence: f64,
    pub is_audited: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StatementType {
    IncomeStatement,
    BalanceSheet,
    CashFlowStatement,
    TrialBalance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrrtNode {
    pub id: Uuid,
    pub entity_type: DrrtEntityType,
    pub entity_id: Uuid,
    pub label: String,
    pub activation: f64,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DrrtEntityType {
    Transaction,
    Account,
    Customer,
    Supplier,
    Invoice,
    TaxRecord,
    VatReturn,
    FinancialStatement,
    Dimension,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrrtRelationship {
    pub id: Uuid,
    pub source_node_id: Uuid,
    pub target_node_id: Uuid,
    pub weight: f64,
    pub relation_type: String,
    pub sign: f64,
    pub drrt_coherence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CashFlowForecast {
    pub id: Uuid,
    pub business_id: Uuid,
    pub forecast_date: DateTime<Utc>,
    pub projected_balance: Money,
    pub confidence: f64,
    pub drrt_coherence_at_forecast: f64,
    pub scenarios: Vec<CashFlowScenario>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CashFlowScenario {
    pub scenario_type: ScenarioType,
    pub projected_balance: Money,
    pub probability: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScenarioType {
    Optimistic,
    Base,
    Pessimistic,
    StressTest,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgrammableRule {
    pub id: Uuid,
    pub business_id: Uuid,
    pub account_id: Uuid,
    pub name: String,
    pub description: String,
    pub rule_type: RuleType,
    pub condition: serde_json::Value,
    pub action: serde_json::Value,
    pub is_active: bool,
    pub approval_required: bool,
    pub approved_by: Option<Uuid>,
    pub drrt_coherence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleType {
    TaxReserve,
    AutoPayment,
    SavingsRule,
    SpendingLimit,
    CashFlowProtection,
    VatAllocation,
}
