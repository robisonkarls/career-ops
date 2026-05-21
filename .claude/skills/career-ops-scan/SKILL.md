---
name: career-ops-scan
description: Scans configured job portals (Greenhouse, Ashby, Lever) for new offers matching the profile. Use when asked to scan for jobs, search for new offers, or find new job postings.
---

# career-ops-scan — Scan Job Portals

Scan configured job portals (Greenhouse, Ashby, Lever) for new backend engineering offers matching the profile.

## Instructions

Load context:
- Read `modes/_shared.md`
- Read `modes/scan.md`
- Read `portals.yml`
- Read `modes/_profile.md` (if exists)
- Read `data/scan-history.tsv` (if exists)

Then execute scan mode as defined in `modes/scan.md`.

**Fastest approach:** Run the zero-token scanner first:
```
node scan.mjs
```

This queries ATS APIs directly (Greenhouse, Ashby, Lever) with zero LLM cost and adds new offers to `data/pipeline.md`.

For companies not covered by the API scanner, use browser navigation per `modes/scan.md`.

Additional filters (if any): {{arguments}}
