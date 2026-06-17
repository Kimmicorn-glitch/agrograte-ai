use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use axum::http::HeaderMap;
use axum::{
    extract::State,
    http::header::AUTHORIZATION,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::{Duration, Utc};
use sha2::{Digest, Sha256};
use sqlx::Row;
use tracing::info;
use uuid::Uuid;

fn validate_email(email: &str) -> bool {
    if email.is_empty() || email.len() > 254 {
        return false;
    }
    let parts: Vec<&str> = email.splitn(2, '@').collect();
    if parts.len() != 2 {
        return false;
    }
    let (local, domain) = (parts[0], parts[1]);
    if local.is_empty() || domain.is_empty() {
        return false;
    }
    if let Some(dot_pos) = domain.rfind('.') {
        if dot_pos == 0 {
            return false;
        }
        let tld = &domain[dot_pos + 1..];
        tld.len() >= 2
    } else {
        false
    }
}

use super::super::domain::value_objects::Role;
use super::super::AppState;
use super::jwt;
use super::{AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, UserResponse};

fn hash_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    format!("{:x}", hasher.finalize())
}

async fn store_session(
    pool: &sqlx::PgPool,
    user_id: Uuid,
    refresh_token: &str,
) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    let token_hash = hash_token(refresh_token);
    let expires_at = Utc::now() + Duration::days(7);
    sqlx::query("INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)")
        .bind(user_id)
        .bind(&token_hash)
        .bind(expires_at)
        .execute(pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;
    Ok(())
}

async fn validate_session(
    pool: &sqlx::PgPool,
    user_id: Uuid,
    refresh_token: &str,
) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    let token_hash = hash_token(refresh_token);
    let row = sqlx::query(
        "SELECT id FROM sessions WHERE user_id = $1 AND refresh_token = $2 AND expires_at > NOW()",
    )
    .bind(user_id)
    .bind(&token_hash)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
        )
    })?;

    if row.is_none() {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(
                serde_json::json!({"error": "Invalid or expired refresh token", "code": "UNAUTHORIZED"}),
            ),
        ));
    }
    Ok(())
}

async fn revoke_session(
    pool: &sqlx::PgPool,
    user_id: Uuid,
    refresh_token: &str,
) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    let token_hash = hash_token(refresh_token);
    sqlx::query("DELETE FROM sessions WHERE user_id = $1 AND refresh_token = $2")
        .bind(user_id)
        .bind(&token_hash)
        .execute(pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;
    Ok(())
}

async fn revoke_all_sessions(
    pool: &sqlx::PgPool,
    user_id: Uuid,
) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    sqlx::query("DELETE FROM sessions WHERE user_id = $1")
        .bind(user_id)
        .execute(pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;
    Ok(())
}

async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<serde_json::Value>)> {
    if req.email.is_empty() || req.password.is_empty() || req.full_name.is_empty() {
        return Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(
                serde_json::json!({"error": "All fields are required", "code": "VALIDATION_ERROR"}),
            ),
        ));
    }

    if !validate_email(&req.email) {
        return Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(
                serde_json::json!({"error": "Invalid email format", "code": "VALIDATION_ERROR"}),
            ),
        ));
    }

    if req.password.len() < 8 {
        return Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(
                serde_json::json!({"error": "Password must be at least 8 characters", "code": "VALIDATION_ERROR"}),
            ),
        ));
    }

    let existing = sqlx::query("SELECT id FROM users WHERE email = $1")
        .bind(&req.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;

    if existing.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(serde_json::json!({"error": "Email already registered", "code": "CONFLICT"})),
        ));
    }

    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Argon2::default()
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "INTERNAL_ERROR"})),
            )
        })?
        .to_string();

    let user_id = Uuid::new_v4();
    let now = chrono::Utc::now();

    sqlx::query(
        "INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, $6, $7)"
    )
        .bind(user_id)
        .bind(&req.email)
        .bind(&password_hash)
        .bind(&req.full_name)
        .bind("user")
        .bind(now)
        .bind(now)
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let token = jwt::create_access_token(
        user_id,
        &req.email,
        &Role::User,
        None,
        &state.config.jwt_secret,
    )
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "INTERNAL_ERROR"})),
        )
    })?;

    let refresh_token =
        jwt::create_refresh_token(user_id, &state.config.jwt_secret).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "INTERNAL_ERROR"})),
            )
        })?;

    store_session(&state.pool, user_id, &refresh_token).await?;

    info!("User registered: {}", req.email);

    Ok(Json(AuthResponse {
        token,
        refresh_token,
        user: UserResponse {
            id: user_id,
            email: req.email,
            full_name: req.full_name,
            role: Role::User,
            business_id: None,
        },
    }))
}

async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<serde_json::Value>)> {
    let row = sqlx::query("SELECT id, email, password_hash, full_name, role, business_id FROM users WHERE email = $1 AND is_active = true")
        .bind(&req.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Invalid email or password", "code": "UNAUTHORIZED"}))))?;

    let user_id: Uuid = row.get("id");
    let email: String = row.get("email");
    let password_hash: String = row.get("password_hash");
    let full_name: String = row.get("full_name");
    let role_str: String = row.get("role");
    let business_id: Option<Uuid> = row.get("business_id");

    let role = match role_str.as_str() {
        "admin" => Role::Admin,
        "accountant" => Role::Accountant,
        "auditor" => Role::Auditor,
        "viewer" => Role::Viewer,
        _ => Role::User,
    };

    let parsed_hash = PasswordHash::new(&password_hash).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Internal error", "code": "INTERNAL_ERROR"})),
        )
    })?;

    Argon2::default()
        .verify_password(req.password.as_bytes(), &parsed_hash)
        .map_err(|_| (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Invalid email or password", "code": "UNAUTHORIZED"}))))?;

    let token = jwt::create_access_token(
        user_id,
        &email,
        &role,
        business_id,
        &state.config.jwt_secret,
    )
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "INTERNAL_ERROR"})),
        )
    })?;

    let refresh_token =
        jwt::create_refresh_token(user_id, &state.config.jwt_secret).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "INTERNAL_ERROR"})),
            )
        })?;

    store_session(&state.pool, user_id, &refresh_token).await?;

    info!("User logged in: {}", email);

    Ok(Json(AuthResponse {
        token,
        refresh_token,
        user: UserResponse {
            id: user_id,
            email,
            full_name,
            role,
            business_id,
        },
    }))
}

