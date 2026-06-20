use crate::AppState;
use axum::{extract::State, routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
struct SimpleHealthResponse {
    status: &'static str,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    database: String,
    redis: String,
    nats: String,
    drrt_ready: bool,
}

async fn simple_health_check() -> Json<SimpleHealthResponse> {
    Json(SimpleHealthResponse { status: "ok" })
}

async fn health_check(State(state): State<AppState>) -> Json<HealthResponse> {
    let drrt = state.drrt.read().await;
    let db_ok = !state.pool.is_closed();
    let redis_ok = state.redis.read().await.is_some();
    let nats_ok = state.nats.read().await.is_some();

    Json(HealthResponse {
        status: String::from(if db_ok { "ok" } else { "degraded" }),
        version: env!("CARGO_PKG_VERSION").to_string(),
        database: String::from(if db_ok { "connected" } else { "disconnected" }),
        redis: String::from(if redis_ok {
            "connected"
        } else {
            "disconnected"
        }),
        nats: String::from(if nats_ok { "connected" } else { "disconnected" }),
        drrt_ready: drrt.primary_tensor.dimension_count() > 0,
    })
}

pub fn health_routes() -> Router<AppState> {
    Router::new()
        .route("/health", get(simple_health_check))
        .route("/api/health", get(health_check))
}
