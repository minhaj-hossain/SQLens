/**
 * Prisma track validator — Phase 1 (string checks) + Phase 6 (snippet checks).
 * ─────────────────────────────────────────────────────────────────────────────
 * String-level checks for Prisma client code (no execution yet — Phase 4 adds
 * the prisma→SQL generator + real execution via the SQL engine).
 * Pure + client-safe: safe to import from UI, tests, and audit scripts.
 *
 * Phase 6 additions (additive only — existing rules keep their semantics):
 *  - `requiredCodeSnippets`: literal fragments that must appear in the raw
 *    code (used for CLI, schema.prisma, URL and Zod content before the client
 *    validator exists). Checked BEFORE structural rules so snippet labs fail
 *    fast with the authored message.
 *  - `forbiddenCodeSnippets`: literal fragments that must NOT appear.
 */

import type { PrismaValidationRule } from '../../types/prisma-curriculum';

export interface PrismaValidationOutcome {
  passed: boolean;
  feedback?: string;
}

function normalize(code: string): string {
  return code.replace(/\s+/g, ' ');
}

/** Extract the model from `prisma.<model>.<method>(...)`. */
export function extractPrismaTarget(code: string): { model?: string; method?: string } {
  const match = /prisma\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/.exec(code);
  if (!match) return {};
  return { model: match[1].toLowerCase(), method: match[2] };
}

function extractBlock(code: string, key: 'select' | 'include' | 'where' | 'orderBy'): string | null {
  const keyIdx = code.indexOf(key);
  if (keyIdx < 0) return null;
  const braceIdx = code.indexOf('{', keyIdx);
  if (braceIdx < 0) return null;
  let depth = 0;
  for (let i = braceIdx; i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}') {
      depth--;
      if (depth === 0) return code.slice(braceIdx, i + 1);
    }
  }
  return null;
}

export function validatePrismaCode(
  code: string,
  rule: PrismaValidationRule,
): PrismaValidationOutcome {
  const flat = normalize(code);

  // Phase 6: snippet labs (CLI / schema.prisma / URL / Zod). The solution is
  // authored to contain every snippet; the starter is authored to contain at
  // least one missing or one forbidden fragment.
  if (rule.requiredCodeSnippets) {
    const missing = rule.requiredCodeSnippets.filter((s) => !code.includes(s));
    if (missing.length > 0) {
      return { passed: false, feedback: `Missing required code: ${missing.map((m) => `\`${m}\``).join(', ')}.` };
    }
  }

  if (rule.forbiddenCodeSnippets) {
    const present = rule.forbiddenCodeSnippets.filter((s) => code.includes(s));
    if (present.length > 0) {
      return { passed: false, feedback: `Remove forbidden code: ${present.map((m) => `\`${m}\``).join(', ')}.` };
    }
  }

  if (rule.targetModel) {
    const { model } = extractPrismaTarget(code);
    if (model !== rule.targetModel.toLowerCase()) {
      return { passed: false, feedback: `Expected a query on model \`${rule.targetModel}\`.` };
    }
  }

  if (rule.requiredMethod) {
    const { method } = extractPrismaTarget(code);
    if (method !== rule.requiredMethod) {
      return { passed: false, feedback: `Use \`prisma.<model>.${rule.requiredMethod}(...)\`.` };
    }
  }

  if (rule.requiredFieldsInSelect) {
    const selectBlock = extractBlock(code, 'select');
    if (!selectBlock) {
      return { passed: false, feedback: 'Add a `select` block listing the required fields.' };
    }
    const missing = rule.requiredFieldsInSelect.filter(
      (f) => !new RegExp(`\\b${f}\\s*:\\s*true\\b`).test(selectBlock),
    );
    if (missing.length > 0) {
      return { passed: false, feedback: `Missing in select: ${missing.map((m) => `\`${m}\``).join(', ')}.` };
    }
  }

  if (rule.forbiddenFieldsInSelect) {
    const selectBlock = extractBlock(code, 'select');
    if (selectBlock) {
      const leaked = rule.forbiddenFieldsInSelect.filter(
        (f) => new RegExp(`\\b${f}\\s*:\\s*true\\b`).test(selectBlock),
      );
      if (leaked.length > 0) {
        return { passed: false, feedback: `Do not select: ${leaked.map((m) => `\`${m}\``).join(', ')}.` };
      }
    }
  }

  if (rule.requiredIncludes) {
    const includeBlock = extractBlock(code, 'include');
    if (!includeBlock) {
      return { passed: false, feedback: 'Add an `include` block for the required relation.' };
    }
    const missing = rule.requiredIncludes.filter(
      (r) => !new RegExp(`\\b${r}\\s*:`).test(includeBlock),
    );
    if (missing.length > 0) {
      return { passed: false, feedback: `Missing in include: ${missing.map((m) => `\`${m}\``).join(', ')}.` };
    }
  }

  if (rule.requiredWhereClauses) {
    const whereBlock = extractBlock(code, 'where');
    if (!whereBlock) {
      return { passed: false, feedback: 'Add a `where` filter for the required field.' };
    }
    const missing = rule.requiredWhereClauses.filter(
      (f) => !new RegExp(`\\b${f}\\b`).test(whereBlock),
    );
    if (missing.length > 0) {
      return { passed: false, feedback: `Missing in where: ${missing.map((m) => `\`${m}\``).join(', ')}.` };
    }
  }

  if (rule.requiredOrderBy) {
    if (!/\borderBy\b/.test(flat)) {
      return { passed: false, feedback: 'Add an `orderBy` clause.' };
    }
    const missing = rule.requiredOrderBy.filter((o) => !new RegExp(`\\b${o.field}\\b`).test(flat));
    if (missing.length > 0) {
      return { passed: false, feedback: `Missing in orderBy: ${missing.map((m) => `\`${m.field}\``).join(', ')}.` };
    }
  }

  if (rule.requirePagination) {
    const { take, skip, cursor } = rule.requirePagination;
    if (take !== undefined && !new RegExp(`\\btake\\s*:\\s*${take}\\b`).test(flat)) {
      return { passed: false, feedback: `Set \`take: ${take}\` for pagination.` };
    }
    if (skip !== undefined && !new RegExp(`\\bskip\\s*:\\s*${skip}\\b`).test(flat)) {
      return { passed: false, feedback: `Set \`skip: ${skip}\` for pagination.` };
    }
    if (cursor && !/\bcursor\b/.test(flat)) {
      return { passed: false, feedback: 'Add a `cursor` for cursor pagination.' };
    }
  }

  // expectFailure / expectedErrorCode / row counts need execution (Phase 4).
  return { passed: true };
}
