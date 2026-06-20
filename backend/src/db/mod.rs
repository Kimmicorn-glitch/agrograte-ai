use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::time::Duration;
use tracing::{info, warn};

pub mod migrations;

pub fn connect(database_url: &str) -> PgPool {
    info!(
        event = "startup",
        component = "postgres_pool",
        "initializing PostgreSQL pool"
    );

    PgPoolOptions::new()
        .max_connections(5)
        .min_connections(0)
        .acquire_timeout(Duration::from_secs(15))
        .idle_timeout(Duration::from_secs(300))
        .max_lifetime(Duration::from_secs(1800))
        .connect_lazy(database_url)
        .expect("Invalid database URL")
}

pub async fn warmup_database(pool: PgPool) {
    let mut attempt = 1_u64;

    loop {
        match sqlx::query("SELECT 1").execute(&pool).await {
            Ok(_) => {
                info!(
                    event = "database_connected",
                    attempt, "PostgreSQL connection ready"
                );
                return;
            }
            Err(error) => {
                warn!(
                    event = "database_retry",
                    attempt,
                    error = %error,
                    "PostgreSQL unavailable; retrying in background"
                );
            }
        }

        let delay = Duration::from_secs((attempt * 2).min(30));
        tokio::time::sleep(delay).await;
        attempt += 1;
    }
}

pub async fn connect_redis(redis_url: &str) -> Option<redis::aio::ConnectionManager> {
    match redis::Client::open(redis_url) {
        Ok(client) => match redis::aio::ConnectionManager::new(client).await {
            Ok(manager) => {
                info!(event = "redis_connected", "Connected to Redis");
                Some(manager)
            }
            Err(e) => {
                warn!(event = "redis_unavailable", error = %e, "Redis unavailable; continuing without cache");
                None
            }
        },
        Err(e) => {
            warn!(event = "redis_unavailable", error = %e, "Redis URL invalid; continuing without cache");
            None
        }
    }
}

pub async fn connect_nats(nats_url: &str) -> Option<async_nats::Client> {
    match async_nats::connect(nats_url).await {
        Ok(client) => {
            info!(event = "nats_connected", "Connected to NATS");
            Some(client)
        }
        Err(e) => {
            warn!(event = "nats_unavailable", error = %e, "NATS unavailable; continuing without messaging");
            None
        }
    }
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::Error> {
    info!(event = "migrations_started", "Database migrations started");
    sqlx::migrate!("./src/db/migrations").run(pool).await?;
    info!(
        event = "migrations_complete",
        "Database migrations complete"
    );
    Ok(())
}

pub async fn seed_default_user(pool: &PgPool) -> Result<(), sqlx::Error> {
    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users)")
        .fetch_one(pool)
        .await?;

    if exists {
        info!(event = "seed_skipped", "Default user already exists; skipping seed");
        return Ok(());
    }

    let email = std::env::var("SEED_ADMIN_EMAIL").unwrap_or_else(|_| "admin@agrograte.ai".into());
    let password =
        std::env::var("SEED_ADMIN_PASSWORD").unwrap_or_else(|_| "Admin123!".into());
    let full_name = std::env::var("SEED_ADMIN_NAME").unwrap_or_else(|_| "Admin User".into());

    use argon2::{
        password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
        Argon2,
    };

    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .expect("Failed to hash seed password")
        .to_string();

    let user_id = uuid::Uuid::new_v4();
    let now = chrono::Utc::now();

    sqlx::query(
        "INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, 'admin', true, $5, $6)"
    )
        .bind(user_id)
        .bind(&email)
        .bind(&password_hash)
        .bind(&full_name)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

    info!(
        event = "seed_complete",
        email = %email,
        "Default admin user created"
    );

    Ok(())
}

pub async fn run_migrations_with_retry(pool: PgPool) {
    let mut attempt = 1_u64;

    loop {
        match run_migrations(&pool).await {
            Ok(()) => return,
            Err(error) => {
                warn!(
                    event = "database_retry",
                    component = "migrations",
                    attempt,
                    error = %error,
                    "Migration attempt failed; retrying in background"
                );
            }
        }

        let delay = Duration::from_secs((attempt * 3).min(60));
        tokio::time::sleep(delay).await;
        attempt += 1;
    }
}
