use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::domain::approval::{ApprovalStatus, ApprovalWorkflow};

pub async fn list_pending(pool: &PgPool) -> Result<Vec<ApprovalWorkflow>, sqlx::Error> {
    let rows = sqlx::query_as::<_, ApprovalRow>(
        "SELECT id, rule_id, trigger_type, entity_type, entity_id, requester_id, approver_ids, approved_by, status, payload, reason, drrt_coherence, created_at, updated_at FROM approval_workflows WHERE status = 'pending' ORDER BY created_at DESC",
    )
    .fetch_all(pool)
    .await?;

    rows.into_iter().map(|r| r.try_into()).collect()
}

pub async fn list_all(pool: &PgPool) -> Result<Vec<ApprovalWorkflow>, sqlx::Error> {
    let rows = sqlx::query_as::<_, ApprovalRow>(
        "SELECT id, rule_id, trigger_type, entity_type, entity_id, requester_id, approver_ids, approved_by, status, payload, reason, drrt_coherence, created_at, updated_at FROM approval_workflows ORDER BY created_at DESC",
    )
    .fetch_all(pool)
    .await?;

    rows.into_iter().map(|r| r.try_into()).collect()
}

pub async fn create(pool: &PgPool, workflow: &ApprovalWorkflow) -> Result<(), sqlx::Error> {
    let status_str = workflow.status.to_string();

    sqlx::query(
        "INSERT INTO approval_workflows (id, rule_id, trigger_type, entity_type, entity_id, requester_id, approver_ids, approved_by, status, payload, reason, drrt_coherence, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
    )
    .bind(workflow.id)
    .bind(workflow.rule_id)
    .bind(&workflow.trigger_type)
    .bind(&workflow.entity_type)
    .bind(workflow.entity_id)
    .bind(workflow.requester_id)
    .bind(&workflow.approver_ids)
    .bind(&workflow.approved_by)
    .bind(&status_str)
    .bind(&workflow.payload)
    .bind(&workflow.reason)
    .bind(workflow.drrt_coherence)
    .bind(workflow.created_at)
    .bind(workflow.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn update_status(
    pool: &PgPool,
    id: Uuid,
    status: &ApprovalStatus,
    approved_by: &[Uuid],
    reason: Option<&str>,
) -> Result<Option<ApprovalWorkflow>, sqlx::Error> {
    let status_str = status.to_string();
    let now = Utc::now();

    let row = sqlx::query_as::<_, ApprovalRow>(
        "UPDATE approval_workflows SET status = $1, approved_by = $2, reason = COALESCE($3, reason), updated_at = $4 WHERE id = $5 RETURNING id, rule_id, trigger_type, entity_type, entity_id, requester_id, approver_ids, approved_by, status, payload, reason, drrt_coherence, created_at, updated_at",
    )
    .bind(&status_str)
    .bind(approved_by)
    .bind(reason)
    .bind(now)
    .bind(id)
    .fetch_optional(pool)
    .await?;

    row.map(|r| r.try_into()).transpose()
}

pub async fn get(pool: &PgPool, id: Uuid) -> Result<Option<ApprovalWorkflow>, sqlx::Error> {
    let row = sqlx::query_as::<_, ApprovalRow>(
        "SELECT id, rule_id, trigger_type, entity_type, entity_id, requester_id, approver_ids, approved_by, status, payload, reason, drrt_coherence, created_at, updated_at FROM approval_workflows WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    row.map(|r| r.try_into()).transpose()
}

#[derive(sqlx::FromRow)]
struct ApprovalRow {
    id: Uuid,
    rule_id: Option<Uuid>,
    trigger_type: String,
    entity_type: String,
    entity_id: Option<Uuid>,
    requester_id: Uuid,
    approver_ids: Vec<Uuid>,
    approved_by: Vec<Uuid>,
    status: String,
    payload: Option<serde_json::Value>,
    reason: Option<String>,
    drrt_coherence: f64,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
}

impl TryFrom<ApprovalRow> for ApprovalWorkflow {
    type Error = sqlx::Error;

    fn try_from(row: ApprovalRow) -> Result<Self, Self::Error> {
        let status = match row.status.as_str() {
            "approved" => ApprovalStatus::Approved,
            "rejected" => ApprovalStatus::Rejected,
            "cancelled" => ApprovalStatus::Cancelled,
            _ => ApprovalStatus::Pending,
        };

        Ok(ApprovalWorkflow {
            id: row.id,
            rule_id: row.rule_id,
            trigger_type: row.trigger_type,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            requester_id: row.requester_id,
            approver_ids: row.approver_ids,
            approved_by: row.approved_by,
            status,
            payload: row.payload.unwrap_or_default(),
            reason: row.reason,
            drrt_coherence: row.drrt_coherence,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }
}
