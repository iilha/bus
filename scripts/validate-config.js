#!/usr/bin/env node
/**
 * Config validation for production builds
 * Ensures devMode and debug are not accidentally enabled in production
 *
 * Usage:
 *   node scripts/validate-config.js
 *   node scripts/validate-config.js --env=production
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../app-config.json');

function validateConfig(env = 'production') {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ app-config.json not found');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

  console.log(`🔍 Validating config for ${env} environment...`);

  const errors = [];

  if (env === 'production') {
    // Production rules
    if (config.devMode === true) {
      errors.push('devMode must be false or absent in production');
    }

    if (config.debug === true) {
      errors.push('debug must be false or absent in production');
    }

    if (config.apiBase !== 'https://api.octile.eu.cc') {
      errors.push(`apiBase must be 'https://api.octile.eu.cc' in production (got: '${config.apiBase}')`);
    }
  }

  // General sanity checks
  if (!config.appId) {
    errors.push('appId is required');
  }

  if (!config.siteBase) {
    errors.push('siteBase is required');
  }

  if (errors.length > 0) {
    console.error('\n❌ Config validation failed:\n');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('');
    process.exit(1);
  }

  console.log('✅ Config validation passed\n');
  console.log(`   devMode: ${config.devMode ?? false}`);
  console.log(`   debug: ${config.debug ?? false}`);
  console.log(`   apiBase: ${config.apiBase}`);
  console.log('');
}

// Parse CLI args
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'production';

validateConfig(env);
