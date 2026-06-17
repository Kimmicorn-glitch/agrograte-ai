use crate::drrt::metrics::DrrtMetrics;
use crate::drrt::tensor::{ConvergenceState, RelationalTensor};

/// Collapse detection monitors the tensor for destabilization events
/// A collapse occurs when coherence drops below critical threshold
/// after having been stable, indicating a phase transition
pub struct CollapseDetector;

impl CollapseDetector {
    pub fn check(tensor: &mut RelationalTensor) -> CollapseStatus {
        if tensor.memory_state.coherence_history.len() < 20 {
            return CollapseStatus::InsufficientHistory;
        }

        let coherence = DrrtMetrics::coherence(tensor);
        let stability = DrrtMetrics::coherence_stability(tensor);
        let contradiction = DrrtMetrics::contradiction(tensor);

        let recent_coherence = &tensor.memory_state.coherence_history
            [tensor.memory_state.coherence_history.len() - 10..];
        let coherence_trend: f64 = if recent_coherence.len() >= 2 {
            recent_coherence.last().unwrap_or(&0.0) - recent_coherence.first().unwrap_or(&0.0)
        } else {
            0.0
        };

        // Rapid coherence drop with rising contradiction
        if coherence_trend < -0.1 && contradiction > 0.3 {
            tensor.convergence_state = ConvergenceState::Collapsed {
                reason: format!(
                    "Coherence dropped {:.4} over last 10 iterations. Contradiction at {:.4}",
                    coherence_trend.abs(),
                    contradiction
                ),
            };
            tensor.memory_state.last_collapse = Some(format!(
                "Collapse at iteration {}: coherence={:.4}, contradiction={:.4}",
                tensor.memory_state.convergence_iterations, coherence, contradiction
            ));
            return CollapseStatus::Collapsed {
                coherence,
                contradiction,
                reason: "Critical coherence degradation detected".to_string(),
            };
        }

        // Pre-collapse warning: instability detected
        if stability < 0.3 && coherence < 0.5 {
            return CollapseStatus::Warning {
                coherence,
                stability,
                contradiction,
            };
        }

        CollapseStatus::Stable {
            coherence,
            stability,
        }
    }
}

#[derive(Debug)]
pub enum CollapseStatus {
    Stable {
        coherence: f64,
        stability: f64,
    },
    Warning {
        coherence: f64,
        stability: f64,
        contradiction: f64,
    },
    Collapsed {
        coherence: f64,
        contradiction: f64,
        reason: String,
    },
    InsufficientHistory,
}
