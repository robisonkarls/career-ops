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
 *   GITHUB_TOKEN in .env (or environment variable)
 *   Token must belong to an account with an active GitHub Copilot subscription.
 *
 * How to get your token:
 *   1. Go to https://github.com/settings/tokens
 *   2. Generate a new token (classic) — no special scopes needed
 *   3. Add GITHUB_TOKEN=<your-token> to .env
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
const COPILOT_API_BASE    = 'https://api.githubcopilot.com';
const COPILOT_MODELS_URL  = `${COPILOT_API_BASE}/models`;
const COPILOT_CHAT_URL    = `${COPILOT_API_BASE}/chat/completions`;
const DEFAULT_MODEL       = process.env.COPILOT_MODEL || 'gpt-4o';
const COPILOT_API_VERSION = '2023-07-07';

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
// Validate environment
// ---------------------------------------------------------------------------
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error(`
❌  GITHUB_TOKEN not found.

   1. Go to https://github.com/settings/tokens
   2. Generate a new token (classic) — no special scopes needed
   3. Add it to .env:   GITHUB_TOKEN=your_token_here
   4. Or export it:     export GITHUB_TOKEN=your_token_here

   Note: Your GitHub account must have an active Copilot subscription.
`);
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${githubToken}`,
  'Content-Type': 'application/json',
  'Copilot-Integration-Id': 'vscode-chat',
  'editor-version': 'vscode/1.85.0',
  'editor-plugin-version': 'copilot-chat/0.12.0',
};

// ---------------------------------------------------------------------------
// List models (--list-models flag)
// ---------------------------------------------------------------------------
if (listModels) {
  console.log('\n🤖  Fetching available GitHub Copilot models...\n');
  try {
    const res = await fetch(COPILOT_MODELS_URL, { headers });
    if (!res.ok) {
      const body = await res.text();
      console.error(`❌  API error ${res.status}: ${body}`);
      if (res.status === 401) {
        console.error('    Your GITHUB_TOKEN is invalid or expired.');
      } else if (res.status === 403) {
        console.error('    Your account does not have an active GitHub Copilot subscription.');
      }
      process.exit(1);
    }
    const data = await res.json();
    const models = data.data || data.models || data || [];
    console.log('Available models on your Copilot subscription:\n');
    for (const m of models) {
      const id = m.id || m.name || JSON.stringify(m);
      const version = m.version ? ` (v${m.version})` : '';
      const capabilities = m.capabilities?.type ? ` [${m.capabilities.type}]` : '';
      console.log(`  • ${id}${version}${capabilities}`);
    }
    console.log(`\nSet default in .env:  COPILOT_MODEL=<model-id>`);
    console.log(`Or pass per-run:      --model <model-id>\n`);
  } catch (err) {
    console.error('❌  Network error:', err.message);
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
  const res = await fetch(COPILOT_CHAT_URL, {
    method: 'POST',
    headers,
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
    if (res.status === 401) {
      console.error('    Your GITHUB_TOKEN is invalid or expired.');
      console.error('    Regenerate at: https://github.com/settings/tokens');
    } else if (res.status === 403) {
      console.error('    Your account does not have an active GitHub Copilot subscription.');
      console.error('    Check: https://github.com/settings/copilot');
    } else if (res.status === 404) {
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
  console.error('❌  Network error:', err.message);
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
