#!/usr/bin/env node
/**
 * copilot-eval.mjs — GitHub Copilot-powered Job Offer Evaluator for career-ops
 *
 * Uses the GitHub Copilot API to evaluate job offers.
 * Reads evaluation logic from modes/oferta.md + modes/_shared.md,
 * reads the user's resume from cv.md, and evaluates a Job Description
 * passed as a command-line argument.
 *
 * Usage:
 *   node copilot-eval.mjs --login                    # first-time auth (run once)
 *   node copilot-eval.mjs --list-models              # see available models
 *   node copilot-eval.mjs "Paste full JD text here"
 *   node copilot-eval.mjs --file ./jds/my-job.txt
 *   node copilot-eval.mjs --model github-copilot/gpt-4o "JD text"
 *
 * First-time setup:
 *   node copilot-eval.mjs --login
 *   node copilot-eval.mjs --list-models
 *   # Add to .env: COPILOT_MODEL=github-copilot/gpt-4o
 *   node copilot-eval.mjs "JD text here"
 *
 * Requires an active GitHub Copilot subscription on your account.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Bootstrap: load .env
// ---------------------------------------------------------------------------
try {
  const { config } = await import('dotenv');
  config();
} catch { /* dotenv optional */ }

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = dirname(fileURLToPath(import.meta.url));

const PATHS = {
  shared:     join(ROOT, 'modes', '_shared.md'),
  oferta:     join(ROOT, 'modes', 'oferta.md'),
  cv:         join(ROOT, 'cv.md'),
  reports:    join(ROOT, 'reports'),
  githubCred: join(ROOT, '.copilot-github.json'),   // stores GitHub OAuth token
  tokenCache: join(ROOT, '.copilot-token.cache.json'), // stores short-lived Copilot token
};

// ---------------------------------------------------------------------------
// Copilot API constants
// ---------------------------------------------------------------------------
const CLIENT_ID           = 'Iv1.b507a08c87ecfe98'; // GitHub OAuth app for Copilot
const DEVICE_CODE_URL     = 'https://github.com/login/device/code';
const ACCESS_TOKEN_URL    = 'https://github.com/login/oauth/access_token';
const TOKEN_EXCHANGE_URL  = 'https://api.github.com/copilot_internal/v2/token';
const COPILOT_API_BASE    = 'https://api.individual.githubcopilot.com';
const EDITOR_VERSION      = 'vscode/1.96.2';
const USER_AGENT          = 'GitHubCopilotChat/0.26.7';
const GITHUB_API_VERSION  = '2025-04-01';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║       career-ops — GitHub Copilot Evaluator                     ║
╚══════════════════════════════════════════════════════════════════╝

  Evaluate a job offer using your GitHub Copilot subscription.

  USAGE
    node copilot-eval.mjs --login                    First-time setup
    node copilot-eval.mjs --list-models              See available models
    node copilot-eval.mjs "<JD text>"                Evaluate inline JD
    node copilot-eval.mjs --file ./jds/my-job.txt    Evaluate from file
    node copilot-eval.mjs --model github-copilot/gpt-4o "<JD text>"

  OPTIONS
    --login           Authenticate with GitHub (run once)
    --list-models     List all models on your Copilot subscription
    --file <path>     Read JD from a file
    --model <name>    Model to use, e.g. github-copilot/gpt-4o
    --no-save         Do not save report to reports/
    --help            Show this help

  FIRST-TIME SETUP
    node copilot-eval.mjs --login
    node copilot-eval.mjs --list-models
    echo "COPILOT_MODEL=github-copilot/gpt-4o" >> .env
    node copilot-eval.mjs "We are looking for a Senior AI Engineer..."
