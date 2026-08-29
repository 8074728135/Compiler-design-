import React, { useState, useEffect } from 'react';
import { Workflow, DB } from '../services/db';
import { tokenize } from '../compiler/lexer';
import { parse } from '../compiler/parser';
import { analyze } from '../compiler/analyzer';
import { generateIR } from '../compiler/ir';
import { optimizeIR } from '../compiler/optimizer';
import { executeWorkflow, ExecutionStep } from '../compiler/executor';
import { PlayCircle, ShieldCheck, UserCheck, AlertTriangle, MessageSquare, ListCollapse } from 'lucide-react';

interface ExecutionPanelProps {
  activeWorkflowId?: string;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ activeWorkflowId }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Inputs
  const [amount, setAmount] = useState<number>(75000);
  const [quantity, setQuantity] = useState<number>(10);
  const [department, setDepartment] = useState<string>('Production');
  const [priority, setPriority] = useState<string>('High');

  // Outputs
  const [executionRun, setExecutionRun] = useState<{
    steps: ExecutionStep[];
    required: string[];
    skipped: string[];
    notified: string[];
    status: 'SUCCESS' | 'REJECTED';
  } | null>(null);
  
  const [compileErr, setCompileErr] = useState<string | null>(null);

  useEffect(() => {
    const list = DB.getWorkflows();
    setWorkflows(list);
    if (activeWorkflowId) {
      setSelectedId(activeWorkflowId);
    } else if (list.length > 0) {
      setSelectedId(list[0].id);
    }
  }, [activeWorkflowId]);

  const handleRun = () => {
    setCompileErr(null);
    setExecutionRun(null);

    const activeWf = workflows.find((w) => w.id === selectedId);
    if (!activeWf) return;

    try {
      // 1. Compile authoritatively on the spot to verify correct status before run!
      const tokens = tokenize(activeWf.source);
      const ast = parse(tokens);
      analyze(ast);
      const ir = generateIR(ast);
      const opt = optimizeIR(ir);

      // 2. Execute using Simulator Engine
      const res = executeWorkflow(opt.optimized, {
        amount,
        quantity,
        department,
        priority,
      });

      setExecutionRun({
        steps: res.steps,
        required: res.requiredApprovals,
        skipped: res.skippedApprovals,
        notified: res.sentNotifications,
        status: res.finalStatus,
      });

      // Save execution trace to DB
      DB.addExecution({
        workflowId: activeWf.id,
        workflowName: activeWf.name,
        amount,
        quantity,
        department,
        priority,
        requiredApprovals: res.requiredApprovals,
        skippedApprovals: res.skippedApprovals,
        sentNotifications: res.sentNotifications,
        finalStatus: res.finalStatus,
        durationMs: 12,
        stepsJson: JSON.stringify(res.steps),
      });

    } catch (err: any) {
      // If compile fails, execution is blocked
      setCompileErr(err.message || String(err));
      alert('Compilation error! Workflow cannot be run.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Simulation Controller */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            SIMULATOR ENVIRONMENT
          </h3>
        </div>

        {/* Target selection */}
        <div>
          <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1.5">
            Target Workflow
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded font-mono font-semibold focus:outline-none focus:border-cyan-500"
          >
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.name}
              </option>
            ))}
          </select>
        </div>

        {/* Variables Inputs */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">
              Purchase Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2 rounded focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">
              Purchase Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2 rounded focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2 rounded focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Production">Production</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2 rounded focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRun}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs rounded transition-colors shadow flex items-center justify-center gap-1.5"
        >
          <PlayCircle className="w-4 h-4 fill-slate-950 text-cyan-600" />
          RUN WORKFLOW
        </button>

        {compileErr && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded text-xs text-red-400">
            <h4 className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Workflow Blocked
            </h4>
            <p className="mt-1 text-slate-300 font-mono text-[11px] leading-relaxed">{compileErr}</p>
          </div>
        )}
      </div>

      {/* Simulation Trace and Outputs */}
      <div className="md:col-span-2 space-y-6">
        {executionRun ? (
          <>
            {/* Status overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Approval status */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" /> Required Approvals
                </h4>
                <div className="space-y-2">
                  {executionRun.required.map((role) => (
                    <div
                      key={role}
                      className="px-2.5 py-1 text-xs bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 rounded font-mono font-semibold"
                    >
                      • {role} (PENDING APPROVAL)
                    </div>
                  ))}
                  {executionRun.skipped.map((role) => (
                    <div
                      key={role}
                      className="px-2.5 py-1 text-xs bg-slate-950/40 border border-slate-800/40 text-slate-500 rounded font-mono"
                    >
                      • {role} (SKIPPED)
                    </div>
                  ))}
                  {executionRun.required.length === 0 && (
                    <div className="text-xs text-slate-500 italic">No approvals required.</div>
                  )}
                </div>
              </div>

              {/* Notifications / Final Status */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-400" /> Notifications Sent
                  </h4>
                  <div className="space-y-1">
                    {executionRun.notified.map((target, idx) => (
                      <div key={idx} className="text-xs text-slate-300 font-mono">
                        ✓ Dispatched alert to: <span className="text-cyan-400 font-semibold">{target}</span>
                      </div>
                    ))}
                    {executionRun.notified.length === 0 && (
                      <div className="text-xs text-slate-500 italic">No notifications sent.</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">OUTCOME:</span>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold font-mono tracking-wider shadow ${
                      executionRun.status === 'SUCCESS'
                        ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400'
                        : 'bg-red-950 border border-red-500/30 text-red-400'
                    }`}
                  >
                    {executionRun.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Trace Logs Console */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center gap-1.5">
                <ListCollapse className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300 font-mono">EXECUTION LOGGER TRACE</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] leading-relaxed">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3 w-16 text-center">STEP</th>
                      <th className="p-3">OPERATION</th>
                      <th className="p-3 w-28 text-center">STATUS</th>
                      <th className="p-3">RESULT DETAILS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {executionRun.steps.map((step) => {
                      let pillClass = 'bg-slate-950 border-slate-800 text-slate-400';
                      if (step.status === 'SUCCESS' || step.status === 'TRUE') {
                        pillClass = 'bg-emerald-950 border-emerald-900/60 text-emerald-400';
                      } else if (step.status === 'REQUIRED') {
                        pillClass = 'bg-indigo-950 border-indigo-900/60 text-indigo-400';
                      } else if (step.status === 'SKIPPED') {
                        pillClass = 'bg-slate-950 border-slate-800/60 text-slate-500';
                      } else if (step.status === 'FALSE' || step.status === 'REJECTED') {
                        pillClass = 'bg-red-950 border-red-900/60 text-red-400';
                      }

                      return (
                        <tr key={step.stepNumber} className="hover:bg-slate-800/10">
                          <td className="p-3 text-center text-slate-500 font-bold">{step.stepNumber}</td>
                          <td className="p-3 text-slate-200 font-bold">{step.operation}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 border rounded text-[9px] font-bold ${pillClass}`}>
                              {step.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{step.message}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center text-slate-400 text-sm h-full flex flex-col justify-center items-center">
            <PlayCircle className="w-10 h-10 text-slate-600 mb-2.5" />
            Select workflow and parameters, then click "Run Workflow" to stream execution steps.
          </div>
        )}
      </div>
    </div>
  );
};
