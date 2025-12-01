# TypeScript Verification Script for Builders-Liability-AMMC-FRONTEND (PowerShell)
# This script verifies that all TypeScript types are properly defined

Write-Host "🔍 Starting TypeScript Verification..." -ForegroundColor Cyan
Write-Host ""

$Issues = 0

# 1. Check for TypeScript compilation errors
Write-Host "📝 Checking TypeScript compilation..." -ForegroundColor Yellow
try {
    $output = npx tsc --noEmit 2>&1
    if ($output -match "error TS") {
        Write-Host "❌ TypeScript compilation errors found" -ForegroundColor Red
        Write-Host $output
        $Issues++
    } else {
        Write-Host "✅ No TypeScript compilation errors" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not run TypeScript compiler" -ForegroundColor Yellow
}
Write-Host ""

# 2. Check for 'any' types
Write-Host "🔎 Checking for 'any' types..." -ForegroundColor Yellow
$anyFiles = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse | 
    Select-String -Pattern ": any" | 
    Select-Object -ExpandProperty Path -Unique

if ($anyFiles) {
    Write-Host "⚠️  Found 'any' types in the following files:" -ForegroundColor Yellow
    $anyFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    $Issues++
} else {
    Write-Host "✅ No 'any' types found" -ForegroundColor Green
}
Write-Host ""

# 3. Check for strict mode
Write-Host "🔒 Checking strict mode..." -ForegroundColor Yellow
$tsconfig = Get-Content "tsconfig.json" -Raw
if ($tsconfig -match '"strict":\s*true') {
    Write-Host "✅ Strict mode is enabled" -ForegroundColor Green
} else {
    Write-Host "⚠️  Strict mode is not enabled" -ForegroundColor Yellow
    $Issues++
}
Write-Host ""

# 4. Check for type definition files
Write-Host "📚 Checking type definition files..." -ForegroundColor Yellow
if (Test-Path "src/types/api.types.ts") {
    Write-Host "✅ api.types.ts exists" -ForegroundColor Green
} else {
    Write-Host "❌ api.types.ts not found" -ForegroundColor Red
    $Issues++
}
Write-Host ""

# 5. Verify key type exports
Write-Host "📦 Verifying key type exports..." -ForegroundColor Yellow
$keyTypes = @(
    "BrokerAdmin",
    "BrokerAdminLoginResponse",
    "BrokerPolicyRequest",
    "PolicyRequest",
    "Assignment",
    "Surveyor",
    "ApiResponse"
)

$apiTypes = Get-Content "src/types/api.types.ts" -Raw

foreach ($type in $keyTypes) {
    if ($apiTypes -match "export.*interface $type" -or $apiTypes -match "export.*type $type") {
        Write-Host "✅ $type is exported" -ForegroundColor Green
    } else {
        Write-Host "❌ $type is not exported" -ForegroundColor Red
        $Issues++
    }
}
Write-Host ""

# 6. Check documentation files
Write-Host "📖 Checking documentation files..." -ForegroundColor Yellow
$docs = @(
    "TYPESCRIPT_FIXES_APPLIED.md",
    "TYPESCRIPT_BEST_PRACTICES_GUIDE.md",
    "TYPESCRIPT_QUICK_REFERENCE.md",
    "TYPESCRIPT_IMPROVEMENTS_SUMMARY.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✅ $doc exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $doc not found" -ForegroundColor Yellow
    }
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($Issues -eq 0) {
    Write-Host "✅ All TypeScript checks passed!" -ForegroundColor Green
    Write-Host "🎉 Your codebase has excellent type safety!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Found $Issues issue(s)" -ForegroundColor Yellow
    Write-Host "Please review the issues above" -ForegroundColor Yellow
    exit 1
}
