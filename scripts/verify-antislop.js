'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running SAPA NAMBASO quality and antislop verifications...\n');

// 1. Check for forbidden em-dash / en-dash in source and data files
const forbiddenDashRegex = /[\u2013\u2014]/;
const dirsToCheck = ['src', 'public', 'data'];
let dashErrors = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'vendor' || entry.name === 'node_modules') continue;
      scanDir(fullPath);
    } else if (/\.(js|css|html|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (forbiddenDashRegex.test(line)) {
          console.error(`[DASH RULE ERROR] ${fullPath}:${idx + 1}: contains em-dash or en-dash: "${line.trim()}"`);
          dashErrors++;
        }
      });
    }
  }
}

for (const d of dirsToCheck) {
  scanDir(path.join(__dirname, '..', d));
}

if (dashErrors > 0) {
  console.error(`\nFAILED: Found ${dashErrors} forbidden dashes (AGENTS.md rule 3).\n`);
  process.exit(1);
} else {
  console.log('PASSED: Zero em-dashes and en-dashes detected (AGENTS.md rule 3).');
}

// 2. Syntax check for primary JS files
const filesToCheck = [
  'server.js',
  'src/db.js',
  'src/seed.js',
  'src/analytics.js',
  'src/qr-svg.js',
  'src/render-public.js',
  'public/app.js',
  'public/admin.js'
];

for (const f of filesToCheck) {
  const filePath = path.join(__dirname, '..', f);
  if (fs.existsSync(filePath)) {
    try {
      execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
      console.log(`PASSED: Syntax check for ${f}`);
    } catch (err) {
      console.error(`FAILED: Syntax error in ${f}:`, err.message);
      process.exit(1);
    }
  }
}

// 3. Verify public page rendering
try {
  const { loadDatabase } = require('../src/db');
  const { renderPublicPage } = require('../src/render-public');
  const db = loadDatabase(false);
  const html = renderPublicPage(db);
  if (!html || typeof html !== 'string' || html.length < 500) {
    throw new Error('Public page HTML output is suspiciously short or invalid.');
  }
  console.log(`PASSED: Public page rendered successfully (${html.length} bytes).`);
} catch (err) {
  console.error('FAILED: Error rendering public page:', err);
  process.exit(1);
}

// 4. Contrast check verification
try {
  execSync('python contrast-check.py', { stdio: 'pipe' });
  console.log('PASSED: WCAG AA contrast ratio standards met across all tokens.');
} catch (err) {
  console.error('FAILED: Contrast check failed:', err.message);
  process.exit(1);
}

console.log('\nAll verification checks PASSED successfully!');
