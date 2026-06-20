#![allow(dead_code)]

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Authentication failed: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("DRRT engine error: {0}")]
    Drrt(String),

    #[error("Investec API error: {0}")]
    Investec(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    code: String,
    details: Option<String>,
}

impl AppError {
    pub fn into_response_with_sanitize(self, sanitize: bool) -> Response {
        let (status, code) = match &self {
            AppError::NotFound(_) => (StatusCode::NOT_FOUND, "NOT_FOUND"),
            AppError::Validation(_) => (StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION_ERROR"),
            AppError::Unauthorized(_) => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED"),
            AppError::Forbidden(_) => (StatusCode::FORBIDDEN, "FORBIDDEN"),
            AppError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "DATABASE_ERROR"),
            AppError::Drrt(_) => (StatusCode::INTERNAL_SERVER_ERROR, "DRRT_ERROR"),
            AppError::Investec(_) => (StatusCode::BAD_GATEWAY, "INVESTEC_ERROR"),
            AppError::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR"),
        };

        let body = ErrorResponse {
            error: if sanitize {
                match &self {
                    AppError::Database(_) => "An internal database error occurred".into(),
                    AppError::Internal(_) => "An internal error occurred".into(),
                    _ => self.to_string(),
                }
            } else {
                self.to_string()
            },
            code: code.to_string(),
            details: None,
        };

        (status, Json(body)).into_response()
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        self.into_response_with_sanitize(true)
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        AppError::Database(e.to_string())
    }
}

impl From<redis::RedisError> for AppError {
    fn from(e: redis::RedisError) -> Self {
        AppError::Database(e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_database_error() {
        let err = AppError::Database("connection refused: details".into());
        let response = err.into_response_with_sanitize(true);
        let status = response.status();
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[test]
    fn test_sanitize_internal_error() {
        let err = AppError::Internal("panic: something broke".into());
        let response = err.into_response_with_sanitize(true);
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[test]
    fn test_sanitize_does_not_hide_not_found() {
        let err = AppError::NotFound("user 123".into());
        let response = err.into_response_with_sanitize(true);
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[test]
    fn test_sanitize_does_not_hide_validation() {
        let err = AppError::Validation("email is invalid".into());
        let response = err.into_response_with_sanitize(true);
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[test]
    fn test_sanitize_does_not_hide_unauthorized() {
        let err = AppError::Unauthorized("bad token".into());
        let response = err.into_response_with_sanitize(true);
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn test_no_sanitize_shows_details() {
        let err = AppError::Database("real db error".into());
        let response = err.into_response_with_sanitize(false);
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[test]
    fn test_default_into_response_sanitizes() {
        let err = AppError::Internal("secret info".into());
        let response: Response = err.into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[test]
    fn test_from_sqlx_error() {
        let sqlx_err = sqlx::Error::Protocol("bad message".into());
        let app_err: AppError = sqlx_err.into();
        assert!(matches!(app_err, AppError::Database(_)));
    }
}
