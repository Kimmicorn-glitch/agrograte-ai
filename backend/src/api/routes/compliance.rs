use axum::{
    extract::{Extension, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use chrono::{Datelike, Utc};
use serde::Serialize;

use crate::auth::middleware::AuthenticatedUser;
use crate::drrt::engine::FinancialMetrics;
use crate::sars::compliance::SarsCompliance;
use crate::sars::tax_reserve::TaxReserveEngine;
use crate::sars::vat::VatEngine;
use crate::AppState;

#[derive(Serialize)]
struct ComplianceSummaryResponse {
    sars_compliance_score: f64,
    vat_compliant: bool,
    tax_compliant: bool,
    outstanding_returns: u32,
    drrt_coherence: f64,
}

#[derive(Serialize)]
struct FullComplianceReportResponse {
    overall_score: f64,
    vat_score: f64,
    vat_compliant: bool,
    tax_score: f64,
    tax_compliant: bool,
    violations: Vec<ViolationResponse>,
    recommendations: Vec<String>,
    drrt_coherence: f64,
}

#[derive(Serialize)]
struct ViolationResponse {
    code: String,
    severity: String,
    description: String,
    regulation_ref: String,
    remediation: String,
}

#[derive(Serialize)]
struct VatReturnResponse {
    period: String,
    start: String,
    end: String,
    vat_on_sales: f64,
    vat_on_purchases: f64,
    net_vat_due: f64,
    is_submitted: bool,
    penalties: f64,
}

#[derive(Serialize)]
struct TaxRecordResponse {
    tax_period: String,
    tax_type: String,
    amount_due: f64,
    amount_paid: f64,
    balance: f64,
    status: String,
}

#[derive(Serialize)]
struct TaxReserveResponse {
    estimated_vat_liability: f64,
    estimated_income_tax: f64,
    estimated_paye: f64,
    total_reserve_required: f64,
    current_reserve_balance: f64,
    reserve_gap: f64,
    drrt_confidence: f64,
    recommended_monthly_allocation: f64,
}

async fn get_compliance_summary(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<ComplianceSummaryResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let vat_rows = sqlx::query_as::<_, VatReturnRow>(
        "SELECT id, period_start, period_end, total_sales, total_purchases, vat_on_sales, vat_on_purchases, net_vat_due, is_submitted, submission_date, sars_reference, penalties FROM vat_returns WHERE business_id = $1"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let tax_rows = sqlx::query_as::<_, TaxRecordRow>(
        "SELECT id, tax_period, tax_type, amount_due, amount_paid, balance, due_date, status, filed_at FROM tax_records WHERE business_id = $1"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let vat_returns: Vec<crate::domain::models::VatReturn> = vat_rows.into_iter().map(|r| r.into()).collect();
    let tax_records: Vec<crate::domain::models::TaxRecord> = tax_rows.into_iter().map(|r| r.into()).collect();

    let mut drrt = state.drrt.write().await;
    {
        let submitted = vat_returns.iter().filter(|r| r.is_submitted).count();
        let total_vat = vat_returns.len();
        let vat_ratio = if total_vat > 0 { submitted as f64 / total_vat as f64 } else { 0.0 };
        let paid = tax_records.iter().filter(|r| r.amount_paid.amount >= r.amount_due.amount).count();
        let total_tax = tax_records.len();
        let tax_ratio = if total_tax > 0 { paid as f64 / total_tax as f64 } else { 0.0 };
        let mut metrics = FinancialMetrics::default();
        metrics.vat_compliance_ratio = Some(vat_ratio);
        metrics.tax_compliance_ratio = Some(tax_ratio);
        metrics.compliance_score = Some((vat_ratio + tax_ratio) / 2.0);
        drrt.update_from_financial_data(&metrics);
    }
    let coherence = drrt.global_coherence;

    let report = SarsCompliance::generate_compliance_report(business_id, &vat_returns, &tax_records, coherence);
    let outstanding = report.vat_compliance.outstanding_returns.len() as u32;

    Ok(Json(ComplianceSummaryResponse {
        sars_compliance_score: (report.overall_score * 100.0).round(),
        vat_compliant: report.vat_compliance.is_compliant,
        tax_compliant: report.income_tax_compliance.is_compliant,
        outstanding_returns: outstanding,
        drrt_coherence: coherence,
    }))
}

async fn get_compliance_report(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<FullComplianceReportResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let vat_rows = sqlx::query_as::<_, VatReturnRow>(
        "SELECT id, period_start, period_end, total_sales, total_purchases, vat_on_sales, vat_on_purchases, net_vat_due, is_submitted, submission_date, sars_reference, penalties FROM vat_returns WHERE business_id = $1"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let tax_rows = sqlx::query_as::<_, TaxRecordRow>(
        "SELECT id, tax_period, tax_type, amount_due, amount_paid, balance, due_date, status, filed_at FROM tax_records WHERE business_id = $1"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let vat_returns: Vec<crate::domain::models::VatReturn> = vat_rows.into_iter().map(|r| r.into()).collect();
    let tax_records: Vec<crate::domain::models::TaxRecord> = tax_rows.into_iter().map(|r| r.into()).collect();

    let mut drrt = state.drrt.write().await;
    {
        let submitted = vat_returns.iter().filter(|r| r.is_submitted).count();
        let total_vat = vat_returns.len();
        let vat_ratio = if total_vat > 0 { submitted as f64 / total_vat as f64 } else { 0.0 };
        let paid = tax_records.iter().filter(|r| r.amount_paid.amount >= r.amount_due.amount).count();
        let total_tax = tax_records.len();
        let tax_ratio = if total_tax > 0 { paid as f64 / total_tax as f64 } else { 0.0 };
        let mut metrics = FinancialMetrics::default();
        metrics.vat_compliance_ratio = Some(vat_ratio);
        metrics.tax_compliance_ratio = Some(tax_ratio);
        metrics.compliance_score = Some((vat_ratio + tax_ratio) / 2.0);
        drrt.update_from_financial_data(&metrics);
    }
    let coherence = drrt.global_coherence;

    let report = SarsCompliance::generate_compliance_report(business_id, &vat_returns, &tax_records, coherence);

    Ok(Json(FullComplianceReportResponse {
        overall_score: report.overall_score,
        vat_score: report.vat_compliance.score,
        vat_compliant: report.vat_compliance.is_compliant,
        tax_score: report.income_tax_compliance.score,
        tax_compliant: report.income_tax_compliance.is_compliant,
        violations: report.violations.into_iter().map(|v| ViolationResponse {
            code: v.code,
            severity: format!("{:?}", v.severity),
            description: v.description,
            regulation_ref: v.regulation_ref,
            remediation: v.remediation,
        }).collect(),
        recommendations: report.recommendations,
        drrt_coherence: coherence,
    }))
}

async fn get_vat_returns(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<Vec<VatReturnResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let rows = sqlx::query_as::<_, VatReturnRow>(
        "SELECT id, period_start, period_end, total_sales, total_purchases, vat_on_sales, vat_on_purchases, net_vat_due, is_submitted, submission_date, sars_reference, penalties FROM vat_returns WHERE business_id = $1 ORDER BY period_start DESC"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    if rows.is_empty() {
        let now = Utc::now();
        let year = now.year();
        let periods = VatEngine::get_vat_periods(year);
        let returns: Vec<VatReturnResponse> = periods.into_iter().enumerate().map(|(i, (start, end))| VatReturnResponse {
            period: format!("{}-{}", start.format("%b"), end.format("%b")),
            start: start.to_rfc3339(),
            end: end.to_rfc3339(),
            vat_on_sales: 0.0,
            vat_on_purchases: 0.0,
            net_vat_due: 0.0,
            is_submitted: i < now.month0() as usize,
            penalties: 0.0,
        }).collect();
        return Ok(Json(returns));
    }

    Ok(Json(rows.into_iter().map(|r| VatReturnResponse {
        period: format!("{} to {}", r.period_start.format("%Y-%m-%d"), r.period_end.format("%Y-%m-%d")),
        start: r.period_start.to_rfc3339(),
        end: r.period_end.to_rfc3339(),
        vat_on_sales: r.vat_on_sales,
        vat_on_purchases: r.vat_on_purchases,
        net_vat_due: r.net_vat_due,
        is_submitted: r.is_submitted,
        penalties: r.penalties,
    }).collect()))
}

async fn get_tax_records(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<Vec<TaxRecordResponse>>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let rows = sqlx::query_as::<_, TaxRecordRow>(
        "SELECT id, tax_period, tax_type, amount_due, amount_paid, balance, due_date, status, filed_at FROM tax_records WHERE business_id = $1 ORDER BY due_date DESC"
    )
    .bind(business_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    if rows.is_empty() {
        return Ok(Json(vec![
            TaxRecordResponse {
                tax_period: "2025".into(),
                tax_type: "IncomeTax".into(),
                amount_due: 0.0,
                amount_paid: 0.0,
                balance: 0.0,
                status: "Pending".into(),
            },
        ]));
    }

    Ok(Json(rows.into_iter().map(|r| TaxRecordResponse {
        tax_period: r.tax_period,
        tax_type: r.tax_type,
        amount_due: r.amount_due,
        amount_paid: r.amount_paid,
        balance: r.balance,
        status: r.status,
    }).collect()))
}

async fn get_tax_reserve(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
) -> Result<Json<TaxReserveResponse>, (StatusCode, Json<serde_json::Value>)> {
    let business_id = user.business_id.unwrap_or_default();

    let invoice_rows = sqlx::query_as::<_, (f64, f64)>(
        "SELECT COALESCE(SUM(total), 0), COALESCE(SUM(vat_amount), 0) FROM invoices WHERE business_id = $1 AND status = 'paid'"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?;

    let (_total_invoiced, total_vat) = invoice_rows;

    let reserved = sqlx::query_scalar::<_, Option<f64>>(
        "SELECT SUM(reserved_tax_funds) FROM accounts WHERE business_id = $1 AND is_active = true"
    )
    .bind(business_id)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string(), "code": "DATABASE_ERROR"}))))?
    .unwrap_or(0.0);

    let mut drrt = state.drrt.write().await;
    {
        let paid_invoice_ratio = if total_vat > 0.0 { 1.0 } else { 0.0 };
        let mut metrics = FinancialMetrics::default();
        metrics.paid_invoice_ratio = Some(paid_invoice_ratio);
        drrt.update_from_financial_data(&metrics);
    }
    let calc = TaxReserveEngine::calculate_reserves(business_id, &[], &*drrt, reserved);

    Ok(Json(TaxReserveResponse {
        estimated_vat_liability: if total_vat > 0.0 { total_vat } else { calc.estimated_vat_liability.amount },
        estimated_income_tax: calc.estimated_income_tax.amount,
        estimated_paye: calc.estimated_paye.amount,
        total_reserve_required: calc.total_reserve_required.amount,
        current_reserve_balance: calc.current_reserve_balance.amount,
        reserve_gap: calc.reserve_gap.amount,
        drrt_confidence: calc.drrt_confidence,
        recommended_monthly_allocation: calc.recommended_monthly_allocation.amount,
    }))
}

pub fn compliance_routes() -> Router<AppState> {
    Router::new()
        .route("/api/compliance/summary", get(get_compliance_summary))
        .route("/api/compliance/report", get(get_compliance_report))
        .route("/api/compliance/vat-returns", get(get_vat_returns))
        .route("/api/compliance/tax-records", get(get_tax_records))
        .route("/api/compliance/tax-reserve", get(get_tax_reserve))
}

#[derive(sqlx::FromRow)]
struct VatReturnRow {
    id: uuid::Uuid,
    period_start: chrono::DateTime<chrono::Utc>,
    period_end: chrono::DateTime<chrono::Utc>,
    total_sales: f64,
    total_purchases: f64,
    vat_on_sales: f64,
    vat_on_purchases: f64,
    net_vat_due: f64,
    is_submitted: bool,
    submission_date: Option<chrono::DateTime<chrono::Utc>>,
    sars_reference: Option<String>,
    penalties: f64,
}

#[derive(sqlx::FromRow)]
struct TaxRecordRow {
    id: uuid::Uuid,
    tax_period: String,
    tax_type: String,
    amount_due: f64,
    amount_paid: f64,
    balance: f64,
    due_date: chrono::DateTime<chrono::Utc>,
    status: String,
    filed_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl From<VatReturnRow> for crate::domain::models::VatReturn {
    fn from(r: VatReturnRow) -> Self {
        Self {
            id: r.id,
            business_id: uuid::Uuid::nil(),
            period_start: r.period_start,
            period_end: r.period_end,
            total_sales: crate::domain::value_objects::Money::zar(r.total_sales),
            total_purchases: crate::domain::value_objects::Money::zar(r.total_purchases),
            vat_on_sales: crate::domain::value_objects::Money::zar(r.vat_on_sales),
            vat_on_purchases: crate::domain::value_objects::Money::zar(r.vat_on_purchases),
            net_vat_due: crate::domain::value_objects::Money::zar(r.net_vat_due),
            is_submitted: r.is_submitted,
            submission_date: r.submission_date,
            sars_reference: r.sars_reference,
            penalties: crate::domain::value_objects::Money::zar(r.penalties),
        }
    }
}

impl From<TaxRecordRow> for crate::domain::models::TaxRecord {
    fn from(r: TaxRecordRow) -> Self {
        use crate::domain::models::TaxType;
        Self {
            id: r.id,
            business_id: uuid::Uuid::nil(),
            tax_period: r.tax_period,
            tax_type: match r.tax_type.to_lowercase().as_str() {
                "vat" => TaxType::Vat,
                "paye" => TaxType::Paye,
                "uif" => TaxType::Uif,
                "sdl" => TaxType::Sdl,
                _ => TaxType::IncomeTax,
            },
            amount_due: crate::domain::value_objects::Money::zar(r.amount_due),
            amount_paid: crate::domain::value_objects::Money::zar(r.amount_paid),
            balance: crate::domain::value_objects::Money::zar(r.balance),
            due_date: r.due_date,
            status: crate::domain::models::ComplianceStatus::Pending,
            filed_at: r.filed_at,
        }
    }
}
