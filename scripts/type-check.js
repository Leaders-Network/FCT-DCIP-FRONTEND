#!/usr/bin/env node

/**
 * TypeScript Type Checking Script
 * 
 * This script performs comprehensive type checking across the Builders-Liability-AMMC-FRONTEND project
 * and generates a report of any type issues found.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting TypeScript type checking...\n');

// Function to run TypeScript compiler and capture output
function runTypeCheck(configFile = 'tsconfig.json') {
    try {
        console.log(`📋 Checking with ${configFile}...`);
        const output = execSync(`npx tsc --noEmit --project ${configFile}`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        return { success: true, output: output || 'No issues found' };
    } catch (error) {
        return { success: false, output: error.stdout || error.message };
    }
}

// Function to analyze TypeScript files for common issues
function analyzeTypeIssues() {
    const issues = [];
    const srcDir = path.join(__dirname, '../src');

    function scanDirectory(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                const content = fs.readFileSync(filePath, 'utf8');
                const relativePath = path.relative(path.join(__dirname, '..'), filePath);

                // Check for 'any' types
                const anyMatches = content.match(/:\s*any\b/g);
                if (anyMatches) {
                    issues.push({
                        file: relativePath,
                        type: 'any-type',
                        count: anyMatches.length,
                        message: `Found ${anyMatches.length} 'any' type(s)`
                    });
                }

                // Check for 'unknown' types that might need refinement
                const unknownMatches = content.match(/:\s*unknown\b/g);
                if (unknownMatches && unknownMatches.length > 2) {
                    issues.push({
                        file: relativePath,
                        type: 'unknown-type',
                        count: unknownMatches.length,
                        message: `Found ${unknownMatches.length} 'unknown' type(s) - consider more specific types`
                    });
                }

                // Check for missing return types on functions
                const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{/g);
                if (functionMatches) {
                    issues.push({
                        file: relativePath,
                        type: 'missing-return-type',
                        count: functionMatches.length,
                        message: `Found ${functionMatches.length} function(s) without explicit return types`
                    });
                }

                // Check for TODO/FIXME comments related to types
                const todoMatches = content.match(/\/\/\s*(TODO|FIXME).*type/gi);
                if (todoMatches) {
                    issues.push({
                        file: relativePath,
                        type: 'type-todo',
                        count: todoMatches.length,
                        message: `Found ${todoMatches.length} type-related TODO/FIXME comment(s)`
                    });
                }
            }
        }
    }

    scanDirectory(srcDir);
    return issues;
}

// Main execution
async function main() {
    // Run standard type check
    console.log('1️⃣ Running standard TypeScript check...');
    const standardCheck = runTypeCheck('tsconfig.json');

    if (standardCheck.success) {
        console.log('✅ Standard type check passed\n');
    } else {
        console.log('❌ Standard type check failed:');
        console.log(standardCheck.output);
        console.log('');
    }

    // Run strict type check if config exists
    const strictConfigPath = path.join(__dirname, '../tsconfig.strict.json');
    if (fs.existsSync(strictConfigPath)) {
        console.log('2️⃣ Running strict TypeScript check...');
        const strictCheck = runTypeCheck('tsconfig.strict.json');

        if (strictCheck.success) {
            console.log('✅ Strict type check passed\n');
        } else {
            console.log('⚠️ Strict type check found issues:');
            console.log(strictCheck.output);
            console.log('');
        }
    }

    // Analyze for common type issues
    console.log('3️⃣ Analyzing for common type issues...');
    const issues = analyzeTypeIssues();

    if (issues.length === 0) {
        console.log('✅ No common type issues found\n');
    } else {
        console.log('⚠️ Found potential type issues:');
        issues.forEach(issue => {
            console.log(`  📁 ${issue.file}: ${issue.message}`);
        });
        console.log('');
    }

    // Generate summary report
    const report = {
        timestamp: new Date().toISOString(),
        standardTypeCheck: standardCheck,
        strictTypeCheck: fs.existsSync(strictConfigPath) ? runTypeCheck('tsconfig.strict.json') : null,
        commonIssues: issues,
        summary: {
            totalFiles: issues.length,
            totalIssues: issues.reduce((sum, issue) => sum + issue.count, 0),
            typesSafe: standardCheck.success && issues.length === 0
        }
    };

    // Save report
    const reportPath = path.join(__dirname, '../type-check-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('📊 Type checking complete!');
    console.log(`📄 Report saved to: ${reportPath}`);

    if (report.summary.typesSafe) {
        console.log('🎉 All type checks passed! Your code is type-safe.');
    } else {
        console.log('⚠️ Some type issues were found. Please review the report.');
    }

    // Exit with appropriate code
    process.exit(report.summary.typesSafe ? 0 : 1);
}

main().catch(error => {
    console.error('💥 Type checking script failed:', error);
    process.exit(1);
});