`);
  process.exit(0);
}

let jdText     = '';
let modelArg   = null;
let saveReport = true;
let listModels = false;
let doLogin    = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--login') {
    doLogin = true;
  } else if (args[i] === '--file' && args[i + 1]) {
    const p = args[++i];
    if (!existsSync(p)) { console.error(`❌  File not found: ${p}`); process.exit(1); }
    jdText = readFileSync(p, 'utf-8').trim();
  } else if (args[i] === '--model' && args[i + 1]) {
    modelArg = args[++i];
  } else if (args[i] === '--no-save') {
    saveReport = false;
  } else if (args[i] === '--list-models') {
    listModels = true;
  } else if (!args[i].startsWith('--')) {
    jdText += (jdText ? '\n' : '') + args[i];
  }
}

// ---------------------------------------------------------------------------
// GitHub OAuth device flow (--login)
// ---------------------------------------------------------------------------
async function githubLogin() {
  console.log('\n🔐  Authenticating with GitHub Copilot...\n');

  // Step 1: request device code
  const codeRes = await fetch(DEVICE_CODE_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, scope: 'read:user' }),
  });
  if (!codeRes.ok) throw new Error(`Device code request failed: HTTP ${codeRes.status}`);
  const codeData = await codeRes.json();
  const { device_code, user_code, verification_uri, expires_in, interval } = codeData;

  console.log(`  1. Open this URL in your browser:`);
  console.log(`     ${verification_uri}\n`);
  console.log(`  2. Enter this code: ${user_code}\n`);
  console.log('  Waiting for authorization...');

  // Step 2: poll for access token
  const expiresAt  = Date.now() + expires_in * 1000;
  const intervalMs = (interval || 5) * 1000;

  while (Date.now() < expiresAt) {
    await new Promise(r => setTimeout(r, intervalMs));
    const tokenRes = await fetch(ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.access_token) {
      // Save GitHub OAuth token
      writeFileSync(PATHS.githubCred, JSON.stringify({ token: tokenData.access_token, savedAt: Date.now() }), 'utf-8');
      console.log('\n✅  Logged in successfully!\n');

      // Immediately fetch and show models so user can pick one right away
      console.log('─'.repeat(66));
      console.log('  Pick a model — add one of these to your .env:');
      console.log('─'.repeat(66) + '\n');
      try {
        const exchRes = await fetch('https://api.github.com/copilot_internal/v2/token', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Editor-Version': EDITOR_VERSION,
            'User-Agent': USER_AGENT,
            'X-Github-Api-Version': GITHUB_API_VERSION,
          },
        });
        if (exchRes.ok) {
          const exchData = await exchRes.json();
          const copilotToken = exchData.token;
          const proxyEp = copilotToken.match(/(?:^|;)\s*proxy-ep=([^;\s]+)/i)?.[1]?.trim();
          const baseUrl = proxyEp
            ? `https://${proxyEp.replace(/^https?:\/\//i, '').replace(/^proxy\./i, 'api.')}`
            : 'https://api.individual.githubcopilot.com';
          // Cache the Copilot token now so first eval is instant
          try {
            const expiresAt = exchData.expires_at
              ? (exchData.expires_at < 1e11 ? exchData.expires_at * 1000 : exchData.expires_at)
              : Date.now() + 25 * 60 * 1000;
            writeFileSync(PATHS.tokenCache, JSON.stringify({ token: copilotToken, expiresAt, updatedAt: Date.now() }), 'utf-8');
          } catch { /* non-fatal */ }
          const modelsRes = await fetch(`${baseUrl}/models`, {
            headers: {
              'Authorization': `Bearer ${copilotToken}`,
              'Content-Type': 'application/json',
              'Editor-Version': EDITOR_VERSION,
              'User-Agent': USER_AGENT,
            },
          });
          if (modelsRes.ok) {
            const modelsData = await modelsRes.json();
            const models = (modelsData.data || []).filter(m => m.capabilities?.type === 'chat');
            for (const m of models) console.log(`  COPILOT_MODEL=github-copilot/${m.id}`);
          }
        }
      } catch { /* non-fatal — user can run --list-models manually */ }

      console.log();
      console.log('─'.repeat(66));
      console.log('  1. Copy a line above and add it to your .env, e.g.:');
      console.log();
      console.log('       echo "COPILOT_MODEL=github-copilot/gpt-4o" >> .env');
      console.log();
      console.log('  2. Then evaluate any job offer:');
      console.log();
      console.log('       node copilot-eval.mjs "Paste JD text here"');
      console.log('─'.repeat(66) + '\n');
      return;
    }
    const err = tokenData.error;
    if (err === 'authorization_pending' || err === 'slow_down') continue;
    if (err === 'expired_token') throw new Error('Code expired. Run --login again.');
    if (err === 'access_denied') throw new Error('Authorization cancelled.');
    throw new Error(`Auth error: ${err}`);
  }
  throw new Error('Code expired. Run --login again.');
}

