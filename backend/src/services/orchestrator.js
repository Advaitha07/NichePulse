/**
 * Phase 4: Autonomous Research Orchestrator Service
 * Coordinates goal → plan → execute → dedupe → analyze → verify → bounded recovery loop.
 */

import { generatePlan, validatePlan } from './planner.js';
import { executeTask } from './executor.js';

const MAX_RECOVERY_ATTEMPTS = 2;

/**
 * Creates initial agent state object.
 */
function createRunState(goal, runId) {
  return {
    runId: runId || `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    goal,
    status: 'initialized',
    plan: null,
    completedTasks: [],
    failedTasks: [],
    evidence: [],
    report: null,
    verification: null,
    recoveryAttempts: [],
    trace: [],
    metadata: {
      startedAt: new Date().toISOString(),
      completedAt: null,
      isFixtureEvidence: false,
      recoveryCount: 0
    }
  };
}

/**
 * Appends step record to structured trace log.
 */
function logTrace(state, step, status, details = {}) {
  state.trace.push({
    step,
    status,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Runs the autonomous research agent loop for a given goal.
 */
export async function runAgent(goal, options = {}) {
  const state = createRunState(goal, options.runId);
  logTrace(state, 'initialization', 'success', { runId: state.runId, goal });

  // 1. Generate & Validate Plan
  state.status = 'planning';
  logTrace(state, 'planning', 'started');

  const planResult = generatePlan(goal, options);
  if (!planResult.success) {
    state.status = 'failed';
    logTrace(state, 'planning', 'failed', { error: planResult.error });
    return state;
  }

  state.plan = planResult.plan;
  logTrace(state, 'planning', 'success', { taskCount: state.plan.tasks.length });

  // Execution working variables
  const rawEvidence = [];
  const sourceMetadata = { reddit: null, youtube: null };
  let currentRecoveryAttempts = 0;

  // 2. Execute Tasks Bounded Sequence
  state.status = 'executing';

  for (const task of state.plan.tasks) {
    logTrace(state, task.tool, 'started', { taskId: task.taskId });

    let execContext = {
      goal,
      allowFallback: options.allowFallback ?? true,
      rawEvidence,
      evidence: state.evidence,
      report: state.report,
      metadata: state.metadata,
      isFixtureEvidence: state.metadata.isFixtureEvidence,
      clientOverride: options.clientOverride
    };

    let record = await executeTask(task, execContext);

    // 3. Bounded Recovery Loop if Task Failed
    if (!record.success) {
      logTrace(state, task.tool, 'failed', { error: record.error });

      if (currentRecoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
        currentRecoveryAttempts++;
        state.metadata.recoveryCount = currentRecoveryAttempts;

        const recoveryRecord = {
          taskId: task.taskId,
          tool: task.tool,
          reason: record.error || 'Tool execution failure',
          action: 'retry_with_fallback',
          attempt: currentRecoveryAttempts,
          result: 'pending'
        };

        logTrace(state, 'recovery', 'started', { attempt: currentRecoveryAttempts, tool: task.tool });

        // Retry task with fallback enabled explicitly
        const retryContext = { ...execContext, allowFallback: true };
        const retryRecord = await executeTask(task, retryContext);

        if (retryRecord.success) {
          recoveryRecord.result = 'success';
          record = retryRecord;
          logTrace(state, 'recovery', 'success', { attempt: currentRecoveryAttempts, tool: task.tool });
        } else {
          recoveryRecord.result = 'failed';
          logTrace(state, 'recovery', 'failed', { attempt: currentRecoveryAttempts, tool: task.tool, error: retryRecord.error });
        }

        state.recoveryAttempts.push(recoveryRecord);
      }
    }

    // Process Task Outcome
    if (record.success) {
      state.completedTasks.push(record);
      logTrace(state, task.tool, 'success', { evidenceCount: record.evidenceCount });

      // Handle Task Outputs
      if (task.tool === 'reddit_search' && record.result?.items) {
        rawEvidence.push(...record.result.items);
        sourceMetadata.reddit = record.result;
        if (record.result.status === 'fallback') state.metadata.isFixtureEvidence = true;
      }

      if (task.tool === 'youtube_search' && record.result?.items) {
        rawEvidence.push(...record.result.items);
        sourceMetadata.youtube = record.result;
        if (record.result.status === 'fallback') state.metadata.isFixtureEvidence = true;
      }

      if (task.tool === 'dedupe' && record.result?.items) {
        state.evidence = record.result.items;
        if (state.evidence.some(item => item.sourceType === 'fixture')) {
          state.metadata.isFixtureEvidence = true;
        }
      }

      if (task.tool === 'analysis' && record.result?.report) {
        state.report = record.result.report;
      }

      if (task.tool === 'verification' && record.result) {
        state.verification = record.result;
      }
    } else {
      state.failedTasks.push(record);

      // Non-fatal isolation: if one source fails but evidence/report can continue, proceed; otherwise fail
      if (task.tool === 'analysis' || task.tool === 'verification') {
        state.status = 'failed';
        state.metadata.completedAt = new Date().toISOString();
        logTrace(state, 'orchestration', 'failed', { reason: record.error });
        return state;
      }
    }
  }

  // 4. Final State Determination
  const verificationPassed = Boolean(state.verification?.passed);
  if (verificationPassed) {
    state.status = 'completed';
    logTrace(state, 'orchestration', 'completed', { reportGenerated: Boolean(state.report) });
  } else {
    state.status = 'failed';
    logTrace(state, 'orchestration', 'failed', { reason: 'Final report verification failed' });
  }

  state.metadata.completedAt = new Date().toISOString();
  return state;
}
