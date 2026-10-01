import React, { useState } from 'react';
import {
  Search, Play, RefreshCw, Zap, CheckCircle2, AlertTriangle,
  ExternalLink, Layers, Sparkles, TrendingUp, HelpCircle,
  FileText, Database, ShieldAlert, MessageSquare, Youtube,
  CheckSquare, ArrowRight, Activity, Server, ShieldCheck, Award
} from 'lucide-react';

export default function ReportDashboard() {
  // Input & execution state
  const [niche, setNiche] = useState('Sustainable fashion ecommerce sizing challenges');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setAgentError] = useState(null);

  // Determine API base URL dynamically
  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return `${import.meta.env.VITE_API_URL}/api/analyze`;
    }
    return '/api/analyze';
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!niche.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setAgentError(null);

    try {
      const endpoint = getApiUrl();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim(), allowFallback: true })
      });

      const data = await response.json();

      if (!response.ok && response.status !== 502) {
        throw new Error(data.error || data.message || `Server error (${response.status})`);
      }

      setResult(data);
    } catch (err) {
      setAgentError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  // Helper values safely extracted from result
  const sources = result?.sources || {};
  const metrics = result?.metrics || {};
  const evidence = result?.evidence || [];
  const analysis = result?.analysis || {};
  const report = analysis.report || {};
  const metadata = report.metadata || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 text-slate-100 font-sans">
      {/* Hero Header & Search Card */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-indigo-300 border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5 fill-current text-indigo-400" />
            <span>NichePulse — AI Niche Intelligence Agent</span>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Research Niche Sentiment & Synthesize Market Insights
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Harvest public discussions across Reddit & YouTube, normalize evidence, deduplicate overlapping signals, and synthesize grounded market intelligence using Anthropic Claude.
            </p>
          </div>

          {/* Research Input Form */}
          <form onSubmit={handleAnalyze} className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Sustainable fashion ecommerce sizing challenges"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium shadow-inner"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !niche.trim()}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Mining & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-indigo-200" />
                    <span>Analyze Niche</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Loading Progress State */}
      {loading && (
        <div className="rounded-3xl bg-slate-900/80 border border-indigo-500/30 p-8 text-center space-y-4 shadow-xl backdrop-blur-md">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">NichePulse Agent at Work</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Aggregating Reddit discussions, fetching YouTube video signals, executing deterministic deduplication, and generating Claude 3.5 insights...
            </p>
          </div>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-indigo-500 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Error Alert State */}
      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 text-rose-300 text-sm flex items-center gap-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-semibold block text-white">Analysis Failed</span>
            <span className="text-xs text-rose-300">{error}</span>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {result && !loading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Status & Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Research Topic</div>
              <div className="text-sm font-bold text-white truncate mt-1">{result.niche}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Harvested Evidence</div>
              <div className="text-sm font-bold text-indigo-400 mt-1">
                {metrics.deduplicatedCount || evidence.length || 0} Items ({metrics.duplicatesRemoved || 0} Deduped)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Source Health</div>
              <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Reddit ({sources.reddit?.status === 'fallback' || sources.reddit?.status === 'missing_credentials' ? 'unavailable — credentials not configured' : (sources.reddit?.status || 'ok')}) • YouTube ({sources.youtube?.status || 'ok'})
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Synthesis Status</div>
              <div className={`text-xs font-bold mt-1 uppercase tracking-wider ${analysis.status === 'live' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {analysis.status || 'Complete'} {metadata.isFixtureData ? '(Demo Fixture)' : ''}
              </div>
            </div>
          </div>

          {/* Synthesized Intelligence Report */}
          {report && (
            <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Synthesized Market Intelligence Report</span>
                </div>
                {analysis.message && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-medium">
                    {analysis.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Topics */}
                {report.topTopics?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Top Niche Topics
                    </h3>
                    <div className="space-y-3">
                      {report.topTopics.map((top, i) => (
                        <div key={i} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                          <div className="font-bold text-white">{top.topic}</div>
                          <p className="text-slate-400 leading-relaxed">{top.summary}</p>
                          {top.evidenceIds?.length > 0 && (
                            <div className="text-[10px] font-mono text-slate-500 pt-1">
                              Evidence: {top.evidenceIds.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emerging Trends */}
                {report.emergingTrends?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Emerging Market Trends
                    </h3>
                    <div className="space-y-3">
                      {report.emergingTrends.map((trend, i) => (
                        <div key={i} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                          <div className="font-bold text-white">{trend.trend}</div>
                          <p className="text-slate-400 leading-relaxed">{trend.description}</p>
                          {trend.evidenceIds?.length > 0 && (
                            <div className="text-[10px] font-mono text-slate-500 pt-1">
                              Evidence: {trend.evidenceIds.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recurring Problems */}
                {report.recurringProblems?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Recurring Consumer Problems
                    </h3>
                    <div className="space-y-3">
                      {report.recurringProblems.map((prob, i) => (
                        <div key={i} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                          <div className="font-bold text-white">{prob.problem}</div>
                          <p className="text-slate-400 leading-relaxed">{prob.impact}</p>
                          {prob.evidenceIds?.length > 0 && (
                            <div className="text-[10px] font-mono text-slate-500 pt-1">
                              Evidence: {prob.evidenceIds.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Opportunities & AI Insights */}
                {(report.opportunities?.length > 0 || report.aiInsights?.length > 0) && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Strategic Opportunities & Insights
                    </h3>
                    <div className="space-y-3">
                      {report.opportunities?.map((opp, i) => (
                        <div key={`opp-${i}`} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                          <div className="font-bold text-white">{opp.opportunity}</div>
                          <p className="text-slate-400 leading-relaxed">{opp.potential || opp.rationale}</p>
                        </div>
                      ))}
                      {report.aiInsights?.map((ins, i) => (
                        <div key={`ins-${i}`} className="text-xs text-slate-300 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                          <div className="font-bold text-white">{ins.insight}</div>
                          <p className="text-slate-400 leading-relaxed">{ins.explanation || ins.grounding}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Source Links */}
              {report.sourceLinks?.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Grounded Source References</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {report.sourceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
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

          {/* Harvested Evidence Raw Cards */}
          {evidence.length > 0 && (
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <span>Harvested Community Evidence ({evidence.length} Items)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidence
                  .filter(item => !(item.source === 'reddit' && item.sourceType === 'fixture'))
                  .map((item, idx) => (
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
                        rel="noopener noreferrer"
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
        </div>
      )}
    </div>
  );
}
