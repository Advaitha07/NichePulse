/**
 * Phase 4: Deterministic Task Planner Service
 * Generates a bounded, validated execution plan for a given research goal.
 */

const ALLOWED_TASK_TYPES = new Set([
  'reddit_search',
  'youtube_search',
  'dedupe',
  'analysis',
  'verification'
]);

/**
 * Creates a standard 5-step research plan for a niche query goal.
 */
export function generatePlan(goal, options = {}) {
  if (!goal || typeof goal !== 'string' || !goal.trim()) {
    return {
      success: false,
      error: 'Research goal is required for planning',
      plan: null
    };
  }

  const cleanGoal = goal.trim();
  const limit = options.limit || 10;

  const plan = {
    goal: cleanGoal,
    createdAt: new Date().toISOString(),
    tasks: [
      {
        taskId: 'task_1_reddit',
        tool: 'reddit_search',
        params: { niche: cleanGoal, limit },
        description: 'Harvest Reddit discussions and market pain points'
      },
      {
        taskId: 'task_2_youtube',
        tool: 'youtube_search',
        params: { niche: cleanGoal, limit },
        description: 'Harvest YouTube video discussions and consumer signals'
      },
      {
        taskId: 'task_3_dedupe',
        tool: 'dedupe',
        params: { threshold: 0.75 },
        description: 'Deduplicate raw evidence across sources'
      },
      {
        taskId: 'task_4_analysis',
        tool: 'analysis',
        params: { niche: cleanGoal },
        description: 'Synthesize evidence with Claude into structured intelligence report'
      },
      {
        taskId: 'task_5_verification',
        tool: 'verification',
        params: {},
        description: 'Perform programmatic verification on generated report'
      }
    ]
  };

  const validation = validatePlan(plan);
  if (!validation.valid) {
    return {
      success: false,
      error: `Plan validation failed: ${validation.errors.join('; ')}`,
      plan: null
    };
  }

  return {
    success: true,
    plan
  };
}

/**
 * Strictly validates plan format, task bounds, and allowed tools.
 */
export function validatePlan(plan) {
  const errors = [];

  if (!plan || typeof plan !== 'object') {
    return { valid: false, errors: ['Plan must be an object'] };
  }

  if (!Array.isArray(plan.tasks) || plan.tasks.length === 0) {
    return { valid: false, errors: ['Plan tasks must be a non-empty array'] };
  }

  if (plan.tasks.length > 10) {
    errors.push(`Plan task count exceeds maximum bound of 10 (got ${plan.tasks.length})`);
  }

  for (let i = 0; i < plan.tasks.length; i++) {
    const task = plan.tasks[i];
    if (!task || typeof task !== 'object') {
      errors.push(`Task at index ${i} is not a valid object`);
      continue;
    }

    if (!task.taskId || typeof task.taskId !== 'string') {
      errors.push(`Task at index ${i} is missing valid taskId`);
    }

    if (!task.tool || typeof task.tool !== 'string') {
      errors.push(`Task at index ${i} is missing valid tool name`);
    } else if (!ALLOWED_TASK_TYPES.has(task.tool)) {
      errors.push(`Task at index ${i} specifies disallowed or unknown tool '${task.tool}'`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
