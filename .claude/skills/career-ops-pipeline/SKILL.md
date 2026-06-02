---
name: career-ops-pipeline
description: Processes pending job URLs from the pipeline inbox. Evaluates each offer and updates the tracker. Use when asked to process the pipeline, evaluate pending jobs, or work through the URL inbox.
---

# career-ops-pipeline — Process Job Pipeline Inbox

Process pending job URLs from `data/pipeline.md`. Evaluate each offer and update the tracker.

## Instructions

Load context:
- Read `modes/_shared.md`
- Read `modes/pipeline.md`
- Read `cv.md`
- Read `modes/_profile.md` (if exists)
- Read `data/pipeline.md`

Then execute pipeline mode as defined in `modes/pipeline.md`.

## Resume Content Rule

When generating PDFs for evaluated offers, apply the Brazilian experience rule from `modes/_profile.md`:
- **Exclude by default:** Mato Grosso State Supreme Court, Allen Informática
- **Include only if JD explicitly mentions:** BI, ETL, data warehouse, judicial, Brazil, SQL Server

Process each pending URL (`- [ ]` items) in `data/pipeline.md`:
1. Evaluate the offer using the A–G scoring system
2. Save the report to `reports/`
3. Write a TSV entry to `batch/tracker-additions/`
4. Mark the URL as processed (`- [x]`) in `data/pipeline.md`

After processing, run `node merge-tracker.mjs` to merge tracker additions.

Additional arguments (if any): {{arguments}}
