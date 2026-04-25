#!/usr/bin/env node
/**
 * copilot-eval.mjs — GitHub Copilot-powered Job Offer Evaluator for career-ops
 *
 * Uses the GitHub Copilot API (OpenAI-compatible) to evaluate job offers.
 * Reads evaluation logic from modes/oferta.md + modes/_shared.md,
 * reads the user's resume from cv.md, and evaluates a Job Description
 * passed as a command-line argument.
 *
 * Usage:
 *   node copilot-eval.mjs "Paste full JD text here"
 *   node copilot-eval.mjs --file ./jds/my-job.txt
 *   node copilot-eval.mjs --model gpt-4o "Paste full JD text here"
 *   node copilot-eval.mjs --list-models
 *
 * Requires:
 *   GitHub CLI (gh) logged in to an account with an active Copilot subscription.
 *   OR: GITHUB_TOKEN in .env set to an OAuth token (gho_... or ghu_..., NOT a classic PAT ghp_...).
 *
 * Setup (recommended):
 *   brew install gh      # macOS
 *   gh auth login        # follow browser prompt
 *   node copilot-eval.mjs --list-models
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Bootstrap: load .env before anything else
// ---------------------------------------------------------------------------
try {
  const { config } = await import('dotenv');
  config();
} catch {
  // dotenv optional — fall back to process.env
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT = dirname(fileURLToPath(import.meta.url));

const PATHS = {
  shared:  join(ROOT, 'modes', '_shared.md'),
  oferta:  join(ROOT, 'modes', 'oferta.md'),
  cv:      join(ROOT, 'cv.md'),
  reports: join(ROOT, 'reports'),
  tracker: join(ROOT, 'data', 'applications.md'),
};

// ---------------------------------------------------------------------------
// GitHub Copilot API config
// ---------------------------------------------------------------------------
const COPILOT_TOKEN_URL      = 'https://api.github.com/copilot_internal/v2/token';
const COPILOT_API_BASE       = 'https://api.individual.githubcopilot.com';
const DEFAULT_MODEL          = process.env.COPILOT_MODEL || 'gpt-4o';
const COPILOT_EDITOR_VERSION = 'vscode/1.96.2';
const COPILOT_USER_AGENT     = 'GitHubCopilotChat/0.26.7';
const COPILOT_API_VERSION    = '2025-04-01';

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
    node copilot-eval.mjs "<JD text>"
    node copilot-eval.mjs --file ./jds/my-job.txt
    node copilot-eval.mjs --model gpt-4o-mini "<JD text>"
    node copilot-eval.mjs --list-models

  OPTIONS
    --file <path>     Read JD from a file instead of inline text
    --model <name>    Copilot model to use (default: gpt-4o)
    --list-models     List all models available on your Copilot subscription
    --no-save         Do not save report to reports/ directory
    --help            Show this help

  SETUP
    1. Go to https://github.com/settings/tokens
    2. Generate a new token (classic) — no special scopes needed
    3. Add GITHUB_TOKEN=<your-token> to .env
    4. Run: npm install   (installs dotenv)

  EXAMPLES
    node copilot-eval.mjs "We are looking for a Senior AI Engineer..."
    node copilot-eval.mjs --file ./jds/openai-swe.txt
    node copilot-eval.mjs --model gpt-4o-mini --file ./jds/openai-swe.txt
    node copilot-eval.mjs --list-models
`);
  process.exit(0);
}

// Parse flags
let jdText    = '';
let modelName = DEFAULT_MODEL;
let saveReport = true;
let listModels = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) {
    const filePath = args[++i];
    if (!existsSync(filePath)) {
      console.error(`❌  File not found: ${filePath}`);
      process.exit(1);
    }
    jdText = readFileSync(filePath, 'utf-8').trim();
  } else if (args[i] === '--model' && args[i + 1]) {
    modelName = args[++i];
  } else if (args[i] === '--no-save') {
    saveReport = false;
  } else if (args[i] === '--list-models') {
    listModels = true;
  } else if (!args[i].startsWith('--')) {
    jdText += (jdText ? '\n' : '') + args[i];
  }
}

// ---------------------------------------------------------------------------
// Resolve GitHub token (OAuth via gh CLI preferred, env fallback)
// ---------------------------------------------------------------------------
async function resolveGithubToken() {
  // 1. Try GITHUB_TOKEN env / .env (must be an OAuth token, not a classic PAT)
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  // 2. Try gh CLI — this always produces the right OAuth token
  try {
    const { execSync } = await import('child_process');
    const token = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe','pipe','pipe'] }).trim();
    if (token) return token;
  } catch {
    // gh not installed or not logged in
  }

  return null;
}

const githubToken = await resolveGithubToken();
if (!githubToken) {
  console.error(`
❌  No GitHub OAuth token found.

   Copilot's API requires an OAuth token — classic PATs are NOT supported.

   Option 1 (recommended): use the gh CLI
     brew install gh          # macOS
     gh auth login            # follow the browser prompt
     node copilot-eval.mjs    # token is picked up automatically

   Option 2: set GITHUB_TOKEN in .env with an OAuth token
     (OAuth tokens start with gho_ or ghu_, not ghp_)

   Your account must have an active GitHub Copilot subscription.
`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Token resolution: OpenClaw cache → token exchange → error
// ---------------------------------------------------------------------------
async function resolveCopilotToken(githubToken) {
  const { join } = await import('path');
  const { homedir } = await import('os');

  // 1. Use OpenClaw's cached Copilot token if valid (works on all plans incl. individual)
  const cachePaths = [
    join(homedir(), '.openclaw', 'credentials', 'github-copilot.token.json'),
    join(homedir(), '.openclaw', 'state', 'credentials', 'github-copilot.token.json'),
  ];
  for (const cachePath of cachePaths) {
    if (existsSync(cachePath)) {
      try {
        const cached = JSON.parse(readFileSync(cachePath, 'utf-8'));
        if (cached.token && cached.expiresAt && cached.expiresAt - Date.now() > 300_000) {
          const proxyEp = cached.token.match(/(?:^|;)\s*proxy-ep=([^;\s]+)/i)?.[1]?.trim();
          const baseUrl = proxyEp
            ? `https://${proxyEp.replace(/^https?:\/\//i, '').replace(/^proxy\./i, 'api.')}`
            : COPILOT_API_BASE;
          return { token: cached.token, baseUrl };
        }
      } catch { /* corrupt cache, skip */ }
    }
  }

  // 2. Exchange GitHub OAuth token (requires 'copilot' scope on the token)
  const res = await fetch(COPILOT_TOKEN_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${githubToken}`,
      'Editor-Version': COPILOT_EDITOR_VERSION,
      'User-Agent': COPILOT_USER_AGENT,
      'X-Github-Api-Version': COPILOT_API_VERSION,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) throw new Error(`GitHub token invalid or expired (${res.status})`);
    throw new Error(
      `Copilot token exchange failed: HTTP ${res.status}\n` +
      `   If you're on the Individual plan, make sure OpenClaw is logged in:\n` +
      `   openclaw login github-copilot`
    );
  }
  const data = await res.json();
  const token = data.token;
  const proxyEp = token.match(/(?:^|;)\s*proxy-ep=([^;\s]+)/i)?.[1]?.trim();
  const baseUrl = proxyEp
    ? `https://${proxyEp.replace(/^https?:\/\//i, '').replace(/^proxy\./i, 'api.')}`
    : COPILOT_API_BASE;
  return { token, baseUrl };
}

