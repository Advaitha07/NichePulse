import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import express from 'express';
import agentRouter from '../src/routes/agent.js';
import analyzeRouter from '../src/routes/analyze.js';
import { createGitHubIssue, verifyGitHubIssue } from '../src/services/github.js';

describe('Phase 5A: Human Approval Gate & GitHub External Action Tests', () => {
  let app;
  let server;
  let baseUrl;

  beforeEach(async () => {
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
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Unapproved external action request (approved: false) is rejected with 403', async () => {
    const response = await fetch(`${baseUrl}/api/agent/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approved: false,
        goal: 'sustainable fashion',
        report: { opportunities: [] },
        runId: 'run_123'
      })
    });

    assert.strictEqual(response.status, 403);
    const data = await response.json();
    assert.strictEqual(data.status, 'action_rejected');
    assert.strictEqual(data.actionState, 'action_pending');
  });

  test('2. Approved request without credentials returns action_unavailable status cleanly', async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPO;

    const response = await fetch(`${baseUrl}/api/agent/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approved: true,
        goal: 'sustainable fashion',
        report: { opportunities: [{ opportunity: 'Fit tool' }] },
        runId: 'run_123'
      })
    });

    assert.strictEqual(response.status, 503);
    const data = await response.json();
    assert.strictEqual(data.status, 'action_unavailable');
    assert.strictEqual(data.actionState, 'action_unavailable');
  });

  test('3. Direct github.js service mock testing for issue creation and verification', async () => {
    const mockOptions = {
      clientOverride: {
        createIssue: async () => ({
          success: true,
          status: 'action_succeeded',
          message: 'Issue #42 created',
          issue: { id: 101, number: 42, html_url: 'https://github.com/org/repo/issues/42', title: 'Report Issue' }
        }),
        verifyIssue: async (issueNum) => ({
          verified: true,
          status: 'action_verified',
          message: `Issue #${issueNum} verified`,
          details: { number: issueNum, url: `https://github.com/org/repo/issues/${issueNum}`, state: 'open' }
        })
      }
    };

    const actionRes = await createGitHubIssue({
      goal: 'sustainable fashion',
      report: { opportunities: [{ opportunity: 'Fit tool' }] },
      runId: 'run_123',
      options: mockOptions
    });

    assert.strictEqual(actionRes.success, true);
    assert.strictEqual(actionRes.issue.number, 42);

    const verifyRes = await verifyGitHubIssue(actionRes.issue.number, mockOptions);
    assert.strictEqual(verifyRes.verified, true);
    assert.strictEqual(verifyRes.status, 'action_verified');
  });
});
