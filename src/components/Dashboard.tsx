import React from 'react';
import { Workflow, CompilationRecord, ExecutionRecord } from '../services/db';
import { ShieldCheck, Cpu, Play, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

interface DashboardProps {
  workflows: Workflow[];
  compilations: CompilationRecord[];
  executions: ExecutionRecord[];
  onNavigate: (page: string, activeWfId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workflows,
  compilations,
  executions,
  onNavigate,
}) => {
  const successCompiles = compilations.filter((c) => c.success).length;
  const compileRate =
    compilations.length > 0
      ? Math.round((successCompiles / compilations.length) * 100)
      : 100;

  const successExecs = executions.filter((e) => e.finalStatus === 'SUCCESS').length;
  const execRate =
    executions.length > 0 ? Math.round((successExecs / executions.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg relative overflow-hidden glow-cyan">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <h2 className="text-2xl font-bold text-slate-100 glow-text-cyan flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-cyan-400" />
          FlowSync Compiler Console
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mt-1">
          Authoritative workflow compiler and execution simulator tailored for Apex Manufacturing Pvt.
          Ltd. Create, optimize, and simulate purchase approval workflows securely.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 rounded-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">SAVED PROCEDURES</div>
            <div className="text-2xl font-bold text-slate-200">{workflows.length}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded-md">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">COMPILATIONS</div>
            <div className="text-2xl font-bold text-slate-200">{compilations.length}</div>
            <div className="text-[10px] text-emerald-400 font-semibold">{compileRate}% Success Rate</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-md">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">EXECUTIONS</div>
            <div className="text-2xl font-bold text-slate-200">{executions.length}</div>
            <div className="text-[10px] text-emerald-400 font-semibold">{execRate}% Success Rate</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 rounded-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">AUTH STATUS</div>
            <div className="text-sm font-bold text-emerald-400">Authenticated</div>
            <div className="text-[9px] text-slate-500 font-mono truncate max-w-[130px]">Internet Identity connected</div>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saved Workflows Panel */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-300 font-mono">ACTIVE WORKFLOW POLICIES</h3>
            <button
              onClick={() => onNavigate('studio')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              + Create New
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[300px] divide-y divide-slate-800/60">
            {workflows.map((wf) => (
              <div key={wf.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 font-mono">{wf.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Version: {wf.version} • Created: {new Date(wf.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('studio', wf.id)}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono border border-slate-700/60"
                  >
                    Open Studio
                  </button>
                  <button
                    onClick={() => onNavigate('execution', wf.id)}
                    className="px-2.5 py-1 text-xs bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded font-mono border border-cyan-800/40"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            ))}
            {workflows.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-sm">
                No workflows found. Head to the settings panel to restore default examples.
              </div>
            )}
          </div>
        </div>

        {/* System Activity Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 font-mono font-bold">SYSTEM ACTIVITY</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3">
            {/* Show mix of compilations & executions in chronological order */}
            {[
              ...compilations.map((c) => ({
                type: 'compile',
                success: c.success,
                title: `Compiled ${c.workflowName}`,
                time: c.compiledAt,
                desc: c.success ? `Reduced instruction set by ${c.reductionPercentage}%` : c.error?.message,
              })),
              ...executions.map((e) => ({
                type: 'execute',
                success: e.finalStatus === 'SUCCESS',
                title: `Executed ${e.workflowName}`,
                time: e.executedAt,
                desc: `Amount: $${e.amount.toLocaleString()} | Approvals: ${e.requiredApprovals.join(', ') || 'None'}`,
              })),
            ]
              .sort((a, b) => b.time - a.time)
              .slice(0, 5)
              .map((act, index) => (
                <div key={index} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5">
                    {act.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-300 truncate">{act.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{act.desc}</p>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(act.time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

            {compilations.length === 0 && executions.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-sm">
                No recent compilation or simulation logs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
