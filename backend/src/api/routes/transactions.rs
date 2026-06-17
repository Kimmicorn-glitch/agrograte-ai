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
struct CategoryBreakdown {
    category: String,
    count: u32,
    total_amount: f64,
    percentage: f64,
}

#[derive(Serialize)]
struct PatternInfo {
    pattern_type: String,
    frequency: u64,
    confidence: f64,
    last_observed: u64,
}

#[derive(Serialize)]
struct AnomalyInfo {
    anomaly_type: String,
    severity: String,
    coherence: f64,
    contradiction: f64,
    description: String,
}

#[derive(Serialize)]
struct TransactionIntelligenceResponse {
    categories: Vec<CategoryBreakdown>,
    patterns: Vec<PatternInfo>,
    anomalies: Vec<AnomalyInfo>,
    drrt_coherence: f64,
}

async fn get_transaction_intelligence(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<TransactionIntelligenceResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();
    let mut drrt = state.drrt.write().await;

    let cat_rows = sqlx::query_as::<_, (String, i64, f64)>(
        "SELECT COALESCE(category, 'Uncategorized') as category, COUNT(*) as count, COALESCE(SUM(ABS(amount)), 0) as total FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE business_id = $1) GROUP BY category ORDER BY total DESC"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let grand_total: f64 = cat_rows.iter().map(|r| r.2).sum();
    let total_count: i64 = cat_rows.iter().map(|r| r.1).sum();

    let categories: Vec<CategoryBreakdown> = cat_rows.into_iter().map(|(cat, count, total)| CategoryBreakdown {
        category: cat,
        count: count as u32,
        total_amount: (total * 100.0).round() / 100.0,
        percentage: if grand_total > 0.0 { (total / grand_total * 100.0 * 100.0).round() / 100.0 } else { 0.0 },
    }).collect();

    {
        let mut metrics = FinancialMetrics::default();
        metrics.transaction_volume_90d = Some(grand_total);
        metrics.transaction_count_90d = Some(total_count as f64);
        drrt.update_from_financial_data(&metrics);
    }

    let patterns: Vec<PatternInfo> = drrt.memory.pattern_memory.iter().map(|p| PatternInfo {
        pattern_type: format!("{:?}", p.pattern_type),
        frequency: p.frequency,
        confidence: p.confidence,
        last_observed: p.last_observed,
    }).collect();

    let status = drrt.check_collapse();
    let coherence = drrt.global_coherence;
    let contradiction = drrt.global_contradiction;
    let severity = if coherence < 0.3 { "critical".to_string() } else if coherence < 0.5 { "warning".to_string() } else { "normal".to_string() };

    let anomalies = if categories.is_empty() && patterns.is_empty() {
        vec![AnomalyInfo {
            anomaly_type: "NoData".into(),
            severity: "warning".into(),
            coherence,
            contradiction,
            description: "No transaction data available for analysis".into(),
        }]
    } else {
        vec![AnomalyInfo {
            anomaly_type: format!("{:?}", status),
            severity,
            coherence,
            contradiction,
            description: format!("Collapse status: {:?}, Coherence: {:.3}", status, coherence),
        }]
    };

    Ok(Json(TransactionIntelligenceResponse {
        categories,
        patterns,
        anomalies,
        drrt_coherence: coherence,
    }))
}

async fn get_categories(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<Vec<CategoryBreakdown>>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let rows = sqlx::query_as::<_, (String, i64, f64)>(
        "SELECT COALESCE(category, 'Uncategorized') as cat, COUNT(*) as cnt, COALESCE(SUM(ABS(amount)), 0) as total FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE business_id = $1) GROUP BY category ORDER BY total DESC"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let grand_total: f64 = rows.iter().map(|r| r.2).sum();

    Ok(Json(rows.into_iter().map(|(cat, count, total)| CategoryBreakdown {
        category: cat,
        count: count as u32,
        total_amount: (total * 100.0).round() / 100.0,
        percentage: if grand_total > 0.0 { (total / grand_total * 100.0 * 100.0).round() / 100.0 } else { 0.0 },
    }).collect()))
}

async fn get_patterns(
    State(state): State<AppState>,
) -> Json<Vec<PatternInfo>> {
    let drrt = state.drrt.read().await;
    Json(drrt.memory.pattern_memory.iter().map(|p| PatternInfo {
        pattern_type: format!("{:?}", p.pattern_type),
        frequency: p.frequency,
        confidence: p.confidence,
        last_observed: p.last_observed,
    }).collect())
}

async fn get_anomalies(
    State(state): State<AppState>,
) -> Json<Vec<AnomalyInfo>> {
    let mut drrt = state.drrt.write().await;
    let status = drrt.check_collapse();
    let coherence = drrt.global_coherence;
    let contradiction = drrt.global_contradiction;
    let severity = if coherence < 0.3 { "critical".to_string() } else if coherence < 0.5 { "warning".to_string() } else { "normal".to_string() };
    Json(vec![AnomalyInfo {
        anomaly_type: format!("{:?}", status),
        severity,
        coherence,
        contradiction,
        description: format!("Collapse: {:?}, Coherence: {:.3}", status, coherence),
    }])
}

pub fn transaction_routes() -> Router<AppState> {
    Router::new()
        .route("/api/transactions/intelligence", get(get_transaction_intelligence))
        .route("/api/transactions/categories", get(get_categories))
        .route("/api/transactions/patterns", get(get_patterns))
        .route("/api/transactions/anomalies", get(get_anomalies))
}
