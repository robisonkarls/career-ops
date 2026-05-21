---
name: career-ops-batch
description: Batch process multiple job offers in parallel for maximum throughput. Use when asked to batch evaluate, process multiple offers at once, or run the batch pipeline.
---

# career-ops-batch — Batch Process Job Offers

Batch evaluate multiple job offers using parallel worker agents for maximum throughput.

## Instructions

Load context:
- Read `modes/_shared.md`
- Read `modes/batch.md`
- Read `cv.md`
- Read `modes/_profile.md` (if exists)

Then execute batch mode as defined in `modes/batch.md`.
Process multiple offers efficiently, write TSV files to `batch/tracker-additions/`, then run `node merge-tracker.mjs`.

Batch input or context: {{arguments}}
