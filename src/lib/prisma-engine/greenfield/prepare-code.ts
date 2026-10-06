/**
 * Greenfield Code Transpiler.
 * ─────────────────────────────────────────────────────────────────────────────
 * Transpiles learner TypeScript code to JavaScript while preserving `async` and `await`
 * for genuine asynchronous concurrency, transaction callbacks, and promise resolution.
 */

import ts from 'typescript';

export function prepareGreenfieldCode(code: string): string {
  try {
    // Strip imports so TypeScript CommonJS emission does not inject require()
    const codeWithoutImports = code.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '');

    const transpiled = ts.transpileModule(codeWithoutImports, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;

    return transpiled
      .replace(/"use strict";/g, '')
      .replace(/Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value:\s*true\s*\}\);/g, '');
  } catch {
    return code.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '');
  }
}

export const AsyncFunction: any = Object.getPrototypeOf(async function () {}).constructor;
