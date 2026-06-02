#!/usr/bin/env node

/**
 * Filter CV experiences: Exclude Brazilian roles by default
 * Include only if JD explicitly matches domain/stack
 * 
 * Used by: career-ops-pdf skill and resume generation workflows
 * 
 * Brazilian roles to filter:
 *   - Mato Grosso State Supreme Court (2017-2018)
 *   - Allen Informática (2013-2017)
 * 
 * Rule: Exclude by default. Include only if JD matches:
 *   - BI, ETL, data warehouse keywords
 *   - Brazil/Brazilian context
 *   - Judicial/government domain
 *   - SQL Server, Oracle expertise
 */

const BRAZILIAN_ROLES = [
  'Mato Grosso State Supreme Court',
  'Allen Informática',
  'Brazil',
  'Cuiabá'
];

const INCLUSION_KEYWORDS = [
  'BI',
  'ETL',
  'data warehouse',
  'data-warehouse',
  'Brazil',
  'Brazilian',
  'judicial',
  'government',
  'SQL Server',
  'Oracle',
  'business intelligence',
  'data extraction',
  'legacy system'
];

/**
 * Detect if a job should be filtered (excluded by default)
 */
function isBrazilianRole(job) {
  const company = (job.company || '').toLowerCase();
  const location = (job.location || '').toLowerCase();
  
  return BRAZILIAN_ROLES.some(role => {
    const r = role.toLowerCase();
    return company.includes(r) || location.includes(r);
  });
}

/**
 * Check if JD content has keywords that make Brazilian roles valuable
 */
function jdHasInclusionKeywords(jdContent) {
  const lower = jdContent.toLowerCase();
  return INCLUSION_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

/**
 * Filter experiences: exclude Brazilian roles unless JD is relevant
 * @param {Array} experiences - Array of job objects from cv.md
 * @param {String} jdContent - Full JD text for keyword matching
 * @returns {Array} Filtered experiences
 */
function filterExperiences(experiences, jdContent) {
  const includeAllKeywords = jdHasInclusionKeywords(jdContent || '');
  
  return experiences.map(exp => ({
    ...exp,
    shouldFilter: isBrazilianRole(exp) && !includeAllKeywords,
    filterReason: isBrazilianRole(exp) 
      ? (includeAllKeywords ? 'Brazilian role included (JD-relevant)' : 'Brazilian role filtered (default)')
      : null
  })).filter(exp => !exp.shouldFilter);
}

/**
 * Get filtered experience summary
 */
function getFilteringSummary(allExperiences, jdContent) {
  const brazilianJobs = allExperiences.filter(e => isBrazilianRole(e));
  const includeAllKeywords = jdHasInclusionKeywords(jdContent || '');
  
  return {
    totalJobs: allExperiences.length,
    brazilianJobs: brazilianJobs.length,
    included: includeAllKeywords,
    filtered: brazilianJobs.filter(e => !includeAllKeywords).map(e => e.company),
    summary: includeAllKeywords 
      ? `Including ${brazilianJobs.length} Brazilian roles (JD match)`
      : `Filtering ${brazilianJobs.length} Brazilian roles (default exclusion)`
  };
}

export { filterExperiences, isBrazilianRole, jdHasInclusionKeywords, getFilteringSummary };
