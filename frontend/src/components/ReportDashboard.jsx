import React, { useState, useEffect } from 'react';
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Zap, Server, Layout, ShieldAlert,
  Play, CheckSquare, AlertTriangle, ExternalLink, ShieldCheck, ArrowRight, FileText,
  TrendingUp, HelpCircle, Layers, Cpu, CornerDownRight
} from 'lucide-react';

export default function ReportDashboard() {
  const [healthStatus, setHealthStatus] = useState({ loading: true, data: null, error: null });

  // Agent input & execution state
  const [goal, setGoal] = useState('Sustainable fashion ecommerce sizing challenges');
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentState, setAgentState] = useState(null); // full result from /api/agent/run
  const [agentError, setAgentError] = useState(null);

  // Human Approval & External Action state
  const [approved, setApproved] = useState(false);
  const [actionExecuting, setActionExecuting] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [actionError, setActionError] = useState(null);

  const checkHealth = async () => {
    setHealthStatus({ loading: true, data: null, error: null });
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
      const data = await response.json();
      setHealthStatus({ loading: false, data, error: null });
    } catch (err) {
      setHealthStatus({ loading: false, data: null, error: err.message });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleRunAgent = async (e) => {
    if (e) e.preventDefault();
    if (!goal.trim() || agentRunning) return;

    setAgentRunning(true);
    setAgentState(null);
    setAgentError(null);
    setApproved(false);
    setActionResult(null);
    setActionError(null);

    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim() })
      });

      const data = await response.json();

      if (!response.ok && response.status !== 502) {
        throw new Error(data.error || 'Agent execution failed');
      }

      setAgentState(data);
    } catch (err) {
      setAgentError(err.message);
    } finally {
      setAgentRunning(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!approved || !agentState?.report || actionExecuting) return;

    setActionExecuting(true);
    setActionResult(null);
    setActionError(null);

    try {
      const response = await fetch('/api/agent/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: true,
          goal: agentState.goal,
          report: agentState.report,
          runId: agentState.runId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.status === 'action_unavailable') {
          setActionResult({ status: 'action_unavailable', message: data.message });
        } else {
          setActionError(data.message || data.error || 'External action failed');
        }
      } else {
        setActionResult(data);
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionExecuting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>PS-01 — Autonomous Research Agent Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              NichePulse Autonomous Agent
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl">
              End-to-end research automation: AI Planning → Harvesting → Deduplication → Claude Synthesis → Programmatic Verification → Human Approval → Verified External Action.
            </p>
          </div>
          <button
            onClick={checkHealth}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${healthStatus.loading ? 'animate-spin' : ''}`} />
            <span>Health Check</span>
          </button>
        </div>
      </div>

      {/* Goal Input & Trigger Form */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <form onSubmit={handleRunAgent} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            Enter Niche Research Goal
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Sustainable fashion ecommerce sizing challenges"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              disabled={agentRunning}
            />
            <button
              type="submit"
              disabled={agentRunning || !goal.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {agentRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Agent Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Autonomous Agent</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Agent Execution Error */}
      {agentError && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Agent execution error: {agentError}</span>
        </div>
      )}

      {/* Live Agent Dashboard & Results */}
      {agentState && (
        <div className="space-y-8">
          {/* Status & Run ID Banner */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${agentState.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Agent Run Status:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${agentState.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                    {agentState.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">Run ID: {agentState.runId}</div>
              </div>
            </div>

            {agentState.metadata?.isFixtureEvidence && (
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
                Demo Fixture Mode
              </span>
            )}
          </div>

          {/* Grid Layout: Plan & Execution Trace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Plan Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <Layers className="w-4 h-4" />
                    <span>AI Execution Plan ({agentState.plan?.tasks?.length || 0} Tasks)</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Validated</span>
                </div>
                <div className="space-y-3">
                  {agentState.plan?.tasks?.map((task, idx) => (
                    <div key={task.taskId || idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-200">{idx + 1}. {task.tool}</div>
                        <div className="text-slate-400 mt-0.5">{task.description}</div>
                      </div>
                      <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded shrink-0">{task.taskId}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Trace & Recovery Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Execution Trace & Recovery</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Steps: {agentState.trace?.length || 0}</span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {agentState.trace?.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="w-3 h-3 text-slate-500" />
                        <span className="font-medium text-slate-300 capitalize">{t.step}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        t.status === 'success' || t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                        t.status === 'started' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>

                {agentState.recoveryAttempts?.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bounded Recovery Triggered ({agentState.recoveryAttempts.length})</span>
                    </div>
                    {agentState.recoveryAttempts.map((r, i) => (
                      <div key={i} className="text-[11px] text-amber-400/90 pl-5">
                        Task: {r.tool} | Action: {r.action} | Result: {r.result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Programmatic Verification Card */}
          {agentState.verification && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Programmatic Verification (6 Checks)</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  agentState.verification.passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {agentState.verification.passed ? 'ALL CHECKS PASSED' : 'VERIFICATION FAILED'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agentState.verification.checks?.map((check, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between">
                    <span className="text-slate-300 font-mono">{check.name}</span>
                    {check.passed ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Intelligence Report Card */}
          {agentState.report && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-base">
                  <FileText className="w-5 h-5" />
                  <span>Synthesized Market Intelligence Report</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Evidence Count: {agentState.report.metadata?.evidenceCount || 0}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emerging Trends */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-indigo-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Emerging Trends
                  </h3>
                  <div className="space-y-2">
                    {agentState.report.emergingTrends?.map((trend, i) => (
                      <div key={i} className="text-xs text-slate-300 border-b border-slate-800/50 pb-2">
                        <div className="font-semibold text-white">{trend.trend}</div>
                        <div className="text-slate-400 mt-0.5">{trend.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-purple-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Strategic Opportunities
                  </h3>
                  <div className="space-y-2">
                    {agentState.report.opportunities?.map((opp, i) => (
                      <div key={i} className="text-xs text-slate-300 border-b border-slate-800/50 pb-2">
                        <div className="font-semibold text-white">{opp.opportunity}</div>
                        <div className="text-slate-400 mt-0.5">{opp.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Source Links */}
              {agentState.report.sourceLinks?.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Verified Source References</h4>
                  <div className="flex flex-wrap gap-2">
                    {agentState.report.sourceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-xs">{link.title || link.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Human Approval Gate Card (Phase 5A) */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Human Approval Gate</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Review & Authorize External Action</h3>
                <p className="text-xs text-slate-400">Explicit human approval required before creating external GitHub issues.</p>
              </div>

              <button
                onClick={() => setApproved(!approved)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border shadow-lg ${
                  approved
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40 shadow-emerald-600/25'
                    : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500/40 shadow-purple-600/25'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>{approved ? 'Approved (Click to Revoke)' : 'Approve Report for Export'}</span>
              </button>
            </div>

            {/* Approval Status Indicator */}
            <div className="text-xs flex items-center gap-2">
              <span className="text-slate-400">Approval State:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                approved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {approved ? 'Approved (approved: true)' : 'Pending Approval (approved: false)'}
              </span>
            </div>

            {/* External Action Button */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">External Action: Create Verified GitHub Issue</h4>
                <p className="text-xs text-slate-400">Posts goal, opportunities, insights, and verified source links to GitHub.</p>
              </div>

              <button
                onClick={handleExecuteAction}
                disabled={!approved || actionExecuting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {actionExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing & Verifying...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Create & Verify GitHub Issue</span>
                  </>
                )}
              </button>
            </div>

            {/* Action State & Verification Result Display */}
            {actionResult && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                {actionResult.status === 'action_unavailable' ? (
                  <div className="text-amber-400 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{actionResult.message}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Action State:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{actionResult.actionState}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400">Verification State:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{actionResult.verificationState}</span>
                    </div>
                    {actionResult.issue?.url && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-slate-300 font-medium">Verified GitHub Issue:</span>
                        <a
                          href={actionResult.issue.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold underline"
                        >
                          Issue #{actionResult.issue.number} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Action Error: {actionError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
