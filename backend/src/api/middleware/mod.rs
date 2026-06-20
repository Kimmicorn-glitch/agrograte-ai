use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
    Json,
};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::info;

use crate::AppState;

#[derive(Clone)]
struct RateLimitEntry {
    count: u64,
    reset_at: Instant,
}

#[derive(Clone)]
pub struct RateLimiter {
    limits: Arc<RwLock<HashMap<String, RateLimitEntry>>>,
    max_requests: u64,
    window: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: u64, window_secs: u64) -> Self {
        Self {
            limits: Arc::new(RwLock::new(HashMap::new())),
            max_requests,
            window: Duration::from_secs(window_secs),
        }
    }

    pub async fn check(&self, key: &str) -> bool {
        let mut limits = self.limits.write().await;
        let now = Instant::now();

        if let Some(entry) = limits.get(key) {
            let (count, reset_at) = (entry.count, entry.reset_at);
            if now < reset_at {
                if count >= self.max_requests {
                    return false;
                }
                limits.insert(
                    key.to_string(),
                    RateLimitEntry {
                        count: count + 1,
                        reset_at,
                    },
                );
            } else {
                limits.insert(
                    key.to_string(),
                    RateLimitEntry {
                        count: 1,
                        reset_at: now + self.window,
                    },
                );
            }
        } else {
            limits.insert(
                key.to_string(),
                RateLimitEntry {
                    count: 1,
                    reset_at: now + self.window,
                },
            );
        }
        true
    }
}

#[allow(dead_code)]
pub async fn request_logger(request: Request, next: Next) -> Response {
    let method = request.method().to_string();
    let uri = request.uri().to_string();
    info!("→ {} {}", method, uri);
    let response = next.run(request).await;
    info!("← {} {} {}", method, uri, response.status().as_u16());
    response
}

pub async fn rate_limit_middleware(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let client_ip = request
        .headers()
        .get("X-Forwarded-For")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");

    if !state.rate_limiter.check(client_ip).await {
        return Err((
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({
                "error": "Rate limit exceeded",
                "code": "RATE_LIMITED",
                "retry_after": 60
            })),
        ));
    }

    Ok(next.run(request).await)
}

pub async fn security_headers(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    let headers = response.headers_mut();

    headers.insert("X-Content-Type-Options", "nosniff".parse().unwrap());
    headers.insert("X-Frame-Options", "DENY".parse().unwrap());
    headers.insert(
        "Referrer-Policy",
        "strict-origin-when-cross-origin".parse().unwrap(),
    );
    headers.insert(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' http://localhost:* https://*.investec.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';".parse().unwrap()
    );
    headers.insert(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains".parse().unwrap(),
    );
    headers.insert(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()".parse().unwrap(),
    );

    response
}
