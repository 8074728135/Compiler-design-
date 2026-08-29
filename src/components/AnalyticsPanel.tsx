import React from 'react';
import { DB } from '../services/db';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart3, LineChart as LucideLineChart, PieChart as LucidePieChart, TrendingUp } from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const compilations = DB.getCompilations();
  const executions = DB.getExecutions();

  // 1. Compile Success Rate
  const successCompiles = compilations.filter((c) => c.success).length;
  const failCompiles = compilations.length - successCompiles;
  const compileRateData = [
    { name: 'Success', value: successCompiles, color: '#10b981' },
    { name: 'Failure', value: failCompiles, color: '#ef4444' },
  ];

  // 2. Average Optimization Percentage
  const successfulCompilesList = compilations.filter((c) => c.success);
  const avgReduction =
    successfulCompilesList.length > 0
      ? Math.round(
          successfulCompilesList.reduce((acc, c) => acc + c.reductionPercentage, 0) /
            successfulCompilesList.length
        )
      : 0;

  const originalTotalCount = successfulCompilesList.reduce((acc, c) => acc + c.originalCount, 0);
  const optimizedTotalCount = successfulCompilesList.reduce((acc, c) => acc + c.optimizedCount, 0);
  const sizeReductionData = [
    { name: 'Original', instructions: originalTotalCount },
    { name: 'Optimized', instructions: optimizedTotalCount },
  ];

  // 3. Compile / Execution Durations
  const durationData = successfulCompilesList.map((c, index) => {
    // Map corresponding execution duration if exists
    const exec = executions[index] || { durationMs: 5 };
    return {
      name: `Run ${index + 1}`,
      compile: c.durationMs || 2,
      execute: exec.durationMs || 4,
    };
  });

  // 4. Compiler Error Categories Distribution
  const errorCounts = { Lexical: 0, Syntax: 0, Semantic: 0 };
  compilations.forEach((c) => {
    if (!c.success && c.error) {
      errorCounts[c.error.type]++;
    }
  });
  const errorData = [
    { name: 'Lexical Error', count: errorCounts.Lexical },
    { name: 'Syntax Error', count: errorCounts.Syntax },
    { name: 'Semantic Error', count: errorCounts.Semantic },
  ];

  // 5. Approval Role usage
  const roleCounts: Record<string, number> = {
    manager: 0,
    finance: 0,
    department_head: 0,
    procurement: 0,
  };
  executions.forEach((e) => {
    e.requiredApprovals.forEach((role) => {
      if (role in roleCounts) roleCounts[role]++;
    });
  });
  const roleUsageData = Object.keys(roleCounts).map((role) => ({
    name: role.toUpperCase(),
    value: roleCounts[role],
  }));

  const COLORS = ['#06b6d4', '#3b82f6', '#6366f1', '#a855f7'];

  return (
    <div className="space-y-6">
      {/* Analytics Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            COMPILER ANALYTICS METRICS
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Telemetry reports retrieved dynamically from stored canister compilations and logs.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Average Optimizer Reduction</div>
          <div className="text-xl font-black text-cyan-400 glow-text-cyan">{avgReduction}%</div>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compilation Success Pie */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col h-[280px]">
          <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase mb-4 flex items-center gap-1.5">
            <LucidePieChart className="w-4 h-4 text-cyan-400" /> Compilation Success vs Failure
          </h4>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {compilations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compileRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {compileRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  <Legend verticalAlign="bottom" height={24} iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic">No compilations registered.</div>
            )}
          </div>
        </div>

        {/* Instructions reduction Bar */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col h-[280px]">
          <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Instruction Optimization Size
          </h4>
          <div className="flex-1 min-h-0">
            {successfulCompilesList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sizeReductionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  <Bar dataKey="instructions" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                    <Cell fill="#64748b" />
                    <Cell fill="#06b6d4" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic flex h-full items-center justify-center">
                Compile a valid workflow to view reduction analytics.
              </div>
            )}
          </div>
        </div>

        {/* Line chart durations */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col h-[280px]">
          <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase mb-4 flex items-center gap-1.5">
            <LucideLineChart className="w-4 h-4 text-cyan-400" /> Pipeline Durations (ms)
          </h4>
          <div className="flex-1 min-h-0">
            {durationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={durationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  <Legend iconSize={10} />
                  <Line type="monotone" dataKey="compile" stroke="#06b6d4" strokeWidth={2} name="Compile Time" />
                  <Line type="monotone" dataKey="execute" stroke="#818cf8" strokeWidth={2} name="Execution Time" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic flex h-full items-center justify-center">
                Compile runs are required to measure times.
              </div>
            )}
          </div>
        </div>

        {/* Common Compiler Errors */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col h-[280px]">
          <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Common Compiler Errors
          </h4>
          <div className="flex-1 min-h-0">
            {compilations.some((c) => !c.success) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic flex h-full items-center justify-center">
                No compilation errors recorded yet!
              </div>
            )}
          </div>
        </div>

        {/* Approval role frequency */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col h-[280px] md:col-span-2">
          <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase mb-4 flex items-center gap-1.5">
            <LucidePieChart className="w-4 h-4 text-cyan-400" /> Approval Role Frequency (Runs)
          </h4>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {executions.some((e) => e.requiredApprovals.length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleUsageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
                    dataKey="value"
                  >
                    {roleUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic">No approval steps registered from execution runs.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
