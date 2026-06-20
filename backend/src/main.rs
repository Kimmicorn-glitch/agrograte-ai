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

    if let Ok(db_url) = std::env::var("APP_DATABASE_URL") {
        if !db_url.is_empty() {
            config.database_url = db_url;
        }
    }

    info!(event = "startup", "Agrograte AI starting up");

    let pool = db::connect(&config.database_url);
    let redis = Arc::new(RwLock::new(None));
    let nats = Arc::new(RwLock::new(None));

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
        pool: pool.clone(),
        redis: redis.clone(),
        nats: nats.clone(),
        drrt: drrt_engine,
        investec,
        cashflow: CashFlowForecaster,
        sars: SarsCompliance,
        config: config.clone(),
        rate_limiter: RateLimiter::new(100, 60),
    };

    let router = AppRouter::new(app_state).build();

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap();
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await?;

    info!(event = "server_listening", %addr, "HTTP server listening");

    let migration_pool = pool.clone();
    tokio::spawn(async move {
        db::run_migrations_with_retry(migration_pool.clone()).await;
        if let Err(e) = db::seed_default_user(&migration_pool).await {
            tracing::warn!(event = "seed_failed", error = %e, "Failed to seed default user");
        }
    });

    let warmup_pool = pool.clone();
    tokio::spawn(async move {
        db::warmup_database(warmup_pool).await;
    });

    let redis_url = config.redis_url.clone();
    let redis_state = redis.clone();
    tokio::spawn(async move {
        let manager = db::connect_redis(&redis_url).await;
        *redis_state.write().await = manager;
    });

    let nats_url = config.nats_url.clone();
    let nats_state = nats.clone();
    tokio::spawn(async move {
        let client = db::connect_nats(&nats_url).await;
        *nats_state.write().await = client;
    });

    axum::serve(listener, router).await?;

    Ok(())
}

#[derive(Clone)]
pub struct AppState {
    pub pool: sqlx::PgPool,
    pub redis: Arc<RwLock<Option<redis::aio::ConnectionManager>>>,
    pub nats: Arc<RwLock<Option<async_nats::Client>>>,
    pub drrt: Arc<RwLock<DrrtEngine>>,
    pub investec: Arc<InvestecClient>,
    pub cashflow: CashFlowForecaster,
    pub sars: SarsCompliance,
    pub config: AppConfig,
    pub rate_limiter: RateLimiter,
}
