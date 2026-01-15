#!/usr/bin/env node

/**
 * TypeScript Type Checking Script
 * Runs comprehensive type checking and reports issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running TypeScript type checking...\n');

try {
    // Run TypeScript compiler in check mode
    console.log('📋 Checking TypeScript compilation...');
    execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ TypeScript compilation check passed!\n');

    // Check for any remaining 'any' types
    console.log('🔎 Scanning for remaining "any" types...');
    try {
        const result = execSync('npx grep -r ":\\s*any\\b" src/ --include="*.ts" --include="*.tsx"', {
            encoding: 'utf8',
            cwd: process.cwd()
        });
        if (result.trim()) {
            console.log('⚠️  Found remaining "any" types:');
            console.log(result);
        } else {
            console.log('✅ No explicit "any" types found!\n');
        }
    } catch (error) {
        if (error.status === 1) {
            console.log('✅ No explicit "any" types found!\n');
        } else {
            console.log('❌ Error checking for "any" types:', error.message);
        }
    }

    // Check for untyped function parameters
    console.log('🔎 Scanning for untyped function parameters...');
    try {
        const result = execSync('npx grep -r "\\(.*\\)\\s*=>" src/ --include="*.ts" --include="*.tsx" | grep -v ":\\s*\\w"', {
            encoding: 'utf8',
            cwd: process.cwd()
        });
        if (result.trim()) {
            console.log('⚠️  Found potentially untyped function parameters:');
            console.log(result);
        } else {
            console.log('✅ No untyped function parameters found!\n');
        }
    } catch (error) {
        if (error.status === 1) {
            console.log('✅ No untyped function parameters found!\n');
        }
    }

    console.log('🎉 Type checking completed successfully!');

} catch (error) {
    console.error('❌ TypeScript compilation failed:');
    console.error(error.message);
    process.exit(1);
}