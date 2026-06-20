use crate::drrt::metrics::DrrtMetrics;
use crate::drrt::tensor::{ConvergenceState, RelationalTensor};

pub struct ConvergenceEngine;

impl ConvergenceEngine {
    /// Recursive relaxation: iteratively update dimension activations
    /// to minimize contradiction and maximize coherence
    pub fn relax(tensor: &mut RelationalTensor, max_iterations: u64) -> ConvergenceResult {
        let mut prev_coherence = 0.0_f64;

        for iteration in 0..max_iterations {
            DrrtMetrics::compute_all(tensor);

            let delta = (tensor.coherence - prev_coherence).abs();
            prev_coherence = tensor.coherence;

            tensor.convergence_state = ConvergenceState::Converging { iteration, delta };

            if delta < 0.0001 {
                tensor.convergence_state = ConvergenceState::Stable {
                    at_iteration: iteration,
                    coherence: tensor.coherence,
                };
                return ConvergenceResult::Converged {
                    iterations: iteration,
                    final_coherence: tensor.coherence,
                };
            }

            Self::update_dimension_activations(tensor);
        }

        DrrtMetrics::compute_all(tensor);

        if tensor.coherence > 0.9 {
            ConvergenceResult::Converged {
                iterations: max_iterations,
                final_coherence: tensor.coherence,
            }
        } else {
            ConvergenceResult::DidNotConverge {
                iterations: max_iterations,
                coherence: tensor.coherence,
            }
        }
    }

    fn update_dimension_activations(tensor: &mut RelationalTensor) {
        let dim_ids: Vec<(uuid::Uuid, f64)> = tensor
            .dimensions
            .iter()
            .map(|d| (d.id, d.activation))
            .collect();
        for dim in tensor.dimensions.iter_mut() {
            let mut net_input = 0.0_f64;
            let mut total_weight = 0.0_f64;

            for edge in &tensor.relationships {
                if edge.source_id == dim.id {
                    let target_activation = dim_ids
                        .iter()
                        .find(|(id, _)| *id == edge.target_id)
                        .map(|(_, act)| *act)
                        .unwrap_or(0.0);

                    net_input += edge.sign.to_f64() * edge.strength * target_activation;
                    total_weight += edge.strength.abs();
                }
                if edge.target_id == dim.id {
                    let source_activation = dim_ids
                        .iter()
                        .find(|(id, _)| *id == edge.source_id)
                        .map(|(_, act)| *act)
                        .unwrap_or(0.0);

                    net_input += edge.sign.to_f64() * edge.strength * source_activation;
                    total_weight += edge.strength.abs();
                }
            }

            if total_weight > 0.0 {
                let avg_input = net_input / total_weight;
                dim.activation = Self::sigmoid(avg_input);
            }
        }
    }

    fn sigmoid(x: f64) -> f64 {
        1.0 / (1.0 + (-x).exp())
    }

    /// Detect if the tensor is in a local minimum (stuck)
    #[allow(dead_code)]
    pub fn detect_local_minimum(tensor: &RelationalTensor, window: usize) -> bool {
        let history = &tensor.memory_state.coherence_history;
        if history.len() < window * 2 {
            return false;
        }

        let recent = &history[history.len() - window..];
        let older = &history[history.len() - window * 2..history.len() - window];

        let recent_mean: f64 = recent.iter().sum::<f64>() / window as f64;
        let older_mean: f64 = older.iter().sum::<f64>() / window as f64;

        (recent_mean - older_mean).abs() < 0.001
    }
}

#[derive(Debug)]
pub enum ConvergenceResult {
    Converged {
        iterations: u64,
        final_coherence: f64,
    },
    DidNotConverge {
        iterations: u64,
        coherence: f64,
    },
    Collapsed {
        reason: String,
    },
}
