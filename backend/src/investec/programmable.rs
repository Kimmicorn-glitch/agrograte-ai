use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Investec Programmable Banking rule engine
/// Allows creation and management of programmable banking rules
/// that execute automatically based on conditions
pub struct ProgrammableBanking;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankingRule {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub account_id: String,
    pub event_type: RuleEventType,
    pub conditions: Vec<RuleCondition>,
    pub actions: Vec<RuleAction>,
    pub is_active: bool,
    pub requires_approval: bool,
    pub drrt_coherence_score: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleEventType {
    TransactionPosted,
    BalanceThreshold,
    DailySummary,
    WeeklySummary,
    MonthlySummary,
    TaxDeadline,
    VatPeriodEnd,
    InvoiceDue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleCondition {
    pub field: String,
    pub operator: ComparisonOperator,
    pub value: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComparisonOperator {
    Equals,
    GreaterThan,
    LessThan,
    GreaterOrEqual,
    LessOrEqual,
    Contains,
    Between,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleAction {
    TransferToSavings {
        account_id: String,
        amount_expression: String,
    },
    ReserveTaxFunds {
        percentage: f64,
    },
    Notify {
        channel: NotificationChannel,
    },
    BlockTransaction {
        reason: String,
    },
    CategorizeTransaction {
        category: String,
    },
    CreateApprovalWorkflow {
        approvers: Vec<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationChannel {
    Email,
    Sms,
    Push,
    Dashboard,
}

impl ProgrammableBanking {
    pub fn validate_rule(rule: &BankingRule) -> Result<(), String> {
        if rule.name.is_empty() {
            return Err("Rule name cannot be empty".to_string());
        }
        if rule.conditions.is_empty() {
            return Err("Rule must have at least one condition".to_string());
        }
        if rule.actions.is_empty() {
            return Err("Rule must have at least one action".to_string());
        }
        Ok(())
    }

    /// Evaluate whether a transaction triggers a given rule
    pub fn evaluate_rule(rule: &BankingRule, transaction: &serde_json::Value) -> bool {
        rule.conditions.iter().all(|condition| {
            let field_value = transaction.get(&condition.field);
            match field_value {
                Some(val) => Self::compare(val, &condition.operator, &condition.value),
                None => false,
            }
        })
    }

    fn compare(
        actual: &serde_json::Value,
        operator: &ComparisonOperator,
        expected: &serde_json::Value,
    ) -> bool {
        match operator {
            ComparisonOperator::Equals => actual == expected,
            ComparisonOperator::GreaterThan => actual
                .as_f64()
                .zip(expected.as_f64())
                .map(|(a, e)| a > e)
                .unwrap_or(false),
            ComparisonOperator::LessThan => actual
                .as_f64()
                .zip(expected.as_f64())
                .map(|(a, e)| a < e)
                .unwrap_or(false),
            ComparisonOperator::GreaterOrEqual => actual
                .as_f64()
                .zip(expected.as_f64())
                .map(|(a, e)| a >= e)
                .unwrap_or(false),
            ComparisonOperator::LessOrEqual => actual
                .as_f64()
                .zip(expected.as_f64())
                .map(|(a, e)| a <= e)
                .unwrap_or(false),
            ComparisonOperator::Contains => actual
                .as_str()
                .zip(expected.as_str())
                .map(|(a, e)| a.contains(e))
                .unwrap_or(false),
            ComparisonOperator::Between => false,
        }
    }
}
