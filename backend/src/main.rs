mod api;
mod auth;
mod cashflow;
mod config;
mod db;
mod domain;
mod drrt;
mod error;
mod investec;
mod repositories;
mod sars;
mod telemetry;

use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::info;

use crate::api::middleware::RateLimiter;
use crate::api::AppRouter;
use crate::cashflow::forecasting::CashFlowForecaster;
use crate::config::AppConfig;
use crate::drrt::engine::DrrtEngine;
use crate::investec::client::InvestecClient;
use crate::sars::compliance::SarsCompliance;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    telemetry::init();
    dotenvy::dotenv().ok();

    let mut config = AppConfig::from_env()?;

    // Override database_url from explicit env var to ensure correctness
    if let Ok(db_url) = std::env::var("APP_DATABASE_URL") {
        if !db_url.is_empty() {
            config.database_url = db_url;
        }
    }

    info!("Agrograte AI starting up");

    let pool = db::connect(&config.database_url).await?;
    db::run_migrations(&pool).await?;

    let redis = db::connect_redis(&config.redis_url).await?;
    let nats = db::connect_nats(&config.nats_url).await?;

    let mut drrt_engine = DrrtEngine::new();
    drrt_engine
        .initialize_tensor_space()
        .map_err(anyhow::Error::msg)?;
    let drrt_engine = Arc::new(RwLock::new(drrt_engine));

    let investec = Arc::new(InvestecClient::new(
        config.investec_client_id.clone(),
        config.investec_client_secret.clone(),
        config.investec_api_key.clone(),
    ));

    let app_state = AppState {
        pool,
        redis,
        nats,
        drrt: drrt_engine,
        investec,
        cashflow: CashFlowForecaster,
        sars: SarsCompliance,
        config: config.clone(),
        rate_limiter: RateLimiter::new(100, 60),
    };

    let router = AppRouter::new(app_state).build();

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, router).await?;

    Ok(())
}

#[derive(Clone)]
pub struct AppState {
    pub pool: sqlx::PgPool,
    pub redis: redis::aio::ConnectionManager,
    pub nats: async_nats::Client,
    pub drrt: Arc<RwLock<DrrtEngine>>,
    pub investec: Arc<InvestecClient>,
    pub cashflow: CashFlowForecaster,
    pub sars: SarsCompliance,
    pub config: AppConfig,
    pub rate_limiter: RateLimiter,
}
