use crate::drrt::tensor::{ConvergenceState, RelationalTensor};
use std::collections::HashSet;
use uuid::Uuid;

pub struct DrrtMetrics;

impl DrrtMetrics {
    /// K(T) - Global coherence of the tensor space
    /// Measures how well relationships align across all dimensions
    pub fn coherence(tensor: &RelationalTensor) -> f64 {
        if tensor.relationships.is_empty() || tensor.dimensions.is_empty() {
            return 0.0;
        }

        let mut total_alignment = 0.0_f64;
        let mut total_weight = 0.0_f64;

        for edge in &tensor.relationships {
            let source_weight = tensor
                .dimensions
                .iter()
                .find(|d| d.id == edge.source_id)
                .map(|d| d.weight)
                .unwrap_or(1.0);

            let target_weight = tensor
                .dimensions
                .iter()
                .find(|d| d.id == edge.target_id)
                .map(|d| d.weight)
                .unwrap_or(1.0);

            let combined_weight = source_weight * target_weight;
            let sign_val = edge.sign.to_f64();

            let alignment = sign_val * edge.strength * combined_weight;
            total_alignment += alignment.max(0.0);
            total_weight += combined_weight.abs();
        }

        if total_weight == 0.0 {
            return 0.0;
        }

        let raw_coherence = total_alignment / total_weight;
        raw_coherence.clamp(0.0, 1.0)
    }

    /// C(T) - Contradiction measure
    /// Detects conflicting relationships in the tensor
    pub fn contradiction(tensor: &RelationalTensor) -> f64 {
        if tensor.relationships.len() < 2 {
            return 0.0;
        }

        let mut contradiction_count = 0.0_f64;
        let mut pair_count = 0.0_f64;

        let mut seen_pairs: HashSet<(Uuid, Uuid)> = HashSet::new();

        for i in 0..tensor.relationships.len() {
            let a = &tensor.relationships[i];
            for j in (i + 1)..tensor.relationships.len() {
                let b = &tensor.relationships[j];

                let a_key = (a.source_id, a.target_id);
                let b_key = (b.source_id, b.target_id);

                if (a_key == b_key || a_key == (b.target_id, b.source_id))
                    && !seen_pairs.contains(&a_key)
                {
                    seen_pairs.insert(a_key);
                    pair_count += 1.0;

                    let sign_a = a.sign.to_f64();
                    let sign_b = b.sign.to_f64();

                    if sign_a * sign_b < 0.0 {
                        contradiction_count += 1.0;
                    }
                }
            }
        }

        if pair_count == 0.0 {
            0.0
        } else {
            contradiction_count / pair_count
        }
    }

    /// H_R(T) - Relational entropy of the tensor
    /// Measures the disorder/uncertainty in relationship strengths
    pub fn relational_entropy(tensor: &RelationalTensor) -> f64 {
        if tensor.relationships.is_empty() {
            return 0.0;
        }

        let total_strength: f64 = tensor.relationships.iter().map(|e| e.strength.abs()).sum();
        if total_strength == 0.0 {
            return 0.0;
        }

        let entropy: f64 = tensor
            .relationships
            .iter()
            .map(|e| {
                let p = e.strength.abs() / total_strength;
                if p > 0.0 {
                    -p * p.log2()
                } else {
                    0.0
                }
            })
            .sum();

        entropy / (tensor.relationships.len() as f64).log2()
    }

    /// Frustration index - measures structural imbalance
    /// Based on signed graph theory
    pub fn frustration_index(tensor: &RelationalTensor) -> f64 {
        if tensor.relationships.is_empty() {
            return 0.0;
        }

        let mut frustrated_cycles = 0.0;
        let n = tensor.relationships.len() as f64;

        for i in 0..tensor.relationships.len() {
            for j in 0..tensor.relationships.len() {
                if i == j {
                    continue;
                }
                for k in 0..tensor.relationships.len() {
                    if k == i || k == j {
                        continue;
                    }

                    let edge_ij = &tensor.relationships[i];
                    let edge_jk = &tensor.relationships[j];
                    let edge_ki = &tensor.relationships[k];

                    let is_cycle = edge_ij.target_id == edge_jk.source_id
                        && edge_jk.target_id == edge_ki.source_id
                        && edge_ki.target_id == edge_ij.source_id;

                    if is_cycle {
                        let product =
                            edge_ij.sign.to_f64() * edge_jk.sign.to_f64() * edge_ki.sign.to_f64();

                        if product < 0.0 {
                            frustrated_cycles += 1.0;
                        }
                    }
                }
            }
        }

        let total_cycles = n * (n - 1.0) * (n - 2.0);
        if total_cycles == 0.0 {
            0.0
        } else {
            frustrated_cycles / total_cycles
        }
    }

    /// K_crit(T) - Critical coherence threshold detector
    pub fn coherence_stability(tensor: &RelationalTensor) -> f64 {
        let history = &tensor.memory_state.coherence_history;
        if history.len() < 10 {
            return 0.0;
        }

        let recent = &history[history.len().saturating_sub(10)..];
        let mean: f64 = recent.iter().sum::<f64>() / recent.len() as f64;
        let variance: f64 =
            recent.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / recent.len() as f64;

        1.0 - (variance.sqrt()).clamp(0.0, 1.0)
    }

    /// Computes all DRRT metrics at once
    pub fn compute_all(tensor: &mut RelationalTensor) {
        let coherence = Self::coherence(tensor);
        let contradiction = Self::contradiction(tensor);
        let frustration = Self::frustration_index(tensor);
        let _entropy = Self::relational_entropy(tensor);
        let stability = Self::coherence_stability(tensor);

        tensor.coherence = coherence;
        tensor.contradiction = contradiction;
        tensor.frustration_index = frustration;

        tensor.memory_state.coherence_history.push(coherence);
        tensor.memory_state.frustration_history.push(frustration);
        tensor.memory_state.convergence_iterations += 1;

        if coherence > 0.95 && stability > 0.9 {
            tensor.convergence_state = ConvergenceState::Stable {
                at_iteration: tensor.memory_state.convergence_iterations,
                coherence,
            };
        }
    }
}
