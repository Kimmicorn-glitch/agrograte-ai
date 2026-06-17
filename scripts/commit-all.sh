#!/bin/bash
# ============================================
# AGROGRATE AI - Initial Commit Script
# ============================================
# Stages files in logical groups and commits
# each group with a descriptive message.
# Run from the repo root: bash scripts/commit-all.sh
# ============================================

set -e

echo "=== AgroGrate AI - Initial Commit ==="
echo ""

# ──────────────────────────────────────────
# 1. Root configuration
# ──────────────────────────────────────────
echo "[1/7] Project foundation..."
git add Cargo.toml Cargo.lock .gitignore
git commit -m "Project foundation: Rust workspace and Git ignore rules

Cargo.toml defines a Rust workspace containing the backend binary crate
(agrograte-backend) and a test-link helper. .gitignore excludes all build
artifacts (target/, .next/, dist/), environment files with secrets (.env,
.env.local), IDE configs, OS metadata, logs, and Terraform state."

# ──────────────────────────────────────────
# 2. Backend core
# ──────────────────────────────────────────
echo "[2/7] Backend core..."
git add backend/src/main.rs backend/src/config/ backend/src/error/ backend/src/telemetry/
git commit -m "Backend core: application entry point, config loader, error handling, telemetry

main.rs: Axum HTTP server wiring all modules, starting PostgreSQL/Redis/NATS
connections, and initializing the DRRT engine.
config/mod.rs: Environment-based config with production-safety checks (panics
if JWT secret is the default in staging/production).
error/mod.rs: Unified AppError enum with sanitized JSON responses that hide
internal details from end users in production.
telemetry/mod.rs: Structured logging via the tracing crate."

# ──────────────────────────────────────────
# 3. Database
# ──────────────────────────────────────────
echo "[3/7] Database layer..."
git add backend/src/db/
git commit -m "Database: PostgreSQL connection pool, migration runner, and schema

db/mod.rs: Creates a connection pool from DATABASE_URL and runs migrations
on startup using sqlx::migrate!.
Migrations:
- 20260101000001: Initial schema (businesses, accounts, invoices, etc.)
- 20260101000002: Users table with roles and refresh tokens
- 20260101000003: Approval workflows table"

# ──────────────────────────────────────────
# 4. Domain models
# ──────────────────────────────────────────
echo "[4/7] Domain layer..."
git add backend/src/domain/
git commit -m "Domain layer: business entities, value objects, and approval logic

models.rs: Core types used across the application (User, Business, Account,
Invoice, TaxRecord, VatReturn, BankingRule, ComplianceStatus, etc.).
value_objects.rs: Immutable value types — Money (ZAR with safe arithmetic),
TaxRate (standard/zero/exempt with percentage), Role (with permission checks
for Admin/User/Accountant/Auditor/Viewer).
approval.rs: Approval workflow state machine with status transitions."

# ──────────────────────────────────────────
# 5. Auth
# ──────────────────────────────────────────
echo "[5/7] Authentication system..."
git add backend/src/auth/
git commit -m "Authentication: JWT token creation/validation, middleware, and routes

jwt.rs: HMAC-SHA256 access tokens (with email + role claims) and refresh
tokens (with only user_id for rotation). Includes unit tests for round-trip
validation, wrong-secret rejection, and garbage token handling.
middleware.rs: AuthenticatedUser extractor that validates Bearer tokens from
the Authorization header. Includes require_admin_access() for protected routes.
routes.rs: Register (with email format validation), login (returns access +
refresh tokens), refresh (rotates refresh token), me (returns current user),
and logout (revokes all sessions for the user)."

# ──────────────────────────────────────────
# 6. DRRT engine
# ──────────────────────────────────────────
echo "[6/7] DRRT intelligence engine..."
git add backend/src/drrt/
git commit -m "DRRT engine: relational tensor processing for financial intelligence

The DRRT (Dynamic Relational Reasoning Tensor) engine models financial
relationships as a weighted tensor graph and recursively converges
dimension activations to reveal hidden contradictions and risks.

