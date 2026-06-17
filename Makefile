# ============================================
# AGROGRATE AI - DevOps Makefile
# ============================================
# Full command reference for development,
# testing, security scanning, and deployment.
# ============================================

.PHONY: help dev dev-backend dev-frontend build build-backend build-frontend
.PHONY: test test-backend test-all test-e2e test-frontend
.PHONY: lint lint-backend lint-frontend typecheck
.PHONY: audit security-scan sbom loopcheck
.PHONY: docker-build docker-up docker-down docker-logs db-reset db-migrate
.PHONY: clean doc deploy-dev ci setup pre-commit

# ──────────────────────────────────────────
# Help (default target)
# ──────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ──────────────────────────────────────────
# Development
# ──────────────────────────────────────────
dev: ## Start all services locally via docker-compose
	docker compose up --build

dev-backend: ## Run backend in watch mode (requires Rust toolchain)
	cd backend && cargo watch -x run

dev-frontend: ## Run frontend dev server (requires Node.js)
	cd frontend && npm run dev

# ──────────────────────────────────────────
# Setup
# ──────────────────────────────────────────
setup: ## Install all dependencies (first-time setup)
	cd backend && cargo build
	cd frontend && npm ci
	@echo ""
	@echo "✓ Setup complete. Copy backend/.env.example to backend/.env and fill in secrets."
	@echo "  See TODO.md for step-by-step GitHub secrets setup."

pre-commit: lint typecheck test ## Run before every commit

# ──────────────────────────────────────────
# Build
# ──────────────────────────────────────────
build-backend: ## Build backend release binary
	cd backend && cargo build --release

build-frontend: ## Build frontend for production
	cd frontend && npm run build

build: build-backend build-frontend ## Build everything

# ──────────────────────────────────────────
# Test
# ──────────────────────────────────────────
test-backend: ## Run backend unit tests
	cd backend && cargo test

test-all: ## Run backend integration tests (requires DB)
	cd backend && cargo test -- --ignored

test-frontend: ## Run frontend unit tests
	cd frontend && npm test

test-e2e: ## Run Playwright E2E tests
	cd frontend && npx playwright test

test: test-backend test-frontend ## Run all unit tests

# ──────────────────────────────────────────
# Lint & Typecheck
# ──────────────────────────────────────────
lint-backend: ## Lint backend (clippy + format)
	cd backend && cargo fmt --check && cargo clippy -- -D warnings

lint-frontend: ## Lint frontend (ESLint + audit)
	cd frontend && npm run lint && npm audit --audit-level=high || echo "npm audit warnings"

lint: lint-backend lint-frontend ## Lint everything

typecheck: ## TypeScript type check
	cd frontend && npm run typecheck

# ──────────────────────────────────────────
# Security
# ──────────────────────────────────────────
audit: ## Run cargo-audit on backend dependencies
	cd backend && cargo audit

security-scan: ## Run security scan scripts
	bash scripts/security-scan.sh

sbom: ## Generate CycloneDX SBOM
	cargo install cargo-cyclonedx 2>/dev/null; cargo cyclonedx

# ──────────────────────────────────────────
# Loopcheck Gate
# ──────────────────────────────────────────
loopcheck: ## Run loopcheck engine
	bash scripts/loopcheck.sh

# ──────────────────────────────────────────
# Docker
# ──────────────────────────────────────────
docker-build: ## Build all docker images
	docker compose build

docker-up: ## Start all services in background
	docker compose up -d

docker-down: ## Stop all services
	docker compose down

docker-logs: ## Tail logs from all services
	docker compose logs -f

docker-prod: ## Start production stack
	docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# ──────────────────────────────────────────
# Database
# ──────────────────────────────────────────
db-reset: ## Reset database schema
	docker compose exec postgres psql -U agrograte -d agrograte -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	cd backend && cargo run --bin migrations

db-migrate: ## Run database migrations
	cd backend && cargo run --bin migrations

# ──────────────────────────────────────────
# Clean
# ──────────────────────────────────────────
clean: ## Remove all build artifacts
	cd backend && cargo clean
	cd frontend && rm -rf .next node_modules

# ──────────────────────────────────────────
# Documentation
# ──────────────────────────────────────────
doc: ## Generate Rust docs
	cd backend && cargo doc --no-deps --open

# ──────────────────────────────────────────
# Production
# ──────────────────────────────────────────
deploy-dev: ## Deploy to dev via Terraform
	cd infra/terraform/environments/dev && terraform init && terraform apply

# ──────────────────────────────────────────
# CI pipeline shortcut
# ──────────────────────────────────────────
ci: lint test audit security-scan loopcheck ## Run full CI pipeline locally
	@echo ""
	@echo "✓ CI pipeline complete"

.PHONY: help
