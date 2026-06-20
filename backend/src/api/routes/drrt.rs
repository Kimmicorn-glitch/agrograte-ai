use crate::auth::middleware::AuthenticatedUser;
use crate::drrt::engine::DrrtStateSummary;
use crate::drrt::tensor::{DimensionName, RelationSign, RelationType};
use crate::repositories;
use crate::AppState;
use axum::{
    extract::{Extension, State},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

#[derive(Serialize)]
#[allow(dead_code)]
struct DrrtStateResponse {
    state: DrrtStateSummary,
}

#[derive(Serialize)]
struct DimensionResponse {
    id: Uuid,
    name: String,
    weight: f64,
    activation: f64,
}

#[derive(Serialize)]
struct RelationshipResponse {
    id: Uuid,
    source_id: Uuid,
    target_id: Uuid,
    relation_type: String,
    strength: f64,
    sign: String,
}

async fn get_drrt_state(State(state): State<AppState>) -> Json<serde_json::Value> {
    let drrt = state.drrt.read().await;
    let summary = drrt.get_state_summary();
    let dimensions: Vec<DimensionResponse> = drrt
        .primary_tensor
        .dimensions
        .iter()
        .map(|d| DimensionResponse {
            id: d.id,
            name: format!("{:?}", d.name),
            weight: d.weight,
            activation: d.activation,
        })
        .collect();
    let relationships: Vec<RelationshipResponse> = drrt
        .primary_tensor
        .relationships
        .iter()
        .map(|r| RelationshipResponse {
            id: Uuid::new_v4(),
            source_id: r.source_id,
            target_id: r.target_id,
            relation_type: format!("{:?}", r.relation_type),
            strength: r.strength,
            sign: format!("{:?}", r.sign),
        })
        .collect();
    Json(json!({
        "state": summary,
        "dimensions": dimensions,
        "relationships": relationships,
    }))
}

async fn get_dimensions(State(state): State<AppState>) -> Json<Vec<DimensionResponse>> {
    let drrt = state.drrt.read().await;
    Json(
        drrt.primary_tensor
            .dimensions
            .iter()
            .map(|d| DimensionResponse {
                id: d.id,
                name: format!("{:?}", d.name),
                weight: d.weight,
                activation: d.activation,
            })
            .collect(),
    )
}

async fn converge_drrt(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Json<serde_json::Value> {
    let mut drrt = state.drrt.write().await;
    let result = drrt.converge(1000);
    let summary = drrt.get_state_summary();
    let dimensions: Vec<DimensionResponse> = drrt
        .primary_tensor
        .dimensions
        .iter()
        .map(|d| DimensionResponse {
            id: d.id,
            name: format!("{:?}", d.name),
            weight: d.weight,
            activation: d.activation,
        })
        .collect();

    repositories::audit::insert_event(
        &state.pool,
        user.user_id,
        "drrt_converged",
        "drrt_engine",
        None,
        Some(json!({
            "coherence": summary.coherence,
            "contradiction": summary.contradiction,
            "iterations": 1000,
        })),
    )
    .await
    .ok();

    Json(serde_json::json!({
        "convergence_result": format!("{:?}", result),
        "state": summary,
        "dimensions": dimensions,
    }))
}

#[derive(Deserialize)]
struct AddRelationshipRequest {
    source: String,
    target: String,
    relation_type: String,
    strength: f64,
    sign: String,
}

async fn add_relationship(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Json(req): Json<AddRelationshipRequest>,
) -> Json<serde_json::Value> {
    let source_dim = match req.source.to_lowercase().as_str() {
        "transaction_value" => DimensionName::TransactionValue,
        "account_balance" => DimensionName::AccountBalance,
        "customer_trust" => DimensionName::CustomerTrust,
        "supplier_reliability" => DimensionName::SupplierReliability,
        "invoice_validity" => DimensionName::InvoiceValidity,
        "tax_compliance" => DimensionName::TaxCompliance,
        "vat_alignment" => DimensionName::VatAlignment,
        "cash_flow_liquidity" => DimensionName::CashFlowLiquidity,
        "regulatory_risk" => DimensionName::RegulatoryRisk,
        "payment_velocity" => DimensionName::PaymentVelocity,
        "credit_exposure" => DimensionName::CreditExposure,
        "audit_trail" => DimensionName::AuditTrail,
        _ => return Json(serde_json::json!({"error": "Unknown source dimension"})),
    };

    let target_dim = match req.target.to_lowercase().as_str() {
        "transaction_value" => DimensionName::TransactionValue,
        "account_balance" => DimensionName::AccountBalance,
        "customer_trust" => DimensionName::CustomerTrust,
        "supplier_reliability" => DimensionName::SupplierReliability,
        "invoice_validity" => DimensionName::InvoiceValidity,
        "tax_compliance" => DimensionName::TaxCompliance,
        "vat_alignment" => DimensionName::VatAlignment,
        "cash_flow_liquidity" => DimensionName::CashFlowLiquidity,
        "regulatory_risk" => DimensionName::RegulatoryRisk,
        "payment_velocity" => DimensionName::PaymentVelocity,
        "credit_exposure" => DimensionName::CreditExposure,
        "audit_trail" => DimensionName::AuditTrail,
        _ => return Json(serde_json::json!({"error": "Unknown target dimension"})),
    };

    let rel_type = match req.relation_type.to_lowercase().as_str() {
        "financial_flow" => RelationType::FinancialFlow,
        "trust_link" => RelationType::TrustLink,
        "compliance_dependency" => RelationType::ComplianceDependency,
        "temporal_sequence" => RelationType::TemporalSequence,
        "causal_dependency" => RelationType::CausalDependency,
        "audit_trail" => RelationType::AuditTrail,
        _ => return Json(serde_json::json!({"error": "Unknown relation type"})),
    };

    let sign = match req.sign.to_lowercase().as_str() {
        "positive" => RelationSign::Positive,
        "negative" => RelationSign::Negative,
        "neutral" => RelationSign::Neutral,
        _ => return Json(serde_json::json!({"error": "Unknown sign"})),
    };

    let mut drrt = state.drrt.write().await;
    match drrt.add_relationship(source_dim, target_dim, rel_type, req.strength, sign) {
        Ok(()) => {
            let result = drrt.converge(500);
            let summary = drrt.get_state_summary();
            let dimensions: Vec<DimensionResponse> = drrt
                .primary_tensor
                .dimensions
                .iter()
                .map(|d| DimensionResponse {
                    id: d.id,
                    name: format!("{:?}", d.name),
                    weight: d.weight,
                    activation: d.activation,
                })
                .collect();

            repositories::audit::insert_event(
                &state.pool,
                user.user_id,
                "drrt_relationship_added",
                "drrt_engine",
                None,
                Some(json!({
                    "source": req.source,
                    "target": req.target,
                    "relation_type": req.relation_type,
                    "strength": req.strength,
                    "sign": req.sign,
                })),
            )
            .await
            .ok();

            Json(serde_json::json!({
                "success": true,
                "message": "Relationship added and tensor converged",
                "convergence": format!("{:?}", result),
                "state": summary,
                "dimensions": dimensions,
            }))
        }
        Err(e) => Json(serde_json::json!({"error": e})),
    }
}

async fn get_memory(State(state): State<AppState>) -> Json<serde_json::Value> {
    let drrt = state.drrt.read().await;
    Json(serde_json::json!({
        "memory_size": drrt.memory.state_history.len(),
        "patterns": drrt.memory.pattern_memory,
        "recent_history": drrt.memory.state_history.iter().rev().take(20).collect::<Vec<_>>(),
    }))
}

pub fn drrt_routes() -> Router<AppState> {
    Router::new()
        .route("/api/drrt/state", get(get_drrt_state))
        .route("/api/drrt/dimensions", get(get_dimensions))
        .route("/api/drrt/converge", post(converge_drrt))
        .route("/api/drrt/relationship", post(add_relationship))
        .route("/api/drrt/memory", get(get_memory))
}
