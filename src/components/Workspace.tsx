import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Workflow, DB } from '../services/db';
import { tokenize, Token } from '../compiler/lexer';
import { parse, ProgramNode, CompileError } from '../compiler/parser';
import { analyze } from '../compiler/analyzer';
import { generateIR, formatIR, IRInstruction } from '../compiler/ir';
import { optimizeIR, OptimizationResult } from '../compiler/optimizer';
import { generateExecutionPlan } from '../compiler/executor';
import { Visualizer } from './Visualizer';
import { Play, Save, RotateCcw, AlignLeft, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

interface WorkspaceProps {
  initialWorkflowId?: string;
  onNavigate: (page: string, activeWfId?: string) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ initialWorkflowId, onNavigate }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWfId, setSelectedWfId] = useState<string>('');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [editorMode, setEditorMode] = useState<'monaco' | 'native'>('monaco');

  // Compiler output state
  const [compilerStatus, setCompilerStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [diagnostics, setDiagnostics] = useState<CompileError | null>(null);
  const [tokensList, setTokensList] = useState<Token[]>([]);
  const [astTree, setAstTree] = useState<ProgramNode | null>(null);
  const [unoptimizedIr, setUnoptimizedIr] = useState<IRInstruction[]>([]);
  const [optimizedIr, setOptimizedIr] = useState<IRInstruction[]>([]);
  const [reductionPercentage, setReductionPercentage] = useState<number>(0);
  const [executionPlan, setExecutionPlan] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'tokens' | 'ast' | 'ir' | 'opt_ir' | 'plan'>('diagnostics');

  useEffect(() => {
    const list = DB.getWorkflows();
    setWorkflows(list);

    if (initialWorkflowId) {
      const activeWf = list.find((w) => w.id === initialWorkflowId);
      if (activeWf) {
        setSelectedWfId(activeWf.id);
        setSourceCode(activeWf.source);
        resetCompiler();
      }
    } else if (list.length > 0) {
      setSelectedWfId(list[0].id);
      setSourceCode(list[0].source);
    }
  }, [initialWorkflowId]);

  const handleWorkflowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedWfId(id);
    const activeWf = workflows.find((w) => w.id === id);
    if (activeWf) {
      setSourceCode(activeWf.source);
      resetCompiler();
    }
  };

  const resetCompiler = () => {
    setCompilerStatus('IDLE');
    setDiagnostics(null);
    setTokensList([]);
    setAstTree(null);
    setUnoptimizedIr([]);
    setOptimizedIr([]);
    setReductionPercentage(0);
    setExecutionPlan('');
    setActiveTab('diagnostics');
  };

  const handleCompile = () => {
    const startTime = performance.now();
    resetCompiler();

    let tokens: Token[] = [];
    let ast: ProgramNode | null = null;
    let ir: IRInstruction[] = [];
    let optRes: OptimizationResult | null = null;
    let plan = '';

    try {
      // 1. Lexical Analysis
      tokens = tokenize(sourceCode);
      setTokensList(tokens);

      // 2. Syntax Analysis (Parser)
      ast = parse(tokens);
      setAstTree(ast);

      // 3. Semantic Analysis
      analyze(ast);

      // 4. IR Generation
      ir = generateIR(ast);
      setUnoptimizedIr(ir);

      // 5. Optimization
      optRes = optimizeIR(ir);
      setOptimizedIr(optRes.optimized);
      setReductionPercentage(optRes.reductionPercentage);

      // 6. Code Generation
      plan = generateExecutionPlan(optRes.optimized);
      setExecutionPlan(plan);

      // Compilation Success
      setCompilerStatus('SUCCESS');
      setActiveTab('plan'); // switch tab to look at plan

      // Save to persistence
      const durationMs = Math.round(performance.now() - startTime);
      const activeWf = workflows.find((w) => w.id === selectedWfId);
      DB.addCompilation({
        workflowId: selectedWfId,
        workflowName: activeWf?.name || 'Custom',
        success: true,
        originalCount: ir.length,
        optimizedCount: optRes.optimized.length,
        reductionPercentage: optRes.reductionPercentage,
        durationMs,
      });
    } catch (err: any) {
      // Compilation Failure
      setCompilerStatus('ERROR');
      const compErr: CompileError = err.type
        ? err
        : { type: 'Syntax', message: err.message || String(err), line: 1, column: 1 };
      setDiagnostics(compErr);
      setActiveTab('diagnostics');

      // Save compilation failure
      const durationMs = Math.round(performance.now() - startTime);
      const activeWf = workflows.find((w) => w.id === selectedWfId);
      DB.addCompilation({
        workflowId: selectedWfId,
        workflowName: activeWf?.name || 'Custom',
        success: false,
        error: compErr,
        originalCount: 0,
        optimizedCount: 0,
        reductionPercentage: 0,
        durationMs,
      });
    }
  };

  const handleSave = () => {
    const activeWf = workflows.find((w) => w.id === selectedWfId);
    if (activeWf) {
      const updatedWf = { ...activeWf, source: sourceCode };
      DB.saveWorkflow(updatedWf);
      // Refresh list
      setWorkflows(DB.getWorkflows());
      alert('Workflow saved successfully!');
    }
  };

  const handleResetExample = () => {
    DB.clearAll();
    const list = DB.getWorkflows();
    setWorkflows(list);
    const activeWf = list.find((w) => w.id === selectedWfId);
    if (activeWf) {
      setSourceCode(activeWf.source);
    }
    resetCompiler();
    alert('Restored default examples!');
  };

  const handleFormat = () => {
    // Simple line formatter for FSP
    const lines = sourceCode.split('\n');
    let indentLevel = 0;
    const formatted = lines
      .map((line) => {
        let trimmed = line.trim();
        if (trimmed.endsWith('}')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indent = '  '.repeat(indentLevel);
        const result = trimmed.length > 0 ? `${indent}${trimmed}` : '';
        if (trimmed.endsWith('{')) {
          indentLevel++;
        }
        return result;
      })
      .join('\n');
    setSourceCode(formatted);
  };

  const handleNewWorkflow = () => {
    const name = prompt('Enter name of new workflow:');
    if (!name) return;
    const identifier = name.replace(/\s+/g, '');
    const newId = identifier.toLowerCase();
    const source = `WORKFLOW ${identifier} {
  REQUEST purchase
  APPROVAL manager
  END
}`;
    const newWf: Workflow = {
      id: newId,
      name: identifier,
      source,
      createdAt: Date.now(),
      version: 1,
    };
    DB.saveWorkflow(newWf);
    const list = DB.getWorkflows();
    setWorkflows(list);
    setSelectedWfId(newId);
    setSourceCode(source);
    resetCompiler();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
      {/* Editor & Inspector Panel */}
      <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedWfId}
              onChange={handleWorkflowChange}
              className="bg-slate-900 border border-slate-700/60 text-xs text-slate-200 px-2 py-1.5 rounded font-mono font-semibold focus:outline-none focus:border-cyan-500"
            >
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  {wf.name} (v{wf.version})
                </option>
              ))}
            </select>
            <button
              onClick={handleNewWorkflow}
              className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded font-semibold text-slate-300"
            >
              + New
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              title="Format source code"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              title="Save changes to database"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetExample}
              title="Reset all examples"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCompile}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs rounded shadow flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              COMPILE
            </button>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="flex-1 min-h-[300px] relative border-b border-slate-800 bg-slate-950">
          {editorMode === 'monaco' ? (
            <Editor
              height="100%"
              language="apex"
              theme="vs-dark"
              value={sourceCode}
              onChange={(v) => setSourceCode(v || '')}
              options={{
                fontFamily: 'JetBrains Mono',
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
              }}
            />
          ) : (
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="w-full h-full bg-slate-950 text-slate-100 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed"
            />
          )}

          {/* Editor Fallback Toggle */}
          <button
            onClick={() => setEditorMode(editorMode === 'monaco' ? 'native' : 'monaco')}
            className="absolute bottom-2 right-2 px-2 py-0.5 text-[9px] bg-slate-900 text-slate-500 hover:text-slate-300 rounded border border-slate-800 font-mono"
          >
            {editorMode === 'monaco' ? 'Plain Text Mode' : 'IDE Monaco Mode'}
          </button>
        </div>

        {/* Compile Status Bar */}
        <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs px-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">STATUS:</span>
            {compilerStatus === 'IDLE' && (
              <span className="text-slate-400 font-bold font-mono">NOT COMPILED</span>
            )}
            {compilerStatus === 'SUCCESS' && (
              <span className="text-emerald-400 font-bold font-mono flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                COMPILED (PASS)
              </span>
            )}
            {compilerStatus === 'ERROR' && (
              <span className="text-red-400 font-bold font-mono flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                COMPILED (FAIL)
              </span>
            )}
          </div>
          {compilerStatus === 'SUCCESS' && (
            <div className="flex items-center gap-3 text-[10px] text-cyan-400 font-mono">
              <span>REDUCTION: {reductionPercentage}%</span>
              <button
                onClick={() => onNavigate('execution', selectedWfId)}
                className="hover:underline font-bold text-slate-200"
              >
                Launch Simulator →
              </button>
            </div>
          )}
        </div>

        {/* Tabbed Inspector Panel */}
        <div className="h-[220px] flex flex-col bg-slate-950/80">
          <div className="flex border-b border-slate-800 text-[11px] font-mono font-semibold text-slate-400 bg-slate-950/40">
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3 py-2 border-r border-slate-800 ${
                activeTab === 'diagnostics' ? 'text-cyan-400 bg-slate-900 border-t-2 border-t-cyan-500' : 'hover:bg-slate-900/60'
              }`}
            >
              Diagnostics
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-3 py-2 border-r border-slate-800 ${
                activeTab === 'tokens' ? 'text-cyan-400 bg-slate-900 border-t-2 border-t-cyan-500' : 'hover:bg-slate-900/60'
              }`}
            >
              Tokens
            </button>
            <button
              onClick={() => setActiveTab('ast')}
              className={`px-3 py-2 border-r border-slate-800 ${
                activeTab === 'ast' ? 'text-cyan-400 bg-slate-900 border-t-2 border-t-cyan-500' : 'hover:bg-slate-900/60'
              }`}
            >
              AST
            </button>
            <button
              onClick={() => setActiveTab('ir')}
              className={`px-3 py-2 border-r border-slate-800 ${
                activeTab === 'ir' ? 'text-cyan-400 bg-slate-900 border-t-2 border-t-cyan-500' : 'hover:bg-slate-900/60'
              }`}
            >
              IR
            </button>
            <button
              onClick={() => setActiveTab('opt_ir')}
              className={`px-3 py-2 border-r border-slate-800 ${
                activeTab === 'opt_ir' ? 'text-cyan-400 bg-slate-900 border-t-2 border-t-cyan-500' : 'hover:bg-slate-900/60'
              }`}
            >
              Optimized IR
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-2 ${
                activeTab === 'plan' ? 'text-cyan-400 bg-slate-900 border-t-2 border-t-cyan-500' : 'hover:bg-slate-900/60'
              }`}
            >
              Execution Plan
            </button>
          </div>

          <div className="flex-1 overflow-auto p-3 font-mono text-xs text-slate-300">
            {activeTab === 'diagnostics' && (
              <div>
                {diagnostics ? (
                  <div className="text-red-400 flex items-start gap-2.5 bg-red-950/20 border border-red-900/40 p-2.5 rounded">
                    <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">{diagnostics.type} Error</div>
                      <div className="mt-1 text-slate-300">{diagnostics.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Location: Line {diagnostics.line}, Column {diagnostics.column}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic p-2">No compile errors reported.</div>
                )}
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="divide-y divide-slate-800/40">
                {tokensList.length > 0 ? (
                  <div className="grid grid-cols-4 font-bold text-[10px] text-slate-500 border-b border-slate-800 pb-1.5">
                    <span>LEXEME</span>
                    <span>TYPE</span>
                    <span>LINE</span>
                    <span>COLUMN</span>
                  </div>
                ) : null}
                {tokensList.map((tok, idx) => (
                  <div key={idx} className="grid grid-cols-4 py-1 text-[11px] font-mono hover:bg-slate-900/20">
                    <span className="text-cyan-400">"{tok.lexeme}"</span>
                    <span className="text-slate-400">{tok.type}</span>
                    <span className="text-slate-500">{tok.line}</span>
                    <span className="text-slate-500">{tok.column}</span>
                  </div>
                ))}
                {tokensList.length === 0 && (
                  <div className="text-slate-500 italic p-2">Tokens list will populate after compilation.</div>
                )}
              </div>
            )}

            {activeTab === 'ast' && (
              <pre className="text-[11px] text-indigo-300">
                {astTree
                  ? JSON.stringify(astTree, null, 2)
                  : '// AST structure will show here after compilation.'}
              </pre>
            )}

            {activeTab === 'ir' && (
              <pre className="text-[11px] text-emerald-400">
                {unoptimizedIr.length > 0
                  ? formatIR(unoptimizedIr)
                  : '; IR instructions will show here after compilation.'}
              </pre>
            )}

            {activeTab === 'opt_ir' && (
              <pre className="text-[11px] text-cyan-400">
                {optimizedIr.length > 0
                  ? formatIR(optimizedIr)
                  : '; Optimized IR instructions will show here after compilation.'}
              </pre>
            )}

            {activeTab === 'plan' && (
              <pre className="text-[11px] text-slate-400">
                {executionPlan
                  ? executionPlan
                  : '// Compiled plan will display here.'}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Visualizer Panel */}
      <div className="h-full">
        <Visualizer ast={astTree} compileError={diagnostics ? diagnostics.message : null} />
      </div>
    </div>
  );
};
