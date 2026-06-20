#![allow(dead_code)]

use chrono::{DateTime, Datelike, Timelike, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::{Invoice, InvoiceStatus, VatReturn};
use crate::domain::value_objects::{Money, TaxRate, VatCategory};

/// VAT calculation and return preparation engine
/// Handles South African VAT at 15% standard rate
pub struct VatEngine;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VatCalculation {
    pub invoice_id: Uuid,
    pub net_amount: Money,
    pub vat_rate: TaxRate,
    pub vat_amount: Money,
    pub gross_amount: Money,
    pub category: VatCategory,
}

impl VatEngine {
    pub fn calculate_vat(invoice: &Invoice) -> VatCalculation {
        let rate = match invoice.vat_category {
            VatCategory::Standard => TaxRate::standard_vat(),
            VatCategory::ZeroRated => TaxRate::zero_rate(),
            VatCategory::Exempt | VatCategory::OutOfScope => TaxRate::exempt(),
        };

        let vat_amount = invoice.subtotal.amount * (rate.percentage / 100.0);

        VatCalculation {
            invoice_id: invoice.id,
            net_amount: invoice.subtotal.clone(),
            vat_rate: rate,
            vat_amount: Money::zar(vat_amount),
            gross_amount: Money::zar(invoice.subtotal.amount + vat_amount),
            category: invoice.vat_category.clone(),
        }
    }

    pub fn prepare_vat_return(
        business_id: Uuid,
        invoices: &[Invoice],
        period_start: DateTime<Utc>,
        period_end: DateTime<Utc>,
    ) -> VatReturn {
        let relevant_invoices: Vec<&Invoice> = invoices
            .iter()
            .filter(|inv| inv.issue_date >= period_start && inv.issue_date <= period_end)
            .collect();

        let total_sales: f64 = relevant_invoices
            .iter()
            .filter(|inv| matches!(inv.status, InvoiceStatus::Sent | InvoiceStatus::Paid))
            .map(|inv| inv.total.amount)
            .sum();

        let total_purchases: f64 = relevant_invoices
            .iter()
            .filter(|inv| matches!(inv.status, InvoiceStatus::Paid))
            .map(|inv| inv.total.amount)
            .sum();

        let vat_on_sales: f64 = relevant_invoices
            .iter()
            .filter(|inv| matches!(inv.status, InvoiceStatus::Sent | InvoiceStatus::Paid))
            .map(|inv| inv.vat_amount.amount)
            .sum();

        let vat_on_purchases: f64 = relevant_invoices
            .iter()
            .filter(|inv| matches!(inv.status, InvoiceStatus::Paid))
            .map(|inv| inv.vat_amount.amount)
            .sum();

        VatReturn {
            id: Uuid::new_v4(),
            business_id,
            period_start,
            period_end,
            total_sales: Money::zar(total_sales),
            total_purchases: Money::zar(total_purchases),
            vat_on_sales: Money::zar(vat_on_sales),
            vat_on_purchases: Money::zar(vat_on_purchases),
            net_vat_due: Money::zar((vat_on_sales - vat_on_purchases).max(0.0)),
            is_submitted: false,
            submission_date: None,
            sars_reference: None,
            penalties: Money::zar(0.0),
        }
    }

    pub fn get_vat_periods(year: i32) -> Vec<(DateTime<Utc>, DateTime<Utc>)> {
        let mut periods = Vec::new();

        for month in 0..12 {
            let start = Utc::now()
                .with_year(year)
                .unwrap()
                .with_month(month + 1)
                .unwrap()
                .with_day(1)
                .unwrap()
                .with_hour(0)
                .unwrap()
                .with_minute(0)
                .unwrap()
                .with_second(0)
                .unwrap()
                .with_nanosecond(0)
                .unwrap();

            let end = if month == 11 {
                Utc::now()
                    .with_year(year + 1)
                    .unwrap()
                    .with_month(1)
                    .unwrap()
                    .with_day(1)
                    .unwrap()
                    .with_hour(0)
                    .unwrap()
                    .with_minute(0)
                    .unwrap()
                    .with_second(0)
                    .unwrap()
                    .with_nanosecond(0)
                    .unwrap()
            } else {
                Utc::now()
                    .with_year(year)
                    .unwrap()
                    .with_month(month + 2)
                    .unwrap()
                    .with_day(1)
                    .unwrap()
                    .with_hour(0)
                    .unwrap()
                    .with_minute(0)
                    .unwrap()
                    .with_second(0)
                    .unwrap()
                    .with_nanosecond(0)
                    .unwrap()
            };

            periods.push((start, end));
        }

        periods
    }
}
