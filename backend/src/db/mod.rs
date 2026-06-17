use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use tracing::info;

pub mod migrations;

pub async fn connect(database_url: &str) -> Result<PgPool, sqlx::Error> {
    info!("Connecting to PostgreSQL...");

    let pool = PgPoolOptions::new()
        .max_connections(1)
        .acquire_timeout(std::time::Duration::from_secs(8))
        .connect(database_url)
        .await
        .map_err(|e| {
            info!("Connection failed");
            e
        })?;

    info!("Connected to PostgreSQL");
    Ok(pool)
}

pub async fn connect_redis(
    redis_url: &str,
) -> Result<redis::aio::ConnectionManager, redis::RedisError> {
    let client = redis::Client::open(redis_url)?;
    let manager = redis::aio::ConnectionManager::new(client).await?;
    info!("Connected to Redis");
    Ok(manager)
}

pub async fn connect_nats(nats_url: &str) -> Result<async_nats::Client, async_nats::ConnectError> {
    let client = async_nats::connect(nats_url).await?;
    info!("Connected to NATS");
    Ok(client)
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::migrate!("./src/db/migrations").run(pool).await?;
    info!("Database migrations complete");
    Ok(())
}
