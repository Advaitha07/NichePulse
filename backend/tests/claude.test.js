import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { analyzeNicheData, prepareEvidenceInput, normalizeReportOutput } from '../src/services/claude.js';

describe('Phase 3: Claude Intelligence Synthesis Service Tests', () => {
  const originalEnv = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'mock_api_key_for_tests';
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalEnv;
    }
  });

  test('1. Successful Claude synthesis with controlled/mock evidence', async () => {
    const mockEvidence = [
      {
        id: 'reddit_001',
        source: 'reddit',
        sourceType: 'live',
        title: 'High sizing return rates in eco-clothing',
        text: 'Sizing inconsistency causes 40% of returns.',
        url: 'https://reddit.com/r/sustainability/comments/123'
      }
    ];

    const mockAnthropicClient = {
      messages: {
        create: async () => ({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                topTopics: [
                  {
                    topic: 'Sizing Inconsistency',
                    summary: 'Customers return eco-clothing due to unpredictable sizing.',
                    evidenceIds: ['reddit_001']
                  }
                ],
                emergingTrends: [
                  {
                    trend: 'Sizing Transparency',
                    description: 'Brands offering explicit sizing guides.',
                    signalStrength: 'high',
                    evidenceIds: ['reddit_001']
                  }
                ],
                recurringProblems: [
                  {
                    problem: 'High Return Rates',
                    impact: 'Financial loss for small sustainable brands.',
                    evidenceIds: ['reddit_001']
                  }
                ],
                aiInsights: [
                  {
                    insight: 'Sizing clarity is more critical than fabric marketing.',
                    grounding: 'Directly stated in Reddit comment regarding 40% returns.',
                    evidenceIds: ['reddit_001']
                  }
                ],
                opportunities: [
                  {
                    opportunity: 'Fit guarantee tools for sustainable ecommerce',
                    rationale: 'Addresses primary return cause.',
                    evidenceIds: ['reddit_001']
                  }
                ],
                sourceLinks: [
                  {
                    title: 'High sizing return rates in eco-clothing',
                    url: 'https://reddit.com/r/sustainability/comments/123',
                    source: 'reddit',
                    evidenceId: 'reddit_001'
                  }
                ]
              })
            }
          ]
        })
      }
    };

    const res = await analyzeNicheData('sustainable fashion', mockEvidence, {
      clientOverride: mockAnthropicClient,
      isFixtureEvidence: false
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'success');
    assert.ok(res.report);
    assert.strictEqual(res.report.topTopics.length, 1);
    assert.strictEqual(res.report.topTopics[0].evidenceIds[0], 'reddit_001');
    assert.strictEqual(res.report.sourceLinks[0].url, 'https://reddit.com/r/sustainability/comments/123');
    assert.strictEqual(res.report.metadata.isFixtureEvidence, false);
  });

  test('2. Missing ANTHROPIC_API_KEY handling', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const resFallback = await analyzeNicheData('sustainable fashion', [
      { id: 'fix_1', title: 'Test', url: 'https://example.com' }
    ], { allowFallback: true });

    assert.strictEqual(resFallback.success, true);
    assert.strictEqual(resFallback.status, 'fallback');
    assert.ok(resFallback.report);

    const resNoFallback = await analyzeNicheData('sustainable fashion', [
      { id: 'fix_1', title: 'Test', url: 'https://example.com' }
    ], { allowFallback: false });

    assert.strictEqual(resNoFallback.success, false);
    assert.strictEqual(resNoFallback.status, 'missing_api_key');
    assert.strictEqual(resNoFallback.report, null);
  });

  test('3. Malformed / non-JSON Claude response handling', async () => {
    const mockAnthropicClient = {
      messages: {
        create: async () => ({
          content: [
            {
              type: 'text',
              text: 'I cannot output JSON right now because of internal error.'
            }
          ]
        })
      }
    };

    const res = await analyzeNicheData('sustainable fashion', [
      { id: 'fix_1', title: 'Test', url: 'https://example.com' }
    ], { clientOverride: mockAnthropicClient });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 'malformed_response');
    assert.strictEqual(res.report, null);
  });

  test('4. Empty evidence list handling', async () => {
    const res = await analyzeNicheData('sustainable fashion', []);

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'empty_evidence');
    assert.ok(res.report);
    assert.strictEqual(res.report.metadata.evidenceCount, 0);
  });

  test('5. Preservation of source URLs and evidence traceability', () => {
    const evidence = [
      { id: 'ev_1', title: 'Evidence 1', url: 'https://youtube.com/watch?v=abc', source: 'youtube' }
    ];

    const prepared = prepareEvidenceInput(evidence);
    assert.strictEqual(prepared[0].id, 'ev_1');
    assert.strictEqual(prepared[0].url, 'https://youtube.com/watch?v=abc');

    const normalized = normalizeReportOutput(
      {
        topTopics: [{ topic: 'Topic A', evidenceIds: ['ev_1'] }],
        sourceLinks: []
      },
      prepared,
      { isFixtureEvidence: false }
    );

    assert.strictEqual(normalized.sourceLinks.length, 1);
    assert.strictEqual(normalized.sourceLinks[0].url, 'https://youtube.com/watch?v=abc');
    assert.strictEqual(normalized.sourceLinks[0].evidenceId, 'ev_1');
  });

  test('6. Deterministic evidence limit (truncation / bounds)', () => {
    const manyItems = Array.from({ length: 35 }, (_, i) => ({
      id: `item_${i}`,
      title: `Title ${i}`,
      text: 'Sample text',
      url: `https://example.com/${i}`
    }));

    const prepared = prepareEvidenceInput(manyItems);
    assert.strictEqual(prepared.length, 20);
  });
});
