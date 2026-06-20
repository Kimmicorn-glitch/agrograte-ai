pub mod handlers;
pub mod middleware;
pub mod routes;

use axum::http::{HeaderValue, Method};
use axum::{middleware as axum_middleware, Router};
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    cors::{AllowOrigin, CorsLayer},
    trace::TraceLayer,
};

use crate::api::middleware::{rate_limit_middleware, security_headers};
use crate::auth::middleware::{
    auth_middleware, require_audit_access, require_rules_management, require_tax_access,
};
use crate::auth::routes::auth_routes;
use crate::config::Environment;
use crate::AppState;

use crate::api::routes::{
    approval::approval_routes, banking::banking_routes, cashflow::cashflow_routes,
    compliance::compliance_routes, drrt::drrt_routes, financial::financial_routes,
    health::health_routes, investec::investec_routes, transactions::transaction_routes,
};

pub struct AppRouter {
    state: AppState,
}

impl AppRouter {
    pub fn new(state: AppState) -> Self {
        Self { state }
    }

    pub fn build(&self) -> Router {
        let cors = match self.state.config.environment {
            Environment::Development => CorsLayer::permissive(),
            Environment::Staging | Environment::Production => {
                let origin = HeaderValue::from_str(&self.state.config.frontend_origin)
                    .expect("APP_FRONTEND_ORIGIN must be a valid HTTP origin");

                CorsLayer::new()
                    .allow_origin(AllowOrigin::exact(origin))
                    .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
                    .allow_headers(tower_http::cors::Any)
            }
        };

        let middleware_stack = ServiceBuilder::new()
            .layer(TraceLayer::new_for_http())
            .layer(CompressionLayer::new())
            .layer(cors);

        let protected_routes = Router::new()
            .merge(drrt_routes())
            .merge(financial_routes())
            .merge(investec_routes())
            .merge(banking_routes().route_layer(axum_middleware::from_fn(require_rules_management)))
            .merge(approval_routes().route_layer(axum_middleware::from_fn(require_audit_access)))
            .merge(compliance_routes().route_layer(axum_middleware::from_fn(require_tax_access)))
            .merge(cashflow_routes())
            .merge(transaction_routes())
            .route_layer(axum_middleware::from_fn_with_state(
                self.state.clone(),
                auth_middleware,
            ));

        Router::new()
            .merge(health_routes())
            .merge(auth_routes())
            .merge(protected_routes)
            .layer(axum_middleware::from_fn(security_headers))
            .layer(axum_middleware::from_fn_with_state(
                self.state.clone(),
                rate_limit_middleware,
            ))
            .layer(middleware_stack)
            .with_state(self.state.clone())
    }
}
