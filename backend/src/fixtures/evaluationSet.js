/**
 * NichePulse Phase 5B: Reproducible Evaluation Dataset & Metric Definitions
 * Category: PS-01 — Autonomous Agents for Everyday Apps
 *
 * Contains 10 research goals across distinct market niches for benchmark testing.
 */

export const EVALUATION_SET = [
  {
    id: "eval_001",
    nicheCategory: "Sustainable fashion opportunities",
    goal: "Find underserved opportunities in sustainable fashion sizing consistency and return reduction",
    scenario: "normal_research",
    expectedBehavior: "Planner schedules 5 tasks. Reddit + YouTube harvest data, deduplicate, synthesize via Claude, pass 6 verification checks, and display for Human Approval.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_002",
    nicheCategory: "AI tools for college students",
    goal: "Identify key friction points and complaints regarding AI study tools and exam prep apps for college students",
    scenario: "normal_research",
    expectedBehavior: "Harvest student feedback across Reddit/YouTube, extract pain points around citation accuracy and cost, verify evidence traceability.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_003",
    nicheCategory: "Budget fitness apps",
    goal: "Analyze consumer complaints regarding hidden subscription fees and paywalls in budget workout applications",
    scenario: "normal_research",
    expectedBehavior: "Synthesize recurring monetization complaints and extract opportunities for transparent flat-rate fitness tracking.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_004",
    nicheCategory: "Home gardening products",
    goal: "Discover unmet product needs for urban apartment indoor gardening and hydroponic kit maintenance",
    scenario: "normal_research",
    expectedBehavior: "Extract hydroponic maintenance issues, synthesize automated indoor garden monitoring opportunities.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_005",
    nicheCategory: "Creator economy tools",
    goal: "Uncover pain points around short-form video repurposing and multi-platform publishing for solo content creators",
    scenario: "normal_research",
    expectedBehavior: "Identify multi-platform workflow bottlenecks, verify source URLs, and generate strategic tool opportunities.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_006",
    nicheCategory: "Study productivity tools",
    goal: "Analyze audience demand for offline-first active recall and flashcard applications among medical students",
    scenario: "normal_research",
    expectedBehavior: "Extract flashcard sync complaints and offline study requirements from community discussions.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_007",
    nicheCategory: "Pet-care services",
    goal: "Identify customer trust issues and communication gaps in mobile pet grooming and urban dog-walking services",
    scenario: "normal_research",
    expectedBehavior: "Gather pet owner feedback on scheduling delays, synthesize GPS and live video update opportunities.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_008",
    nicheCategory: "Budget travel planning",
    goal: "Uncover hidden stress points and flight disruption management issues for solo budget backpackers",
    scenario: "failure_recovery_scenario",
    expectedBehavior: "Simulate source rate-limiting / failure; trigger bounded recovery loop with fallback fixtures, verify report, and succeed cleanly.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "recoverySuccess", "humanApproved"]
  },
  {
    id: "eval_009",
    nicheCategory: "Niche food delivery problems",
    goal: "Discover consumer complaints regarding eco-friendly packaging leakage and thermal preservation in food delivery",
    scenario: "normal_research",
    expectedBehavior: "Synthesize packaging durability issues and present verified recommendations for food delivery startups.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved"]
  },
  {
    id: "eval_010",
    nicheCategory: "Small-business automation needs",
    goal: "Identify time-consuming invoice processing and receipt reconciliation tasks for freelance contractors",
    scenario: "normal_research",
    expectedBehavior: "Harvest contractor complaints, generate automated receipt parsing opportunities, require human approval, and verify GitHub issue creation.",
    metricsToRecord: ["taskSuccess", "executionTimeMs", "rawEvidenceCount", "deduplicatedCount", "verificationPassed", "recoveryTriggered", "humanApproved", "githubActionStatus"]
  }
];

export const EVALUATION_METRICS_DEFINITION = {
  taskSuccess: "Boolean — Whether all 5 planned tasks executed without unhandled errors",
  executionTimeMs: "Number — Total millisecond duration from goal submission to verified state",
  rawEvidenceCount: "Number — Count of items harvested before deduplication",
  deduplicatedCount: "Number — Count of unique evidence items after exact ID, URL, and Jaccard similarity filtering",
  verificationPassed: "Boolean — Programmatic 6-check verification result (schema, non-emptiness, evidence ID traceability, URL integrity, fixture flag match)",
  recoveryTriggered: "Boolean — Whether bounded recovery loop was activated due to task failure",
  recoverySuccess: "Boolean — Whether recovery attempt succeeded within max attempt bound (2)",
  humanApproved: "Boolean — Explicit state of Human Approval Gate (approved: true required before external action)",
  githubActionStatus: "String — Status of external action creation & verification (action_pending | action_succeeded | action_verified | action_unavailable | action_failed)"
};
