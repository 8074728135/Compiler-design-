import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { ExecutionPanel } from './components/ExecutionPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { TestsPanel } from './components/TestsPanel';
import { DocPanel } from './components/DocPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { DB, Workflow, CompilationRecord, ExecutionRecord } from './services/db';
import { Cpu, Play, BarChart3, HelpCircle, Settings, ClipboardList, Shield, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | undefined>(undefined);

  // Global state loaded from persistence
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [compilations, setCompilations] = useState<CompilationRecord[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);

  // Function to refresh state values from DB
  const refreshData = () => {
    setWorkflows(DB.getWorkflows());
    setCompilations(DB.getCompilations());
    setExecutions(DB.getExecutions());
  };

  useEffect(() => {
    refreshData();
  }, [currentPage]);

  const handleNavigate = (page: string, wfId?: string) => {
    setCurrentPage(page);
    if (wfId) {
      setActiveWorkflowId(wfId);
    } else {
      setActiveWorkflowId(undefined);
    }
  };

  const handleResetAll = () => {
    DB.clearAll();
    refreshData();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800/80 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider font-mono text-slate-100 uppercase">
              FlowSync <span className="text-cyan-400 font-normal">Compiler</span>
            </h1>
            <span className="text-[9px] text-slate-500 font-mono font-bold tracking-wide uppercase">
              Apex Manufacturing Pvt. Ltd.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Identity Principal indicator */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 border border-slate-800/80 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-400 font-mono">
              Principal: <span className="text-slate-300 font-semibold truncate max-w-[150px]">qocth-qyqaa-aaaaa-cai</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          
          <div className="text-[10px] bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
            Internet Identity
          </div>
        </div>
      </header>

      {/* Main Layout split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-56 bg-slate-900 border-r border-slate-800/60 flex flex-col p-4 justify-between">
          <nav className="space-y-1.5">
            <span className="text-[9px] text-slate-600 font-bold font-mono tracking-wider block mb-2 px-2.5">
              WORKSPACES
            </span>

            <button
              onClick={() => handleNavigate('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => handleNavigate('studio')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all ${
                currentPage === 'studio'
                  ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Workflow Studio
            </button>

            <button
              onClick={() => handleNavigate('execution')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all ${
                currentPage === 'execution'
                  ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Play className="w-4 h-4" />
              Execution Simulator
            </button>

            <button
              onClick={() => handleNavigate('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all ${
                currentPage === 'analytics'
                  ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics Console
            </button>

            <button
              onClick={() => handleNavigate('tests')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all ${
                currentPage === 'tests'
                  ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Compiler Tests
            </button>

            <span className="text-[9px] text-slate-600 font-bold font-mono tracking-wider block pt-4 pb-2 px-2.5">
              DOCUMENTATION & CONFIG
            </span>

            <button
              onClick={() => handleNavigate('docs')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all ${
                currentPage === 'docs'
                  ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Language Reference
            </button>

            <button
              onClick={() => handleNavigate('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded transition-all ${
                currentPage === 'settings'
                  ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              System Settings
            </button>
          </nav>

          {/* Sidebar Footer Info */}
          <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5 justify-between">
              <span>CANISTER VM</span>
              <span className="text-emerald-400 font-semibold font-sans">ONLINE</span>
            </div>
            <div className="mt-1 font-sans">Apex Manufacturing © 2026</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {currentPage === 'dashboard' && (
            <Dashboard
              workflows={workflows}
              compilations={compilations}
              executions={executions}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'studio' && (
            <Workspace initialWorkflowId={activeWorkflowId} onNavigate={handleNavigate} />
          )}

          {currentPage === 'execution' && (
            <ExecutionPanel activeWorkflowId={activeWorkflowId} />
          )}

          {currentPage === 'analytics' && <AnalyticsPanel />}

          {currentPage === 'tests' && <TestsPanel />}

          {currentPage === 'docs' && <DocPanel />}

          {currentPage === 'settings' && <SettingsPanel onResetAll={handleResetAll} />}
        </main>
      </div>
    </div>
  );
};
export default App;
