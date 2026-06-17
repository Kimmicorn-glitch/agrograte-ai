use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::{Transaction, TransactionStatus, TransactionType};
use crate::domain::value_objects::Money;
use crate::drrt::engine::DrrtEngine;

/// Tax reserve management engine
/// Automatically calculates and reserves funds for tax obligations
/// based on transaction history and DRRT coherence analysis
pub struct TaxReserveEngine;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaxReserveCalculation {
    pub business_id: Uuid,
    pub estimated_vat_liability: Money,
    pub estimated_income_tax: Money,
    pub estimated_paye: Money,
    pub total_reserve_required: Money,
    pub current_reserve_balance: Money,
    pub reserve_gap: Money,
    pub drrt_confidence: f64,
    pub recommended_monthly_allocation: Money,
}

impl TaxReserveEngine {
    pub fn calculate_reserves(
        business_id: Uuid,
        transactions: &[Transaction],
        drrt_engine: &DrrtEngine,
        current_reserve: f64,
    ) -> TaxReserveCalculation {
        let total_revenue: f64 = transactions
            .iter()
            .filter(|t| {
                matches!(
                    t.transaction_type,
                    TransactionType::Credit | TransactionType::Payment
                )
            })
            .filter(|t| matches!(t.status, TransactionStatus::Posted))
            .map(|t| t.amount.amount)
            .sum();

        let total_expenses: f64 = transactions
            .iter()
            .filter(|t| {
                matches!(
                    t.transaction_type,
                    TransactionType::Debit | TransactionType::Fee
                )
            })
            .filter(|t| matches!(t.status, TransactionStatus::Posted))
            .map(|t| t.amount.amount.abs())
            .sum();

        let estimated_vat = total_revenue * 0.15 - total_expenses * 0.15;
        let estimated_income_tax = (total_revenue - total_expenses).max(0.0) * 0.28;
        let estimated_paye = total_expenses * 0.01;

        let total_reserve = estimated_vat + estimated_income_tax + estimated_paye;
        let reserve_gap = (total_reserve - current_reserve).max(0.0);

        let drrt_confidence = drrt_engine.global_coherence;

        let recommended_allocation = if reserve_gap > 0.0 {
            reserve_gap / 12.0
        } else {
            0.0
        };

        TaxReserveCalculation {
            business_id,
            estimated_vat_liability: Money::zar(estimated_vat.max(0.0)),
            estimated_income_tax: Money::zar(estimated_income_tax),
            estimated_paye: Money::zar(estimated_paye),
            total_reserve_required: Money::zar(total_reserve.max(0.0)),
            current_reserve_balance: Money::zar(current_reserve),
            reserve_gap: Money::zar(reserve_gap),
            drrt_confidence,
            recommended_monthly_allocation: Money::zar(recommended_allocation),
        }
    }
}
