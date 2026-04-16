#!/usr/bin/env node

/**
 * TypeScript Type Checking Script
 * Runs comprehensive type checking and reports issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: process.cwd() });
    try {
        const result = execSync('npx grep -r ":\\s*any\\b" src/ --include="*.ts" --include="*.tsx"', {
            encoding: 'utf8',
            cwd: process.cwd()
        });
        if (result.trim()) {
        } else {
        }
    } catch (error) {
        if (error.status === 1) {
        } else {
        }
    }
    try {
        const result = execSync('npx grep -r "\\(.*\\)\\s*=>" src/ --include="*.ts" --include="*.tsx" | grep -v ":\\s*\\w"', {
            encoding: 'utf8',
            cwd: process.cwd()
        });
        if (result.trim()) {
        } else {
        }
    } catch (error) {
        if (error.status === 1) {
        }
    }

} catch (error) {
    process.exit(1);
}