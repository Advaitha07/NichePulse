/**
 * Phase 4: Deterministic Programmatic Verification Service
 * Validates report structure, non-emptiness, evidence traceability, and URL integrity.
 */

export function verifyReport(report, evidence = [], metadata = {}) {
  const checks = [];
  const errors = [];

  // 1. Report existence check
  const hasReport = Boolean(report && typeof report === 'object');
  checks.push({
    name: 'report_object_exists',
    passed: hasReport,
    details: hasReport ? 'Report is a valid object' : 'Report is missing or null'
  });

  if (!hasReport) {
    errors.push('Report object is null or not an object');
    return { passed: false, checks, errors };
  }

  // 2. Required categories existence and array type checks
  const requiredCategories = [
    'topTopics',
    'emergingTrends',
    'recurringProblems',
    'aiInsights',
    'opportunities',
    'sourceLinks'
  ];

  for (const cat of requiredCategories) {
    const isArray = Array.isArray(report[cat]);
    checks.push({
      name: `category_${cat}_is_array`,
      passed: isArray,
      details: isArray ? `${cat} is an array` : `${cat} is missing or not an array`
    });
    if (!isArray) {
      errors.push(`Required category '${cat}' is not an array`);
    }
  }

  // 3. Report non-emptiness check
  const totalItems = requiredCategories.reduce((acc, cat) => acc + (Array.isArray(report[cat]) ? report[cat].length : 0), 0);
  const notEmpty = totalItems > 0;
  checks.push({
    name: 'report_is_not_empty',
    passed: notEmpty,
    details: notEmpty ? `Report contains ${totalItems} total items across categories` : 'Report contains 0 items'
  });
  if (!notEmpty) {
    errors.push('Report contains no items across any category');
  }

  // 4. Evidence ID reference verification
  const validEvidenceIds = new Set(evidence.map(e => String(e.id)).filter(Boolean));
  let invalidRefFound = false;
  const referencedCategories = ['topTopics', 'emergingTrends', 'recurringProblems', 'aiInsights', 'opportunities'];

  for (const cat of referencedCategories) {
    if (Array.isArray(report[cat])) {
      for (const item of report[cat]) {
        if (Array.isArray(item.evidenceIds)) {
          for (const refId of item.evidenceIds) {
            if (validEvidenceIds.size > 0 && !validEvidenceIds.has(String(refId))) {
              invalidRefFound = true;
              errors.push(`Invalid evidenceId reference '${refId}' in ${cat}`);
            }
          }
        }
      }
    }
  }

  checks.push({
    name: 'evidence_id_traceability',
    passed: !invalidRefFound,
    details: invalidRefFound ? 'Report contains unmapped evidence ID references' : 'All referenced evidence IDs exist in input evidence'
  });

  // 5. Source Links URL integrity (Only URLs from supplied evidence)
  const suppliedUrls = new Set(evidence.map(e => e.url).filter(Boolean));
  let unsuppliedUrlFound = false;

  if (Array.isArray(report.sourceLinks)) {
    for (const link of report.sourceLinks) {
      if (link && link.url && suppliedUrls.size > 0 && !suppliedUrls.has(link.url)) {
        unsuppliedUrlFound = true;
        errors.push(`Source link URL '${link.url}' was not in supplied evidence`);
      }
    }
  }

  checks.push({
    name: 'source_links_url_integrity',
    passed: !unsuppliedUrlFound,
    details: unsuppliedUrlFound ? 'Report contains URLs not present in supplied evidence' : 'All source links match supplied evidence URLs'
  });

  // 6. Fixture vs Live metadata accuracy check
  const evidenceHasFixture = evidence.some(e => e.sourceType === 'fixture');
  const metadataFixtureFlag = Boolean(report.metadata?.isFixtureEvidence || metadata.isFixtureEvidence);
  const fixtureMetaMatch = evidenceHasFixture === metadataFixtureFlag;

  checks.push({
    name: 'fixture_metadata_accuracy',
    passed: fixtureMetaMatch,
    details: fixtureMetaMatch
      ? `Fixture flag (${metadataFixtureFlag}) matches evidence source type (${evidenceHasFixture})`
      : `Mismatch between evidence source types (${evidenceHasFixture}) and metadata flag (${metadataFixtureFlag})`
  });
  if (!fixtureMetaMatch) {
    errors.push(`Fixture metadata mismatch: evidence has fixture=${evidenceHasFixture}, metadata has fixture=${metadataFixtureFlag}`);
  }

  const passed = checks.every(c => c.passed);

  return {
    passed,
    checks,
    errors
  };
}