if (doLogin) {
  try {
    await githubLogin();
  } catch (err) {
    console.error(`❌  ${err.message}`);
    process.exit(1);
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Resolve GitHub OAuth token (local cred file → gh CLI fallback)
// ---------------------------------------------------------------------------
function resolveGithubToken() {
  // 1. Local cred file (written by --login)
  if (existsSync(PATHS.githubCred)) {
    try {
      const d = JSON.parse(readFileSync(PATHS.githubCred, 'utf-8'));
      if (d.token) return d.token;
    } catch { /* corrupt */ }
  }

  // 2. gh CLI fallback (works if token has copilot scope via correct OAuth app)
  try {
    const { execSync } = require('child_process');
    const t = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (t) return t;
  } catch { /* gh not available */ }

  return null;
}

// ---------------------------------------------------------------------------
// Copilot token: exchange GitHub OAuth token → short-lived Copilot API token
// ---------------------------------------------------------------------------
async function resolveCopilotToken() {
  // Check cache first
  if (existsSync(PATHS.tokenCache)) {
    try {
      const cached = JSON.parse(readFileSync(PATHS.tokenCache, 'utf-8'));
      if (cached.token && cached.expiresAt && cached.expiresAt - Date.now() > 300_000) {
        return { token: cached.token, baseUrl: deriveBaseUrl(cached.token) };
      }
    } catch { /* re-fetch */ }
  }

  const githubToken = resolveGithubToken();
  if (!githubToken) {
    console.error(`
❌  Not logged in.

   Run this once to authenticate:
     node copilot-eval.mjs --login
`);
    process.exit(1);
  }

  const res = await fetch(TOKEN_EXCHANGE_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${githubToken}`,
      'Editor-Version': EDITOR_VERSION,
      'User-Agent': USER_AGENT,
      'X-Github-Api-Version': GITHUB_API_VERSION,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      console.error(`
❌  GitHub token expired. Re-authenticate:
     node copilot-eval.mjs --login
`);
    } else if (res.status === 403) {
      console.error(`
❌  Your account doesn't have an active Copilot subscription.
   Check: https://github.com/settings/copilot
`);
    } else {
      console.error(`❌  Token exchange failed: HTTP ${res.status}`);
    }
    process.exit(1);
  }

  const data      = await res.json();
  const token     = data.token;
  const expiresAt = typeof data.expires_at === 'number'
    ? (data.expires_at < 1e11 ? data.expires_at * 1000 : data.expires_at)
    : Date.now() + 25 * 60 * 1000;

  try {
    writeFileSync(PATHS.tokenCache, JSON.stringify({ token, expiresAt, updatedAt: Date.now() }), 'utf-8');
  } catch { /* non-fatal */ }

  return { token, baseUrl: deriveBaseUrl(token) };
}

function deriveBaseUrl(token) {
  const proxyEp = token.match(/(?:^|;)\s*proxy-ep=([^;\s]+)/i)?.[1]?.trim();
  if (!proxyEp) return COPILOT_API_BASE;
  const host = proxyEp.replace(/^https?:\/\//i, '').replace(/^proxy\./i, 'api.');
  return `https://${host}`;
}

function apiHeaders(copilotToken) {
  return {
    'Authorization': `Bearer ${copilotToken}`,
    'Content-Type': 'application/json',
    'Editor-Version': EDITOR_VERSION,
    'User-Agent': USER_AGENT,
    'X-Initiator': 'user',
    'Openai-Intent': 'conversation-edits',
  };
}

// ---------------------------------------------------------------------------
// --list-models
// ---------------------------------------------------------------------------
if (listModels) {
  console.log('\n🤖  Fetching available GitHub Copilot models...\n');
  const { token, baseUrl } = await resolveCopilotToken();
  const res = await fetch(`${baseUrl}/models`, { headers: apiHeaders(token) });
  if (!res.ok) {
    console.error(`❌  Failed to fetch models: HTTP ${res.status}`);
    process.exit(1);
  }
  const data   = await res.json();
  const models = (data.data || []).filter(m => m.capabilities?.type === 'chat');
  console.log('Available models — add one to your .env:\n');
  for (const m of models) {
    console.log(`  COPILOT_MODEL=github-copilot/${m.id}`);
  }
  console.log('\nOr pass per-run:  --model github-copilot/<model-id>\n');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Require JD text
// ---------------------------------------------------------------------------
if (!jdText) {
  console.error('❌  No Job Description provided. Run with --help for usage.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Resolve model
// ---------------------------------------------------------------------------
const rawModel = modelArg || process.env.COPILOT_MODEL || '';

if (!rawModel) {
  console.error(`
❌  No model configured.

   Run this to see your options:
     node copilot-eval.mjs --list-models

   Then add to .env:
     COPILOT_MODEL=github-copilot/gpt-4o

   Or pass per-run:
     node copilot-eval.mjs --model github-copilot/gpt-4o "JD text"
`);
  process.exit(1);
}

const modelName = rawModel.replace(/^github-copilot\//i, '');

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------
function readFile(path, label) {
  if (!existsSync(path)) {
    console.warn(`⚠️   ${label} not found at: ${path}`);
    return `[${label} not found — skipping]`;
  }
  return readFileSync(path, 'utf-8').trim();
}

function nextReportNumber() {
  if (!existsSync(PATHS.reports)) return '001';
  const files = readdirSync(PATHS.reports)
    .filter(f => /^\d{3}-/.test(f))
    .map(f => parseInt(f.slice(0, 3)))
    .filter(n => !isNaN(n));
  if (files.length === 0) return '001';
  return String(Math.max(...files) + 1).padStart(3, '0');
}

// ---------------------------------------------------------------------------
// Load context files
// ---------------------------------------------------------------------------
console.log('\n📂  Loading context files...');
const sharedContext = readFile(PATHS.shared, 'modes/_shared.md');
const ofertaLogic   = readFile(PATHS.oferta, 'modes/oferta.md');
const cvContent     = readFile(PATHS.cv,     'cv.md');

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const systemPrompt = `You are career-ops, an AI-powered job search assistant.
You evaluate job offers against the user's CV using a structured A-F scoring system.

Your evaluation methodology is defined below. Follow it exactly.

═══════════════════════════════════════════════════════
SYSTEM CONTEXT (_shared.md)
═══════════════════════════════════════════════════════
${sharedContext}

═══════════════════════════════════════════════════════
EVALUATION MODE (oferta.md)
═══════════════════════════════════════════════════════
${ofertaLogic}

═══════════════════════════════════════════════════════
CANDIDATE RESUME (cv.md)
═══════════════════════════════════════════════════════
${cvContent}

═══════════════════════════════════════════════════════
OPERATING RULES
═══════════════════════════════════════════════════════
1. No WebSearch, Playwright, or file writing tools available.
   - Block D (Comp): use training data estimates, note as estimates.
   - Block G (Legitimacy): analyze JD text only.
2. Generate Blocks A through G in full.
3. End with this exact block:

---SCORE_SUMMARY---
COMPANY: <company name or "Unknown">
ROLE: <role title>
SCORE: <decimal, e.g. 3.8>
ARCHETYPE: <detected archetype>
LEGITIMACY: <High Confidence | Proceed with Caution | Suspicious>
---END_SUMMARY---
`;

// ---------------------------------------------------------------------------
// Call GitHub Copilot API
// ---------------------------------------------------------------------------
console.log(`🤖  Calling GitHub Copilot (${rawModel})... this may take 30-60 seconds.\n`);

const { token: copilotToken, baseUrl } = await resolveCopilotToken();

const res = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: apiHeaders(copilotToken),
  body: JSON.stringify({
    model: modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: `JOB DESCRIPTION TO EVALUATE:\n\n${jdText}` },
    ],
    temperature: 0.4,
    max_tokens: 8192,
    stream: false,
  }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`❌  Copilot API error ${res.status}: ${body}`);
  if (res.status === 404) console.error(`    Model "${rawModel}" not found. Run: node copilot-eval.mjs --list-models`);
  if (res.status === 429) console.error('    Rate limit hit. Wait a moment and retry.');
  process.exit(1);
}

const data = await res.json();
const evaluationText = data.choices?.[0]?.message?.content;

if (!evaluationText) {
  console.error('❌  Empty response from Copilot API.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------
console.log('\n' + '═'.repeat(66));
console.log('  CAREER-OPS EVALUATION — powered by GitHub Copilot');
console.log('═'.repeat(66) + '\n');
console.log(evaluationText);

// ---------------------------------------------------------------------------
// Parse score summary
// ---------------------------------------------------------------------------
const summaryMatch = evaluationText.match(/---SCORE_SUMMARY---\s*([\s\S]*?)---END_SUMMARY---/);
let company = 'unknown', role = 'unknown', score = '?', archetype = 'unknown', legitimacy = 'unknown';
if (summaryMatch) {
  const extract = (key) => summaryMatch[1].match(new RegExp(`${key}:\\s*(.+)`))?.[1]?.trim() ?? 'unknown';
  company    = extract('COMPANY');
  role       = extract('ROLE');
  score      = extract('SCORE');
  archetype  = extract('ARCHETYPE');
  legitimacy = extract('LEGITIMACY');
}

// ---------------------------------------------------------------------------
// Save report
// ---------------------------------------------------------------------------
if (saveReport) {
  try {
    if (!existsSync(PATHS.reports)) mkdirSync(PATHS.reports, { recursive: true });
    const num         = nextReportNumber();
    const today       = new Date().toISOString().split('T')[0];
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename    = `${num}-${companySlug}-${today}.md`;
    writeFileSync(
      join(PATHS.reports, filename),
      `# Evaluation: ${company} — ${role}\n\n**Date:** ${today}\n**Archetype:** ${archetype}\n**Score:** ${score}/5\n**Legitimacy:** ${legitimacy}\n**PDF:** pending\n**Tool:** GitHub Copilot (${rawModel})\n\n---\n\n${evaluationText.replace(/---SCORE_SUMMARY---[\s\S]*?---END_SUMMARY---/, '').trim()}\n`,
      'utf-8'
    );
    console.log(`\n✅  Report saved: reports/${filename}`);
    console.log(`\n📊  Tracker entry (add to data/applications.md):`);
    console.log(`    | ${num} | ${today} | ${company} | ${role} | ${score} | Evaluada | ❌ | [${num}](reports/${filename}) |`);
  } catch (err) {
    console.warn(`⚠️   Could not save report: ${err.message}`);
  }
}

console.log('\n' + '─'.repeat(66));
console.log(`  Score: ${score}/5  |  Archetype: ${archetype}  |  Legitimacy: ${legitimacy}`);
console.log(`  Model: ${rawModel}`);
console.log('─'.repeat(66) + '\n');
