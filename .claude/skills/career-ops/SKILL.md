---
name: career-ops
description: Main career-ops job search router. Shows the command menu or routes to the appropriate mode. Use for any job search task — evaluating offers, generating CVs, tracking applications, scanning portals, and more.
---

# career-ops — Router

## Mode Routing

Determine the mode from `{{mode}}`:

| Input | Mode |
|-------|------|
| (empty / no args) | `discovery` -- Show command menu |
| JD text or URL (no sub-command) | **`auto-pipeline`** |
| `oferta` | `oferta` |
| `ofertas` | `ofertas` |
| `contacto` | `contacto` |
| `deep` | `deep` |
| `pdf` | `pdf` |
| `training` | `training` |
| `project` | `project` |
| `tracker` | `tracker` |
| `pipeline` | `pipeline` |
| `apply` | `apply` |
| `scan` | `scan` |
| `batch` | `batch` |
| `patterns` | `patterns` |
| `followup` | `followup` |

**Auto-pipeline detection:** If `{{mode}}` is not a known sub-command AND contains JD text (keywords: "responsibilities", "requirements", "qualifications", "about the role", "we're looking for", company name + role) or a URL to a JD, execute `auto-pipeline`.

If `{{mode}}` is not a sub-command AND doesn't look like a JD, show discovery.

---

## Discovery Mode (no arguments)

Show this menu:

```
career-ops -- Command Center

Available commands:
  /career-ops {JD}           → AUTO-PIPELINE: evaluate + report + PDF + tracker
  /career-ops-pipeline       → Process pending URLs from inbox (data/pipeline.md)
  /career-ops-evaluate       → Evaluation only A-G (no auto PDF)
  /career-ops-compare        → Compare and rank multiple offers
  /career-ops-contact        → LinkedIn outreach: find contacts + draft message
  /career-ops-deep           → Deep research about a company
  /career-ops-pdf            → Generate ATS-optimized CV PDF
  /career-ops-training       → Evaluate course/cert against North Star
  /career-ops-project        → Evaluate a portfolio project idea
  /career-ops-tracker        → Application status overview
  /career-ops-apply          → Live application assistant
  /career-ops-scan           → Scan portals and discover new offers
  /career-ops-batch          → Batch processing with parallel workers
  /career-ops-patterns       → Analyze rejection patterns
  /career-ops-followup       → Follow-up cadence tracker

Inbox: add URLs to data/pipeline.md → /career-ops-pipeline
Or paste a JD directly to run the full pipeline.
```

---

## Context Loading by Mode

After determining the mode, load the necessary files before executing:

### Modes that require `_shared.md` + their mode file:
Read `modes/_shared.md` + `modes/{mode}.md`

Applies to: `auto-pipeline`, `oferta`, `ofertas`, `pdf`, `contacto`, `apply`, `pipeline`, `scan`, `batch`

### Standalone modes (only their mode file):
Read `modes/{mode}.md`

Applies to: `tracker`, `deep`, `training`, `project`, `patterns`, `followup`

### Also load `cv.md` for:
`auto-pipeline`, `pdf`, `apply`, `oferta`, `ofertas`, `contacto`

### Always load if exists:
`modes/_profile.md` for all modes that use `_shared.md`

Execute the instructions from the loaded mode file.
