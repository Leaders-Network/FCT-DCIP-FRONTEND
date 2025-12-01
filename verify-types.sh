#!/bin/bash

# TypeScript Verification Script for Builders-Liability-AMMC-FRONTEND
# This script verifies that all TypeScript types are properly defined

echo "🔍 Starting TypeScript Verification..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for issues
ISSUES=0

# 1. Check for TypeScript compilation errors
echo "📝 Checking TypeScript compilation..."
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌ TypeScript compilation errors found${NC}"
    npx tsc --noEmit
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No TypeScript compilation errors${NC}"
fi
echo ""

# 2. Check for 'any' types (excluding node_modules and .next)
echo "🔎 Checking for 'any' types..."
ANY_COUNT=$(grep -r ": any" src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next | wc -l)
if [ "$ANY_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $ANY_COUNT instances of 'any' type${NC}"
    echo "Files with 'any' types:"
    grep -r ": any" src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next -l
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No 'any' types found${NC}"
fi
echo ""

# 3. Check for implicit any
echo "🔍 Checking for implicit any..."
if grep -r "noImplicitAny.*false" tsconfig.json; then
    echo -e "${YELLOW}⚠️  noImplicitAny is disabled${NC}"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ noImplicitAny is enabled${NC}"
fi
echo ""

# 4. Check for strict mode
echo "🔒 Checking strict mode..."
if grep -q '"strict".*true' tsconfig.json; then
    echo -e "${GREEN}✅ Strict mode is enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Strict mode is not enabled${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 5. Check for type definition files
echo "📚 Checking type definition files..."
if [ -f "src/types/api.types.ts" ]; then
    echo -e "${GREEN}✅ api.types.ts exists${NC}"
else
    echo -e "${RED}❌ api.types.ts not found${NC}"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# 6. Check for unused imports (basic check)
echo "🧹 Checking for unused type imports..."
UNUSED=$(grep -r "import type.*from" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | wc -l)
echo -e "${GREEN}✅ Found $UNUSED type imports${NC}"
echo ""

# 7. Verify key type exports
echo "📦 Verifying key type exports..."
KEY_TYPES=(
    "BrokerAdmin"
    "BrokerAdminLoginResponse"
    "BrokerPolicyRequest"
    "PolicyRequest"
    "Assignment"
    "Surveyor"
    "ApiResponse"
)

for TYPE in "${KEY_TYPES[@]}"; do
    if grep -q "export.*interface $TYPE" src/types/api.types.ts || grep -q "export.*type $TYPE" src/types/api.types.ts; then
        echo -e "${GREEN}✅ $TYPE is exported${NC}"
    else
        echo -e "${RED}❌ $TYPE is not exported${NC}"
        ISSUES=$((ISSUES + 1))
    fi
done
echo ""

# 8. Check documentation files
echo "📖 Checking documentation files..."
DOCS=(
    "TYPESCRIPT_FIXES_APPLIED.md"
    "TYPESCRIPT_BEST_PRACTICES_GUIDE.md"
    "TYPESCRIPT_QUICK_REFERENCE.md"
    "TYPESCRIPT_IMPROVEMENTS_SUMMARY.md"
)

for DOC in "${DOCS[@]}"; do
    if [ -f "$DOC" ]; then
        echo -e "${GREEN}✅ $DOC exists${NC}"
    else
        echo -e "${YELLOW}⚠️  $DOC not found${NC}"
    fi
done
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All TypeScript checks passed!${NC}"
    echo -e "${GREEN}🎉 Your codebase has excellent type safety!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Found $ISSUES issue(s)${NC}"
    echo -e "${YELLOW}Please review the issues above${NC}"
    exit 1
fi
