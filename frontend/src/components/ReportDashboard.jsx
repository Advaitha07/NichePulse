import React, { useState, useEffect } from 'react';
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Zap, Server, ShieldAlert,
  Play, CheckSquare, AlertTriangle, ExternalLink, ShieldCheck, ArrowRight, FileText,
  TrendingUp, HelpCircle, Layers, Cpu, CornerDownRight, Search, Database, Sparkles,
  GitPullRequest, Compass, MessageSquare, Youtube, Share2, Award, Clock
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

  // Helper to calculate workflow step status
  const getStepStatus = (stepKey) => {
    if (!agentState) return agentRunning ? 'active' : 'idle';
    const trace = agentState.trace || [];
    
    if (stepKey === 'plan') return agentState.plan ? 'completed' : 'idle';
    if (stepKey === 'collect') {
      const hasHarvest = trace.some(t => t.step === 'reddit_search' || t.step === 'youtube_search');
      return hasHarvest ? 'completed' : 'idle';
    }
    if (stepKey === 'dedupe') return trace.some(t => t.step === 'dedupe') ? 'completed' : 'idle';
    if (stepKey === 'analyze') return agentState.report ? 'completed' : 'idle';
    if (stepKey === 'verify') return agentState.verification ? (agentState.verification.passed ? 'completed' : 'failed') : 'idle';
    if (stepKey === 'recover') return agentState.recoveryAttempts?.length > 0 ? 'recovered' : 'skipped';
    if (stepKey === 'complete') return agentState.status === 'completed' ? 'completed' : 'idle';
    return 'idle';
  };

  const workflowSteps = [
    { key: 'plan', label: '1. Plan', icon: Layers, desc: 'AI Task Allocation' },
    { key: 'collect', label: '2. Harvest', icon: Search, desc: 'Reddit + YouTube APIs' },
    { key: 'dedupe', label: '3. Dedupe', icon: Database, desc: 'Exact ID & URL Check' },
    { key: 'analyze', label: '4. Analyze', icon: Sparkles, desc: 'Claude 3.5 Synthesis' },
    { key: 'verify', label: '5. Verify', icon: ShieldCheck, desc: '6-Check Logic Rules' },
    { key: 'recover', label: '6. Recover', icon: AlertTriangle, desc: 'Bounded Retry Loop' },
    { key: 'complete', label: '7. Complete', icon: Award, desc: 'Human Approval Gate' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-600/25 ring-1 ring-white/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">NichePulse</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                PS-01 Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Autonomous Market Research & Intelligence Operating System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Health Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Backend:</span>
            {healthStatus.loading ? (
              <span className="text-amber-400 animate-pulse font-mono">Checking...</span>
            ) : healthStatus.data ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">Offline</span>
            )}
          </div>

          <button
            onClick={checkHealth}
            title="Refresh Backend Status"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${healthStatus.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Hero Input Card */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Launch Niche Market Discovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Enter a target audience pain point or niche query. The autonomous agent will plan tasks, mine Reddit & YouTube, deduplicate content, synthesize insights with Claude 3.5, run 6-check verification, and prompt for human approval before external export.
            </p>
          </div>

          <form onSubmit={handleRunAgent} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Sustainable fashion ecommerce sizing challenges"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium shadow-inner"
                  disabled={agentRunning}
                />
              </div>

              <button
                type="submit"
                disabled={agentRunning || !goal.trim()}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              >
                {agentRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Agent Orchestrating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-indigo-200" />
                    <span>Execute Research Agent</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Agent Execution Error */}
      {agentError && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 text-rose-300 text-sm flex items-center gap-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-semibold block text-white">Agent Execution Interrupted</span>
            <span className="text-xs text-rose-300">{agentError}</span>
          </div>
        </div>
      )}

      {/* Visual Agent Workflow Stepper */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Autonomous Agent Workflow Pipeline</span>
          </div>
          {agentState && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Run ID: <strong className="text-indigo-400">{agentState.runId}</strong></span>
              {agentState.metadata?.isFixtureEvidence && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Demo Fixtures
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {workflowSteps.map((step) => {
            const IconComponent = step.icon;
            const status = getStepStatus(step.key);

            let statusBg = 'bg-slate-950/60 border-slate-800/80 text-slate-500';
            let iconBg = 'bg-slate-900 text-slate-600';

            if (status === 'completed') {
              statusBg = 'bg-indigo-950/40 border-indigo-500/30 text-slate-200 shadow-lg shadow-indigo-500/5';
              iconBg = 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
            } else if (status === 'active') {
              statusBg = 'bg-purple-950/50 border-purple-500/40 text-purple-200 animate-pulse';
              iconBg = 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
            } else if (status === 'recovered') {
              statusBg = 'bg-amber-950/40 border-amber-500/30 text-amber-200';
              iconBg = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            } else if (status === 'failed') {
              statusBg = 'bg-rose-950/40 border-rose-500/30 text-rose-200';
              iconBg = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            }

            return (
              <div key={step.key} className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${statusBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${iconBg}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {status === 'recovered' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{step.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Results Dashboard */}
      {agentState && (
        <div className="space-y-8">
          {/* Metadata & Performance Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Agent Status</div>
              <div className="text-base font-bold text-emerald-400 capitalize mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {agentState.status}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Harvested Evidence</div>
              <div className="text-base font-bold text-indigo-400 mt-1">
                {agentState.evidence?.length || 0} Deduplicated Items
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Verification Engine</div>
              <div className={`text-base font-bold mt-1 ${agentState.verification?.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {agentState.verification?.passed ? '6 / 6 Checks Passed' : 'Verification Failed'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Recovery Events</div>
              <div className="text-base font-bold text-amber-400 mt-1">
                {agentState.recoveryAttempts?.length || 0} Bounded Retries
              </div>
            </div>
          </div>

          {/* Grid Layout: AI Plan & Timeline Execution Trace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Task Execution Plan Card */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Layers className="w-4 h-4" />
                    <span>Validated AI Execution Plan</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {agentState.plan?.tasks?.length || 0} Tasks Validated
                  </span>
                </div>

                <div className="space-y-3">
                  {agentState.plan?.tasks?.map((task, idx) => (
                    <div key={task.taskId || idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-start justify-between gap-3 hover:border-slate-700 transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-200 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{task.tool}</span>
                        </div>
                        <div className="text-slate-400 pl-7">{task.description}</div>
                      </div>
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 shrink-0">
                        {task.taskId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Trace Timeline & Bounded Recovery Card */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Live Agent Execution Timeline</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Steps: {agentState.trace?.length || 0}</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {agentState.trace?.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                      <div className="flex items-center gap-2.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-200 capitalize">{t.step}</span>
                          {t.taskId && <span className="text-[10px] font-mono text-slate-500 ml-2">({t.taskId})</span>}
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'success' || t.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        t.status === 'started' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bounded Recovery Alert Callout */}
                {agentState.recoveryAttempts?.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2 shadow-inner">
                    <div className="font-bold flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Bounded Failure Recovery Triggered ({agentState.recoveryAttempts.length} Event)</span>
                    </div>
                    {agentState.recoveryAttempts.map((r, i) => (
                      <div key={i} className="text-[11px] text-amber-300/90 pl-6 space-y-0.5">
                        <div><strong>Failed Tool:</strong> {r.tool} ({r.reason})</div>
                        <div><strong>Recovery Action:</strong> {r.action} → Result: <span className="font-semibold text-emerald-400">{r.result}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Harvested & Deduplicated Evidence Cards */}
          {agentState.evidence?.length > 0 && (
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <span>Harvested & Deduplicated Community Evidence ({agentState.evidence.length} Items)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Normalized Jaccard Threshold: 0.75</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentState.evidence.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.source === 'reddit' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {item.source === 'reddit' ? <MessageSquare className="w-3 h-3" /> : <Youtube className="w-3 h-3" />}
                        {item.source} ({item.sourceType || 'live'})
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-200 line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.text}</p>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium pt-1"
                      >
                        <span>View Source Post</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Programmatic Verification Engine Results */}
          {agentState.verification && (
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Programmatic 6-Check Verification Engine</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  agentState.verification.passed ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}>
                  {agentState.verification.passed ? 'ALL 6 CHECKS PASSED' : 'VERIFICATION FAILED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {agentState.verification.checks?.map((check, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col justify-between gap-2">
                    <div className="font-mono text-[11px] text-slate-300 font-semibold">{check.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{check.details}</span>
                      {check.passed ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold text-[10px]">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Synthesized Intelligence Report Cards */}
          {agentState.report && (
            <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Synthesized Market Intelligence Report</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>Model: <strong>{agentState.report.metadata?.model || 'claude-3-5-sonnet'}</strong></span>
                  <span>Evidence: <strong>{agentState.report.metadata?.evidenceCount || 0} Items</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emerging Trends */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Emerging Market Trends
                  </h3>
                  <div className="space-y-3">
                    {agentState.report.emergingTrends?.map((trend, i) => (
                      <div key={i} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>{trend.trend}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Signal: {trend.signalStrength || 'high'}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">{trend.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic Opportunities */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Strategic Product Opportunities
                  </h3>
                  <div className="space-y-3">
                    {agentState.report.opportunities?.map((opp, i) => (
                      <div key={i} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                        <div className="font-bold text-white">{opp.opportunity}</div>
                        <p className="text-slate-400 leading-relaxed">{opp.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recurring Problems */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Recurring Consumer Problems
                  </h3>
                  <div className="space-y-3">
                    {agentState.report.recurringProblems?.map((prob, i) => (
                      <div key={i} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                        <div className="font-bold text-white">{prob.problem}</div>
                        <p className="text-slate-400 leading-relaxed">{prob.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Grounded AI Insights
                  </h3>
                  <div className="space-y-3">
                    {agentState.report.aiInsights?.map((ins, i) => (
                      <div key={i} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                        <div className="font-bold text-white">{ins.insight}</div>
                        <p className="text-slate-400 leading-relaxed">{ins.grounding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verified Source Links */}
              {agentState.report.sourceLinks?.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">Preserved & Verified Source References</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {agentState.report.sourceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 rounded-xl border border-indigo-500/20 transition-all shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="truncate max-w-xs">{link.title || link.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Human Approval Gate & External GitHub Action Card (Phase 5A) */}
          <section className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Human Approval Gate (PS-01 Compliance)</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">Authorize External Action Dispatch</h3>
                <p className="text-xs text-slate-300">Explicit human approval required before creating external GitHub issues.</p>
              </div>

              <button
                onClick={() => setApproved(!approved)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-200 border shadow-xl ${
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
            <div className="text-xs flex items-center gap-2.5">
              <span className="text-slate-400 font-medium">Approval State:</span>
              <span className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
                approved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {approved ? 'Approved (approved: true)' : 'Pending Approval (approved: false)'}
              </span>
            </div>

            {/* External Action Button & Status */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">External Action: Create Verified GitHub Issue</h4>
                <p className="text-xs text-slate-400">Dispatches research goal, key opportunities, and verified source links directly to GitHub.</p>
              </div>

              <button
                onClick={handleExecuteAction}
                disabled={!approved || actionExecuting}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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

            {/* Action Output Display */}
            {actionResult && (
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs space-y-3 shadow-inner">
                {actionResult.status === 'action_unavailable' ? (
                  <div className="text-amber-400 flex items-center gap-2.5 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{actionResult.message}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400 font-medium">Action Dispatch State:</span>
                      <span className="font-mono text-emerald-400 font-bold">{actionResult.actionState}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-400 font-medium">Remote Issue Verification:</span>
                      <span className="font-mono text-emerald-400 font-bold">{actionResult.verificationState}</span>
                    </div>
                    {actionResult.issue?.url && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-slate-200 font-bold">Verified GitHub Issue Link:</span>
                        <a
                          href={actionResult.issue.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-bold underline text-xs"
                        >
                          Issue #{actionResult.issue.number} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {actionError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Action Error: {actionError}</span>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
