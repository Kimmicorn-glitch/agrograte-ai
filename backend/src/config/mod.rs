use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct AppConfig {
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub nats_url: String,
    pub frontend_origin: String,
    pub investec_client_id: String,
    pub investec_client_secret: String,
    pub investec_api_key: String,
    pub jwt_secret: String,
    pub environment: Environment,
    pub log_level: String,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub enum Environment {
    Development,
    Staging,
    Production,
}

impl std::fmt::Display for Environment {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Environment::Development => write!(f, "development"),
            Environment::Staging => write!(f, "staging"),
            Environment::Production => write!(f, "production"),
        }
    }
}

impl AppConfig {
    pub fn from_env() -> Result<Self, config::ConfigError> {
        let environment = std::env::var("APP_ENVIRONMENT").unwrap_or_else(|_| "development".into());

        let base = config::Config::builder()
            .set_default("port", 8080)?
            .set_default("environment", "development")?
            .set_default("log_level", "info")?
            .set_default(
                "database_url",
                "postgres://agrograte:agrograte@localhost:5432/agrograte",
            )?
            .set_default("redis_url", "redis://localhost:6379")?
            .set_default("nats_url", "nats://localhost:4222")?
            .set_default("frontend_origin", "http://localhost:3000")?
            .set_default("investec_client_id", "your_client_id")?
            .set_default("investec_client_secret", "your_client_secret")?
            .set_default("investec_api_key", "your_api_key")?
            .set_default("jwt_secret", "change_me_in_production")?
            .add_source(config::File::with_name("config/default").required(false))
            .add_source(config::File::with_name(&format!("config/{}", environment)).required(false))
            .add_source(config::Environment::with_prefix("APP"))
            .build()?;

        let config: AppConfig = base.try_deserialize()?;

        if config.environment != Environment::Development {
            if config.jwt_secret == "change_me_in_production" {
                panic!(
                    "JWT_SECRET must be changed from the default in non-development environments"
                );
            }
            if config.investec_client_id == "your_client_id"
                || config.investec_client_secret == "your_client_secret"
                || config.investec_api_key == "your_api_key"
            {
                tracing::warn!("Investec API credentials still set to default values - update APP_INVESTEC_CLIENT_ID, APP_INVESTEC_CLIENT_SECRET, and APP_INVESTEC_API_KEY");
            }
        }

        Ok(config)
    }
}
