/**
 * Phase 4: Task Executor & Controlled Demo Failure Injector
 * Maps task types to existing Reddit, YouTube, dedupe, and Claude services.
 */

import { fetchRedditPosts } from './reddit.js';
import { fetchYouTubeVideos } from './youtube.js';
import { deduplicateItems } from './dedupe.js';
import { analyzeNicheData } from './claude.js';
import { verifyReport } from './verifier.js';

// Demo-only failure simulation state (isolated and disabled by default)
let simulatedFailureTool = null;
let simulatedFailureCount = 0;

/**
 * Configure demo failure injection for testing.
 * @param {string|null} toolName - e.g. 'reddit_search' | 'youtube_search' | 'analysis' | null
 */
export function setSimulatedFailure(toolName) {
  simulatedFailureTool = toolName;
  simulatedFailureCount = 0;
}

/**
 * Executes a single task cleanly with status tracking, execution metadata, and error handling.
 */
export async function executeTask(task, context = {}) {
  const { taskId, tool, params = {} } = task;
  const startTime = Date.now();

  const record = {
    taskId,
    tool,
    startTime: new Date(startTime).toISOString(),
    status: 'running',
    success: false,
    evidenceCount: 0,
    result: null,
    error: null,
    durationMs: 0
  };

  // Check controlled demo failure trigger
  if (simulatedFailureTool === tool && simulatedFailureCount === 0) {
    simulatedFailureCount++;
    record.status = 'failed';
    record.success = false;
    record.error = `[Demo Simulated Failure] Simulated error for tool '${tool}'`;
    record.durationMs = Date.now() - startTime;
    return record;
  }

  try {
    switch (tool) {
      case 'reddit_search': {
        const niche = params.niche || context.goal;
        const limit = params.limit || 10;
        const res = await fetchRedditPosts(niche, { limit, allowFallback: context.allowFallback ?? true });

        record.success = res.success;
        record.status = res.success ? 'completed' : 'failed';
        record.result = res;
        record.evidenceCount = Array.isArray(res.items) ? res.items.length : 0;
        if (!res.success) {
          record.error = res.message || 'Reddit harvest failed';
        }
        break;
      }

      case 'youtube_search': {
        const niche = params.niche || context.goal;
        const limit = params.limit || 10;
        const res = await fetchYouTubeVideos(niche, { limit, allowFallback: context.allowFallback ?? true });

        record.success = res.success;
        record.status = res.success ? 'completed' : 'failed';
        record.result = res;
        record.evidenceCount = Array.isArray(res.items) ? res.items.length : 0;
        if (!res.success) {
          record.error = res.message || 'YouTube harvest failed';
        }
        break;
      }

      case 'dedupe': {
        const rawEvidence = context.rawEvidence || [];
        const threshold = params.threshold ?? 0.75;
        const dedupeRes = deduplicateItems(rawEvidence, { threshold });

        record.success = true;
        record.status = 'completed';
        record.result = dedupeRes;
        record.evidenceCount = dedupeRes.outputCount;
        break;
      }

      case 'analysis': {
        const niche = params.niche || context.goal;
        const evidence = context.evidence || [];
        const isFixtureEvidence = context.isFixtureEvidence ?? false;

        const analysisRes = await analyzeNicheData(niche, evidence, {
          isFixtureEvidence,
          allowFallback: context.allowClaudeFallback ?? false,
          clientOverride: context.clientOverride
        });

        record.success = analysisRes.success;
        record.status = analysisRes.success ? 'completed' : 'failed';
        record.result = analysisRes;
        if (!analysisRes.success) {
          record.error = analysisRes.message || 'Claude analysis failed';
        }
        break;
      }

      case 'verification': {
        const report = context.report;
        const evidence = context.evidence || [];
        const metadata = context.metadata || {};

        const verificationRes = verifyReport(report, evidence, metadata);

        record.success = verificationRes.passed;
        record.status = verificationRes.passed ? 'completed' : 'failed';
        record.result = verificationRes;
        if (!verificationRes.passed) {
          record.error = `Verification failed: ${verificationRes.errors.join('; ')}`;
        }
        break;
      }

      default: {
        record.status = 'failed';
        record.success = false;
        record.error = `Rejected unknown tool: '${tool}'`;
      }
    }
  } catch (err) {
    record.status = 'failed';
    record.success = false;
    record.error = err.message || 'Unexpected tool execution error';
  }

  record.durationMs = Date.now() - startTime;
  return record;
}
