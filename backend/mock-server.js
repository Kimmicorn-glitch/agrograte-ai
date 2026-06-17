const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

// Mock data
let drrtState = {
  coherence: 0.85,
  contradiction: 0.15,
  frustration_index: 0.2,
  stability: 0.75,
  entropy: 0.3,
  convergence_iterations: 42,
  trend: "improving"
};

let financialHealth = {
  health_score: 87,
  liquidity: "strong",
  risk: "low",
  compliance: 95
};

let bankingSummary = {
  available_balance: 125430.50,
  pending_transactions: 15,
  reserved_tax_funds: 18500,
  programmable_rules: 8,
  approval_workflows: 3
};

let complianceSummary = {
  sars_compliance_score: 96,
  vat_compliant: true,
  tax_compliant: true,
  outstanding_returns: 0
};

// DRRT endpoints
app.get('/api/drrt/state', (req, res) => {
  // Add slight variation to mock data for realism
  const variation = 0.02;
  const mockState = {
    ...drrtState,
    coherence: Math.max(0, Math.min(1, drrtState.coherence + (Math.random() - 0.5) * variation)),
    contradiction: Math.max(0, Math.min(1, drrtState.contradiction + (Math.random() - 0.5) * variation)),
    frustration_index: Math.max(0, Math.min(1, drrtState.frustration_index + (Math.random() - 0.5) * variation)),
    stability: Math.max(0, Math.min(1, drrtState.stability + (Math.random() - 0.5) * variation)),
    entropy: Math.max(0, Math.min(1, drrtState.entropy + (Math.random() - 0.5) * variation)),
    convergence_iterations: drrtState.convergence_iterations + Math.floor(Math.random() * 3) - 1
  };
  res.json({ state: mockState });
});

app.post('/api/drrt/converge', (req, res) => {
  drrtState.convergence_iterations += Math.floor(Math.random() * 5) + 1;
  drrtState.coherence = Math.min(0.95, drrtState.coherence + 0.02);
  drrtState.contradiction = Math.max(0.05, drrtState.contradiction - 0.01);
  res.json({ success: true, state: drrtState });
});

app.post('/api/drrt/relationship', (req, res) => {
  res.json({ success: true, id: Math.floor(Math.random() * 1000) });
});

// Financial endpoints
app.get('/api/financial/health', (req, res) => {
  const variation = 2;
  const mockHealth = {
    ...financialHealth,
    health_score: Math.max(0, Math.min(100, financialHealth.health_score + (Math.random() - 0.5) * variation)),
    compliance: Math.max(0, Math.min(100, financialHealth.compliance + (Math.random() - 0.5) * variation))
  };
  res.json(mockHealth);
});

app.get('/api/banking/summary', (req, res) => {
  const variation = 1000;
  const mockBanking = {
    ...bankingSummary,
    available_balance: Math.max(0, bankingSummary.available_balance + (Math.random() - 0.5) * variation),
    pending_transactions: Math.max(0, bankingSummary.pending_transactions + Math.floor((Math.random() - 0.5) * 4)),
    reserved_tax_funds: Math.max(0, bankingSummary.reserved_tax_funds + (Math.random() - 0.5) * variation / 2)
  };
  res.json(mockBanking);
});

app.get('/api/compliance/summary', (req, res) => {
  const variation = 2;
  const mockCompliance = {
    ...complianceSummary,
    sars_compliance_score: Math.max(0, Math.min(100, complianceSummary.sars_compliance_score + (Math.random() - 0.5) * variation)),
    vat_compliant: Math.random() > 0.1, // 90% chance of being compliant
    tax_compliant: Math.random() > 0.1,  // 90% chance of being compliant
    outstanding_returns: Math.max(0, complianceSummary.outstanding_returns + Math.floor((Math.random() - 0.5) * 2))
  };
  res.json(mockCompliance);
});

// Cashflow endpoints
app.get('/api/cashflow/forecast', (req, res) => {
  const forecast = Array.from({ length: 12 }, (_, i) => ({
    month: `2026-${String(i + 1).padStart(2, '0')}`,
    projected_inflow: 45000 + Math.random() * 10000,
    projected_outflow: 32000 + Math.random() * 8000,
    net_cashflow: 13000 + Math.random() * 5000
  }));
  res.json(forecast);
});

app.get('/api/cashflow/tax-reserve', (req, res) => {
  res.json({
    projected_tax: 8500 + Math.random() * 2000,
    current_reserve: 12000 + Math.random() * 3000,
    recommended_reserve: 10000 + Math.random() * 4000
  });
});

// Auth endpoints
const MOCK_USER = { id: 'user-1', email: '', full_name: 'Jane Doe', role: 'admin', business_id: 'biz-1' }

app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name } = req.body
  if (!email || !password || !full_name) return res.status(400).json({ error: 'Missing fields' })
  MOCK_USER.email = email
  MOCK_USER.full_name = full_name
  res.json({ token: 'mock-jwt-token', refresh_token: 'mock-refresh-token', user: { ...MOCK_USER } })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  MOCK_USER.email = email
  res.json({ token: 'mock-jwt-token', refresh_token: 'mock-refresh-token', user: { ...MOCK_USER } })
})

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ ...MOCK_USER, email: MOCK_USER.email || 'jane@example.com' })
})

app.post('/api/auth/refresh', (req, res) => {
  res.json({ token: 'mock-jwt-token', refresh_token: 'mock-refresh-token', user: { ...MOCK_USER, email: MOCK_USER.email || 'jane@example.com' } })
})

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Mock API server running at http://0.0.0.0:${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down mock API server...');
  process.exit(0);
});
