use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::models::{
    CashFlowForecast, CashFlowScenario, ScenarioType, Transaction, TransactionStatus,
    TransactionType,
};
use crate::domain::value_objects::Money;
use crate::drrt::engine::DrrtEngine;
use crate::drrt::metrics::DrrtMetrics;

/// Cash flow forecasting engine powered by DRRT coherence analysis
/// Uses tensor state to improve forecast accuracy by evaluating
/// the relational coherence between financial dimensions
#[derive(Clone)]
pub struct CashFlowForecaster;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastConfig {
    pub historical_days: i64,
    pub forecast_days: i64,
    pub confidence_threshold: f64,
    pub scenario_count: usize,
}

impl Default for ForecastConfig {
    fn default() -> Self {
        Self {
            historical_days: 90,
            forecast_days: 90,
            confidence_threshold: 0.7,
            scenario_count: 4,
        }
    }
}

impl CashFlowForecaster {
    pub fn forecast(
        business_id: Uuid,
        transactions: &[Transaction],
        current_balance: Money,
        drrt_engine: &DrrtEngine,
        config: &ForecastConfig,
    ) -> CashFlowForecast {
        let cutoff = Utc::now() - Duration::days(config.historical_days);
        let recent_txns: Vec<&Transaction> = transactions
            .iter()
            .filter(|t| t.posted_at >= cutoff)
            .collect();

        let period_days = config.historical_days.max(1);
        let avg_daily_inflow = Self::average_daily_flow(&recent_txns, true, period_days);
        let avg_daily_outflow = Self::average_daily_flow(&recent_txns, false, period_days);
        let wavg_daily_inflow = Self::weighted_daily_flow(&recent_txns, true, period_days);
        let wavg_daily_outflow = Self::weighted_daily_flow(&recent_txns, false, period_days);
        let inflow_volatility = Self::flow_volatility(&recent_txns, true);
        let outflow_volatility = Self::flow_volatility(&recent_txns, false);

        let drrt_coherence = drrt_engine.global_coherence;
        let drrt_stability = DrrtMetrics::coherence_stability(&drrt_engine.primary_tensor);
        let drrt_entropy = DrrtMetrics::relational_entropy(&drrt_engine.primary_tensor);

        let weighted_net = wavg_daily_inflow - wavg_daily_outflow;
        let avg_net = avg_daily_inflow - avg_daily_outflow;
        let blended_net = weighted_net * 0.7 + avg_net * 0.3;

        let base_projected = current_balance.amount + blended_net * config.forecast_days as f64;

        let volatility = (inflow_volatility * 0.5 + outflow_volatility * 0.5).clamp(0.0, 1.0);

        let confidence = (drrt_coherence * 0.4
            + drrt_stability * 0.2
            + (1.0 - drrt_entropy) * 0.1
            + (1.0 - volatility) * 0.3)
            .clamp(0.0, 1.0);

        let spread = 1.0 + volatility * 2.0;
        let cfar_95 =
            Self::cash_flow_at_risk(&recent_txns, 0.95, period_days, config.forecast_days);

        let scenarios = vec![
            CashFlowScenario {
                scenario_type: ScenarioType::Optimistic,
                projected_balance: Money::zar(base_projected * (1.0 + 0.15 * spread)),
                probability: 0.15,
            },
            CashFlowScenario {
                scenario_type: ScenarioType::Base,
                projected_balance: Money::zar(base_projected),
                probability: 0.50,
            },
            CashFlowScenario {
                scenario_type: ScenarioType::Pessimistic,
                projected_balance: Money::zar(base_projected * (1.0 - 0.2 * spread)),
                probability: 0.25,
            },
            CashFlowScenario {
                scenario_type: ScenarioType::StressTest,
                projected_balance: Money::zar(base_projected - cfar_95),
                probability: 0.10,
            },
        ];

        CashFlowForecast {
            id: Uuid::new_v4(),
            business_id,
            forecast_date: Utc::now(),
            projected_balance: Money::zar(base_projected),
            confidence,
            drrt_coherence_at_forecast: drrt_coherence,
            scenarios,
        }
    }

    fn average_daily_flow(transactions: &[&Transaction], inflow: bool, period_days: i64) -> f64 {
        if transactions.is_empty() {
            return 0.0;
        }

        let total: f64 = transactions
            .iter()
            .filter(|t| {
                let is_inflow = matches!(
                    t.transaction_type,
                    TransactionType::Credit | TransactionType::Payment | TransactionType::Refund
                );
                is_inflow == inflow && matches!(t.status, TransactionStatus::Posted)
            })
            .map(|t| t.amount.amount.abs())
            .sum();

        total / period_days as f64
    }

    fn weighted_daily_flow(transactions: &[&Transaction], inflow: bool, _period_days: i64) -> f64 {
        if transactions.is_empty() {
            return 0.0;
        }

        let now = Utc::now();
        let mut weighted_sum = 0.0_f64;
        let mut weight_total = 0.0_f64;

        for t in transactions.iter() {
            let is_inflow = matches!(
                t.transaction_type,
                TransactionType::Credit | TransactionType::Payment | TransactionType::Refund
            );
            if is_inflow != inflow || !matches!(t.status, TransactionStatus::Posted) {
                continue;
            }

            let days_ago = (now - t.posted_at).num_days().max(0);
            let weight = 1.0 / (1.0 + days_ago as f64);
            weighted_sum += t.amount.amount.abs() * weight;
            weight_total += weight;
        }

        if weight_total == 0.0 {
            0.0
        } else {
            weighted_sum / weight_total
        }
    }

    fn cash_flow_at_risk(
        transactions: &[&Transaction],
        percentile: f64,
        period_days: i64,
        forecast_days: i64,
    ) -> f64 {
        let daily_net: Vec<f64> = transactions
            .iter()
            .filter(|t| matches!(t.status, TransactionStatus::Posted))
            .map(|t| match t.transaction_type {
                TransactionType::Credit | TransactionType::Payment | TransactionType::Refund => {
                    t.amount.amount.abs()
                }
                _ => -t.amount.amount.abs(),
            })
            .collect();

        if daily_net.len() < 10 {
            let avg_outflow = Self::average_daily_flow(transactions, false, period_days);
            return avg_outflow * forecast_days as f64 * 0.5;
        }

        let mut sorted = daily_net.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

        let idx = ((1.0 - percentile) * sorted.len() as f64) as usize;
        let worst = sorted[idx.min(sorted.len() - 1)];

        (-worst * forecast_days as f64).max(0.0)
    }

    pub fn flow_volatility(transactions: &[&Transaction], inflow: bool) -> f64 {
        if transactions.len() < 10 {
            return 1.0;
        }

        let amounts: Vec<f64> = transactions
            .iter()
            .filter(|t| {
                let is_inflow = matches!(
                    t.transaction_type,
                    TransactionType::Credit | TransactionType::Payment | TransactionType::Refund
                );
                is_inflow == inflow && matches!(t.status, TransactionStatus::Posted)
            })
            .map(|t| t.amount.amount.abs())
            .collect();

        if amounts.is_empty() {
            return 1.0;
        }

        let mean: f64 = amounts.iter().sum::<f64>() / amounts.len() as f64;
        if mean == 0.0 {
            return 1.0;
        }

        let variance: f64 =
            amounts.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / amounts.len() as f64;
        let std_dev = variance.sqrt();

        (std_dev / mean).clamp(0.0, 1.0)
    }
}
