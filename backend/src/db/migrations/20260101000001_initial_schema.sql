CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Businesses
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    tax_number VARCHAR(100) NOT NULL UNIQUE,
    vat_number VARCHAR(100),
    directors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    bank VARCHAR(50) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    available_balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    pending_balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    reserved_tax_funds DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    description TEXT NOT NULL,
    category VARCHAR(100),
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'posted',
    posted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(account_id, transaction_id)
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_code VARCHAR(100) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(100),
    vat_number VARCHAR(100),
    credit_limit DOUBLE PRECISION,
    payment_terms_days INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true,
    trusted DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_code VARCHAR(100) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(100),
    vat_number VARCHAR(100),
    payment_terms_days INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT true,
    reliability DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    issue_date TIMESTAMPTZ NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    line_items JSONB DEFAULT '[]'::jsonb,
    subtotal DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    vat_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    vat_category VARCHAR(20) NOT NULL DEFAULT 'standard',
    is_sars_compliant BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tax Records
CREATE TABLE tax_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    tax_period VARCHAR(20) NOT NULL,
    tax_type VARCHAR(30) NOT NULL,
    amount_due DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    amount_paid DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    due_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    filed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VAT Returns
CREATE TABLE vat_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_sales DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_purchases DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    vat_on_sales DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    vat_on_purchases DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    net_vat_due DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_submitted BOOLEAN NOT NULL DEFAULT false,
    submission_date TIMESTAMPTZ,
    sars_reference VARCHAR(100),
    penalties DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

-- Financial Statements
CREATE TABLE financial_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    statement_type VARCHAR(30) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_revenue DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_expenses DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    net_profit DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_assets DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_liabilities DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    equity DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cash_flow_operating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cash_flow_investing DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    cash_flow_financing DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    drrt_coherence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_audited BOOLEAN NOT NULL DEFAULT false
);

-- Cash Flow Forecasts
CREATE TABLE cash_flow_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    forecast_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    projected_balance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    drrt_coherence_at_forecast DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    scenarios JSONB DEFAULT '[]'::jsonb
);

-- Programmable Rules
CREATE TABLE programmable_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL,
    condition JSONB NOT NULL,
    action JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    approval_required BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID,
    drrt_coherence DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

-- DRRT State (materialized view of current tensor space)
CREATE TABLE drrt_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    coherence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    contradiction DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    frustration_index DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    entropy DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    stability DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    convergence_iterations BIGINT NOT NULL DEFAULT 0,
    convergence_state VARCHAR(50) NOT NULL DEFAULT 'unstable',
    tensor_state JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_accounts_business ON accounts(business_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_posted ON transactions(posted_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_invoices_business ON invoices(business_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_suppliers_business ON suppliers(business_id);
CREATE INDEX idx_tax_records_business ON tax_records(business_id);
CREATE INDEX idx_vat_returns_business ON vat_returns(business_id);
CREATE INDEX idx_financial_statements_business ON financial_statements(business_id);
CREATE INDEX idx_cash_flow_forecasts_business ON cash_flow_forecasts(business_id);
CREATE INDEX idx_programmable_rules_business ON programmable_rules(business_id);
CREATE INDEX idx_drrt_state_business ON drrt_state(business_id);
