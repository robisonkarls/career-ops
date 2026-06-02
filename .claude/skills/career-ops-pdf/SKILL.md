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

**Experience Filtering (MANDATORY):**

Brazilian roles are **excluded by default** unless JD explicitly matches domain/stack:
- 🇧🇷 **Brazilian roles:** Mato Grosso State Supreme Court, Allen Informática
- ⏭️ **Include ONLY if JD contains:** BI, ETL, data warehouse, Brazil/Brazilian, judicial, SQL Server, Oracle, business intelligence
- 🎯 **Default:** Filter out Brazilian roles, focus on North American roles (Dayforce → TrillaBit → TripStack → Avanade → Fleet Complete)
- 📋 **How to apply:** Use `node filter-cv-experience.mjs` or check JD keywords before building HTML

**Example:**
```
JD for "Senior Backend Engineer" (no BI/ETL/judicial keywords) → Filter out Brazilian roles
JD for "BI Lead" (has ETL, data warehouse keywords) → Include Brazilian roles (value-add)
```

**Never:**
- ❌ Invent information
- ❌ Use full name other than "Robison Karls Custodio"
- ❌ Include education section (not in cv.md)
- ❌ Reorder jobs (maintain cv.md sequence)
- ❌ Include Brazilian roles without explicit JD relevance

**Always:**
- ✅ Extract all content from cv.md only
- ✅ Use 6-8 bullets per job (not all, not just 2-3)
- ✅ Order bullets by JD relevance within each job
- ✅ Maintain cv.md job order (Brazilian roles filtered by default)
- ✅ Ethical keyword enrichment only (never invent)
- ✅ Apply filtering logic: Check JD keywords → Use filter-cv-experience.mjs → Generate HTML

Then execute the PDF generation mode as defined in `modes/pdf.md`:

## Execution Workflow

1. **Extract JD keywords** — Look for: BI, ETL, data warehouse, judicial, Brazil, SQL Server, business intelligence, legacy systems
2. **Load cv.md** — All 7 jobs
3. **Apply Brazilian filtering logic:**
   ```bash
   node filter-cv-experience.mjs --jd="<jd-text>" --cv="cv.md"
   ```
   This returns filtered experience list:
   - Included: Dayforce, TrillaBit, TripStack, Avanade, Fleet Complete
   - Filtered: Mato Grosso State Supreme Court, Allen Informática (unless JD keywords match)
4. **Select 6-8 bullets per job** — In cv.md order, matching JD keywords, strongest first
5. **Generate HTML** — Inject into `templates/cv-template.html`
6. **Convert to PDF:**
   ```bash
   node generate-pdf.mjs <html-file> <pdf-output> --format=letter
   ```
7. **Report filtering summary** — Include in response:
   - Total jobs: 7
   - Included: 5 (or 7 if JD-relevant)
   - Filtered: 2 (or 0 if JD-relevant)
   - Example: "Filtered: Mato Grosso State Supreme Court, Allen Informática (no BI/ETL keywords in JD)"
