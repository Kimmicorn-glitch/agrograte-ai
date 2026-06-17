CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES programmable_rules(id) ON DELETE CASCADE,
    trigger_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    requester_id UUID REFERENCES users(id),
    approver_ids UUID[] NOT NULL DEFAULT '{}',
    approved_by UUID[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payload JSONB,
    reason TEXT,
    drrt_coherence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX idx_approval_workflows_rule ON approval_workflows(rule_id);
CREATE INDEX idx_approval_workflows_requester ON approval_workflows(requester_id);
