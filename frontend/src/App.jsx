import React from 'react';
import ReportDashboard from './components/ReportDashboard';
import { Activity, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-white tracking-tight leading-none">
                Niche<span className="text-indigo-400">Pulse</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                AI Niche Intelligence Agent
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Demo Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <ReportDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 bg-slate-950/40 text-center text-xs text-slate-500">
        <p className="max-w-7xl mx-auto px-4">
          NichePulse – AI Niche Intelligence Agent • Multi-Source Evidence Mining & Synthesis
        </p>
      </footer>
    </div>
  );
}
