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
- Read `config/profile.yml` (if exists) for experience filtering rules

## Key Rules

**Experience Filtering:**
- ✅ **Always include:** Dayforce, TrillaBit, TripStack, Avanade, Fleet Complete
- ⚠️ **Conditional:** Brazilian roles (Mato Grosso State Supreme Court, Allen Informática) — include ONLY if JD explicitly matches the domain/stack
- 📋 **Check the JD:** If it's fintech/BI/ETL and specifically values Brazilian government or BI expertise, Brazilian roles may add value. Otherwise, exclude them.
- 🎯 **Default:** Exclude Brazilian roles and focus on North American roles (Dayforce through Fleet)

**Never:**
- ❌ Invent information
- ❌ Use full name other than "Robison Karls Custodio"
- ❌ Include education section (not in cv.md)
- ❌ Reorder jobs (maintain cv.md sequence)
- ❌ Include Brazilian roles without explicit JD relevance

**Always:**
- ✅ Extract all content from cv.md
- ✅ Use 6-8 bullets per job
- ✅ Order bullets by JD relevance within each job
- ✅ Maintain cv.md job order (filtered)
- ✅ Ethical keyword enrichment only

Then execute the PDF generation mode as defined in `modes/pdf.md`.
Tailor the CV to the role, inject into the HTML template, then run:
```
node generate-pdf.mjs
```
