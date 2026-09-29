import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import express from 'express';
import analyzeRouter from '../src/routes/analyze.js';

describe('Phase 3: Analyze Route Integration & Fixture vs Live Metadata Tests', () => {
  let app;
  let server;
  let baseUrl;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
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

  test('1. POST /api/analyze returns evidence and fixture status when API key is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: 'sustainable fashion', allowFallback: true })
    });

    assert.strictEqual(response.status, 200);
    const data = await response.json();

    assert.strictEqual(data.niche, 'sustainable fashion');
    assert.ok(Array.isArray(data.evidence));
    assert.strictEqual(data.sources.reddit.status, 'fallback');
    assert.strictEqual(data.sources.youtube.status, 'fallback');
    assert.strictEqual(data.analysis.status, 'missing_api_key');
    assert.strictEqual(data.analysis.isFixtureEvidence, true);
    assert.strictEqual(data.report, null);
  });

  test('2. POST /api/analyze rejects missing niche query with 400', async () => {
    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: '  ' })
    });

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.error, 'Niche query is required');
  });
});
