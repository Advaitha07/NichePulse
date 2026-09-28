import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw, Zap, Server, Layout, ShieldAlert } from 'lucide-react';

export default function ReportDashboard() {
  const [healthStatus, setHealthStatus] = useState({ loading: true, data: null, error: null });

  const checkHealth = async () => {
    setHealthStatus({ loading: true, data: null, error: null });
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setHealthStatus({ loading: false, data, error: null });
    } catch (err) {
      setHealthStatus({ loading: false, data: null, error: err.message });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Phase 1: Project Setup Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              NichePulse Dashboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl">
              AI Niche Intelligence Agent - Ready for content mining from Reddit, YouTube, and multi-source synthesis using Anthropic Claude.
            </p>
          </div>
          <button
            onClick={checkHealth}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${healthStatus.loading ? 'animate-spin' : ''}`} />
            <span>Check Backend Health</span>
          </button>
        </div>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backend Connection Status */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Backend Status</h3>
                <p className="text-xs text-slate-400">Express API Gateway</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Endpoint: /api/health</span>
            {healthStatus.loading ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...
              </span>
            ) : healthStatus.data ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected ({healthStatus.data.status})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" /> Disconnected
              </span>
            )}
          </div>
        </div>

        {/* Frontend Status */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Frontend Client</h3>
                <p className="text-xs text-slate-400">React + Vite + Tailwind</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Running
            </span>
          </div>
        </div>

        {/* Phase Info */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Next Phase</h3>
                <p className="text-xs text-slate-400">Phase 2 API Integrations</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Reddit / YouTube / Claude</span>
            <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded">
              Awaiting Phase 2
            </span>
          </div>
        </div>
      </div>

      {/* Raw Health Check Response Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-sm font-semibold text-white">Live Endpoint Response: GET /api/health</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">http://localhost:5000/api/health</span>
        </div>
        <div className="p-6 font-mono text-sm bg-black/40">
          {healthStatus.loading ? (
            <div className="text-slate-500 italic animate-pulse">Requesting health check status...</div>
          ) : healthStatus.error ? (
            <div className="text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Failed to fetch: {healthStatus.error}. Ensure backend is running on http://localhost:5000.</span>
            </div>
          ) : (
            <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
              {JSON.stringify(healthStatus.data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
