use axum::{
    extract::{Extension, Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::auth::middleware::AuthenticatedUser;
use crate::drrt::engine::FinancialMetrics;
use crate::AppState;

#[derive(Serialize)]
struct BankingSummaryResponse {
    available_balance: f64,
    pending_transactions: u32,
    reserved_tax_funds: f64,
    programmable_rules: u32,
    approval_workflows: u32,
    drrt_coherence: f64,
}

#[derive(Serialize)]
struct AuthUrlResponse {
    url: String,
    state: String,
}

#[derive(Serialize)]
struct ConnectionStatusResponse {
    connected: bool,
    accounts_linked: u32,
    last_sync: Option<String>,
}

#[derive(Deserialize)]
struct CallbackQuery {
    code: String,
    state: String,
}

async fn get_banking_summary(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<BankingSummaryResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let account_data = sqlx::query_as::<_, (f64, f64, i64)>(
        "SELECT COALESCE(SUM(available_balance), 0), COALESCE(SUM(reserved_tax_funds), 0), COUNT(*) FROM accounts WHERE business_id = $1 AND is_active = true"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let pending = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE business_id = $1) AND status = 'pending'"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?
    .unwrap_or(0);

    let rules = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM programmable_rules WHERE business_id = $1",
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
    .unwrap_or(0);

    let workflows = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM approval_workflows WHERE id IN (SELECT rule_id FROM programmable_rules WHERE business_id = $1)"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?
    .unwrap_or(0);

    let (balance, reserved, _account_count) = account_data;

    let mut drrt = state.drrt.write().await;
    {
        let free_cash = balance - reserved;
        let liquidity_ratio = if balance > 0.0 {
            free_cash / balance
        } else {
            0.0
        };
        let mut metrics = FinancialMetrics::default();
        metrics.total_balance = Some(balance);
        metrics.free_cash = Some(free_cash);
        metrics.liquidity_ratio = Some(liquidity_ratio);
        drrt.update_from_financial_data(&metrics);
    }

    Ok(Json(BankingSummaryResponse {
        available_balance: (balance * 100.0).round() / 100.0,
        pending_transactions: pending as u32,
        reserved_tax_funds: (reserved * 100.0).round() / 100.0,
        programmable_rules: rules as u32,
        approval_workflows: workflows as u32,
        drrt_coherence: drrt.global_coherence,
    }))
}

async fn get_accounts(State(state): State<AppState>) -> Json<Vec<serde_json::Value>> {
    let mut client = (*state.investec).clone();
    match client.authenticate().await {
        Ok(()) => match client.get_accounts().await {
            Ok(accounts) => Json(accounts.into_iter().map(|a| serde_json::json!(a)).collect()),
            Err(_) => Json(Vec::new()),
        },
        Err(_) => Json(Vec::new()),
    }
}

async fn get_transactions(State(state): State<AppState>) -> Json<Vec<serde_json::Value>> {
    let mut client = (*state.investec).clone();
    match client.authenticate().await {
        Ok(()) => match client.get_accounts().await {
            Ok(accounts) => {
                let mut all_txns = Vec::new();
                for account in accounts {
                    if let Ok(txns) = client
                        .get_transactions(&account.account_id, None, None)
                        .await
                    {
                        for t in txns {
                            all_txns.push(serde_json::json!(t));
                        }
                    }
                }
                Json(all_txns)
            }
            Err(_) => Json(Vec::new()),
        },
        Err(_) => Json(Vec::new()),
    }
}

async fn get_connection_status() -> Json<ConnectionStatusResponse> {
    Json(ConnectionStatusResponse {
        connected: false,
        accounts_linked: 0,
        last_sync: None,
    })
}

async fn get_auth_url(State(state): State<AppState>) -> Json<AuthUrlResponse> {
    let csrf_state = uuid::Uuid::new_v4().to_string();
    let client_id = &state.config.investec_client_id;
    let redirect_uri = "http://localhost:8080/api/investec/callback";
    let url = format!(
        "https://openapi.investec.com/identity/v2/oauth2/authorize?client_id={}&redirect_uri={}&response_type=code&state={}",
        client_id, redirect_uri, csrf_state
    );
    Json(AuthUrlResponse {
        url,
        state: csrf_state,
    })
}

async fn handle_callback(Query(_query): Query<CallbackQuery>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "callback_received",
        "message": "OAuth flow initiated. Token exchange pending."
    }))
}

async fn get_investec_accounts(State(state): State<AppState>) -> Json<Vec<serde_json::Value>> {
    let mut client = (*state.investec).clone();
    match client.authenticate().await {
        Ok(()) => match client.get_accounts().await {
            Ok(accounts) => Json(
                accounts
                    .into_iter()
                    .map(|a| {
                        serde_json::json!({
                            "account_id": a.account_id,
                            "account_number": a.account_number,
                            "account_type": a.account_type,
                            "account_name": a.account_name,
                            "current_balance": a.current_balance,
                            "available_balance": a.available_balance,
                            "currency": a.currency,
                        })
                    })
                    .collect(),
            ),
            Err(_) => Json(Vec::new()),
        },
        Err(_) => Json(Vec::new()),
    }
}

async fn get_investec_transactions(
    State(state): State<AppState>,
    axum::extract::Path(account_id): axum::extract::Path<String>,
) -> Json<Vec<serde_json::Value>> {
    let mut client = (*state.investec).clone();
    match client.authenticate().await {
        Ok(()) => match client.get_transactions(&account_id, None, None).await {
            Ok(txns) => Json(
                txns.into_iter()
                    .map(|t| {
                        serde_json::json!({
                            "transaction_id": t.transaction_id,
                            "amount": t.amount,
                            "description": t.description,
                            "transaction_type": t.transaction_type,
                            "posting_date": t.transaction_date,
                            "merchant": t.merchant,
                        })
                    })
                    .collect(),
            ),
            Err(_) => Json(Vec::new()),
        },
        Err(_) => Json(Vec::new()),
    }
}

pub fn investec_routes() -> Router<AppState> {
    Router::new()
        .route("/api/banking/summary", get(get_banking_summary))
        .route("/api/banking/accounts", get(get_accounts))
        .route("/api/banking/transactions", get(get_transactions))
        .route("/api/investec/status", get(get_connection_status))
        .route("/api/investec/auth-url", get(get_auth_url))
        .route("/api/investec/callback", get(handle_callback))
        .route("/api/investec/accounts", get(get_investec_accounts))
        .route(
            "/api/investec/accounts/{account_id}/transactions",
            get(get_investec_transactions),
        )
}
