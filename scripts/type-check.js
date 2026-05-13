#!/usr/bin/env node

/**
 * TypeScript Type Checking Script
 * Runs the local TypeScript compiler without relying on shell utilities.
 */

const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

try {
  execSync('npx tsc --noEmit', {
    stdio: 'inherit',
    cwd: projectRoot
  });
} catch (error) {
  process.exit(typeof error.status === 'number' ? error.status : 1);
}