tensor.rs: RelationalTensor with dimensions, signed edges, coherence/
contradiction/frustration metrics, and convergence state tracking.
convergence.rs: Iterative relaxation algorithm that updates activations
along relationship edges until coherence stabilizes below a delta threshold.
collapse.rs: Monitors for destabilization — rapid coherence drops with
rising contradiction trigger Collapsed/Warning/Stable classification.
memory.rs: DrrtMemory records state snapshots and detects improving/
degrading/stable trends over a configurable window.
metrics.rs: Statistical helpers for relational entropy and stability.
engine.rs: DrrtEngine orchestrates tensor initialization, financial data
ingestion, relationship graph construction, convergence, and state
summary generation. Includes 10 unit tests covering all major paths."

# ──────────────────────────────────────────
# 7. Business modules
# ──────────────────────────────────────────
echo "[7/7a] SARS compliance, cashflow forecasting..."
git add backend/src/sars/ backend/src/cashflow/
git commit -m "SARS compliance: VAT, income tax, and payroll compliance engine

compliance.rs: Checks VAT returns (filing status, on-time submission,
penalties), income tax records (filed, paid, outstanding), and payroll
(PAYE/UIF/SDL compliance). Generates ComplianceReport with violations
and recommendations. Includes 12 unit tests.
reporting.rs: Generates pro-forma income statements, balance sheets,
and cash flow statements from financial data.
vat.rs: VAT calculation engine for invoices (standard/zero-rated/exempt).
tax_reserve.rs: Tax reserve tracking for provisioning.
forecasting.rs: Cash flow forecaster stub (designed for future ML integration)."

# ──────────────────────────────────────────
# 8. Investec & repositories
# ──────────────────────────────────────────
echo "[7/7b] Investec banking integration and data repositories..."
git add backend/src/investec/ backend/src/repositories/
git commit -m "Investec banking API client and data access layer

investec/client.rs: HTTP client for the Investec OpenAPI with OAuth token
refresh, configurable retry, and error mapping.
investec/programmable.rs: Rule evaluation engine for Investec Programmable
Banking — evaluates transaction rules with comparison operators.
investec/types.rs: Shared types for Investec API requests/responses.
repositories/approvals.rs: CRUD for approval workflows.
repositories/audit.rs: Insert/query audit event log.
repositories/rules.rs: CRUD for programmable banking rules."

# ──────────────────────────────────────────
# 9. API routes
# ──────────────────────────────────────────
echo "[7/7c] HTTP API route handlers..."
git add backend/src/api/
git commit -m "API routes: REST endpoints for DRRT, banking, compliance, and health

Route modules:
- drrt.rs: GET /state, GET /dimensions, POST /converge, POST /relationship,
  GET /memory — full DRRT engine control via HTTP
- banking.rs: GET/PUT programmable banking rules with audit logging
- approval.rs: GET/POST approval workflows with approve/reject actions
- cashflow.rs: Cash flow forecast and reserve endpoints
- compliance.rs: SARS compliance report generation
- investec.rs: Investec OAuth callback handler
- financial.rs: Financial health aggregated endpoint
- transactions.rs: Transaction insight queries
- health.rs: Liveness/readiness checks
- auth.rs: Auth routes mounted separately
middleware/mod.rs: Rate limiter, request logging, CORS layer"

# ──────────────────────────────────────────
# 10. Backend config & tests
# ──────────────────────────────────────────
echo "[7/7d] Backend support files..."
git add backend/Cargo.toml backend/Dockerfile backend/.cargo/ backend/.env.example \
       backend/package.json backend/mock-server.js backend/tests/ backend/test-link/
git commit -m "Backend support: Docker image, mock server, and integration tests

Dockerfile: Multi-stage build (rust:slim-bookworm → debian:bookworm-slim)
with non-root 'agrograte' user for production safety.
.env.example: Template for local development config (all placeholder values).
mock-server.js: Express.js server mocking Investec API endpoints for offline dev.
tests/auth_integration.rs: Integration test stubs for auth routes (require DB).
test-link/: Minimal Rust binary to verify DRRT linking."

