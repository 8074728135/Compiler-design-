import React from 'react';
import { Copy, Check } from 'lucide-react';

export const DocPanel: React.FC = () => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const codeExamples = {
    minimal: `WORKFLOW MinimalPurchase {
  REQUEST purchase
  APPROVAL manager
  END
}`,
    conditional: `WORKFLOW EquipmentPurchase {
  REQUEST purchase
  APPROVAL manager
  IF amount > 50000 {
    APPROVAL finance
  }
  IF amount > 100000 {
    APPROVAL department_head
    APPROVAL procurement
  }
  NOTIFY employee
  END
}`,
    quantity: `WORKFLOW BulkOrder {
  REQUEST purchase
  APPROVAL manager
  IF quantity >= 100 {
    APPROVAL procurement
  }
  NOTIFY employee
  END
}`,
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
        <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
          FLOWSYNC PROCESS LANGUAGE (FSP) DOCUMENTATION
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Syntax, keywords, operational semantics, and lexical specifications for the compiler.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Language Reference */}
        <div className="md:col-span-2 space-y-6">
          {/* Keywords & Grammar */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 font-mono border-b border-slate-800 pb-2">
              1. GRAMMAR & STRUCTURE
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every FSP workflow must follow a strict, deterministic sequence:
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 font-mono">
              <li>
                <strong className="text-cyan-400">WORKFLOW [Name] &#123;</strong> : Declares the policy name.
              </li>
              <li>
                <strong className="text-cyan-400">REQUEST purchase</strong> : Initial request type (must be "purchase").
              </li>
              <li>
                <strong className="text-cyan-400">APPROVAL [Role]</strong> : Designates mandatory role approvals.
              </li>
              <li>
                <strong className="text-cyan-400">IF [Variable] [Op] [Value] &#123; ... &#125;</strong> : Conditional branching block.
              </li>
              <li>
                <strong className="text-cyan-400">NOTIFY [Target]</strong> : Dispatches alert emails.
              </li>
              <li>
                <strong className="text-cyan-400">END</strong> : Explicit end statement (must be final).
              </li>
              <li>
                <strong className="text-cyan-400">&#125;</strong> : Closes the block.
              </li>
            </ul>
          </div>

          {/* Tokens & Types */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 font-mono border-b border-slate-800 pb-2">
              2. ENVIRONMENT SPECIFICATIONS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5 p-3 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Supported Roles</span>
                <p className="text-slate-300">manager, finance, department_head, procurement</p>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Notification Targets</span>
                <p className="text-slate-300">employee, manager, finance, department_head, procurement</p>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Numeric Variables</span>
                <p className="text-slate-300">amount, quantity</p>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-slate-500 font-bold uppercase text-[10px]">String/Enum Variables</span>
                <p className="text-slate-300">department, priority</p>
              </div>
            </div>
          </div>

          {/* Compiler Validation Rules */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 font-mono border-b border-slate-800 pb-2">
              3. COMPILER COMPLIANCE RULES
            </h3>
            <ul className="text-xs text-slate-400 space-y-2.5 list-decimal pl-5">
              <li>
                <strong className="text-slate-200">Lexical Integrity</strong>: Any invalid symbols (like <code className="text-red-400 bg-slate-950 px-1 py-0.5 rounded font-mono">@</code>, <code className="text-red-400 bg-slate-950 px-1 py-0.5 rounded font-mono">$</code>) are flagged.
              </li>
              <li>
                <strong className="text-slate-200">Syntax Layout</strong>: Nested braces must match. Comparison instructions require valid operators (<code className="text-cyan-400 font-mono">&gt;, &lt;, &gt;=, &lt;=, ==, !=</code>) and literals.
              </li>
              <li>
                <strong className="text-slate-200">Strict Semantic Checking</strong>:
                <ul className="list-disc pl-4 mt-1.5 space-y-1">
                  <li>Numeric conditions can only be used with <code className="text-cyan-400 font-mono">amount</code> or <code className="text-cyan-400 font-mono">quantity</code>.</li>
                  <li>String conditions must use <code className="text-cyan-400 font-mono">==</code> or <code className="text-cyan-400 font-mono">!=</code>.</li>
                  <li>Workflow ending <code className="text-cyan-400 font-mono">END</code> must be present, must be the last statement, and is strictly forbidden inside conditional <code className="text-cyan-400 font-mono">IF</code> blocks.</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        {/* Examples copy container */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">
            Copy-Paste Blueprints
          </h3>

          {Object.entries(codeExamples).map(([key, code]) => (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
              <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {key.toUpperCase()} PATTERN
                </span>
                <button
                  onClick={() => copyToClipboard(code, key)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedId === key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <pre className="p-3 font-mono text-[10px] text-cyan-400 bg-slate-950/40 overflow-x-auto leading-relaxed">
                {code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
