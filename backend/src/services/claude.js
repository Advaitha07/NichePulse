import Anthropic from '@anthropic-ai/sdk';

/**
 * Maximum number of evidence items sent to Claude to avoid uncontrolled token usage.
 */
const MAX_EVIDENCE_ITEMS = 20;

/**
 * Default model configuration for Claude intelligence synthesis.
 */
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * Truncates text fields to a reasonable character limit to control prompt token size.
 */
function truncateText(text, maxLength = 400) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed;
}

/**
 * Sanitizes and truncates evidence items into a deterministic, compact input list for Claude.
 */
export function prepareEvidenceInput(evidence = []) {
  if (!Array.isArray(evidence)) return [];

  return evidence
    .filter(item => item && typeof item === 'object')
    .slice(0, MAX_EVIDENCE_ITEMS)
    .map(item => ({
      id: item.id ? String(item.id) : 'unknown',
      source: item.source || 'unknown',
      sourceType: item.sourceType || 'unknown',
      title: truncateText(item.title, 200),
      text: truncateText(item.text, 500),
      url: item.url || '',
      author: item.author || item.channel || undefined,
      score: item.score ?? undefined,
      comments: item.comments ?? undefined,
      publishedAt: item.publishedAt || item.createdAt || undefined
    }));
}

/**
 * Formulates system instructions ensuring strict grounding, URL preservation,
 * evidence traceability, and JSON format compliance.
 */
function buildSystemPrompt() {
  return `You are NichePulse Intelligence Synthesis Agent. Your role is to analyze market and audience research evidence for a given niche topic and generate a structured intelligence report.

STRICT GROUNDING RULES:
1. Base all facts, topics, trends, problems, insights, and opportunities ONLY on the provided evidence items.
2. DO NOT fabricate facts, invent sources, invent statistics, or invent URLs.
3. DO NOT attribute claims to sources that did not provide them.
4. PRESERVE source URLs exactly as provided in the evidence items. Never generate imaginary URLs or modify existing ones.
5. Distinguish direct evidence from inference. Explicitly indicate uncertainty when evidence is weak, sparse, or conflicting.
6. Frame opportunities as potential inferences or hypotheses, not established facts.
7. Include supporting evidence IDs (evidenceIds) for each item in topTopics, emergingTrends, recurringProblems, aiInsights, and opportunities.
8. Output MUST be valid, parsable JSON matching the exact schema specified in the user prompt. Do not output markdown code blocks, backticks, or conversational prose outside the JSON.`;
}

/**
 * Builds user prompt containing the clean evidence list and expected JSON schema.
 */
function buildUserPrompt(niche, evidenceInput) {
  return `Perform intelligence synthesis for the following niche research goal:
Niche Goal: "${niche}"

Supplied Evidence (${evidenceInput.length} items):
${JSON.stringify(evidenceInput, null, 2)}

Respond ONLY with a JSON object matching this schema:
{
  "topTopics": [
    {
      "topic": "string",
      "summary": "string",
      "evidenceIds": ["string"]
    }
  ],
  "emergingTrends": [
    {
      "trend": "string",
      "description": "string",
      "signalStrength": "low" | "medium" | "high",
      "evidenceIds": ["string"]
    }
  ],
  "recurringProblems": [
    {
      "problem": "string",
      "impact": "string",
      "evidenceIds": ["string"]
    }
  ],
  "aiInsights": [
    {
      "insight": "string",
      "grounding": "string",
      "evidenceIds": ["string"]
    }
  ],
  "opportunities": [
    {
      "opportunity": "string",
      "rationale": "string",
      "evidenceIds": ["string"]
    }
  ],
  "sourceLinks": [
    {
      "title": "string",
      "url": "string",
      "source": "string",
      "evidenceId": "string"
    }
  ]
}`;
}

/**
 * Generates a deterministic, grounded report shape from evidence items when running in demo fixture mode.
 */
function generateFixtureReport(niche, evidenceInput = []) {
  const topItem = evidenceInput[0] || {};
  const evidenceIds = evidenceInput.map(e => e.id).filter(Boolean);

  return {
    topTopics: [
      {
        topic: `${niche || 'Niche'} Insights & Feedback`,
        summary: topItem.title || `Market discussion analysis for ${niche}`,
        evidenceIds: evidenceIds.slice(0, 2)
      }
    ],
    emergingTrends: [
      {
        trend: 'Transparent & Direct Value Delivery',
        description: topItem.text || `Consumer preference shifting towards verified quality and transparent pricing in ${niche}.`,
        signalStrength: 'high',
        evidenceIds: evidenceIds.slice(0, 2)
      }
    ],
    recurringProblems: [
      {
        problem: 'Sizing & Expectation Mismatches',
        impact: 'High return rates and customer conversion drop-offs.',
        evidenceIds: evidenceIds.slice(0, 1)
      }
    ],
    aiInsights: [
      {
        insight: 'Consumer trust and clear specifications are primary conversion drivers.',
        grounding: `Reflected across discussions in ${niche} community threads.`,
        evidenceIds: evidenceIds.slice(0, 2)
      }
    ],
    opportunities: [
      {
        opportunity: 'Automated Fit & Quality Verification Tools',
        rationale: 'Addresses primary dissatisfaction and return friction point.',
        evidenceIds: evidenceIds.slice(0, 2)
      }
    ],
    sourceLinks: evidenceInput.filter(e => e.url).map(e => ({
      title: e.title || e.id,
      url: e.url,
      source: e.source || 'fixture',
      evidenceId: e.id
    }))
  };
}

