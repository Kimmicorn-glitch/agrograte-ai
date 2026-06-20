use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

use crate::auth::middleware::AuthenticatedUser;
use crate::domain::approval::{ApprovalStatus, ApprovalWorkflow};
use crate::repositories;
use crate::AppState;

#[derive(Deserialize)]
struct CreateApprovalRequest {
    rule_id: Option<Uuid>,
    trigger_type: String,
    entity_type: String,
    entity_id: Option<Uuid>,
    approver_ids: Vec<Uuid>,
    reason: Option<String>,
}

#[derive(Deserialize)]
struct ApprovalAction {
    reason: Option<String>,
}

#[derive(Deserialize)]
struct AuditQuery {
    entity_type: Option<String>,
    action: Option<String>,
    limit: Option<usize>,
}

async fn list_pending(
    State(state): State<AppState>,
) -> Result<Json<Vec<ApprovalWorkflow>>, (StatusCode, Json<serde_json::Value>)> {
    repositories::approvals::list_pending(&state.pool)
        .await
        .map(Json)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })
}

async fn list_all(
    State(state): State<AppState>,
) -> Result<Json<Vec<ApprovalWorkflow>>, (StatusCode, Json<serde_json::Value>)> {
    repositories::approvals::list_all(&state.pool)
        .await
        .map(Json)
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })
}

async fn create_approval(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Json(req): Json<CreateApprovalRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let entity_type = req.entity_type.clone();
    let drrt = state.drrt.read().await;
    let workflow = ApprovalWorkflow {
        id: Uuid::new_v4(),
        rule_id: req.rule_id,
        trigger_type: req.trigger_type,
        entity_type,
        entity_id: req.entity_id,
        requester_id: user.user_id,
        approver_ids: req.approver_ids,
        approved_by: Vec::new(),
        status: ApprovalStatus::Pending,
        payload: json!({
            "rule_id": req.rule_id,
            "entity_type": req.entity_type,
            "entity_id": req.entity_id,
        }),
        reason: req.reason,
        drrt_coherence: drrt.global_coherence,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    repositories::approvals::create(&state.pool, &workflow)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;

    repositories::audit::insert_event(
        &state.pool,
        user.user_id,
        "approval_requested",
        "approval_workflow",
        Some(workflow.id),
        Some(json!({"workflow_id": workflow.id, "status": "pending"})),
    )
    .await
    .ok();

    Ok(Json(json!({"success": true, "approval": workflow})))
}

async fn approve(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
    Json(req): Json<ApprovalAction>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let existing = repositories::approvals::get(&state.pool, id)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;

    match existing {
        Some(wf) if !matches!(wf.status, ApprovalStatus::Pending) => {
            return Err((
                StatusCode::CONFLICT,
                Json(json!({"error": "Workflow is not pending", "code": "CONFLICT"})),
            ))
        }
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({"error": "Approval workflow not found", "code": "NOT_FOUND"})),
            ))
        }
        _ => {}
    }

    let approved_by = vec![user.user_id];
    let updated = repositories::approvals::update_status(
        &state.pool,
        id,
        &ApprovalStatus::Approved,
        &approved_by,
        req.reason.as_deref(),
    )
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
        )
    })?;

    match updated {
        Some(wf) => {
            repositories::audit::insert_event(
                &state.pool,
                user.user_id,
                "approval_approved",
                "approval_workflow",
                Some(id),
                Some(json!({"workflow_id": id, "status": "approved", "reason": req.reason})),
            )
            .await
            .ok();

            Ok(Json(json!({"success": true, "approval": wf})))
        }
        None => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Approval workflow not found", "code": "NOT_FOUND"})),
        )),
    }
}

async fn reject(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
    Json(req): Json<ApprovalAction>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let existing = repositories::approvals::get(&state.pool, id)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
            )
        })?;

    match existing {
        Some(wf) if !matches!(wf.status, ApprovalStatus::Pending) => {
            return Err((
                StatusCode::CONFLICT,
                Json(json!({"error": "Workflow is not pending", "code": "CONFLICT"})),
            ))
        }
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({"error": "Approval workflow not found", "code": "NOT_FOUND"})),
            ))
        }
        _ => {}
    }

    let updated = repositories::approvals::update_status(
        &state.pool,
        id,
        &ApprovalStatus::Rejected,
        &[],
        req.reason.as_deref(),
    )
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
        )
    })?;

    match updated {
        Some(wf) => {
            repositories::audit::insert_event(
                &state.pool,
                user.user_id,
                "approval_rejected",
                "approval_workflow",
                Some(id),
                Some(json!({"workflow_id": id, "status": "rejected", "reason": req.reason})),
            )
            .await
            .ok();

            Ok(Json(json!({"success": true, "approval": wf})))
        }
        None => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Approval workflow not found", "code": "NOT_FOUND"})),
        )),
    }
}

async fn list_audit_logs(
    State(state): State<AppState>,
    Query(query): Query<AuditQuery>,
) -> Result<Json<Vec<crate::domain::approval::AuditLogEntry>>, (StatusCode, Json<serde_json::Value>)>
{
    repositories::audit::list(
        &state.pool,
        query.entity_type.as_deref(),
        query.action.as_deref(),
        query.limit,
    )
    .await
    .map(Json)
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"})),
        )
    })
}

pub fn approval_routes() -> Router<AppState> {
    Router::new()
        .route("/api/approval/pending", get(list_pending))
        .route("/api/approval/all", get(list_all))
        .route("/api/approval/create", post(create_approval))
        .route("/api/approval/{id}/approve", post(approve))
        .route("/api/approval/{id}/reject", post(reject))
        .route("/api/audit/logs", get(list_audit_logs))
}
