#![allow(dead_code)]

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::{FinancialStatement, StatementType};
use crate::domain::value_objects::Money;
use crate::sars::compliance::ComplianceReport;

/// SARS-compliant financial statement generation
/// Produces income statements, balance sheets, and cash flow statements
/// that meet South African GAAP and IFRS standards
pub struct FinancialReporting;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnnualFinancialStatements {
    pub business_id: Uuid,
    pub financial_year_start: DateTime<Utc>,
    pub financial_year_end: DateTime<Utc>,
    pub income_statement: FinancialStatement,
    pub balance_sheet: FinancialStatement,
    pub cash_flow: FinancialStatement,
    pub compliance_report: ComplianceReport,
    pub drrt_coherence: f64,
    pub is_audit_ready: bool,
}

impl FinancialReporting {
    pub fn generate_income_statement(
        business_id: Uuid,
        revenue: Money,
        cost_of_sales: Money,
        operating_expenses: Money,
        tax_expense: Money,
        period_start: DateTime<Utc>,
        period_end: DateTime<Utc>,
    ) -> FinancialStatement {
        let gross_profit = revenue.clone() - cost_of_sales.clone();
        let net_profit = gross_profit - operating_expenses.clone() - tax_expense.clone();

        FinancialStatement {
            id: Uuid::new_v4(),
            business_id,
            statement_type: StatementType::IncomeStatement,
            period_start,
            period_end,
            total_revenue: revenue,
            total_expenses: cost_of_sales + operating_expenses + tax_expense,
            net_profit,
            total_assets: Money::zar(0.0),
            total_liabilities: Money::zar(0.0),
            equity: Money::zar(0.0),
            cash_flow_operating: Money::zar(0.0),
            cash_flow_investing: Money::zar(0.0),
            cash_flow_financing: Money::zar(0.0),
            drrt_coherence: 0.0,
            is_audited: false,
        }
    }

    pub fn generate_balance_sheet(
        business_id: Uuid,
        assets: Money,
        liabilities: Money,
        equity: Money,
        period_start: DateTime<Utc>,
        period_end: DateTime<Utc>,
    ) -> FinancialStatement {
        FinancialStatement {
            id: Uuid::new_v4(),
            business_id,
            statement_type: StatementType::BalanceSheet,
            period_start,
            period_end,
            total_revenue: Money::zar(0.0),
            total_expenses: Money::zar(0.0),
            net_profit: Money::zar(0.0),
            total_assets: assets,
            total_liabilities: liabilities,
            equity,
            cash_flow_operating: Money::zar(0.0),
            cash_flow_investing: Money::zar(0.0),
            cash_flow_financing: Money::zar(0.0),
            drrt_coherence: 0.0,
            is_audited: false,
        }
    }

    pub fn generate_cash_flow(
        business_id: Uuid,
        operating: Money,
        investing: Money,
        financing: Money,
        period_start: DateTime<Utc>,
        period_end: DateTime<Utc>,
    ) -> FinancialStatement {
        FinancialStatement {
            id: Uuid::new_v4(),
            business_id,
            statement_type: StatementType::CashFlowStatement,
            period_start,
            period_end,
            total_revenue: Money::zar(0.0),
            total_expenses: Money::zar(0.0),
            net_profit: Money::zar(0.0),
            total_assets: Money::zar(0.0),
            total_liabilities: Money::zar(0.0),
            equity: Money::zar(0.0),
            cash_flow_operating: operating,
            cash_flow_investing: investing,
            cash_flow_financing: financing,
            drrt_coherence: 0.0,
            is_audited: false,
        }
    }
}