/**
 * Validates and normalizes raw JSON response from Claude into the standard NichePulse report shape.
 */
export function normalizeReportOutput(rawReport, evidenceInput, metadataExtras = {}) {
  const safeObj = (rawReport && typeof rawReport === 'object' && !Array.isArray(rawReport)) ? rawReport : {};

  // Extract source links from evidence input to guarantee source URL preservation even if Claude omitted some
  const providedSourceLinks = evidenceInput
    .filter(item => item.url)
    .map(item => ({
      title: item.title || item.id,
      url: item.url,
      source: item.source || 'unknown',
      evidenceId: item.id
    }));

  // Combine provided links with LLM returned links without inventing URLs
  const returnedSourceLinks = Array.isArray(safeObj.sourceLinks) ? safeObj.sourceLinks : [];
  const validReturnedUrls = new Set(evidenceInput.map(e => e.url).filter(Boolean));

  const mergedSourceLinks = [...providedSourceLinks];
  for (const link of returnedSourceLinks) {
    if (link && link.url && validReturnedUrls.has(link.url)) {
      if (!mergedSourceLinks.some(l => l.url === link.url)) {
        mergedSourceLinks.push({
          title: link.title || '',
          url: link.url,
          source: link.source || 'unknown',
          evidenceId: link.evidenceId || ''
        });
      }
    }
  }

  return {
    topTopics: Array.isArray(safeObj.topTopics) ? safeObj.topTopics : [],
    emergingTrends: Array.isArray(safeObj.emergingTrends) ? safeObj.emergingTrends : [],
    recurringProblems: Array.isArray(safeObj.recurringProblems) ? safeObj.recurringProblems : [],
    aiInsights: Array.isArray(safeObj.aiInsights) ? safeObj.aiInsights : [],
    opportunities: Array.isArray(safeObj.opportunities) ? safeObj.opportunities : [],
    sourceLinks: mergedSourceLinks,
    metadata: {
      evidenceCount: evidenceInput.length,
      model: CLAUDE_MODEL,
      status: metadataExtras.status || 'success',
      isFixtureEvidence: metadataExtras.isFixtureEvidence ?? false,
      timestamp: new Date().toISOString(),
      ...metadataExtras.metadata
    }
  };
}

/**
 * Synthesizes research evidence into a structured intelligence report using Claude.
 * Handles missing API key, API errors, network issues, and malformed response safely.
 *
 * @param {string} niche - Niche query / research goal
 * @param {Array} evidence - Normalized evidence items from Reddit/YouTube/Fixtures
 * @param {Object} options - Additional options e.g. { isFixtureEvidence: boolean, clientOverride: Anthropic }
 */
export async function analyzeNicheData(niche, evidence = [], options = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isFixtureEvidence = options.isFixtureEvidence ?? evidence.some(item => item?.sourceType === 'fixture');

  // Handle empty or invalid evidence gracefully without failing
  const evidenceInput = prepareEvidenceInput(evidence);

  if (!apiKey && !options.clientOverride) {
    if (options.allowFallback === true) {
      const fallbackReport = generateFixtureReport(niche, evidenceInput);
      return {
        success: true,
        status: 'fallback',
        message: 'ANTHROPIC_API_KEY not configured; using deterministic demo fixture synthesis',
        report: normalizeReportOutput(fallbackReport, evidenceInput, {
          status: 'fallback',
          isFixtureEvidence: true,
          metadata: { note: 'Generated via demo fixture synthesis mode' }
        })
      };
    }
    return {
      success: false,
      status: 'missing_api_key',
      message: 'ANTHROPIC_API_KEY is not configured in backend environment',
      report: null
    };
  }

  if (evidenceInput.length === 0) {
    return {
      success: true,
      status: 'empty_evidence',
      message: 'No evidence items provided for Claude analysis',
      report: normalizeReportOutput({}, [], {
        status: 'empty_evidence',
        isFixtureEvidence,
        metadata: { note: 'No evidence was available to analyze' }
      })
    };
  }

  try {
    const anthropic = options.clientOverride || new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2500,
      temperature: 0.2,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(niche, evidenceInput)
        }
      ]
    });

    const responseText = response.content?.[0]?.text || '';

    // Parse JSON safely
    let parsedData = null;
    try {
      // Clean potential JSON markdown blocks if present
      const cleanJsonText = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      parsedData = JSON.parse(cleanJsonText);
    } catch (parseError) {
      return {
        success: false,
        status: 'malformed_response',
        message: `Claude returned non-JSON or malformed response: ${parseError.message}`,
        rawResponse: responseText.slice(0, 500),
        report: null
      };
    }

    const structuredReport = normalizeReportOutput(parsedData, evidenceInput, {
      status: 'success',
      isFixtureEvidence
    });

    return {
      success: true,
      status: 'success',
      message: 'Claude intelligence synthesis completed successfully',
      report: structuredReport
    };
  } catch (err) {
    return {
      success: false,
      status: 'api_error',
      message: `Anthropic API error: ${err.message || 'Unknown API failure'}`,
      report: null
    };
  }
}
