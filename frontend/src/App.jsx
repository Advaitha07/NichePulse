import React from 'react';
import ReportDashboard from './components/ReportDashboard';
import { Activity } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Niche<span className="text-indigo-400">Pulse</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              Phase 1 Setup Verified
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-4">
        <ReportDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>NichePulse – AI Niche Intelligence Agent • Phase 1 Infrastructure</p>
      </footer>
    </div>
  );
}
