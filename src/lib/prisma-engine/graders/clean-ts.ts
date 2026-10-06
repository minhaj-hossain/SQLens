/**
 * Clean TypeScript Code Utility — Phase 2.
 * ─────────────────────────────────────────────────────────────────────────────
 * Transpiles learner TypeScript code to pure synchronous CommonJS JavaScript
 * using the TypeScript compiler's lightweight `transpileModule`, stripping
 * all types, interfaces, generics, and async/await keywords for fast,
 * deterministic in-memory evaluation.
 */

import ts from 'typescript';

export function cleanTypeScriptCode(code: string): string {
  try {
    // 1. Strip imports before compilation so ts does not emit `require(...)`
    const codeWithoutImports = code.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '');

    // 2. Transpile TS -> JS
    const transpiled = ts.transpileModule(codeWithoutImports, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;

    // 3. Clean up CommonJS header and async keywords
    return transpiled
      .replace(/"use strict";/g, '')
      .replace(/Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value:\s*true\s*\}\);/g, '')
      .replace(/\bawait\s+/g, '')
      .replace(/\basync\s+/g, '');
  } catch {
    // Fallback in case of syntax error
    return code
      .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
      .replace(/\bawait\s+/g, '')
      .replace(/\basync\s+/g, '');
  }
}
