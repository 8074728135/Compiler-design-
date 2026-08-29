import React, { useState } from 'react';
import { DB } from '../services/db';
import { Settings, ShieldCheck, Database, RefreshCw, Cpu } from 'lucide-react';

interface SettingsPanelProps {
  onResetAll: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onResetAll }) => {
  const [compilerMode, setCompilerMode] = useState<'typescript' | 'motoko'>('typescript');
  const [identityPrincipal, setIdentityPrincipal] = useState<string>(
    'qocth-qyqaa-aaaaa-aaaaa-cai'
  );

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all database, compilations, and execution histories? This will restore the default workflows.')) {
      onResetAll();
      alert('Local database storage cleared and restored.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
        <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-cyan-400" />
          SYSTEM SETTINGS & ENVIRONMENT
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Configure compiler engines, backend actors, and clear local state stores.
        </p>
      </div>

      {/* Compiler Selection Mode */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-1.5">
          <Cpu className="w-4.5 h-4.5 text-cyan-400" /> Authoritative Compiler Engine
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select which environment executes the Lexer/Parser/Analyzer pipeline and generates instruction code.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TypeScript choice */}
          <div
            onClick={() => setCompilerMode('typescript')}
            className={`p-4 rounded border cursor-pointer transition-all ${
              compilerMode === 'typescript'
                ? 'bg-cyan-950/20 border-cyan-500/50 glow-cyan'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold font-mono text-slate-200">Local Browser Mode</span>
              {compilerMode === 'typescript' && (
                <span className="text-[9px] bg-cyan-900/60 border border-cyan-800/40 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Uses the deterministic TypeScript compiler library inside the browser. Zero-dependency offline desktop compiler.
            </p>
          </div>

          {/* Motoko Canister choice */}
          <div
            onClick={() => {
              setCompilerMode('motoko');
              alert('Internet Computer mode selected. This checks canister actors for query calls (using local browser simulated actor fallbacks as dfx replica is offline).');
            }}
            className={`p-4 rounded border cursor-pointer transition-all ${
              compilerMode === 'motoko'
                ? 'bg-cyan-950/20 border-cyan-500/50 glow-cyan'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/80'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold font-mono text-slate-200">Internet Computer Mode</span>
              {compilerMode === 'motoko' && (
                <span className="text-[9px] bg-cyan-900/60 border border-cyan-800/40 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Calls the compiled Motoko actor canister backend over the Internet Computer agent protocol. Requires running dfx.
            </p>
          </div>
        </div>
      </div>

      {/* Internet Identity credentials */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" /> Internet Identity Credentials
        </h3>
        <div className="space-y-3 font-mono text-xs text-slate-400">
          <div>
            <span className="text-slate-500 font-bold uppercase text-[9px] block mb-1">Identity Provider</span>
            <p className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
              Internet Identity (https://identity.ic0.app)
            </p>
          </div>

          <div>
            <span className="text-slate-500 font-bold uppercase text-[9px] block mb-1">Session Principal</span>
            <p className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 break-all select-all">
              {identityPrincipal}
            </p>
          </div>
        </div>
      </div>

      {/* Database control */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-1.5">
          <Database className="w-4.5 h-4.5 text-cyan-400" /> Local Storage Database
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Reset all stored procedures, logs, compile counts, and analytics metadata back to system initial defaults.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 font-bold font-mono text-xs rounded transition-colors shadow flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          RESET LOCAL SYSTEM STORAGE
        </button>
      </div>
    </div>
  );
};
