use sqlx::PgPool;
use uuid::Uuid;

use crate::investec::programmable::{BankingRule, RuleAction, RuleCondition, RuleEventType};

pub async fn list_rules(pool: &PgPool) -> Result<Vec<BankingRule>, sqlx::Error> {
    let rows = sqlx::query_as::<_, RuleRow>(
        "SELECT id, name, description, account_id, rule_type, condition, action, is_active, approval_required, drrt_coherence, created_at FROM programmable_rules ORDER BY created_at DESC",
    )
    .fetch_all(pool)
    .await?;

    rows.into_iter()
        .map(|r| r.try_into_banking_rule())
        .collect()
}

pub async fn create_rule(
    pool: &PgPool,
    rule: &BankingRule,
    business_id: Uuid,
) -> Result<(), sqlx::Error> {
    let event_type_str = format!("{:?}", rule.event_type);
    let conditions_json = serde_json::to_value(&rule.conditions).unwrap_or_default();
    let actions_json = serde_json::to_value(&rule.actions).unwrap_or_default();

    sqlx::query(
        "INSERT INTO programmable_rules (id, business_id, account_id, name, description, rule_type, condition, action, is_active, approval_required, drrt_coherence, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
    )
    .bind(rule.id)
    .bind(business_id)
    .bind(Uuid::parse_str(&rule.account_id).unwrap_or(Uuid::nil()))
    .bind(&rule.name)
    .bind(&rule.description)
    .bind(&event_type_str)
    .bind(&conditions_json)
    .bind(&actions_json)
    .bind(rule.is_active)
    .bind(rule.requires_approval)
    .bind(rule.drrt_coherence_score)
    .bind(rule.created_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn get_rule(pool: &PgPool, id: Uuid) -> Result<Option<BankingRule>, sqlx::Error> {
    let row = sqlx::query_as::<_, RuleRow>(
        "SELECT id, name, description, account_id, rule_type, condition, action, is_active, approval_required, drrt_coherence, created_at FROM programmable_rules WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    row.map(|r| r.try_into_banking_rule()).transpose()
}

pub async fn toggle_rule(pool: &PgPool, id: Uuid) -> Result<Option<bool>, sqlx::Error> {
    let row = sqlx::query_scalar::<_, bool>(
        "UPDATE programmable_rules SET is_active = NOT is_active WHERE id = $1 RETURNING is_active",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(row)
}

pub async fn delete_rule(pool: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM programmable_rules WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

#[derive(sqlx::FromRow)]
struct RuleRow {
    id: Uuid,
    name: String,
    description: Option<String>,
    account_id: Option<Uuid>,
    rule_type: Option<String>,
    condition: Option<serde_json::Value>,
    action: Option<serde_json::Value>,
    is_active: bool,
    approval_required: bool,
    drrt_coherence: f64,
    created_at: chrono::DateTime<chrono::Utc>,
}

impl RuleRow {
    fn try_into_banking_rule(self) -> Result<BankingRule, sqlx::Error> {
        let event_type = match self.rule_type.as_deref() {
            Some("TransactionPosted") => RuleEventType::TransactionPosted,
            Some("BalanceThreshold") => RuleEventType::BalanceThreshold,
            Some("DailySummary") => RuleEventType::DailySummary,
            Some("WeeklySummary") => RuleEventType::WeeklySummary,
            Some("MonthlySummary") => RuleEventType::MonthlySummary,
            Some("TaxDeadline") => RuleEventType::TaxDeadline,
            Some("VatPeriodEnd") => RuleEventType::VatPeriodEnd,
            Some("InvoiceDue") => RuleEventType::InvoiceDue,
            _ => RuleEventType::TransactionPosted,
        };

        let conditions = self
            .condition
            .and_then(|c| serde_json::from_value::<Vec<RuleCondition>>(c).ok())
            .unwrap_or_default();

        let actions = self
            .action
            .and_then(|a| serde_json::from_value::<Vec<RuleAction>>(a).ok())
            .unwrap_or_default();

        Ok(BankingRule {
            id: self.id,
            name: self.name,
            description: self.description.unwrap_or_default(),
            account_id: self.account_id.map(|id| id.to_string()).unwrap_or_default(),
            event_type,
            conditions,
            actions,
            is_active: self.is_active,
            requires_approval: self.approval_required,
            drrt_coherence_score: self.drrt_coherence,
            created_at: self.created_at,
        })
    }
}
