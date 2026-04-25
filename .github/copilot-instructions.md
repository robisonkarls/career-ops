# Career-Ops — GitHub Copilot Instructions

> This file is auto-loaded by GitHub Copilot as persistent workspace context.
> It is the Copilot equivalent of CLAUDE.md and GEMINI.md.

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
4. Does `portals.yml` exist?

If `modes/_profile.md` is missing → copy from `modes/_profile.template.md` silently.
If ANY is missing → enter onboarding mode (see CLAUDE.md for full script).

## Mode Routing

| Input | Mode |
|-------|------|
| (empty / no args) | `discovery` — show command menu |
| JD text or URL | `auto-pipeline` |
| `oferta` | single offer evaluation A–F |
| `ofertas` | compare multiple offers |
| `contacto` | LinkedIn outreach |
| `deep` | company research |
| `pdf` | generate CV PDF |
| `training` | evaluate course/cert |
| `project` | evaluate portfolio project |
| `tracker` | application status overview |
| `pipeline` | process URLs from data/pipeline.md |
| `apply` | live application assistant |
| `scan` | scan portals for new offers |
| `batch` | parallel batch processing |
| `patterns` | analyze rejection patterns |
| `followup` | follow-up cadence tracker |
| `interview-prep` | interview prep for a role |

**Auto-pipeline detection:** If input contains JD keywords ("responsibilities", "requirements", "qualifications", "about the role", "we're looking for") or a URL → run `auto-pipeline`.

## Context Loading by Mode

**Full context** (`modes/_shared.md` + `modes/_profile.md` + mode file):
→ `auto-pipeline`, `oferta`, `ofertas`, `pdf`, `contacto`, `apply`, `pipeline`, `scan`, `batch`

**Standalone** (mode file only):
→ `tracker`, `deep`, `training`, `project`, `patterns`, `followup`, `interview-prep`

**Also load `cv.md` for:** `auto-pipeline`, `pdf`, `apply`

## Discovery Menu

```
🎯 career-ops — Command Center

  @career-ops {JD or URL}   → AUTO-PIPELINE: evaluate + report + PDF + tracker
  @career-ops pipeline       → Process pending URLs from inbox (data/pipeline.md)
  @career-ops oferta         → Evaluate a single offer A–F
  @career-ops ofertas        → Compare and rank multiple offers
  @career-ops contacto       → LinkedIn power move: find contacts + draft message
  @career-ops deep           → Deep research on a company
  @career-ops pdf            → Generate ATS-optimized CV PDF
  @career-ops training       → Evaluate course/cert vs your North Star
  @career-ops project        → Evaluate a portfolio project idea
  @career-ops tracker        → Application status overview
  @career-ops apply          → Live application assistant
  @career-ops scan           → Scan portals for new offers
  @career-ops batch          → Parallel batch processing
  @career-ops patterns       → Analyze rejection patterns
  @career-ops followup       → Follow-up cadence tracker
  @career-ops interview-prep → Interview prep for a specific role

Tip: Paste a JD directly → full auto-pipeline.
```

## Safety Rules

- **NEVER submit an application without the user's explicit approval.**
- Always show the full draft before sending anything.
- Tracker updates and report generation are safe to write automatically.
- `trash` > `rm` for deletions.
- If a task fails 3 times, stop and report.
