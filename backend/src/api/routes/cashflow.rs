use axum::{
    extract::{Extension, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::Serialize;

use crate::auth::middleware::AuthenticatedUser;
use crate::cashflow::forecasting::{CashFlowForecaster, ForecastConfig};
use crate::domain::models::{Transaction, TransactionStatus, TransactionType};
use crate::domain::value_objects::Money;
use crate::drrt::engine::FinancialMetrics;
use crate::AppState;

#[derive(Serialize)]
struct CashFlowForecastResponse {
    projected_balance: f64,
    confidence: f64,
    drrt_coherence: f64,
    avg_daily_inflow: f64,
    avg_daily_outflow: f64,
    inflow_volatility: f64,
    outflow_volatility: f64,
    scenarios: Vec<ScenarioResponse>,
    forecast_date: String,
}

#[derive(Serialize)]
struct ScenarioResponse {
    scenario_type: String,
    projected_balance: f64,
    probability: f64,
}

async fn get_cashflow_forecast(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<CashFlowForecastResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();
    let config = ForecastConfig::default();

    let txn_rows = sqlx::query_as::<_, TransactionRow>(
        "SELECT id, account_id, amount, balance, description, category, transaction_type, status, posted_at FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE business_id = $1) AND posted_at >= NOW() - INTERVAL '90 days' ORDER BY posted_at DESC"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let balance_row = sqlx::query_as::<_, (f64,)>(
        "SELECT COALESCE(SUM(available_balance), 0) FROM accounts WHERE business_id = $1 AND is_active = true"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let current_balance = balance_row.0;
    let transactions: Vec<Transaction> = txn_rows.into_iter().map(|r| r.into()).collect();

    let mut drrt = state.drrt.write().await;
    {
        let total_volume: f64 = transactions.iter().map(|t| t.amount.amount.abs()).sum();
        let pending_count = transactions
            .iter()
            .filter(|t| matches!(t.status, TransactionStatus::Pending))
            .count();
        let posted_count = transactions
            .iter()
            .filter(|t| matches!(t.status, TransactionStatus::Posted))
            .count();
        let pending_ratio = if transactions.is_empty() {
            0.0
        } else {
            pending_count as f64 / transactions.len() as f64
        };
        let success_ratio = if transactions.is_empty() {
            0.0
        } else {
            posted_count as f64 / transactions.len() as f64
        };
        let metrics = FinancialMetrics {
            total_balance: Some(current_balance),
            transaction_volume_90d: Some(total_volume),
            transaction_count_90d: Some(transactions.len() as f64),
            pending_transaction_ratio: Some(pending_ratio),
            successful_transaction_ratio: Some(success_ratio),
            ..Default::default()
        };
        drrt.update_from_financial_data(&metrics);
    }
    let forecast = CashFlowForecaster::forecast(
        business_id,
        &transactions,
        Money::zar(current_balance),
        &drrt,
        &config,
    );

    let scenarios: Vec<ScenarioResponse> = forecast
        .scenarios
        .into_iter()
        .map(|s| ScenarioResponse {
            scenario_type: format!("{:?}", s.scenario_type),
            projected_balance: s.projected_balance.amount,
            probability: s.probability,
        })
        .collect();

    let now = chrono::Utc::now();
    let cutoff = now - chrono::Duration::days(config.historical_days);
    let recent: Vec<&Transaction> = transactions
        .iter()
        .filter(|t| t.posted_at >= cutoff)
        .collect();
    let avg_in = if recent.is_empty() {
        0.0
    } else {
        let total: f64 = recent
            .iter()
            .filter(|t| {
                matches!(
                    t.transaction_type,
                    TransactionType::Credit | TransactionType::Payment | TransactionType::Refund
                )
            })
            .map(|t| t.amount.amount.abs())
            .sum();
        total / config.historical_days as f64
    };
    let avg_out = if recent.is_empty() {
        0.0
    } else {
        let total: f64 = recent
            .iter()
            .filter(|t| {
                matches!(
                    t.transaction_type,
                    TransactionType::Debit | TransactionType::Fee
                )
            })
            .map(|t| t.amount.amount.abs())
            .sum();
        total / config.historical_days as f64
    };

    Ok(Json(CashFlowForecastResponse {
        projected_balance: forecast.projected_balance.amount,
        confidence: forecast.confidence,
        drrt_coherence: forecast.drrt_coherence_at_forecast,
        avg_daily_inflow: (avg_in * 100.0).round() / 100.0,
        avg_daily_outflow: (avg_out * 100.0).round() / 100.0,
        inflow_volatility: CashFlowForecaster::flow_volatility(&recent, true),
        outflow_volatility: CashFlowForecaster::flow_volatility(&recent, false),
        scenarios,
        forecast_date: forecast.forecast_date.to_rfc3339(),
    }))
}

async fn get_cashflow_detail(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();
    let config = ForecastConfig::default();

    let txn_rows = sqlx::query_as::<_, TransactionRow>(
        "SELECT id, account_id, amount, balance, description, category, transaction_type, status, posted_at FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE business_id = $1) AND posted_at >= NOW() - INTERVAL '90 days'"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let balance_row = sqlx::query_as::<_, (f64,)>(
        "SELECT COALESCE(SUM(available_balance), 0) FROM accounts WHERE business_id = $1 AND is_active = true"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let transactions: Vec<Transaction> = txn_rows.into_iter().map(|r| r.into()).collect();
    let mut drrt = state.drrt.write().await;
    {
        let total_volume: f64 = transactions.iter().map(|t| t.amount.amount.abs()).sum();
        let pending_count = transactions
            .iter()
            .filter(|t| matches!(t.status, TransactionStatus::Pending))
            .count();
        let posted_count = transactions
            .iter()
            .filter(|t| matches!(t.status, TransactionStatus::Posted))
            .count();
        let metrics = FinancialMetrics {
            total_balance: Some(balance_row.0),
            transaction_volume_90d: Some(total_volume),
            transaction_count_90d: Some(transactions.len() as f64),
            pending_transaction_ratio: Some(if transactions.is_empty() {
                0.0
            } else {
                pending_count as f64 / transactions.len() as f64
            }),
            successful_transaction_ratio: Some(if transactions.is_empty() {
                0.0
            } else {
                posted_count as f64 / transactions.len() as f64
            }),
            ..Default::default()
        };
        drrt.update_from_financial_data(&metrics);
    }
    let forecast = CashFlowForecaster::forecast(
        business_id,
        &transactions,
        Money::zar(balance_row.0),
        &drrt,
        &config,
    );

    Ok(Json(serde_json::json!({
        "forecast_date": forecast.forecast_date.to_rfc3339(),
        "projected_balance": forecast.projected_balance.amount,
        "confidence": forecast.confidence,
        "drrt_coherence": forecast.drrt_coherence_at_forecast,
        "scenarios": forecast.scenarios.into_iter().map(|s| serde_json::json!({
            "type": format!("{:?}", s.scenario_type),
            "balance": s.projected_balance.amount,
            "probability": s.probability,
        })).collect::<Vec<_>>(),
        "historical_period_days": config.historical_days,
        "forecast_period_days": config.forecast_days,
        "total_transactions": transactions.len(),
    })))
}

async fn get_tax_reserve(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();
    let drrt = state.drrt.read().await;

    let vat_total = sqlx::query_scalar::<_, Option<f64>>(
        "SELECT SUM(vat_amount) FROM invoices WHERE business_id = $1 AND status = 'paid'",
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
        )
    })?
    .unwrap_or(0.0);

    let reserved = sqlx::query_scalar::<_, Option<f64>>(
        "SELECT SUM(reserved_tax_funds) FROM accounts WHERE business_id = $1 AND is_active = true",
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
        )
    })?
    .unwrap_or(0.0);

    let income_tax_est = vat_total * 0.28;

    Ok(Json(serde_json::json!({
        "estimated_vat_liability": vat_total,
        "estimated_income_tax": income_tax_est,
        "total_reserve_required": vat_total + income_tax_est,
        "current_reserve_balance": reserved,
        "drrt_confidence": drrt.global_coherence,
        "reserve_gap": (vat_total + income_tax_est - reserved).max(0.0),
    })))
}

pub fn cashflow_routes() -> Router<AppState> {
    Router::new()
        .route("/api/cashflow/forecast", get(get_cashflow_forecast))
        .route("/api/cashflow/detail", get(get_cashflow_detail))
        .route("/api/cashflow/tax-reserve", get(get_tax_reserve))
}

#[derive(sqlx::FromRow)]
struct TransactionRow {
    id: uuid::Uuid,
    account_id: uuid::Uuid,
    amount: f64,
    balance: f64,
    description: String,
    category: Option<String>,
    transaction_type: String,
    status: String,
    posted_at: chrono::DateTime<chrono::Utc>,
}

impl From<TransactionRow> for Transaction {
    fn from(r: TransactionRow) -> Self {
        Transaction {
            id: r.id,
            account_id: r.account_id,
            transaction_id: r.id.to_string(),
            amount: Money::zar(r.amount),
            balance: Money::zar(r.balance),
            description: r.description,
            category: r.category,
            transaction_type: match r.transaction_type.to_lowercase().as_str() {
                "credit" | "deposit" => TransactionType::Credit,
                "debit" | "withdrawal" => TransactionType::Debit,
                "payment" => TransactionType::Payment,
                "refund" => TransactionType::Refund,
                "fee" => TransactionType::Fee,
                "interest" => TransactionType::Interest,
                "transfer" => TransactionType::Transfer,
                _ => TransactionType::Debit,
            },
            status: match r.status.to_lowercase().as_str() {
                "pending" => TransactionStatus::Pending,
                "reversed" => TransactionStatus::Reversed,
                "failed" => TransactionStatus::Posted,
                _ => TransactionStatus::Posted,
            },
            posted_at: r.posted_at,
            created_at: r.posted_at,
        }
    }
}
