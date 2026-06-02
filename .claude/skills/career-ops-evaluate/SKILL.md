---
name: career-ops-evaluate
description: Full A–G scoring evaluation of a single job offer. Produces a scored report and registers it in the tracker. Use when asked to evaluate a job offer, score a role, or analyze a job description.
---

# career-ops-evaluate — Evaluate a Job Offer

Full A–G scoring evaluation of a single job offer. Produces a scored report and registers in the tracker.

## Instructions

Job description or URL to evaluate: {{arguments}}

Load context:
- Read `modes/_shared.md`
- Read `modes/oferta.md`
- Read `cv.md`
- Read `modes/_profile.md` (if exists)
- Read `article-digest.md` (if exists)

Then execute the full A–G evaluation as defined in `modes/oferta.md`.

## Resume Content Rule

If this evaluation leads to PDF generation (score ≥ 4.0), apply the Brazilian experience rule from `modes/_profile.md`:
- **Exclude by default:** Mato Grosso State Supreme Court, Allen Informática
- **Include only if JD explicitly mentions:** BI, ETL, data warehouse, judicial, Brazil, SQL Server

After evaluation:
1. Save report to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`
2. Write TSV entry to `batch/tracker-additions/`
3. Run `node merge-tracker.mjs`