async fn refresh_token(
    State(state): State<AppState>,
    Json(req): Json<RefreshRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<serde_json::Value>)> {
    let claims =
        jwt::validate_token(&req.refresh_token, &state.config.jwt_secret).map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({"error": "Invalid refresh token", "code": "UNAUTHORIZED"})),
            )
        })?;

    let user_id = claims.sub;

    // Validate that the session exists and is not expired
    validate_session(&state.pool, user_id, &req.refresh_token).await?;

    let row = sqlx::query("SELECT id, email, full_name, role, business_id FROM users WHERE id = $1 AND is_active = true")
        .bind(user_id)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?
        .ok_or_else(|| (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "User not found", "code": "UNAUTHORIZED"}))))?;

    let email: String = row.get("email");
    let full_name: String = row.get("full_name");
    let role_str: String = row.get("role");
    let business_id: Option<Uuid> = row.get("business_id");

    let role = match role_str.as_str() {
        "admin" => Role::Admin,
        "accountant" => Role::Accountant,
        "auditor" => Role::Auditor,
        "viewer" => Role::Viewer,
        _ => Role::User,
    };

    // Rotate tokens: revoke old session, create new tokens
    revoke_session(&state.pool, user_id, &req.refresh_token).await?;

    let token = jwt::create_access_token(
        user_id,
        &email,
        &role,
        business_id,
        &state.config.jwt_secret,
    )
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "INTERNAL_ERROR"})),
        )
    })?;

    let new_refresh =
        jwt::create_refresh_token(user_id, &state.config.jwt_secret).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "INTERNAL_ERROR"})),
            )
        })?;

    store_session(&state.pool, user_id, &new_refresh).await?;

    Ok(Json(AuthResponse {
        token,
        refresh_token: new_refresh,
        user: UserResponse {
            id: user_id,
            email,
            full_name,
            role,
            business_id,
        },
    }))
}

async fn me(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<UserResponse>, (StatusCode, Json<serde_json::Value>)> {
    let token = headers
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(
                    serde_json::json!({"error": "Authentication required", "code": "UNAUTHORIZED"}),
                ),
            )
        })?;

    let claims = jwt::validate_token(token, &state.config.jwt_secret).map_err(|_| {
        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({"error": "Invalid token", "code": "UNAUTHORIZED"})),
        )
    })?;

    let row = sqlx::query(
        "SELECT id, email, full_name, role, business_id FROM users WHERE id = $1 AND is_active = true",
    )
    .bind(claims.sub)
    .fetch_optional(&state.pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Unable to load user", "code": "DATABASE_ERROR"})),
        )
    })?
    .ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({"error": "User not found", "code": "UNAUTHORIZED"})),
        )
    })?;

    let role_str: String = row.get("role");

    Ok(Json(UserResponse {
        id: row.get("id"),
        email: row.get("email"),
        full_name: row.get("full_name"),
        role: role_from_str(&role_str),
        business_id: row.get("business_id"),
    }))
}

async fn logout(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let token = headers
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(
                    serde_json::json!({"error": "Authentication required", "code": "UNAUTHORIZED"}),
                ),
            )
        })?;

    let claims = jwt::validate_token(token, &state.config.jwt_secret).map_err(|_| {
        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({"error": "Invalid token", "code": "UNAUTHORIZED"})),
        )
    })?;

    revoke_all_sessions(&state.pool, claims.sub).await?;

    info!("User logged out: {}", claims.email);
    Ok(Json(
        serde_json::json!({"message": "Logged out successfully"}),
    ))
}

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/refresh", post(refresh_token))
        .route("/api/auth/me", get(me))
        .route("/api/auth/logout", post(logout))
}

fn role_from_str(role: &str) -> Role {
    match role {
        "admin" => Role::Admin,
        "accountant" => Role::Accountant,
        "auditor" => Role::Auditor,
        "viewer" => Role::Viewer,
        _ => Role::User,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_email_valid() {
        assert!(validate_email("user@example.com"));
        assert!(validate_email("test.user@domain.co.za"));
        assert!(validate_email("user+tag@company.org"));
        assert!(validate_email("a@b.cd"));
    }

    #[test]
    fn test_validate_email_invalid() {
        assert!(!validate_email(""));
        assert!(!validate_email("notanemail"));
        assert!(!validate_email("@domain.com"));
        assert!(!validate_email("user@"));
        assert!(!validate_email("user@.com"));
        assert!(!validate_email("user@domain"));
    }

    #[test]
    fn test_validate_email_too_long() {
        let long = format!("{}@example.com", "a".repeat(250));
        assert!(!validate_email(&long));
    }

    #[test]
    fn test_role_from_str() {
        assert!(matches!(role_from_str("admin"), Role::Admin));
        assert!(matches!(role_from_str("accountant"), Role::Accountant));
        assert!(matches!(role_from_str("auditor"), Role::Auditor));
        assert!(matches!(role_from_str("viewer"), Role::Viewer));
        assert!(matches!(role_from_str("unknown"), Role::User));
    }
}
