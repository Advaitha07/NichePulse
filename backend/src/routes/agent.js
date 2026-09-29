import express from 'express';
import { runAgent } from '../services/orchestrator.js';
import { createGitHubIssue, verifyGitHubIssue } from '../services/github.js';

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

/**
 * POST /api/agent/action
 * Human Approval Gate + External Action (GitHub Issue Creation & Verification)
 * Enforces explicit approved: true requirement.
 */
router.post('/action', async (req, res) => {
  const { approved, goal, report, runId, options, clientOverride } = req.body || {};
  const activeOptions = options || (clientOverride ? { clientOverride } : {});

  // 1. Enforce Human Approval Gate
  if (approved !== true) {
    return res.status(403).json({
      success: false,
      status: 'action_rejected',
      error: 'Human approval is required before executing external actions. Set approved: true explicitly.',
      actionState: 'action_pending',
      verificationState: 'unverified'
    });
  }

  if (!goal || !report || !runId) {
    return res.status(400).json({
      success: false,
      status: 'action_failed',
      error: 'Missing required parameters (goal, report, or runId) for external action',
      actionState: 'action_failed',
      verificationState: 'unverified'
    });
  }

  try {
    // 2. Execute GitHub Action
    const actionRes = await createGitHubIssue({ goal, report, runId, options: activeOptions });

    if (!actionRes.success) {
      const isUnavailable = actionRes.status === 'action_unavailable';
      return res.status(isUnavailable ? 503 : 500).json({
        success: false,
        status: actionRes.status,
        message: actionRes.message,
        actionState: isUnavailable ? 'action_unavailable' : 'action_failed',
        verificationState: 'unverified',
        issue: null
      });
    }

    // 3. Verify Created Action
    const issueNumber = actionRes.issue?.number;
    const verificationRes = await verifyGitHubIssue(issueNumber, activeOptions);

    if (verificationRes.verified) {
      return res.json({
        success: true,
        status: 'action_verified',
        message: 'GitHub issue created and verified successfully',
        actionState: 'action_succeeded',
        verificationState: 'action_verified',
        issue: actionRes.issue,
        verificationDetails: verificationRes.details
      });
    }

    return res.status(500).json({
      success: false,
      status: 'verification_failed',
      message: `Action executed but verification failed: ${verificationRes.message}`,
      actionState: 'action_succeeded',
      verificationState: 'action_failed',
      issue: actionRes.issue
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      status: 'action_failed',
      message: `Unexpected error executing external action: ${err.message}`,
      actionState: 'action_failed',
      verificationState: 'unverified'
    });
  }
});

export default router;
