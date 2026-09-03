'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Unlock, HelpCircle } from 'lucide-react';

export const SecurityInjectionVisualizer: React.FC = () => {
  const [method, setMethod] = useState<'VULNERABLE' | 'PARAMETRIZED'>('PARAMETRIZED');
  const [userInput, setUserInput] = useState<string>("admin' OR '1'='1");

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div>
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Security Architecture & Defensive SQL
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            SQL Injection Attack Vector vs Parameterized Prepared Statements
          </h3>
        </div>

        {/* Method Toggle */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setMethod('VULNERABLE')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              method === 'VULNERABLE'
                ? 'bg-error text-white'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Vulnerable Concatenation
          </button>
          <button
            onClick={() => setMethod('PARAMETRIZED')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              method === 'PARAMETRIZED'
                ? 'bg-success text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Secure Parameter ($1)
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3 font-mono text-xs">
        {/* Untrusted input field */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <span className="text-text-faint text-[10.5px] uppercase tracking-wider">Simulated Malicious Form Input:</span>
          <div className="text-func font-bold text-sm mt-1">{userInput}</div>
        </div>

        {method === 'VULNERABLE' ? (
          <div className="p-3.5 rounded-lg bg-error-bg/30 border border-error-border space-y-2">
            <div className="flex items-center gap-1.5 text-error-text font-bold text-xs">
              <Unlock className="w-4 h-4" />
              <span>Attacker Injected Code Breaks Query Grammar!</span>
            </div>
            <div className="p-2.5 rounded bg-surface border border-border text-[11.5px] leading-relaxed">
              SELECT * FROM users WHERE username = &apos;<span className="text-error-text font-bold">admin&apos; OR &apos;1&apos;=&apos;1</span>&apos;;
            </div>
            <p className="text-text-dim text-[11px] leading-relaxed">
              Because the raw string is glued together with concatenation (<code className="text-text">+</code>), the single quote escapes the data boundary and injects raw boolean syntax into the SQL engine. The query always evaluates to true, dumping the entire database to the attacker!
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg bg-success-bg/30 border border-success-border space-y-2">
            <div className="flex items-center gap-1.5 text-success-text font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Parameterized Bound Variable: Zero Grammar Manipulation</span>
            </div>
            <div className="p-2.5 rounded bg-surface border border-border text-[11.5px] leading-relaxed">
              SELECT * FROM users WHERE username = <span className="text-func font-bold">$1</span>;
            </div>
            <p className="text-text-dim text-[11px] leading-relaxed">
              The database engine compiles and parses the query AST <em>before</em> binding input. The value <code className="text-func">&quot;admin&apos; OR &apos;1&apos;=&apos;1&quot;</code> is treated 100% as a literal data string, never executable instructions. The exploit fails completely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityInjectionVisualizer;