# ──────────────────────────────────────────
# 11. Frontend
# ──────────────────────────────────────────
echo "[7/7e] Frontend application..."
git add frontend/
git commit -m "Frontend: Next.js 14 application with dashboard and 3D financial galaxy

Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion,
Three.js (via @react-three/fiber), and TanStack React Query.

Pages (30+ routes):
- Public marketing: landing, features, pricing, about, blog, docs, security,
  compliance, contact, legal pages (privacy, terms, cookies, disclaimer)
- Dashboard: health, cashflow, compliance, banking, DRRT intelligence,
  approvals, audit, financial orb (3D galaxy)
- Auth: Login with JWT token management

Key components:
- financial-orb/: Three.js 3D galaxy with force-directed graph, node shaders,
  orbit controls, search, context menus, and particle effects
- dashboard/: Sidebar navigation with animated transitions, SystemMetricsPanel
- financial/: Compliance and health score panels with status indicators
- banking/: Account list, transaction feed, anomaly alerts
- drrt/: State panel and 3D tensor visualization
- ui/: GlassCard, MetricTile, StatusBadge, SectionTitle design system

Testing: Jest with @testing-library/react (6 component tests covering
loading/error/data states), Playwright E2E test for login flow."

# ──────────────────────────────────────────
# 12. DevOps
# ──────────────────────────────────────────
echo "[7/7f] DevOps infrastructure..."
git add docker-compose.yml docker-compose.prod.yml .github/ infra/ scripts/ Makefile
git commit -m "DevOps: Docker Compose, CI/CD pipeline, Kubernetes, Terraform

Docker Compose:
- docker-compose.yml: Local dev stack (PostgreSQL, Redis, NATS, backend)
- docker-compose.prod.yml: Production stack with env-var references (no secrets)

CI/CD (12-stage pipeline in .github/workflows/ci.yml):
1. Lint (Rust fmt + clippy, ESLint, npm audit)
2. TypeScript type check
3. Backend + frontend unit tests
4. Integration tests with service containers
5. Security scan (cargo-audit, Trivy, TruffleHog secret scan, SBOM)
6. Loopcheck gate
7. Docker build & push to GHCR
8. Cosign container signing
9. Deploy dev via ArgoCD
10. Smoke + E2E tests
11. Production approval gate
12. Production deploy

Kubernetes: Backend and frontend deployments with secrets via secretKeyRef
Terraform: AKS module and dev environment config
Scripts: loopcheck.sh, security-scan.sh, commit-all.sh
Makefile: Unified dev workflow (make dev/test/lint/audit/ci)"

# ──────────────────────────────────────────
# 13. Documentation
# ──────────────────────────────────────────
echo "[7/7g] Documentation and root project files..."
git add ARCHITECTURE_DECISIONS.md CHANGELOG.md CONTRIBUTING.md ROADMAP.md \
       SECURITY.md TODO.md execution.md running.md status.md docs/
git commit -m "Documentation: architecture, security policy, setup guide, and reviews

- ARCHITECTURE_DECISIONS.md: Key architectural trade-offs and rationale
- CHANGELOG.md: Release history and version tracking
- CONTRIBUTING.md: Contribution guidelines
- ROADMAP.md: Planned features and milestones
- SECURITY.md: Secrets handling policy and vulnerability reporting process
- TODO.md: Step-by-step setup guide with GitHub Actions secrets instructions
  designed for non-technical team members
- docs/: API specification (OpenAPI), architecture/security/testing/UX gap
  analyses, DRRT refactor recovery report, production readiness assessment,
  and peer reviews (architecture, implementation, performance, security, UX)"

echo ""
echo "=== All commits created ==="
echo ""
echo "Summary:"
git log --oneline
echo ""
echo "To push to GitHub:"
echo "  git remote add origin git@github.com:Kimmicorn-glitch/agrograte-ai.git"
echo "  git branch -M main"
echo "  git push -u origin main"
