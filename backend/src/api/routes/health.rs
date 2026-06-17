use crate::AppState;
use axum::{extract::State, routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    database: String,
    redis: String,
    nats: String,
    drrt_ready: bool,
}

async fn health_check(State(state): State<AppState>) -> Json<HealthResponse> {
    let drrt = state.drrt.read().await;
    let db_ok = !state.pool.is_closed();
    Json(HealthResponse {
        status: if db_ok { "ok" } else { "degraded" },
        version: env!("CARGO_PKG_VERSION").to_string(),
        database: if db_ok { "connected" } else { "disconnected" },
        redis: if state.redis.is_some() { "connected" } else { "disconnected" },
        nats: if state.nats.is_some() { "connected" } else { "disconnected" },
        drrt_ready: drrt.primary_tensor.dimension_count() > 0,
    })
}

pub fn health_routes() -> Router<AppState> {
    Router::new().route("/api/health", get(health_check))
}
