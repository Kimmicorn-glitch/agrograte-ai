use crate::AppState;
use axum::{extract::State, routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    drrt_ready: bool,
}

async fn health_check(State(state): State<AppState>) -> Json<HealthResponse> {
    let drrt = state.drrt.read().await;
    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        drrt_ready: drrt.primary_tensor.dimension_count() > 0,
    })
}

pub fn health_routes() -> Router<AppState> {
    Router::new().route("/api/health", get(health_check))
}
