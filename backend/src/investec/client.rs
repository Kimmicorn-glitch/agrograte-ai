use chrono::{DateTime, Utc};
use reqwest::Client as HttpClient;
use serde::Deserialize;
use std::time::Duration;
use tracing::{info, warn};

use super::types::*;

/// Investec Programmable Banking API client
/// Connects to Investec's open banking API for real-time account access
/// and programmable card/account actions
#[derive(Clone)]
pub struct InvestecClient {
    http: HttpClient,
    client_id: String,
    client_secret: String,
    base_url: String,
    api_key: String,
    access_token: Option<String>,
    token_expires_at: Option<DateTime<Utc>>,
    max_retries: u32,
}

#[derive(Debug, Deserialize)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: u64,
}

#[derive(Debug, Deserialize)]
struct AccountsResponse {
    data: AccountsData,
}

#[derive(Debug, Deserialize)]
struct AccountsData {
    accounts: Vec<InvestecAccount>,
}

#[derive(Debug, Deserialize)]
struct TransactionsResponse {
    data: TransactionsData,
}

#[derive(Debug, Deserialize)]
struct TransactionsData {
    transactions: Vec<InvestecTransaction>,
}

impl InvestecClient {
    pub fn new(client_id: String, client_secret: String, api_key: String) -> Self {
        Self {
            http: HttpClient::builder()
                .timeout(Duration::from_secs(30))
                .connect_timeout(Duration::from_secs(10))
                .pool_max_idle_per_host(4)
                .build()
                .unwrap_or_default(),
            client_id,
            client_secret,
            api_key,
            base_url: "https://openapi.investec.com".to_string(),
            access_token: None,
            token_expires_at: None,
            max_retries: 3,
        }
    }

    pub async fn authenticate(&mut self) -> Result<(), InvestecError> {
        let params = [
            ("grant_type", "client_credentials"),
            ("client_id", &self.client_id),
            ("client_secret", &self.client_secret),
        ];

        let resp = self
            .http
            .post(format!("{}/identity/v2/oauth2/token", self.base_url))
            .form(&params)
            .send()
            .await
            .map_err(|e| InvestecError::AuthError(format!("request failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            return Err(InvestecError::AuthError(format!(
                "HTTP {}: {}",
                status, body
            )));
        }

        let token: TokenResponse = resp
            .json()
            .await
            .map_err(|e| InvestecError::AuthError(format!("parse failed: {}", e)))?;

        self.token_expires_at =
            Some(Utc::now() + chrono::Duration::seconds(token.expires_in as i64));
        self.access_token = Some(token.access_token);
        info!("Authenticated with Investec API, token expires in {}s", token.expires_in);
        Ok(())
    }

    pub async fn ensure_authenticated(&mut self) -> Result<(), InvestecError> {
        let needs_refresh = match &self.token_expires_at {
            Some(exp) => Utc::now() >= *exp - chrono::Duration::minutes(5),
            None => true,
        };
        if needs_refresh {
            self.authenticate().await
        } else {
            Ok(())
        }
    }

    async fn retry_request<T, F, Fut>(&self, mut operation: F) -> Result<T, InvestecError>
    where
        F: FnMut() -> Fut,
        Fut: std::future::Future<Output = Result<T, InvestecError>>,
    {
        let mut last_error = None;
        for attempt in 0..=self.max_retries {
            if attempt > 0 {
                let delay = Duration::from_millis(100 * 2u64.pow(attempt - 1));
                tokio::time::sleep(delay).await;
                warn!("Investec API retry {}/{}", attempt, self.max_retries);
            }
            match operation().await {
                Ok(result) => return Ok(result),
                Err(e) => {
                    if matches!(&e, InvestecError::RateLimited | InvestecError::ApiError(_)) {
                        last_error = Some(e);
                        continue;
                    }
                    return Err(e);
                }
            }
        }
        Err(last_error.unwrap_or(InvestecError::ApiError("max retries exceeded".into())))
    }

    pub async fn get_accounts(&self) -> Result<Vec<InvestecAccount>, InvestecError> {
        let token = self
            .access_token
            .as_ref()
            .ok_or(InvestecError::NotAuthenticated)?;

        let resp = self
            .http
            .get(format!("{}/za/pb/v1/accounts", self.base_url))
            .bearer_auth(token)
            .header("x-api-key", &self.api_key)
            .send()
            .await
            .map_err(|e| InvestecError::ApiError(e.to_string()))?;

        if resp.status().as_u16() == 429 {
            return Err(InvestecError::RateLimited);
        }

        let accounts_resp: AccountsResponse = resp
            .json()
            .await
            .map_err(|e| InvestecError::ApiError(e.to_string()))?;

        Ok(accounts_resp.data.accounts)
    }

    pub async fn get_transactions(
        &self,
        account_id: &str,
        from_date: Option<&str>,
        to_date: Option<&str>,
    ) -> Result<Vec<InvestecTransaction>, InvestecError> {
        let token = self
            .access_token
            .as_ref()
            .ok_or(InvestecError::NotAuthenticated)?;

        let url = format!(
            "{}/za/pb/v1/accounts/{}/transactions",
            self.base_url, account_id
        );

        let mut query_params = Vec::new();
        if let Some(from) = from_date {
            query_params.push(("fromDate", from));
        }
        if let Some(to) = to_date {
            query_params.push(("toDate", to));
        }

        let resp = self
            .http
            .get(&url)
            .bearer_auth(token)
            .header("x-api-key", &self.api_key)
            .query(&query_params)
            .send()
            .await
            .map_err(|e| InvestecError::ApiError(e.to_string()))?;

        if resp.status().as_u16() == 429 {
            return Err(InvestecError::RateLimited);
        }

        let txns: TransactionsResponse = resp
            .json()
            .await
            .map_err(|e| InvestecError::ApiError(e.to_string()))?;

        Ok(txns.data.transactions)
    }

    pub async fn get_balance(&self, account_id: &str) -> Result<InvestecBalance, InvestecError> {
        let token = self
            .access_token
            .as_ref()
            .ok_or(InvestecError::NotAuthenticated)?;

        let url = format!("{}/za/pb/v1/accounts/{}/balance", self.base_url, account_id);

        let resp = self
            .http
            .get(&url)
            .bearer_auth(token)
            .header("x-api-key", &self.api_key)
            .send()
            .await
            .map_err(|e| InvestecError::ApiError(e.to_string()))?;

        if resp.status().as_u16() == 429 {
            return Err(InvestecError::RateLimited);
        }

        let balance: InvestecBalanceResponse = resp
            .json()
            .await
            .map_err(|e| InvestecError::ApiError(e.to_string()))?;

        Ok(balance.data.balance)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum InvestecError {
    #[error("Authentication failed: {0}")]
    AuthError(String),
    #[error("API error: {0}")]
    ApiError(String),
    #[error("Not authenticated")]
    NotAuthenticated,
    #[error("Rate limited")]
    RateLimited,
}
