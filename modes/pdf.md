# Mode: pdf — ATS-Optimized PDF Generation

## Core Rules (non-negotiable)

1. **Source of truth:** `cv.md` only — every fact, date, title, metric, and technology name must come from cv.md
2. **Job order:** cv.md sequence is authoritative — Dayforce → TrillaBit → Avanade → TripStack → Fleet Complete
3. **Brazilian roles:** Exclude by default (Mato Grosso State Supreme Court, Allen Informática) — include only if JD explicitly mentions BI, ETL, data warehouse, judicial, Brazil, or SQL Server
4. **Bullet count:** Up to 6–8 bullets per job — select highest JD match; fewer is fine if source material is limited
5. **Enrichment contract:** Rewrite bullets using JD vocabulary — same facts, better framing. Only swap/add wording if the underlying fact exists in cv.md. No new metrics, no new architecture terms, no new outcomes unless already in cv.md.
6. **Never invent:** Every noun, metric, architecture term, and outcome in the final resume must be traceable to a specific line in cv.md

---

## Pipeline

### Step 1 — Extract JD requirements
- Pull 15–20 keywords (tools, patterns, domains, seniority signals)
- Note the exact technical vocabulary the JD uses (e.g., "observability" vs "monitoring", "event streaming" vs "Kafka")
- Identify top 3 must-haves (what the role cannot succeed without)

### Step 2 — Filter experience (Brazilian rule)
- Scan JD for inclusion keywords: BI, ETL, data warehouse, judicial, Brazil, SQL Server, business intelligence
- If found: include all jobs; if not: exclude Mato Grosso State Supreme Court and Allen Informática
- Primary set: Dayforce, TrillaBit, Avanade, TripStack, Fleet Complete

### Step 3 — Bullet selection and enrichment (per job, cv.md order)

For each included job:
1. Read all bullets from cv.md for that job
2. Score each bullet against JD keywords:
   - **3** — direct stack/tech match (exact tool or protocol named in JD)
   - **2** — responsibility match (same domain, similar pattern)
   - **1** — tangential match (related area, transferable concept)
   - **0** — no overlap
3. Select top 6–8 bullets by score (highest score first within each job)
4. Enrich each selected bullet — rewrite using JD vocabulary while preserving every fact:
   - Replace generic terms with the JD's specific vocabulary
   - Lead with the outcome/impact if it exists in cv.md (don't bury it)
   - Add technical precision using only terms already present in cv.md
   - Self-check: can every noun, metric, and outcome be traced back to the source line? If not, remove it.

**Enrichment examples (safe — all facts from cv.md):**

| cv.md original | JD vocabulary | Enriched (all facts preserved) |
|----------------|--------------|--------------------------------|
| "Implemented Kafka for messaging" | "event streaming", "async" | "Implemented Kafka for asynchronous event streaming between services" |
| "Led migration to Kubernetes" | "container orchestration", "cloud-native" | "Led Kubernetes container orchestration migration for cloud-native, zero-downtime deployments" |
| "Built SDD workflow using GitHub Copilot and Claude Code" | "LLM orchestration", "agentic AI" | "Architected agentic AI development workflow using GitHub Copilot and Claude Code MCP integrations for LLM-orchestrated spec generation and automated PR review" |
| "Increased service reliability from 98% to 99.5%" | "SLA", "fault tolerance" | "Improved service SLA from 98% to 99.5% through redundancy, circuit breakers, and expanded monitoring" |

### Step 4 — Professional Summary
- 3–4 lines, dense with the top 5 JD keywords
- Use exact seniority/title framing from cv.md (never upgrade title)
- Lead with the strongest JD match from your experience
- No clichés ("passionate", "results-driven", "proven track record")

### Step 5 — Core Competencies (8–10 tags)
- Extract from cv.md skills section + JD requirements
- Only include skills you have real hands-on experience with

### Step 6 — Generate HTML
- Use `templates/cv-template.html`, replace all `{{...}}` placeholders
- Page format: `8.5in` letter (US/CA), `210mm` A4 (rest)
- Include: Summary, Competencies, Experience, Projects (top 2 from cv.md most relevant to JD), Skills
- Omit: Education, Certifications (not in cv.md)
- Output: `/tmp/cv-robison-karls-{company-slug}-{YYYY-MM-DD}.html`

### Step 7 — Convert to PDF
```bash
node generate-pdf.mjs /tmp/cv-robison-karls-{company-slug}-{date}.html output/cv-robison-karls-{company-slug}-{date}.pdf --format=letter
```

### Step 8 — Report
- PDF path + file size
- Which roles were filtered (Brazilian exclusion note)
- 2–3 key enrichment choices made (what was reframed and why)

---

## Design standards

- Single-column layout, ATS-safe (no sidebars, no tables, selectable text)
- Fonts: Space Grotesk (headings, 600–700) + DM Sans (body, 400)
- Header: name 24px bold + 2px gradient line (`hsl(187,74%,32%) → hsl(270,70%,45%)`) + contact row
- Section headers: uppercase, letter-spacing 0.05em, cyan primary color
- Company names: accent purple `hsl(270,70%,45%)`
- Body: 11px, line-height 1.5, margins 0.6in
- Target file size: 60–90 KB

---

## Canva CV (optional)

If `config/profile.yml` has `cv.canva_resume_design_id` set:
1. `export-design` the base design as PDF → get download URL
2. `import-design-from-url` → creates duplicate editable design
3. Apply enriched content via `find_and_replace_text` (character budget: ±15% of original)
4. Reflow layout: adjust element positions after text replacement to maintain even spacing
5. `get-design-thumbnail` → verify layout, fix overlaps, get user approval
6. `commit-editing-transaction` → `export-design` → `curl -sL -o output/...` (download immediately — URL expires)
If `import-design-from-url` fails, fall back to HTML/PDF pipeline.

---

## Post-generation

Update tracker: PDF column ❌ → ✅ for the matching company+role entry.
