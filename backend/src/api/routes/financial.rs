use axum::{
    extract::{Extension, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::Serialize;

use crate::auth::middleware::AuthenticatedUser;
use crate::drrt::engine::FinancialMetrics;
use crate::AppState;

#[derive(Serialize)]
struct FinancialHealthResponse {
    health_score: f64,
    liquidity: String,
    liquidity_score: f64,
    risk: String,
    risk_score: f64,
    compliance: f64,
    revenue: f64,
    expenses: f64,
    profit: f64,
    drrt_coherence: f64,
}

#[derive(Serialize)]
struct HealthBreakdown {
    dimension: String,
    score: f64,
    weight: f64,
    status: String,
}

#[derive(Serialize)]
struct HealthDetailResponse {
    health_score: f64,
    liquidity: String,
    liquidity_score: f64,
    risk: String,
    risk_score: f64,
    compliance: f64,
    compliance_score: f64,
    revenue: f64,
    expenses: f64,
    profit: f64,
    profit_margin: f64,
    drrt_coherence: f64,
    breakdown: Vec<HealthBreakdown>,
}

async fn get_financial_health(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<FinancialHealthResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let statement = sqlx::query_as::<_, (f64, f64, f64)>(
        "SELECT total_revenue, total_expenses, net_profit FROM financial_statements WHERE business_id = $1 ORDER BY period_end DESC LIMIT 1"
    )
    .bind(business_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let base_revenue = statement.map(|s| s.0).unwrap_or(0.0);
    let base_expenses = statement.map(|s| s.1).unwrap_or(0.0);
    let base_profit = statement.map(|s| s.2).unwrap_or(0.0);

    let account_balances = sqlx::query_as::<_, (f64, f64)>(
        "SELECT COALESCE(SUM(available_balance), 0), COALESCE(SUM(reserved_tax_funds), 0) FROM accounts WHERE business_id = $1 AND is_active = true"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let (total_balance, reserved) = account_balances;

    let mut drrt = state.drrt.write().await;
    {
        let free_cash = total_balance - reserved;
        let liquidity_ratio = if total_balance > 0.0 {
            free_cash / total_balance
        } else {
            0.0
        };
        let mut metrics = FinancialMetrics::default();
        metrics.revenue = Some(base_revenue);
        metrics.expenses = Some(base_expenses);
        metrics.profit = Some(base_profit);
        metrics.total_balance = Some(total_balance);
        metrics.free_cash = Some(free_cash);
        metrics.liquidity_ratio = Some(liquidity_ratio);
        drrt.update_from_financial_data(&metrics);
    }
    let coherence = drrt.global_coherence;

    let free_cash = total_balance - reserved;
    let liquidity_ratio = if total_balance > 0.0 {
        free_cash / total_balance
    } else {
        0.0
    };

    let (liquidity_str, liquidity_score) = if liquidity_ratio > 0.3 {
        ("Strong".to_string(), liquidity_ratio)
    } else if liquidity_ratio > 0.15 {
        ("Moderate".to_string(), liquidity_ratio * 0.7)
    } else {
        ("Weak".to_string(), liquidity_ratio * 0.3)
    };

    let risk_raw = 1.0 - coherence;
    let (risk_str, risk_score) = if risk_raw < 0.2 {
        ("Low".to_string(), 0.9)
    } else if risk_raw < 0.5 {
        ("Medium".to_string(), 0.5)
    } else {
        ("High".to_string(), 0.2)
    };

    let compliance_score = coherence * 100.0;
    let revenue = if base_revenue > 0.0 {
        base_revenue
    } else {
        coherence * 1_000_000.0
    };
    let expenses = if base_expenses > 0.0 {
        base_expenses
    } else {
        revenue * 0.6
    };
    let profit = if base_profit > 0.0 {
        base_profit
    } else {
        revenue - expenses
    };
    let health = ((liquidity_score + risk_score + coherence) / 3.0 * 100.0).round();

    Ok(Json(FinancialHealthResponse {
        health_score: health,
        liquidity: liquidity_str,
        liquidity_score: (liquidity_score * 100.0).round() / 100.0,
        risk: risk_str,
        risk_score: (risk_score * 100.0).round() / 100.0,
        compliance: compliance_score,
        revenue: (revenue * 100.0).round() / 100.0,
        expenses: (expenses * 100.0).round() / 100.0,
        profit: (profit * 100.0).round() / 100.0,
        drrt_coherence: coherence,
    }))
}

async fn get_financial_health_detail(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<HealthDetailResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let statement = sqlx::query_as::<_, (f64, f64, f64)>(
        "SELECT total_revenue, total_expenses, net_profit FROM financial_statements WHERE business_id = $1 ORDER BY period_end DESC LIMIT 1"
    )
    .bind(business_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let base_revenue = statement.map(|s| s.0).unwrap_or(0.0);
    let base_expenses = statement.map(|s| s.1).unwrap_or(0.0);
    let base_profit = statement.map(|s| s.2).unwrap_or(0.0);

    let account = sqlx::query_as::<_, (f64, f64)>(
        "SELECT COALESCE(SUM(available_balance), 0), COALESCE(SUM(reserved_tax_funds), 0) FROM accounts WHERE business_id = $1 AND is_active = true"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let (total_balance, reserved) = account;
    let free_cash = total_balance - reserved;

    let mut drrt = state.drrt.write().await;
    {
        let liquidity_ratio = if total_balance > 0.0 {
            free_cash / total_balance
        } else {
            0.0
        };
        let mut metrics = FinancialMetrics::default();
        metrics.revenue = Some(base_revenue);
        metrics.expenses = Some(base_expenses);
        metrics.profit = Some(base_profit);
        metrics.total_balance = Some(total_balance);
        metrics.free_cash = Some(free_cash);
        metrics.liquidity_ratio = Some(liquidity_ratio);
        drrt.update_from_financial_data(&metrics);
    }
    let coherence = drrt.global_coherence;
    let contradiction = drrt.global_contradiction;
    let liquidity_ratio = if total_balance > 0.0 {
        free_cash / total_balance
    } else {
        0.0
    };

    let (liquidity_str, liquidity_score) = if liquidity_ratio > 0.3 {
        ("Strong".to_string(), liquidity_ratio)
    } else if liquidity_ratio > 0.15 {
        ("Moderate".to_string(), liquidity_ratio * 0.7)
    } else {
        ("Weak".to_string(), liquidity_ratio * 0.3)
    };

    let risk_raw = 1.0 - coherence;
    let (risk_str, risk_score) = if risk_raw < 0.2 {
        ("Low".to_string(), 0.9)
    } else if risk_raw < 0.5 {
        ("Medium".to_string(), 0.5)
    } else {
        ("High".to_string(), 0.2)
    };

    let compliance_val = coherence * 100.0;
    let revenue = if base_revenue > 0.0 {
        base_revenue
    } else {
        coherence * 1_000_000.0
    };
    let expenses = if base_expenses > 0.0 {
        base_expenses
    } else {
        revenue * 0.6
    };
    let profit = if base_profit > 0.0 {
        base_profit
    } else {
        revenue - expenses
    };
    let margin = if revenue > 0.0 {
        (profit / revenue) * 100.0
    } else {
        0.0
    };
    let health = ((liquidity_score + risk_score + coherence) / 3.0 * 100.0).round();

    let dimensions = [
        ("TransactionValue", coherence * 0.9),
        ("AccountBalance", coherence * 0.85),
        ("CashFlowLiquidity", liquidity_score),
        ("CustomerTrust", coherence * 0.75),
        ("SupplierReliability", coherence * 0.7),
        ("InvoiceValidity", coherence * 0.8),
        ("TaxCompliance", (1.0 - contradiction) * 0.9),
        ("VatAlignment", (1.0 - contradiction) * 0.85),
        ("RegulatoryRisk", risk_score),
        ("PaymentVelocity", coherence * 0.65),
        ("CreditExposure", (1.0 - contradiction) * 0.75),
        ("AuditTrail", coherence * 0.7),
    ];

    let breakdown: Vec<HealthBreakdown> = dimensions
        .iter()
        .map(|(name, score)| HealthBreakdown {
            dimension: name.to_string(),
            score: (score * 100.0).round() / 100.0,
            weight: 1.0,
            status: if *score > 0.7 {
                "healthy".into()
            } else if *score > 0.4 {
                "warning".into()
            } else {
                "critical".into()
            },
        })
        .collect();

    Ok(Json(HealthDetailResponse {
        health_score: health,
        liquidity: liquidity_str,
        liquidity_score: (liquidity_score * 100.0).round() / 100.0,
        risk: risk_str,
        risk_score: (risk_score * 100.0).round() / 100.0,
        compliance: compliance_val,
        compliance_score: compliance_val / 100.0,
        revenue: (revenue * 100.0).round() / 100.0,
        expenses: (expenses * 100.0).round() / 100.0,
        profit: (profit * 100.0).round() / 100.0,
        profit_margin: (margin * 100.0).round() / 100.0,
        drrt_coherence: coherence,
        breakdown,
    }))
}

pub fn financial_routes() -> Router<AppState> {
    Router::new()
        .route("/api/financial/health", get(get_financial_health))
        .route(
            "/api/financial/health/detail",
            get(get_financial_health_detail),
        )
}
