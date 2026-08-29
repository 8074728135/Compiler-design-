import React, { useState } from 'react';
import { runCompilerTests, TestSuiteResult } from '../compiler/tests';
import { CheckCircle2, XCircle, PlayCircle, ShieldAlert, Cpu } from 'lucide-react';

export const TestsPanel: React.FC = () => {
  const [suiteResult, setSuiteResult] = useState<TestSuiteResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunTests = () => {
    setIsRunning(true);
    // Simulate slight lag to feel like real execution
    setTimeout(() => {
      const res = runCompilerTests();
      setSuiteResult(res);
      setIsRunning(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-1.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            AUTOMATED COMPILER TEST SUITE
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Run diagnostic checks verifying tokenizer scanning, grammar parsing, semantic rules, constant folding, and VM execution.
          </p>
        </div>
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold font-mono text-xs rounded transition-colors shadow flex items-center gap-1.5"
        >
          <PlayCircle className="w-4 h-4 fill-slate-950 text-cyan-600" />
          {isRunning ? 'RUNNING...' : 'RUN TESTS'}
        </button>
      </div>

      {suiteResult && (
        <>
          {/* Test Metrics Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg">
              <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">TOTAL TEST CASES</div>
              <div className="text-2xl font-bold text-slate-200">{suiteResult.total}</div>
            </div>
            
            <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg">
              <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">PASSED</div>
              <div className="text-2xl font-bold text-emerald-400">{suiteResult.passed}</div>
            </div>

            <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg">
              <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">FAILED</div>
              <div className="text-2xl font-bold text-red-400">{suiteResult.failed}</div>
            </div>

            <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-lg">
              <div className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">PASS PERCENTAGE</div>
              <div className="text-2xl font-bold text-cyan-400">{suiteResult.passPercentage}%</div>
            </div>
          </div>

          {/* Test Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-slate-800 bg-slate-950 flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300 font-mono">SPECIFICATION RUN LOGS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] leading-relaxed">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">CATEGORY</th>
                    <th className="p-3">TEST SPECIFICATION NAME</th>
                    <th className="p-3 w-28 text-center">STATUS</th>
                    <th className="p-3">ASSERTION DETAIL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {suiteResult.results.map((res, index) => (
                    <tr key={index} className="hover:bg-slate-800/10">
                      <td className="p-3">
                        <span className="px-2 py-0.5 border border-slate-700 bg-slate-950 text-slate-400 rounded text-[9px] font-semibold">
                          {res.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 font-semibold">{res.name}</td>
                      <td className="p-3 text-center">
                        {res.status === 'PASSED' ? (
                          <span className="px-2 py-0.5 border border-emerald-900/60 bg-emerald-950 text-emerald-400 rounded text-[9px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {res.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 border border-red-900/60 bg-red-950 text-red-400 rounded text-[9px] font-bold inline-flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            {res.status}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{res.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!suiteResult && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center text-slate-400 text-sm h-48 flex flex-col justify-center items-center">
          <Cpu className="w-10 h-10 text-slate-600 mb-2" />
          Click the "Run Tests" button above to run the automated compiler specification checks.
        </div>
      )}
    </div>
  );
};
