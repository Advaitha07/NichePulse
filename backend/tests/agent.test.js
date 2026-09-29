import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import express from 'express';
import agentRouter from '../src/routes/agent.js';
import analyzeRouter from '../src/routes/analyze.js';
import { generatePlan, validatePlan } from '../src/services/planner.js';
import { executeTask, setSimulatedFailure } from '../src/services/executor.js';
import { verifyReport } from '../src/services/verifier.js';
import { runAgent } from '../src/services/orchestrator.js';

describe('Phase 4: Agent Autonomous Orchestration Tests', () => {
  let app;
  let server;
  let baseUrl;

  beforeEach(async () => {
    setSimulatedFailure(null);
    app = express();
    app.use(express.json());
    app.use('/api/agent', agentRouter);
    app.use('/api/analyze', analyzeRouter);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    setSimulatedFailure(null);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Successful agent run with mock Claude client', async () => {
    const mockClaudeClient = {
      messages: {
        create: async () => ({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                topTopics: [{ topic: 'Mock Topic', summary: 'Summary', evidenceIds: ['reddit_fix_001'] }],
                emergingTrends: [{ trend: 'Trend A', description: 'Desc', signalStrength: 'high', evidenceIds: ['reddit_fix_001'] }],
                recurringProblems: [{ problem: 'Problem B', impact: 'High', evidenceIds: ['reddit_fix_001'] }],
                aiInsights: [{ insight: 'Insight C', grounding: 'Direct', evidenceIds: ['reddit_fix_001'] }],
                opportunities: [{ opportunity: 'Opportunity D', rationale: 'Rationale', evidenceIds: ['reddit_fix_001'] }],
                sourceLinks: [{ title: 'Fix Title', url: 'https://reddit.com/r/sustainability/comments/mock001', source: 'reddit', evidenceId: 'reddit_fix_001' }]
              })
            }
          ]
        })
      }
    };

    const state = await runAgent('sustainable fashion', {
      allowFallback: true,
      clientOverride: mockClaudeClient
    });

    assert.strictEqual(state.status, 'completed');
    assert.ok(state.plan);
    assert.strictEqual(state.plan.tasks.length, 5);
    assert.ok(state.report);
    assert.strictEqual(state.verification.passed, true);
    assert.strictEqual(state.trace.length >= 5, true);
  });

  test('2. Planner validation and plan generation', () => {
    const res = generatePlan('sustainable fashion');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.plan.tasks.length, 5);

    const invalidCheck = validatePlan({ tasks: [{ taskId: 't1', tool: 'non_existent_tool' }] });
    assert.strictEqual(invalidCheck.valid, false);
    assert.ok(invalidCheck.errors[0].includes('disallowed or unknown tool'));
  });

  test('3. Executor unknown task rejection', async () => {
    const record = await executeTask({ taskId: 'bad_1', tool: 'unknown_tool_xyz' });
    assert.strictEqual(record.success, false);
    assert.strictEqual(record.status, 'failed');
    assert.ok(record.error.includes('Rejected unknown tool'));
  });

  test('4 & 5. Reddit & YouTube task execution with fallback mode', async () => {
    const redditRec = await executeTask({ taskId: 't_red', tool: 'reddit_search', params: { niche: 'eco fashion' } });
    assert.strictEqual(redditRec.success, true);
    assert.strictEqual(redditRec.result.status, 'fallback');

    const ytRec = await executeTask({ taskId: 't_yt', tool: 'youtube_search', params: { niche: 'eco fashion' } });
    assert.strictEqual(ytRec.success, true);
    assert.strictEqual(ytRec.result.status, 'fallback');
  });

  test('6. Evidence deduplication execution', async () => {
    const rawItems = [
      { id: '1', source: 'reddit', url: 'https://reddit.com/post1', title: 'Test Post' },
      { id: '1', source: 'reddit', url: 'https://reddit.com/post1', title: 'Test Post' }
    ];
    const record = await executeTask({ taskId: 't_dedupe', tool: 'dedupe' }, { rawEvidence: rawItems });
    assert.strictEqual(record.success, true);
    assert.strictEqual(record.evidenceCount, 1);
  });

  test('7. Claude integration execution failure when API key missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const record = await executeTask({ taskId: 't_claude', tool: 'analysis', params: { niche: 'test' } }, { evidence: [] });
    assert.strictEqual(record.success, false);
    assert.strictEqual(record.error, 'ANTHROPIC_API_KEY is not configured in backend environment');
  });

  test('8. Verification success check', () => {
    const mockReport = {
      topTopics: [{ topic: 'T1' }],
      emergingTrends: [],
      recurringProblems: [],
      aiInsights: [],
      opportunities: [],
      sourceLinks: [{ url: 'https://example.com/1' }]
    };
    const evidence = [{ id: 'e1', url: 'https://example.com/1', sourceType: 'fixture' }];
    const res = verifyReport(mockReport, evidence, { isFixtureEvidence: true });
    assert.strictEqual(res.passed, true);
  });

  test('9. Verification failure check on URL mismatch or unmapped ID', () => {
    const mockReport = {
      topTopics: [{ topic: 'T1', evidenceIds: ['unmapped_id_99'] }],
      emergingTrends: [],
      recurringProblems: [],
      aiInsights: [],
      opportunities: [],
      sourceLinks: [{ url: 'https://invented-url.com' }]
    };
    const evidence = [{ id: 'e1', url: 'https://example.com/1', sourceType: 'fixture' }];
    const res = verifyReport(mockReport, evidence, { isFixtureEvidence: true });
    assert.strictEqual(res.passed, false);
    assert.strictEqual(res.errors.length > 0, true);
  });

  test('10 & 11. Controlled failure demo & bounded recovery', async () => {
    setSimulatedFailure('reddit_search');

    const mockClaudeClient = {
      messages: {
        create: async () => ({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                topTopics: [{ topic: 'Mock Topic', summary: 'Summary', evidenceIds: ['youtube_fix_001'] }],
                emergingTrends: [],
                recurringProblems: [],
                aiInsights: [],
                opportunities: [],
                sourceLinks: [{ title: 'YT Title', url: 'https://www.youtube.com/watch?v=mockyt001', source: 'youtube', evidenceId: 'youtube_fix_001' }]
              })
            }
          ]
        })
      }
    };

    const state = await runAgent('sustainable fashion', {
      allowFallback: true,
      clientOverride: mockClaudeClient
    });

    assert.strictEqual(state.status, 'completed');
    assert.strictEqual(state.recoveryAttempts.length, 1);
    assert.strictEqual(state.recoveryAttempts[0].tool, 'reddit_search');
    assert.strictEqual(state.recoveryAttempts[0].result, 'success');
  });

  test('12. Fixture mode metadata flag tracking', async () => {
    const mockClaudeClient = {
      messages: {
        create: async () => ({
          content: [{ type: 'text', text: JSON.stringify({ topTopics: [{ topic: 'Fix' }], emergingTrends: [], recurringProblems: [], aiInsights: [], opportunities: [], sourceLinks: [{ url: 'https://reddit.com/r/sustainability/comments/mock001' }] }) }]
        })
      }
    };

    const state = await runAgent('sustainable fashion', { allowFallback: true, clientOverride: mockClaudeClient });
    assert.strictEqual(state.metadata.isFixtureEvidence, true);
  });

  test('13. POST /api/agent/run missing goal handling', async () => {
    const res = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: '' })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Research goal is required');
  });

  test('14. Execution trace sequence validation', async () => {
    const mockClaudeClient = {
      messages: {
        create: async () => ({
          content: [{ type: 'text', text: JSON.stringify({ topTopics: [{ topic: 'Fix' }], emergingTrends: [], recurringProblems: [], aiInsights: [], opportunities: [], sourceLinks: [{ url: 'https://reddit.com/r/sustainability/comments/mock001' }] }) }]
        })
      }
    };

    const state = await runAgent('sustainable fashion', { allowFallback: true, clientOverride: mockClaudeClient });
    const steps = state.trace.map(t => t.step);
    assert.ok(steps.includes('planning'));
    assert.ok(steps.includes('reddit_search'));
    assert.ok(steps.includes('youtube_search'));
    assert.ok(steps.includes('dedupe'));
    assert.ok(steps.includes('analysis'));
    assert.ok(steps.includes('verification'));
  });

  test('15. /api/analyze route backward compatibility', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: 'sustainable fashion', skipClaude: true })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.niche, 'sustainable fashion');
    assert.ok(Array.isArray(data.evidence));
  });
});
