use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use tracing::info;

pub mod migrations;

pub fn connect(database_url: &str) -> PgPool {
    info!("Initializing PostgreSQL pool...");
    PgPoolOptions::new()
        .max_connections(5)
        .connect_lazy(database_url)
        .expect("Invalid database URL")
}

pub async fn connect_redis(redis_url: &str) -> Option<redis::aio::ConnectionManager> {
    match redis::Client::open(redis_url) {
        Ok(client) => match redis::aio::ConnectionManager::new(client).await {
            Ok(manager) => {
                info!("Connected to Redis");
                Some(manager)
            }
            Err(e) => {
                info!("Redis connection failed (non-fatal): {}", e);
                None
            }
        },
        Err(e) => {
            info!("Redis URL invalid (non-fatal): {}", e);
            None
        }
    }
}

pub async fn connect_nats(nats_url: &str) -> Option<async_nats::Client> {
    match async_nats::connect(nats_url).await {
        Ok(client) => {
            info!("Connected to NATS");
            Some(client)
        }
        Err(e) => {
            info!("NATS connection failed (non-fatal): {}", e);
            None
        }
    }
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::migrate!("./src/db/migrations").run(pool).await?;
    info!("Database migrations complete");
    Ok(())
}
