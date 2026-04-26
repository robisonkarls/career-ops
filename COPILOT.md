# Career-Ops — AI Job Search Pipeline (GitHub Copilot CLI)

> This file is auto-loaded by GitHub Copilot CLI as primary workspace context.
> It is the Copilot CLI equivalent of CLAUDE.md and GEMINI.md.

## What is career-ops

AI-powered job search automation: pipeline tracking, offer evaluation, CV generation, portal scanning, batch processing. Originally built on Claude Code, now fully supported on Gemini CLI, OpenCode, and GitHub Copilot.

## Data Contract (CRITICAL)

**User Layer (NEVER auto-updated — your personalizations live here):**
- `cv.md`, `config/profile.yml`, `modes/_profile.md`, `article-digest.md`, `portals.yml`
- `data/*`, `reports/*`, `output/*`, `interview-prep/*`

**System Layer (auto-updatable — do NOT put user data here):**
- `modes/_shared.md`, all mode files, `CLAUDE.md`, `GEMINI.md`, `*.mjs` scripts, `templates/*`, `batch/*`

**THE RULE:** Customizations always go to `modes/_profile.md` or `config/profile.yml`. Never to `modes/_shared.md`.

## Update Check

On the first message of each session, run silently:

```bash
node update-system.mjs check
```

- `{"status": "update-available", ...}` → notify user, ask to apply
- `{"status": "up-to-date"}` or `"dismissed"` or `"offline"` → say nothing

## First Run — Onboarding

Check silently at session start:
1. Does `cv.md` exist?
2. Does `config/profile.yml` exist (not just `profile.example.yml`)?
3. Does `modes/_profile.md` exist (not just `_profile.template.md`)?

If `modes/_profile.md` is missing → copy from `modes/_profile.template.md` silently.
If ANY is missing → enter onboarding mode and guide the user through setup.

## How to Use career-ops in Copilot CLI

Copilot CLI does not support custom slash commands yet. Just describe what you want naturally:

| What to say | What happens |
|-------------|--------------|
| Paste a JD URL or text | Full auto-pipeline: evaluate + report + PDF + tracker |
| "evaluate this offer" + JD | Single offer evaluation A–F |
| "compare these offers" | Side-by-side ranking |
| "find contacts at [company]" | LinkedIn outreach draft |
| "research [company]" | Deep company research |
| "generate my CV for this role" | ATS-optimized PDF |
| "show my pipeline" | Application tracker overview |
| "scan for new jobs" | Portal scanner |
| "check for follow-ups" | Follow-up cadence |
| "prep me for this interview" | Interview prep + STAR stories |
| "evaluate this course/cert" | Training vs North Star |
| "evaluate this project idea" | Portfolio project assessment |

## Mode Routing (for the AI)

| Input | Mode file to load |
|-------|-------------------|
| JD text or URL | `modes/_shared.md` + `modes/_profile.md` + `modes/oferta.md` + `cv.md` |
| Compare offers | `modes/_shared.md` + `modes/_profile.md` + `modes/ofertas.md` |
| LinkedIn outreach | `modes/_shared.md` + `modes/_profile.md` + `modes/contacto.md` |
| Company research | `modes/deep.md` |
| Generate CV/PDF | `modes/_shared.md` + `modes/_profile.md` + `modes/pdf.md` + `cv.md` |
| Tracker overview | `modes/tracker.md` |
| Portal scan | `modes/_shared.md` + `modes/_profile.md` + `modes/scan.md` |
| Batch processing | `modes/_shared.md` + `modes/_profile.md` + `modes/batch.md` |
| Rejection patterns | `modes/patterns.md` |
| Follow-up cadence | `modes/followup.md` |
| Interview prep | `modes/interview-prep.md` |
| Training eval | `modes/training.md` |
| Project eval | `modes/project.md` |
| Pipeline inbox | `modes/_shared.md` + `modes/_profile.md` + `modes/pipeline.md` |
| Application assist | `modes/_shared.md` + `modes/_profile.md` + `modes/apply.md` + `cv.md` |

## Main Files

| File | Function |
|------|----------|
| `cv.md` | Candidate resume — source of truth for all evaluations |
| `config/profile.yml` | North Star, comp targets, location, archetypes |
| `modes/_profile.md` | User customizations for scoring and narrative |
| `data/applications.md` | Application tracker |
| `data/pipeline.md` | Inbox of pending JD URLs |
| `portals.yml` | Job portal + company config |
| `templates/cv-template.html` | HTML template for PDF CVs |
| `generate-pdf.mjs` | Playwright: HTML to PDF |
| `copilot-eval.mjs` | Standalone Copilot API evaluator (no CLI required) |

## Safety Rules

- **NEVER submit an application without the user's explicit approval.**
- Always show the full draft before sending anything.
- Tracker updates and report generation are safe to write automatically.
- `trash` > `rm` for deletions.
- If a task fails 3 times, stop and report.
- Strongly discourage applications scoring below 4.0/5.
