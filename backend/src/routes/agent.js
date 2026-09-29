import express from 'express';
import { runAgent } from '../services/orchestrator.js';

const router = express.Router();

/**
 * POST /api/agent/run
 * Triggers full autonomous research agent flow.
 */
router.post('/run', async (req, res) => {
  const { goal, allowFallback = true, limit = 10 } = req.body || {};

  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    return res.status(400).json({
      error: 'Research goal is required',
      status: 'failed',
      trace: [{ step: 'initialization', status: 'failed', error: 'Missing research goal' }]
    });
  }

  const cleanGoal = goal.trim();

  try {
    const resultState = await runAgent(cleanGoal, { allowFallback, limit });

    if (resultState.status === 'completed') {
      return res.json({
        runId: resultState.runId,
        status: resultState.status,
        goal: resultState.goal,
        plan: resultState.plan,
        report: resultState.report,
        evidence: resultState.evidence,
        verification: resultState.verification,
        recoveryAttempts: resultState.recoveryAttempts,
        trace: resultState.trace,
        metadata: resultState.metadata
      });
    }

    return res.status(502).json({
      error: 'Agent execution did not produce a verified report',
      runId: resultState.runId,
      status: resultState.status,
      goal: resultState.goal,
      plan: resultState.plan,
      report: resultState.report,
      verification: resultState.verification,
      recoveryAttempts: resultState.recoveryAttempts,
      trace: resultState.trace,
      metadata: resultState.metadata
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected server error during agent execution',
      message: err.message
    });
  }
});

export default router;
