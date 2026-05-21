---
name: career-ops-apply
description: Live application assistant. Generates tailored answers to job application forms. Use when asked to fill out a job application, help apply to a role, or generate application form answers.
---

# career-ops-apply — Live Application Assistant

Read a job application form and generate tailored answers. **Never auto-submits.**

## Instructions

Job URL or form context: {{arguments}}

Load context:
- Read `modes/_shared.md`
- Read `modes/apply.md`
- Read `cv.md`
- Read `modes/_profile.md` (if exists)
- Read `article-digest.md` (if exists)

Then execute the apply mode as defined in `modes/apply.md`.

**CRITICAL: NEVER click Submit, Apply, or Send.** Generate answers and show them to the user for review. The user submits manually.
