use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::{ComplianceStatus, TaxRecord, TaxType, VatReturn};
use crate::domain::value_objects::Money;

/// SARS compliance engine
/// Validates financial data against South African Revenue Service requirements
/// including VAT returns, income tax, PAYE, UIF, SDL
#[derive(Clone)]
pub struct SarsCompliance;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub business_id: Uuid,
    pub generated_at: DateTime<Utc>,
    pub overall_score: f64,
    pub vat_compliance: VatComplianceResult,
    pub income_tax_compliance: TaxComplianceResult,
    pub payroll_compliance: PayrollComplianceResult,
    pub drrt_coherence: f64,
    pub violations: Vec<ComplianceViolation>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VatComplianceResult {
    pub is_compliant: bool,
    pub vat_number_valid: bool,
    pub returns_filed_on_time: bool,
    pub vat_paid_on_time: bool,
    pub score: f64,
    pub outstanding_returns: Vec<String>,
    pub late_returns: Vec<String>,
    pub penalties: Money,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxComplianceResult {
    pub is_compliant: bool,
    pub provisional_tax_paid: bool,
    pub annual_return_filed: bool,
    pub score: f64,
    pub outstanding_periods: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayrollComplianceResult {
    pub is_compliant: bool,
    pub paye_filed: bool,
    pub uif_filed: bool,
    pub sdl_filed: bool,
    pub score: f64,
    pub assessed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceViolation {
    pub code: String,
    pub severity: ViolationSeverity,
    pub description: String,
    pub regulation_ref: String,
    pub remediation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViolationSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

impl SarsCompliance {
    pub fn check_vat_compliance(
        vat_returns: &[VatReturn],
        _current_date: DateTime<Utc>,
    ) -> VatComplianceResult {
        if vat_returns.is_empty() {
            return VatComplianceResult {
                is_compliant: false,
                vat_number_valid: true,
                returns_filed_on_time: false,
                vat_paid_on_time: false,
                score: 0.0,
                outstanding_returns: vec!["No VAT returns filed".into()],
                late_returns: vec![],
                penalties: Money::zar(0.0),
            };
        }

        let all_filed = vat_returns.iter().all(|r| r.is_submitted);
        let vat_paid = vat_returns
            .iter()
            .all(|r| r.net_vat_due.amount <= 0.0 || r.is_submitted);
        let total_penalties: f64 = vat_returns.iter().map(|r| r.penalties.amount).sum();

        // Check if returns were filed on time (within period + 25 days)
        let on_time = vat_returns.iter().filter(|r| r.is_submitted).all(|r| {
            r.submission_date
                .map(|sd| {
                    let deadline = r.period_end + chrono::Duration::days(25);
                    sd <= deadline
                })
                .unwrap_or(false)
        });

        let filing_ratio = if vat_returns.is_empty() {
            0.0
        } else {
            vat_returns.iter().filter(|r| r.is_submitted).count() as f64 / vat_returns.len() as f64
        };

        let score = if all_filed && vat_paid && on_time {
            1.0
        } else if all_filed && vat_paid {
            0.85
        } else if all_filed {
            0.7
        } else {
            0.3 + filing_ratio * 0.4
        };

        let outstanding: Vec<String> = vat_returns
            .iter()
            .filter(|r| !r.is_submitted)
            .map(|r| {
                format!(
                    "{} to {}",
                    r.period_start.date_naive(),
                    r.period_end.date_naive()
                )
            })
            .collect();

        let late: Vec<String> = vat_returns
            .iter()
            .filter(|r| {
                r.is_submitted
                    && r.submission_date
                        .map(|sd| {
                            let deadline = r.period_end + chrono::Duration::days(25);
                            sd > deadline
                        })
                        .unwrap_or(false)
            })
            .map(|r| {
                format!(
                    "{} (due {}, filed {})",
                    r.period_start.date_naive(),
                    (r.period_end + chrono::Duration::days(25)).date_naive(),
                    r.submission_date
                        .map(|d| d.date_naive().to_string())
                        .unwrap_or_default()
                )
            })
            .collect();

        VatComplianceResult {
            is_compliant: score > 0.8,
            vat_number_valid: true,
            returns_filed_on_time: on_time,
            vat_paid_on_time: vat_paid,
            score: score.clamp(0.0, 1.0),
            outstanding_returns: outstanding,
            late_returns: late,
            penalties: Money::zar(total_penalties),
        }
    }

    pub fn check_tax_compliance(tax_records: &[TaxRecord]) -> TaxComplianceResult {
        if tax_records.is_empty() {
            return TaxComplianceResult {
                is_compliant: false,
                provisional_tax_paid: false,
                annual_return_filed: false,
                score: 0.0,
                outstanding_periods: vec!["No tax records found".into()],
            };
        }

        let all_filed = tax_records.iter().all(|r| {
            matches!(
                r.status,
                ComplianceStatus::Filed | ComplianceStatus::Approved
            )
        });
        let all_paid = tax_records.iter().all(|r| r.balance.amount <= 0.0);

        let filed_count = tax_records
            .iter()
            .filter(|r| {
                matches!(
                    r.status,
                    ComplianceStatus::Filed | ComplianceStatus::Approved
                )
            })
            .count();
        let paid_count = tax_records
            .iter()
            .filter(|r| r.balance.amount <= 0.0)
            .count();

        let filing_ratio = filed_count as f64 / tax_records.len() as f64;
        let payment_ratio = paid_count as f64 / tax_records.len() as f64;

        let score = match (all_filed, all_paid) {
            (true, true) => 1.0,
            (true, false) => 0.5 + payment_ratio * 0.3,
            (false, true) => 0.3 + filing_ratio * 0.3,
            (false, false) => filing_ratio * 0.3 + payment_ratio * 0.2,
        };

        let outstanding: Vec<String> = tax_records
            .iter()
            .filter(|r| r.balance.amount > 0.0)
            .map(|r| {
                format!(
                    "{} ({}) balance: R{:.2}",
                    r.tax_period, r.tax_type, r.balance.amount
                )
            })
            .collect();

        TaxComplianceResult {
            is_compliant: score > 0.7,
            provisional_tax_paid: all_paid,
            annual_return_filed: all_filed,
            score: score.clamp(0.0, 1.0),
            outstanding_periods: outstanding,
        }
    }

    pub fn check_payroll_compliance(tax_records: &[TaxRecord]) -> PayrollComplianceResult {
        let payroll_types = [TaxType::Paye, TaxType::Uif, TaxType::Sdl];
        let has_payroll_data = tax_records
            .iter()
            .any(|r| payroll_types.contains(&r.tax_type));

        if !has_payroll_data {
            return PayrollComplianceResult {
                is_compliant: true,
                paye_filed: true,
                uif_filed: true,
                sdl_filed: true,
                score: 0.5,
                assessed: false,
            };
        }

        let paye = tax_records
            .iter()
            .find(|r| r.tax_type == TaxType::Paye)
            .map(|r| {
                matches!(
                    r.status,
                    ComplianceStatus::Filed | ComplianceStatus::Approved
                ) && r.balance.amount <= 0.0
            })
            .unwrap_or(false);
        let uif = tax_records
            .iter()
            .find(|r| r.tax_type == TaxType::Uif)
            .map(|r| {
                matches!(
                    r.status,
                    ComplianceStatus::Filed | ComplianceStatus::Approved
                ) && r.balance.amount <= 0.0
            })
            .unwrap_or(false);
        let sdl = tax_records
            .iter()
            .find(|r| r.tax_type == TaxType::Sdl)
            .map(|r| {
                matches!(
                    r.status,
                    ComplianceStatus::Filed | ComplianceStatus::Approved
                ) && r.balance.amount <= 0.0
            })
            .unwrap_or(false);

        let score = match (paye, uif, sdl) {
            (true, true, true) => 1.0,
            (false, _, _) if !paye => 0.3,
            _ => 0.6,
        };

        PayrollComplianceResult {
            is_compliant: score > 0.7,
            paye_filed: paye,
            uif_filed: uif,
            sdl_filed: sdl,
            score,
            assessed: true,
        }
    }

    fn build_violations(
        vat_result: &VatComplianceResult,
        tax_result: &TaxComplianceResult,
        payroll_result: &PayrollComplianceResult,
    ) -> Vec<ComplianceViolation> {
        let mut violations = Vec::new();

        if !vat_result.is_compliant {
            for period in &vat_result.outstanding_returns {
                violations.push(ComplianceViolation {
                    code: "VAT-001".into(),
                    severity: ViolationSeverity::High,
                    description: format!("VAT return not filed for period {}", period),
                    regulation_ref: "VAT Act 89 of 1991".into(),
                    remediation: "File outstanding VAT return immediately".into(),
                });
            }
            for period in &vat_result.late_returns {
                violations.push(ComplianceViolation {
                    code: "VAT-002".into(),
                    severity: ViolationSeverity::Medium,
                    description: format!("VAT return filed late: {}", period),
                    regulation_ref: "VAT Act 89 of 1991 s28(2)".into(),
                    remediation: "Ensure future returns are filed within 25 days of period end"
                        .into(),
                });
            }
            if vat_result.penalties.amount > 0.0 {
                violations.push(ComplianceViolation {
                    code: "VAT-003".into(),
                    severity: ViolationSeverity::High,
                    description: format!(
                        "VAT penalties accrued: R{:.2}",
                        vat_result.penalties.amount
                    ),
                    regulation_ref: "VAT Act 89 of 1991 s39".into(),
                    remediation: "Pay outstanding penalties to avoid further escalation".into(),
                });
            }
        }

        if !tax_result.is_compliant {
            for period in &tax_result.outstanding_periods {
                violations.push(ComplianceViolation {
                    code: "TAX-001".into(),
                    severity: ViolationSeverity::Critical,
                    description: format!("Outstanding tax liability: {}", period),
                    regulation_ref: "Income Tax Act 58 of 1962".into(),
                    remediation: "Settle outstanding tax liability to avoid interest".into(),
                });
            }
        }

        if payroll_result.assessed && !payroll_result.is_compliant {
            if !payroll_result.paye_filed {
                violations.push(ComplianceViolation {
                    code: "PAY-001".into(),
                    severity: ViolationSeverity::High,
                    description: "PAYE returns not filed or outstanding balance".into(),
                    regulation_ref: "Fourth Schedule to Income Tax Act".into(),
                    remediation: "File PAYE returns and pay outstanding amounts".into(),
                });
            }
            if !payroll_result.uif_filed {
                violations.push(ComplianceViolation {
                    code: "PAY-002".into(),
                    severity: ViolationSeverity::Medium,
                    description: "UIF declarations not compliant".into(),
                    regulation_ref: "UI Contributions Act 4 of 2002".into(),
                    remediation: "Submit outstanding UIF declarations".into(),
                });
            }
            if !payroll_result.sdl_filed {
                violations.push(ComplianceViolation {
                    code: "PAY-003".into(),
                    severity: ViolationSeverity::Medium,
                    description: "SDL declarations not compliant".into(),
                    regulation_ref: "Skills Development Levies Act 9 of 1999".into(),
                    remediation: "Submit outstanding SDL declarations".into(),
                });
            }
        }

        violations
    }

    fn build_recommendations(
        vat_result: &VatComplianceResult,
        tax_result: &TaxComplianceResult,
        payroll_result: &PayrollComplianceResult,
        overall_score: f64,
    ) -> Vec<String> {
        let mut recs = Vec::new();

        if overall_score < 0.5 {
            recs.push("Engage a tax practitioner to review your compliance status.".into());
        }

        for period in &vat_result.outstanding_returns {
            recs.push(format!("File VAT return for {} to avoid penalties", period));
        }
        if !vat_result.late_returns.is_empty() {
            recs.push(
                "Set up calendar reminders for VAT filing deadlines (25th after period end)".into(),
            );
        }
        if !vat_result.vat_paid_on_time {
            recs.push("Automate VAT payments to ensure timely settlement".into());
        }

        for period in &tax_result.outstanding_periods {
            recs.push(format!("Pay outstanding tax liability: {}", period));
        }
        if !tax_result.annual_return_filed {
            recs.push("File annual income tax return before the deadline".into());
        }

        if payroll_result.assessed && !payroll_result.paye_filed {
            recs.push("File outstanding PAYE returns to avoid penalties".into());
        }
        if payroll_result.assessed && !payroll_result.uif_filed {
            recs.push("Submit UIF declarations for all employees".into());
        }
        if payroll_result.assessed && !payroll_result.sdl_filed {
            recs.push("Submit SDL declarations and pay levies".into());
        }

        if recs.is_empty() {
            recs.push("Maintain current compliance practices".into());
        }

        recs
    }

    pub fn generate_compliance_report(
        business_id: Uuid,
        vat_returns: &[VatReturn],
        tax_records: &[TaxRecord],
        drrt_coherence: f64,
    ) -> ComplianceReport {
        let vat_result = Self::check_vat_compliance(vat_returns, Utc::now());
        let tax_result = Self::check_tax_compliance(tax_records);
        let payroll_result = Self::check_payroll_compliance(tax_records);

        let overall_score = (vat_result.score + tax_result.score + payroll_result.score) / 3.0;
        let violations = Self::build_violations(&vat_result, &tax_result, &payroll_result);
        let recommendations =
            Self::build_recommendations(&vat_result, &tax_result, &payroll_result, overall_score);

        ComplianceReport {
            business_id,
            generated_at: Utc::now(),
            overall_score,
            vat_compliance: vat_result,
            income_tax_compliance: tax_result,
            payroll_compliance: payroll_result,
            drrt_coherence,
            violations,
            recommendations,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::models::TaxType;
    use chrono::TimeZone;
    use uuid::Uuid;

    fn make_vat_return(
        start: DateTime<Utc>,
        end: DateTime<Utc>,
        submitted: bool,
        submission: Option<DateTime<Utc>>,
        net_due: f64,
        penalties: f64,
    ) -> VatReturn {
        VatReturn {
            id: Uuid::new_v4(),
            business_id: Uuid::nil(),
            period_start: start,
            period_end: end,
            total_sales: Money::zar(10000.0),
            total_purchases: Money::zar(5000.0),
            vat_on_sales: Money::zar(1500.0),
            vat_on_purchases: Money::zar(750.0),
            net_vat_due: Money::zar(net_due),
            is_submitted: submitted,
            submission_date: submission,
            sars_reference: if submitted {
                Some("SARS-REF".into())
            } else {
                None
            },
            penalties: Money::zar(penalties),
        }
    }

    fn make_tax_record(
        tax_type: TaxType,
        due: f64,
        paid: f64,
        status: ComplianceStatus,
    ) -> TaxRecord {
        TaxRecord {
            id: Uuid::new_v4(),
            business_id: Uuid::nil(),
            tax_period: "2025".into(),
            tax_type,
            amount_due: Money::zar(due),
            amount_paid: Money::zar(paid),
            balance: Money::zar((due - paid).max(0.0)),
            due_date: Utc.with_ymd_and_hms(2025, 6, 30, 0, 0, 0).unwrap(),
            status,
            filed_at: Some(Utc.with_ymd_and_hms(2025, 6, 25, 0, 0, 0).unwrap()),
        }
    }

    #[test]
    fn test_vat_all_submitted_and_paid() {
        let now = Utc::now();
        let start = now - chrono::Duration::days(90);
        let end = now - chrono::Duration::days(1);
        let submission = Some(now);
        let returns = vec![make_vat_return(start, end, true, submission, 5000.0, 0.0)];
        let result = SarsCompliance::check_vat_compliance(&returns, now);
        assert!(result.is_compliant);
        assert_eq!(result.score, 1.0);
        assert!(result.outstanding_returns.is_empty());
    }

    #[test]
    fn test_vat_none_submitted() {
        let now = Utc::now();
        let start = now - chrono::Duration::days(90);
        let end = now - chrono::Duration::days(1);
        let returns = vec![make_vat_return(start, end, false, None, 5000.0, 100.0)];
        let result = SarsCompliance::check_vat_compliance(&returns, now);
        assert!(!result.is_compliant);
        assert_eq!(result.outstanding_returns.len(), 1);
    }

    #[test]
    fn test_vat_empty_returns() {
        let now = Utc::now();
        let result = SarsCompliance::check_vat_compliance(&[], now);
        assert!(!result.is_compliant);
        assert_eq!(result.score, 0.0);
    }

    #[test]
    fn test_vat_late_submission() {
        let now = Utc::now();
        let start = now - chrono::Duration::days(120);
        let end = now - chrono::Duration::days(90);
        let late_submission = Some(now);
        let returns = vec![make_vat_return(
            start,
            end,
            true,
            late_submission,
            5000.0,
            50.0,
        )];
        let result = SarsCompliance::check_vat_compliance(&returns, now);
        assert!(!result.returns_filed_on_time);
        assert_eq!(result.late_returns.len(), 1);
        assert!(result.penalties.amount > 0.0);
    }

    #[test]
    fn test_tax_all_filed_and_paid() {
        let records = vec![
            make_tax_record(
                TaxType::IncomeTax,
                50000.0,
                50000.0,
                ComplianceStatus::Approved,
            ),
            make_tax_record(TaxType::Vat, 10000.0, 10000.0, ComplianceStatus::Filed),
        ];
        let result = SarsCompliance::check_tax_compliance(&records);
        assert!(result.is_compliant);
        assert_eq!(result.score, 1.0);
    }

    #[test]
    fn test_tax_empty_records() {
        let result = SarsCompliance::check_tax_compliance(&[]);
        assert!(!result.is_compliant);
        assert_eq!(result.score, 0.0);
    }

    #[test]
    fn test_tax_outstanding_balance() {
        let records = vec![make_tax_record(
            TaxType::IncomeTax,
            50000.0,
            30000.0,
            ComplianceStatus::Filed,
        )];
        let result = SarsCompliance::check_tax_compliance(&records);
        assert!(!result.is_compliant);
        assert_eq!(result.outstanding_periods.len(), 1);
    }

    #[test]
    fn test_payroll_no_payroll_data() {
        let records = vec![make_tax_record(
            TaxType::IncomeTax,
            1000.0,
            1000.0,
            ComplianceStatus::Approved,
        )];
        let result = SarsCompliance::check_payroll_compliance(&records);
        assert!(result.is_compliant);
        assert_eq!(result.score, 0.5);
    }

    #[test]
    fn test_payroll_all_compliant() {
        let records = vec![
            make_tax_record(TaxType::Paye, 10000.0, 10000.0, ComplianceStatus::Approved),
            make_tax_record(TaxType::Uif, 500.0, 500.0, ComplianceStatus::Filed),
            make_tax_record(TaxType::Sdl, 300.0, 300.0, ComplianceStatus::Filed),
        ];
        let result = SarsCompliance::check_payroll_compliance(&records);
        assert!(result.is_compliant);
        assert!((result.score - 1.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_payroll_paye_not_filed() {
        let records = vec![make_tax_record(
            TaxType::Paye,
            10000.0,
            0.0,
            ComplianceStatus::Pending,
        )];
        let result = SarsCompliance::check_payroll_compliance(&records);
        assert!(!result.is_compliant);
    }

    #[test]
    fn test_generate_report_with_full_data() {
        let now = Utc::now();
        let start = now - chrono::Duration::days(90);
        let end = now - chrono::Duration::days(1);
        let returns = vec![make_vat_return(start, end, true, Some(now), 5000.0, 0.0)];
        let records = vec![
            make_tax_record(
                TaxType::IncomeTax,
                50000.0,
                50000.0,
                ComplianceStatus::Approved,
            ),
            make_tax_record(TaxType::Paye, 10000.0, 10000.0, ComplianceStatus::Filed),
            make_tax_record(TaxType::Uif, 500.0, 500.0, ComplianceStatus::Filed),
            make_tax_record(TaxType::Sdl, 300.0, 300.0, ComplianceStatus::Filed),
        ];
        let report =
            SarsCompliance::generate_compliance_report(Uuid::nil(), &returns, &records, 0.85);
        assert!(report.overall_score > 0.0);
        assert!(report.violations.is_empty());
        assert!(!report.recommendations.is_empty());
        assert_eq!(report.drrt_coherence, 0.85);
    }

    #[test]
    fn test_generate_report_with_violations() {
        let now = Utc::now();
        let start = now - chrono::Duration::days(120);
        let end = now - chrono::Duration::days(90);
        let returns = vec![make_vat_return(start, end, false, None, 5000.0, 200.0)];
        let records = vec![make_tax_record(
            TaxType::IncomeTax,
            50000.0,
            10000.0,
            ComplianceStatus::Pending,
        )];
        let report =
            SarsCompliance::generate_compliance_report(Uuid::nil(), &returns, &records, 0.5);
        assert!(report.overall_score < 0.5);
        assert!(!report.violations.is_empty());
    }
}
