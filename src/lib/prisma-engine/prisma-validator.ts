/**
 * Prisma track validator — Phase 1 (string checks) + Phase 6 (snippet checks).
 * ─────────────────────────────────────────────────────────────────────────────
 * String-level checks for Prisma client code. Stays pure + client-safe (safe
 * to import from UI, tests, and audit scripts) — the Phase-4 execution layer
 * lives in `prisma-execution.ts` (`gradePrismaCode`), the translator in
 * `prisma-sql-generator.ts` (`generatePrismaSql`), the runner in
 * `prisma-proxy-executor.ts` (`executePrismaCode`), and the schema reader in
 * `prisma-schema-parser.ts`; those need a `SqlExecutor` and must NOT be
 * imported by static-only surfaces.
 *
 * Phase 6 additions (additive only — existing rules keep their semantics):
 *  - `requiredCodeSnippets`: literal fragments that must appear in the raw
 *    code (used for CLI, schema.prisma, URL and Zod content before the client
 *    validator exists). Checked BEFORE structural rules so snippet labs fail
 *    fast with the authored message.
 *  - `forbiddenCodeSnippets`: literal fragments that must NOT appear.
 *
 * Phase 1.1 additions (CLI normalization): CLI-SHAPED snippet fragments (a
 * runner invocation, a bare `prisma <sub>` command, a `--flag`, a subcommand
 * phrase) are compared in a canonical command form — whitespace collapsed,
 * package runners (`npm exec` / `pnpm dlx|exec` / `yarn[ dlx]` / `bunx`)
 * mapped onto `npx`, `--flag=value` unified with `--flag value`, quotes after
 * a flag removed. Every other fragment keeps the exact `String.includes`
 * contract it was authored against (quoted object keys stay Phase 1.2).
 * Feedback always quotes the AUTHORED fragment text, byte for byte.
 */

import type { PrismaValidationRule } from '../../types/prisma-curriculum';

export interface PrismaValidationOutcome {
  passed: boolean;
  feedback?: string;
}

function normalize(code: string): string {
  return code.replace(/\s+/g, ' ');
}

// ── Phase 1.1 — CLI snippet normalization ────────────────────────────────────

/**
 * Source of the Prisma-CLI runner pattern — ONE alias set shared by this
 * validator and the display layer (`prismaCliCommandIn` in
 * `prisma-submit-pipeline.ts`), so matching and rendering cannot drift.
 * Covers `npx prisma …` plus every equivalent package runner a learner may
 * legitimately type: `npm exec prisma`, `pnpm dlx|exec prisma`,
 * `yarn[ dlx] prisma`, `bunx prisma`. The leading lookbehind rejects a
 * runner glued to other word characters (`foonx prisma`).
 */
export const PRISMA_CLI_RUNNER_SRC =
  '(?<![\\w$-])(?:npx|npm\\s+exec|pnpm\\s+(?:dlx|exec)|yarn(?:\\s+dlx)?|bunx)\\s+prisma';

const CLI_RUNNER = new RegExp(PRISMA_CLI_RUNNER_SRC); // no `g` — stateless .test
const CLI_RUNNER_G = new RegExp(PRISMA_CLI_RUNNER_SRC, 'g');

/**
 * A snippet fragment is CLI-shaped when it is command vocabulary: a runner
 * invocation (`npx prisma generate`), a bare `prisma <sub> …` command, a
 * `--flag` (`--name`), or a subcommand phrase (`migrate dev`, `db push`).
 * Only those fragments are compared in canonical form; schema attributes,
 * client calls, Zod and SQL fragments keep their literal contract.
 */
export function isCliFragment(fragment: string): boolean {
  const s = fragment.trim();
  return CLI_RUNNER.test(s) || /^--[A-Za-z]/.test(s) || /^(?:prisma|migrate|db)\s/.test(s);
}

/**
 * Canonical view of CLI text, applied to BOTH sides of a CLI snippet
 * comparison: whitespace runs → one space (multiline / double-space typing),
 * runner aliases → `npx prisma`, `--flag=value` → `--flag value`, and quotes
 * wrapping a flag's value removed. So `pnpm dlx prisma migrate dev
 * --name "init"` and `npx prisma migrate dev --name init` are the same
 * command. Never applied to non-CLI fragments.
 */
export function canonicalizeCli(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(CLI_RUNNER_G, 'npx prisma')
    .replace(/(--[A-Za-z][\w-]*)=("[^"]*"|'[^']*'|[^\s"']+)/g, '$1 $2')
    .replace(/(--[A-Za-z][\w-]*\s+)(["'])([^"']+)\2/g, '$1$3');
}

/**
 * One required/forbidden snippet check: canonical form for CLI-shaped
 * fragments, literal `String.includes` for everything else. Exported so the
 * equivalence audit's `snippetsPreserved` guard uses the SAME contract the
 * learner is graded with.
 */
export function snippetMatches(code: string, fragment: string): boolean {
  if (isCliFragment(fragment)) return canonicalizeCli(code).includes(canonicalizeCli(fragment));
  return code.includes(fragment);
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
  // least one missing or one forbidden fragment. CLI-shaped fragments compare
  // in canonical form (Phase 1.1 — `snippetMatches`), so runner / whitespace /
  // quote / `--flag=` spellings of the same command are the same command;
  // failure messages always quote the AUTHORED fragment.
  if (rule.requiredCodeSnippets) {
    const missing = rule.requiredCodeSnippets.filter((s) => !snippetMatches(code, s));
    if (missing.length > 0) {
      return { passed: false, feedback: `Missing required code: ${missing.map((m) => `\`${m}\``).join(', ')}.` };
    }
  }

  if (rule.forbiddenCodeSnippets) {
    const present = rule.forbiddenCodeSnippets.filter((s) => snippetMatches(code, s));
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

  // expectFailure / expectedErrorCode / row counts need execution (Phase 4 —
  // `gradePrismaCode` in prisma-execution.ts, run against a `SqlExecutor`).
  return { passed: true };
}
