use axum::{
    extract::{Request, State},
    http::{header::AUTHORIZATION, StatusCode},
    middleware::Next,
    response::Response,
    Json,
};
use uuid::Uuid;

use super::super::AppState;

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub user_id: Uuid,
    pub email: String,
    pub role: super::super::domain::value_objects::Role,
    pub business_id: Option<Uuid>,
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let auth_header = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok());

    if let Some(header) = auth_header {
        if let Some(token) = header.strip_prefix("Bearer ") {
            let claims =
                super::jwt::validate_token(token, &state.config.jwt_secret).map_err(|_| {
                    (
                        StatusCode::UNAUTHORIZED,
                        Json(serde_json::json!({"error": "Invalid token", "code": "UNAUTHORIZED"})),
                    )
                })?;

            request.extensions_mut().insert(AuthenticatedUser {
                user_id: claims.sub,
                email: claims.email,
                role: claims.role,
                business_id: claims.business_id,
            });

            return Ok(next.run(request).await);
        }
    }

    Err((
        StatusCode::UNAUTHORIZED,
        Json(serde_json::json!({"error": "Authentication required", "code": "UNAUTHORIZED"})),
    ))
}

async fn check_permission(
    request: Request,
    next: Next,
    required_permissions: &[&str],
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let user = request.extensions().get::<AuthenticatedUser>().cloned();

    match user {
        Some(u) => {
            let permissions = u.role.permissions();
            if permissions.contains(&"*")
                || required_permissions
                    .iter()
                    .any(|rp| permissions.contains(rp))
            {
                return Ok(next.run(request).await);
            }
            Err((
                StatusCode::FORBIDDEN,
                Json(serde_json::json!({"error": "Insufficient permissions", "code": "FORBIDDEN"})),
            ))
        }
        None => Err((
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({"error": "Authentication required", "code": "UNAUTHORIZED"})),
        )),
    }
}

pub async fn require_tax_access(
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    check_permission(request, next, &["read:tax", "write:tax"]).await
}

pub async fn require_audit_access(
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    check_permission(request, next, &["read:audit"]).await
}

pub async fn require_rules_management(
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    check_permission(request, next, &["manage:rules"]).await
}

pub async fn require_admin_access(
    request: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    check_permission(request, next, &["*"]).await
}
