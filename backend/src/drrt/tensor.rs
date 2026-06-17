use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TensorDimension {
    pub id: Uuid,
    pub name: DimensionName,
    pub weight: f64,
    pub activation: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Hash, PartialEq, Eq)]
pub enum DimensionName {
    TransactionValue,
    AccountBalance,
    CustomerTrust,
    SupplierReliability,
    InvoiceValidity,
    TaxCompliance,
    VatAlignment,
    CashFlowLiquidity,
    RegulatoryRisk,
    PaymentVelocity,
    CreditExposure,
    AuditTrail,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelationalTensor {
    pub id: Uuid,
    pub dimensions: Vec<TensorDimension>,
    pub relationships: Vec<RelationalEdge>,
    pub coherence: f64,
    pub contradiction: f64,
    pub frustration_index: f64,
    pub convergence_state: ConvergenceState,
    pub memory_state: TensorMemory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelationalEdge {
    pub source_id: Uuid,
    pub target_id: Uuid,
    pub relation_type: RelationType,
    pub strength: f64,
    pub sign: RelationSign,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationType {
    FinancialFlow,
    TrustLink,
    ComplianceDependency,
    TemporalSequence,
    CausalDependency,
    AuditTrail,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationSign {
    Positive,
    Negative,
    Neutral,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConvergenceState {
    Unstable,
    Converging { iteration: u64, delta: f64 },
    Stable { at_iteration: u64, coherence: f64 },
    Collapsed { reason: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TensorMemory {
    pub coherence_history: Vec<f64>,
    pub frustration_history: Vec<f64>,
    pub convergence_iterations: u64,
    pub last_collapse: Option<String>,
    pub memory_depth: usize,
}

impl RelationalTensor {
    pub fn new(dimensions: Vec<TensorDimension>) -> Self {
        Self {
            id: Uuid::new_v4(),
            dimensions,
            relationships: Vec::new(),
            coherence: 0.0,
            contradiction: 0.0,
            frustration_index: 0.0,
            convergence_state: ConvergenceState::Unstable,
            memory_state: TensorMemory {
                coherence_history: Vec::with_capacity(1000),
                frustration_history: Vec::with_capacity(1000),
                convergence_iterations: 0,
                last_collapse: None,
                memory_depth: 100,
            },
        }
    }

    pub fn add_relationship(&mut self, edge: RelationalEdge) {
        self.relationships.push(edge);
    }

    pub fn dimension_count(&self) -> usize {
        self.dimensions.len()
    }

    pub fn relationship_count(&self) -> usize {
        self.relationships.len()
    }
}

impl RelationSign {
    pub fn to_f64(&self) -> f64 {
        match self {
            RelationSign::Positive => 1.0,
            RelationSign::Negative => -1.0,
            RelationSign::Neutral => 0.0,
        }
    }
}
