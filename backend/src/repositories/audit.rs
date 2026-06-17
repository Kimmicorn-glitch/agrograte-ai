use sqlx::PgPool;
use uuid::Uuid;

use crate::domain::approval::AuditLogEntry;

pub async fn list(
    pool: &PgPool,
    entity_type: Option<&str>,
    action: Option<&str>,
    limit: Option<usize>,
) -> Result<Vec<AuditLogEntry>, sqlx::Error> {
    let limit = limit.unwrap_or(100).min(1000) as i64;

    let rows = sqlx::query_as::<_, AuditRow>(
        "SELECT id, user_id, business_id, action, entity_type, entity_id, before_state, after_state, ip_address, created_at FROM audit_logs WHERE ($1::text IS NULL OR entity_type = $1) AND ($2::text IS NULL OR action = $2) ORDER BY created_at DESC LIMIT $3",
    )
    .bind(entity_type)
    .bind(action)
    .bind(limit)
    .fetch_all(pool)
    .await?;

    rows.into_iter().map(|r| r.try_into()).collect()
}

pub async fn insert(pool: &PgPool, entry: &AuditLogEntry) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO audit_logs (id, user_id, business_id, action, entity_type, entity_id, before_state, after_state, ip_address, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    )
    .bind(entry.id)
    .bind(entry.user_id)
    .bind(entry.business_id)
    .bind(&entry.action)
    .bind(&entry.entity_type)
    .bind(entry.entity_id)
    .bind(&entry.before_state)
    .bind(&entry.after_state)
    .bind(&entry.ip_address)
    .bind(entry.created_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn insert_event(
    pool: &PgPool,
    user_id: Uuid,
    action: &str,
    entity_type: &str,
    entity_id: Option<Uuid>,
    after_state: Option<serde_json::Value>,
) -> Result<(), sqlx::Error> {
    let entry = AuditLogEntry {
        id: Uuid::new_v4(),
        user_id,
        business_id: None,
        action: action.to_string(),
        entity_type: entity_type.to_string(),
        entity_id,
        before_state: None,
        after_state,
        ip_address: None,
        created_at: chrono::Utc::now(),
    };

    insert(pool, &entry).await
}

#[derive(sqlx::FromRow)]
struct AuditRow {
    id: Uuid,
    user_id: Option<Uuid>,
    business_id: Option<Uuid>,
    action: String,
    entity_type: String,
    entity_id: Option<Uuid>,
    before_state: Option<serde_json::Value>,
    after_state: Option<serde_json::Value>,
    ip_address: Option<String>,
    created_at: chrono::DateTime<chrono::Utc>,
}

impl TryFrom<AuditRow> for AuditLogEntry {
    type Error = sqlx::Error;

    fn try_from(row: AuditRow) -> Result<Self, Self::Error> {
        Ok(AuditLogEntry {
            id: row.id,
            user_id: row.user_id.unwrap_or_default(),
            business_id: row.business_id,
            action: row.action,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            before_state: row.before_state,
            after_state: row.after_state,
            ip_address: row.ip_address,
            created_at: row.created_at,
        })
    }
}
