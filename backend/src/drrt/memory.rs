use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// Long-term memory for the DRRT engine
/// Stores past tensor states for trend analysis and pattern recognition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrrtMemory {
    pub state_history: VecDeque<MemoryEntry>,
    pub pattern_memory: Vec<PatternRecord>,
    pub max_states: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub iteration: u64,
    pub coherence: f64,
    pub contradiction: f64,
    pub frustration: f64,
    pub entropy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternRecord {
    pub pattern_type: PatternType,
    pub frequency: u64,
    pub last_observed: u64,
    pub confidence: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PatternType {
    CoherenceGrowth,
    ContradictionSpike,
    FrustrationCycle,
    CollapseEvent,
    ConvergenceSuccess,
}

impl DrrtMemory {
    pub fn new(max_states: usize) -> Self {
        Self {
            state_history: VecDeque::with_capacity(max_states),
            pattern_memory: Vec::new(),
            max_states,
        }
    }

    pub fn record(&mut self, entry: MemoryEntry) {
        if self.state_history.len() >= self.max_states {
            self.state_history.pop_front();
        }
        self.state_history.push_back(entry);
        self.detect_patterns();
    }

    pub fn recent_trend(&self, window: usize) -> TrendDirection {
        if self.state_history.len() < 2 {
            return TrendDirection::Stable;
        }

        let window = window.min(self.state_history.len());
        let recent: Vec<&MemoryEntry> = self.state_history.iter().rev().take(window).collect();

        let first = recent.last().unwrap().coherence;
        let last = recent.first().unwrap().coherence;

        let delta = last - first;
        if delta > 0.02 {
            TrendDirection::Improving(delta)
        } else if delta < -0.02 {
            TrendDirection::Degrading(delta.abs())
        } else {
            TrendDirection::Stable
        }
    }

    fn detect_patterns(&mut self) {
        if self.state_history.len() < 5 {
            return;
        }

        let entries: Vec<MemoryEntry> = self.state_history.iter().rev().take(5).cloned().collect();

        let coherence_delta = entries[0].coherence - entries[4].coherence;
        if coherence_delta > 0.1 {
            self.record_pattern(PatternType::CoherenceGrowth, 8.0);
        }

        let max_contradiction = entries
            .iter()
            .map(|e| e.contradiction)
            .fold(0.0_f64, f64::max);
        if max_contradiction > 0.6 {
            self.record_pattern(PatternType::ContradictionSpike, 7.0);
        }

        if entries[0].frustration > 0.5
            && entries[2].frustration > 0.5
            && entries[4].frustration > 0.5
        {
            self.record_pattern(PatternType::FrustrationCycle, 6.0);
        }
    }

    fn record_pattern(&mut self, pattern_type: PatternType, confidence: f64) {
        let iteration = self.state_history.back().map(|e| e.iteration).unwrap_or(0);

        if let Some(existing) = self
            .pattern_memory
            .iter_mut()
            .find(|p: &&mut PatternRecord| p.pattern_type == pattern_type)
        {
            existing.frequency += 1;
            existing.last_observed = iteration;
            existing.confidence = (existing.confidence + confidence) / 2.0;
        } else {
            self.pattern_memory.push(PatternRecord {
                pattern_type,
                frequency: 1,
                last_observed: iteration,
                confidence,
            });
        }
    }
}

#[derive(Debug)]
pub enum TrendDirection {
    Improving(f64),
    Degrading(f64),
    Stable,
}
