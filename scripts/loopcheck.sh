#!/bin/bash
set -euo pipefail

# Loopcheck Engine - Pre-deployment validation gate
# Validates architecture, security, compliance, accessibility, performance, SEO, legal, docs, testing, observability

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

THRESHOLD=80
FAILED=0
TOTAL=0
SCORES=()

validate() {
    local category="$1"
    local score="$2"
    TOTAL=$((TOTAL + 1))
    SCORES+=("$category:$score")

    if [ "$score" -lt "$THRESHOLD" ]; then
        echo -e "${RED}✗ $category: $score% (BELOW THRESHOLD)${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✓ $category: $score%${NC}"
    fi
}

echo "════════════════════════════════════════════"
echo "  Loopcheck Engine — Pre-Deployment Gate"
echo "  Threshold: ${THRESHOLD}%"
echo "════════════════════════════════════════════"
echo ""

# 1. Architecture Validation
echo "── Architecture ──"
ARCH_SCORE=100
[ -f "execution.md" ] || ARCH_SCORE=$((ARCH_SCORE - 20))
[ -d "docs/architecture" ] || ARCH_SCORE=$((ARCH_SCORE - 15))
[ -f "backend/Cargo.toml" ] || ARCH_SCORE=$((ARCH_SCORE - 20))
[ -d "frontend/src" ] || ARCH_SCORE=$((ARCH_SCORE - 20))
validate "Architecture" $ARCH_SCORE

# 2. Security Validation
echo "── Security ──"
SEC_SCORE=100
[ -f "docs/reviews/SECURITY_REVIEW.md" ] || SEC_SCORE=$((SEC_SCORE - 15))
grep -q "AES-256" backend/src/**/*.rs 2>/dev/null || SEC_SCORE=$((SEC_SCORE - 10))
grep -q "CORS" backend/src/**/*.rs 2>/dev/null || SEC_SCORE=$((SEC_SCORE - 10))
grep -q "cargo audit" .github/workflows/ci.yml 2>/dev/null || SEC_SCORE=$((SEC_SCORE - 10))
validate "Security" $SEC_SCORE

# 3. Compliance Validation
echo "── Compliance ──"
COMP_SCORE=100
[ -f "frontend/src/app/(public)/privacy-policy/page.tsx" ] || COMP_SCORE=$((COMP_SCORE - 20))
[ -f "frontend/src/app/(public)/terms-of-service/page.tsx" ] || COMP_SCORE=$((COMP_SCORE - 20))
[ -f "frontend/src/app/(public)/cookie-policy/page.tsx" ] || COMP_SCORE=$((COMP_SCORE - 15))
[ -f "frontend/src/app/(public)/disclaimer/page.tsx" ] || COMP_SCORE=$((COMP_SCORE - 15))
validate "Compliance" $COMP_SCORE

# 4. Accessibility Validation
echo "── Accessibility ──"
A11Y_SCORE=100
[ -f "frontend/src/app/(public)/accessibility/page.tsx" ] || A11Y_SCORE=$((A11Y_SCORE - 20))
[ -f "frontend/src/app/globals.css" ] || A11Y_SCORE=$((A11Y_SCORE - 15))
grep -q "@media.*prefers-reduced-motion" frontend/src/app/globals.css 2>/dev/null || A11Y_SCORE=$((A11Y_SCORE - 10))
validate "Accessibility" $A11Y_SCORE

# 5. Performance Validation
echo "── Performance ──"
PERF_SCORE=100
[ -f "docs/reviews/PERFORMANCE_REVIEW.md" ] || PERF_SCORE=$((PERF_SCORE - 20))
grep -q "lazy" frontend/next.config.js 2>/dev/null || PERF_SCORE=$((PERF_SCORE - 10))
validate "Performance" $PERF_SCORE

# 6. SEO Validation
echo "── SEO ──"
SEO_SCORE=100
grep -q "metadata" frontend/src/app/layout.tsx 2>/dev/null || SEO_SCORE=$((SEO_SCORE - 20))
grep -q "description" frontend/src/app/layout.tsx 2>/dev/null || SEO_SCORE=$((SEO_SCORE - 15))
validate "SEO" $SEO_SCORE

# 7. Legal Validation
echo "── Legal ──"
LEGAL_SCORE=100
[ -f "frontend/src/app/(public)/privacy-policy/page.tsx" ] || LEGAL_SCORE=$((LEGAL_SCORE - 20))
[ -f "frontend/src/app/(public)/terms-of-service/page.tsx" ] || LEGAL_SCORE=$((LEGAL_SCORE - 20))
[ -f "frontend/src/app/(public)/disclaimer/page.tsx" ] || LEGAL_SCORE=$((LEGAL_SCORE - 20))
[ -f "frontend/src/app/(public)/responsible-ai/page.tsx" ] || LEGAL_SCORE=$((LEGAL_SCORE - 15))
validate "Legal" $LEGAL_SCORE

# 8. Documentation Validation
echo "── Documentation ──"
DOCS_SCORE=100
[ -f "execution.md" ] || DOCS_SCORE=$((DOCS_SCORE - 15))
[ -f "running.md" ] || DOCS_SCORE=$((DOCS_SCORE - 15))
[ -d "docs" ] || DOCS_SCORE=$((DOCS_SCORE - 15))
validate "Documentation" $DOCS_SCORE

# 9. Testing Validation
echo "── Testing ──"
TEST_SCORE=100
[ -f ".github/workflows/ci.yml" ] || TEST_SCORE=$((TEST_SCORE - 25))
grep -q "cargo test" .github/workflows/ci.yml 2>/dev/null || TEST_SCORE=$((TEST_SCORE - 15))
validate "Testing" $TEST_SCORE

# 10. Observability Validation
echo "── Observability ──"
OBS_SCORE=100
grep -q "tracing" backend/src/telemetry/mod.rs 2>/dev/null || OBS_SCORE=$((OBS_SCORE - 20))
grep -q "health" backend/src/**/*.rs 2>/dev/null || OBS_SCORE=$((OBS_SCORE - 15))
validate "Observability" $OBS_SCORE

echo ""
echo "════════════════════════════════════════════"
echo "  RESULTS"
echo "════════════════════════════════════════════"

for score in "${SCORES[@]}"; do
    IFS=':' read -r cat val <<< "$score"
    if [ "$val" -lt "$THRESHOLD" ]; then
        echo -e "  ${RED}✗ $cat: $val%${NC}"
    else
        echo -e "  ${GREEN}✓ $cat: $val%${NC}"
    fi
done

echo ""
if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}✗ DEPLOYMENT BLOCKED: $FAILED/$TOTAL checks below threshold${NC}"
    echo -e "${RED}  Fix all failing checks before deployment${NC}"
    exit 1
else
    echo -e "${GREEN}✓ ALL CHECKS PASSED: Ready for deployment${NC}"
    exit 0
fi
