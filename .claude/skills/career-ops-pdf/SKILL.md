---
name: career-ops-pdf
description: Generates an ATS-optimized, tailored CV PDF for a specific job description. Use when asked to generate a CV, create a PDF resume, or tailor the CV to a role.
---

# career-ops-pdf — Generate ATS-Optimized CV PDF

Generate a tailored, ATS-optimized CV PDF for a specific job description.

## Instructions

Job description or context: {{arguments}}

Load context:
- Read `modes/_shared.md`
- Read `modes/pdf.md`
- Read `cv.md`
- Read `modes/_profile.md` (if exists)
- Read `article-digest.md` (if exists)
- Read `templates/cv-template.html`

Then execute the PDF generation mode as defined in `modes/pdf.md`.
Tailor the CV to the role, inject into the HTML template, then run:
```
node generate-pdf.mjs
```
