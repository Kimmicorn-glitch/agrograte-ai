use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    routing::{delete, get, put},
    Json, Router,
};
use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;

use crate::auth::middleware::AuthenticatedUser;
use crate::investec::programmable::{
    BankingRule, ProgrammableBanking, RuleAction, RuleCondition, RuleEventType,
};
use crate::repositories;
use crate::AppState;

#[derive(Deserialize)]
struct CreateRuleRequest {
    name: String,
    description: String,
    account_id: String,
    event_type: String,
    conditions: Vec<RuleCondition>,
    actions: Vec<RuleAction>,
    requires_approval: bool,
}

async fn list_rules(
    State(state): State<AppState>,
) -> Result<Json<Vec<BankingRule>>, (StatusCode, Json<serde_json::Value>)> {
    repositories::rules::list_rules(&state.pool)
        .await
        .map(Json)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })
}

async fn create_rule(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Json(req): Json<CreateRuleRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let event_type = match req.event_type.to_lowercase().as_str() {
        "transaction_posted" => RuleEventType::TransactionPosted,
        "balance_threshold" => RuleEventType::BalanceThreshold,
        "daily_summary" => RuleEventType::DailySummary,
        "weekly_summary" => RuleEventType::WeeklySummary,
        "monthly_summary" => RuleEventType::MonthlySummary,
        "tax_deadline" => RuleEventType::TaxDeadline,
        "vat_period_end" => RuleEventType::VatPeriodEnd,
        "invoice_due" => RuleEventType::InvoiceDue,
        _ => {
            return Err((
                StatusCode::UNPROCESSABLE_ENTITY,
                Json(
                    serde_json::json!({"error": "Unknown event type", "code": "VALIDATION_ERROR"}),
                ),
            ))
        }
    };

    let drrt = state.drrt.read().await;
    let rule = BankingRule {
        id: Uuid::new_v4(),
        name: req.name,
        description: req.description,
        account_id: req.account_id,
        event_type,
        conditions: req.conditions,
        actions: req.actions,
        is_active: true,
        requires_approval: req.requires_approval,
        drrt_coherence_score: drrt.global_coherence,
        created_at: Utc::now(),
    };

    if let Err(e) = ProgrammableBanking::validate_rule(&rule) {
        return Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(serde_json::json!({"error": e, "code": "VALIDATION_ERROR"})),
        ));
    }

    repositories::rules::create_rule(&state.pool, &rule, user.business_id.unwrap_or_default())
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;

    let audit_payload = serde_json::json!({"rule_id": rule.id, "name": rule.name});
    repositories::audit::insert_event(
        &state.pool,
        user.user_id,
        "rule_created",
        "programmable_rule",
        Some(rule.id),
        Some(audit_payload),
    )
    .await
    .ok();

    Ok(Json(serde_json::json!({"success": true, "rule": rule})))
}

async fn toggle_rule(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let is_active = repositories::rules::toggle_rule(&state.pool, id)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(serde_json::json!({"error": "Rule not found", "code": "NOT_FOUND"})),
            )
        })?;

    let action = if is_active { "rule_activated" } else { "rule_deactivated" };
    repositories::audit::insert_event(
        &state.pool,
        user.user_id,
        action,
        "programmable_rule",
        Some(id),
        Some(serde_json::json!({"rule_id": id, "is_active": is_active})),
    )
    .await
    .ok();

    Ok(Json(serde_json::json!({"success": true, "is_active": is_active})))
}

async fn delete_rule(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let deleted = repositories::rules::delete_rule(&state.pool, id)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;

    if deleted {
        let audit_payload = serde_json::json!({"rule_id": id});
        repositories::audit::insert_event(
            &state.pool,
            user.user_id,
            "rule_deleted",
            "programmable_rule",
            Some(id),
            Some(audit_payload),
        )
        .await
        .ok();

        Ok(Json(serde_json::json!({"success": true})))
    } else {
        Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "Rule not found", "code": "NOT_FOUND"})),
        ))
    }
}

pub fn banking_routes() -> Router<AppState> {
    Router::new()
        .route("/api/banking/rules", get(list_rules).post(create_rule))
        .route("/api/banking/rules/{id}/toggle", put(toggle_rule))
        .route("/api/banking/rules/{id}", delete(delete_rule))
}