function copilotHeaders(copilotToken, extra = {}) {
  return {
    'Authorization': `Bearer ${copilotToken}`,
    'Content-Type': 'application/json',
    'Editor-Version': COPILOT_EDITOR_VERSION,
    'User-Agent': COPILOT_USER_AGENT,
    'X-Initiator': 'user',
    'Openai-Intent': 'conversation-edits',
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// List models (--list-models flag)
// ---------------------------------------------------------------------------
if (listModels) {
  console.log('\n🤖  Fetching available GitHub Copilot models...\n');
  try {
    const { token, baseUrl } = await resolveCopilotToken(githubToken);
    const res = await fetch(`${baseUrl}/models`, { headers: copilotHeaders(token) });
    if (!res.ok) {
      const body = await res.text();
      console.error(`❌  API error ${res.status}: ${body}`);
      process.exit(1);
    }
    const data = await res.json();
    const models = (data.data || data.models || data || []).filter(m => m.capabilities?.type === 'chat' || !m.capabilities);
    console.log('Available models on your Copilot subscription:\n');
    for (const m of models) {
      const id = m.id || m.name || JSON.stringify(m);
      const cap = m.capabilities?.type ? ` [${m.capabilities.type}]` : '';
      console.log(`  • ${id}${cap}`);
    }
    console.log(`\nSet default in .env:  COPILOT_MODEL=<model-id>`);
    console.log(`Or pass per-run:      --model <model-id>\n`);
  } catch (err) {
    console.error('\u274c ', err.message);
    process.exit(1);
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Require JD text for evaluation
// ---------------------------------------------------------------------------
if (!jdText) {
  console.error('❌  No Job Description provided. Run with --help for usage.');
  process.exit(1);
}

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
// Build the system prompt (mirrors gemini-eval.mjs logic)
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
IMPORTANT OPERATING RULES FOR THIS CLI SESSION
═══════════════════════════════════════════════════════
1. You do NOT have access to WebSearch, Playwright, or file writing tools.
   - For Block D (Comp research): provide salary estimates based on your training data, clearly noted as estimates.
   - For Block G (Legitimacy): analyze the JD text only; skip URL/page freshness checks.
   - Post-evaluation file saving is handled by the script, not by you.
2. Generate Blocks A through G in full, in English, unless the JD is in another language.
3. At the very end, output a machine-readable summary block in this exact format:

---SCORE_SUMMARY---
COMPANY: <company name or "Unknown">
ROLE: <role title>
SCORE: <global score as decimal, e.g. 3.8>
ARCHETYPE: <detected archetype>
LEGITIMACY: <High Confidence | Proceed with Caution | Suspicious>
---END_SUMMARY---
`;

// ---------------------------------------------------------------------------
// Call GitHub Copilot API
// ---------------------------------------------------------------------------
console.log(`🤖  Calling GitHub Copilot (${modelName})... this may take 30-60 seconds.\n`);

let evaluationText;
try {
  // Step 1: exchange GitHub OAuth token for short-lived Copilot API token
  const { token: copilotToken, baseUrl } = await resolveCopilotToken(githubToken);

  // Step 2: call chat completions
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: copilotHeaders(copilotToken),
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
    if (res.status === 404) {
      console.error(`    Model "${modelName}" not found on your subscription.`);
      console.error('    Run: node copilot-eval.mjs --list-models');
    } else if (res.status === 429) {
      console.error('    Rate limit hit. Wait a moment and retry.');
    }
    process.exit(1);
  }

  const data = await res.json();
  evaluationText = data.choices?.[0]?.message?.content;

  if (!evaluationText) {
    console.error('❌  Empty response from Copilot API.');
    console.error('    Raw response:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
} catch (err) {
  console.error('❌ ', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Display evaluation
// ---------------------------------------------------------------------------
console.log('\n' + '═'.repeat(66));
console.log('  CAREER-OPS EVALUATION — powered by GitHub Copilot');
console.log('═'.repeat(66) + '\n');
console.log(evaluationText);

// ---------------------------------------------------------------------------
// Parse score summary
// ---------------------------------------------------------------------------
const summaryMatch = evaluationText.match(
  /---SCORE_SUMMARY---\s*([\s\S]*?)---END_SUMMARY---/
);

let company    = 'unknown';
let role       = 'unknown';
let score      = '?';
let archetype  = 'unknown';
let legitimacy = 'unknown';

if (summaryMatch) {
  const block = summaryMatch[1];
  const extract = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : 'unknown';
  };
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
    if (!existsSync(PATHS.reports)) {
      mkdirSync(PATHS.reports, { recursive: true });
    }

    const num         = nextReportNumber();
    const today       = new Date().toISOString().split('T')[0];
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename    = `${num}-${companySlug}-${today}.md`;
    const reportPath  = join(PATHS.reports, filename);

    const reportContent = `# Evaluation: ${company} — ${role}

**Date:** ${today}
**Archetype:** ${archetype}
**Score:** ${score}/5
**Legitimacy:** ${legitimacy}
**PDF:** pending
**Tool:** GitHub Copilot (${modelName})

---

${evaluationText.replace(/---SCORE_SUMMARY---[\s\S]*?---END_SUMMARY---/, '').trim()}
`;

    writeFileSync(reportPath, reportContent, 'utf-8');
    console.log(`\n✅  Report saved: reports/${filename}`);

    console.log(`\n📊  Tracker entry (add to data/applications.md):`);
    console.log(`    | ${num} | ${today} | ${company} | ${role} | ${score} | Evaluada | ❌ | [${num}](reports/${filename}) |`);
  } catch (err) {
    console.warn(`⚠️   Could not save report: ${err.message}`);
  }
}

console.log('\n' + '─'.repeat(66));
console.log(`  Score: ${score}/5  |  Archetype: ${archetype}  |  Legitimacy: ${legitimacy}`);
console.log(`  Model: ${modelName}  |  Provider: GitHub Copilot`);
console.log('─'.repeat(66) + '\n');
