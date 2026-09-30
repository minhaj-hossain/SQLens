/**
 * Prisma → SQL translator — Phase 4.
 * ─────────────────────────────────────────────────────────────────────────────
 * Turns one learner-typed client call (`prisma.user.findMany({ … })`) into the
 * executable SQL the proxy executor runs. Reads clauses structurally (brace
 * matching from the inside out), resolves models/relations from a parsed
 * `schema.prisma` AST — never from hard-coded model knowledge — and resolves
 * values through the task's seed context (literals verbatim, seed-row
 * variables by name, anything else → a named param marker the
 * executor substitutes at run time).
 *
 * Scope: reads/writes on the seed universe (`users` + `posts`), relation loads
 * (`include`) and nested-write fan-out emitted as REAL follow-up statements
 * whenever the schema declares the FK, plus `$transaction` sequencing. Snippet
 * labs (CLI / schema.prisma / URLs / Zod) have no SQL of their own — the
 * generator says so honestly (`ok: false`) instead of inventing a statement.
 * A relation it cannot resolve (no model, no FK column in the schema) degrades
 * to a non-executable `--` comment, named in the lens — never a guessed JOIN.
 */

import type { PrismaMethod } from '../../types/prisma-curriculum';
import { extractPrismaTarget } from './prisma-validator';
import {
  findModel,
  primaryKeyOf,
  relationIsExecutable,
  resolveRelation,
  type PrismaSchema,
} from './prisma-schema-parser';

/** One executable statement, in order. */
export interface GeneratedStatement {
  sql: string;
  /** Recorded values for param markers, in first-use order. */
  params: unknown[];
  /** Human label for the SQL Lens (`parent read`, `child write`, …). */
  label: string;
  /**
   * Phase 10: what this statement IS to the caller.
   *
   *   · `main` (default) — the statement the client call resolves to; the SQL
   *     Lens, the console grid and the grader all read THIS one (`include`
   *     loads are extra queries, never the call's return value).
   *   · `relation` — a follow-up query a relation load (`include`) or a nested
   *     write ran. It executes for real (a broken relation query must fail the
   *     run), but it is never what `await prisma.…()` returns.
   */
  role?: 'main' | 'relation';
}

export interface GenerateResult {
  ok: boolean;
  statements: GeneratedStatement[];
  /** `ok: false` → why translation is impossible (shown in the lens). */
  reason?: string;
  method?: PrismaMethod;
  model?: string;
  /**
   * How a MULTI-statement result is counted (`$transaction`), because the two
   * forms resolve to different values:
   *   · `sum` — the array form `$transaction([a, b, …])` resolves to the LIST
   *     of operations it ran, so the batch's row effect is the sum of every
   *     statement's `affectedRows` (the lens reference shows the touched rows).
   *   · `last` — the interactive form `$transaction(async (tx) => …)` resolves
   *     to the callback's return value, so the last statement's own count is
   *     what the caller receives.
   * Single-statement translations are always `last`.
   */
  rowEffect?: 'sum' | 'last';
}

export interface SeedContext {
  /** Seed rows per table (`users` → the 3 seeded users, object form). */
  tables: Record<string, Record<string, unknown>[]>;
  /** Runtime variable → seed-row bindings (`email` → `'mina@prisma.io'`). */
  variables?: Record<string, unknown>;
}

export interface GenerateOptions {
  schema?: PrismaSchema;
  seed?: SeedContext;
}

/**
 * Canonical demo bindings for the seed universe. Learner code refers to
 * function parameters (`userId`, `email`, `id`) whose runtime values the
 * translator cannot see; these seed-row values make the SQL Lens honest and
 * let the generated SQL actually run against the 3 seeded users.
 *
 * Mirrors the test SEED in `tests/tracks/phase4-prisma-execution.test.ts` —
 * keep both in sync.
 */
export const PRISMA_DEMO_VARIABLES: Record<string, unknown> = {
  id: 1,
  userId: 1,
  email: 'mina@prisma.io',
};

const MODEL_TABLE_OVERRIDES: Record<string, string> = { user: 'users' };

/** Physical table for a model: explicit override, else snake_case plural. */
function tableFor(model: string): string {
  const lower = model.toLowerCase();
  if (MODEL_TABLE_OVERRIDES[lower]) return MODEL_TABLE_OVERRIDES[lower];
  const snake = lower.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  return snake.endsWith('s') ? snake : `${snake}s`;
}

/** Split `key: value` pairs at the top level of a `{ … }` body. */
function splitArgs(body: string): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  let depth = 0;
  let inString: string | null = null;
  let current = '';
  const flush = () => {
    const text = current.trim().replace(/,$/, '').trim();
    if (!text) {
      current = '';
      return;
    }
    const colon = topColon(text);
    if (colon >= 0) {
      out.push({ key: text.slice(0, colon).trim(), value: text.slice(colon + 1).trim() });
    } else {
      out.push({ key: text, value: '' });
    }
    current = '';
  };
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inString) {
      current += ch;
      if (ch === inString && body[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      current += ch;
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    if (ch === '}' || ch === ']' || ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      flush();
      continue;
    }
    current += ch;
  }
  flush();
  return out;
}

function topColon(text: string): number {
  let depth = 0;
  let inString: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === inString && text[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    if (ch === '}' || ch === ']' || ch === ')') depth--;
    if (ch === ':' && depth === 0) return i;
  }
  return -1;
}

/** Balanced `{ … }` (or `( … )` / `[ … ]`) starting at `openIdx`; `null` if unbalanced. */
function balancedSpan(code: string, openIdx: number): string | null {
  const open = code[openIdx];
  const close = open === '{' ? '}' : open === '(' ? ')' : open === '[' ? ']' : null;
  if (!close) return null;
  let depth = 0;
  let inString: string | null = null;
  for (let i = openIdx; i < code.length; i++) {
    const ch = code[i];
    if (inString) {
      if (ch === inString && code[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (ch === '/' && code[i + 1] === '/') {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return code.slice(openIdx, i + 1);
    }
  }
  return null;
}

/** `{ … }` (or `[ … ]` for `$transaction`) after the FIRST target call. */
function callArgs(code: string, method: PrismaMethod, model?: string): string | null {
  const target = model
    ? new RegExp(`prisma\\s*\\.\\s*${model}\\s*\\.\\s*${method}\\s*\\(`)
    : new RegExp(`\\.\\s*${method}\\s*\\(`);
  const m = target.exec(code);
  if (!m) return null;
  let i = m.index + m[0].length;
  while (i < code.length && /\s/.test(code[i])) i++;
  if (code[i] !== '{' && code[i] !== '[') return null;
  return balancedSpan(code, i);
}

/** Inner body of `{ … }` (without the braces); `null` when not an object. */
function bodyOf(span: string | null): string | null {
  if (!span) return null;
  const t = span.trim();
  if (!t.startsWith('{') || !t.endsWith('}')) return null;
  return t.slice(1, -1);
}

/** Value span for `key:` inside an args body (`null` when absent). */
function argValue(body: string, key: string): string | null {
  for (const { key: k, value } of splitArgs(body)) {
    if (k === key) return value;
  }
  return null;
}

/** JS shorthand (`{ id }` ≡ `{ id: id }`): empty value + bare key → key as value. */
function shorthand(p: { key: string; value: string }): { key: string; value: string } {
  if (p.value !== '' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(p.key)) return p;
  return { key: p.key, value: p.key };
}

/** `field: value` pairs inside a `where: { … }` body. */
function wherePairs(whereBody: string | null): { field: string; value: string }[] {
  if (!whereBody) return [];
  return splitArgs(whereBody)
    .map(shorthand)
    .filter((p) => p.value !== '')
    .map((p) => ({ field: p.key, value: p.value }));
}

/** `true`-valued keys of `select: { … }`; `null` when no select block. */
function selectFields(selectBody: string | null): string[] | null {
  if (!selectBody) return null;
  return splitArgs(selectBody)
    .filter((p) => /\btrue\b/.test(p.value))
    .map((p) => p.key);
}



/** `true`-valued keys of `include: { … }`; `[]` when no include block. */
function includeNames(includeBody: string | null): string[] {
  if (!includeBody) return [];
  return splitArgs(includeBody)
    .filter((p) => /\btrue\b/.test(p.value))
    .map((p) => p.key);
}

/** `{ field: 'asc'|'desc' }` of `orderBy: { … }`; `[]` when absent. */
function orderEntries(orderBody: string | null): { field: string; dir: string }[] {
  if (!orderBody) return [];
  return splitArgs(orderBody).map((p) => ({
    field: p.key,
    dir: /desc/i.test(p.value) ? 'DESC' : 'ASC',
  }));
}

function toLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${String(value).replace(/'/g, "''")}'`;
}


/**
 * Resolve a filter/data value to a SQL literal. Seed-row variables bind by
 * name (`email` → the bound value); quoted values stay verbatim; numbers /
 * booleans / null pass through; anything unresolvable becomes a named
 * param marker the executor substitutes at run time.
 */
function literalFor(
  raw: string,
  seed: SeedContext | undefined,
  params: unknown[],
  paramName: string,
): string {
  const t = raw.trim();
  if (/^'.*'$/.test(t) || /^-?\d+(\.\d+)?$/.test(t)) {
    return t;
  }
  if (/^null$/i.test(t)) return 'NULL';
  if (/^(true|false)$/i.test(t)) return t.toUpperCase();
  if (/^".*"$/.test(t)) return `'${t.slice(1, -1).replace(/'/g, "''")}'`;
  const bare = /^[A-Za-z_][A-Za-z0-9_]*$/.exec(t)?.[0];
  // Demo bindings are the fallback so learner function params (`userId`,
  // `email`, `id`) translate to seed-row literals even when the caller
  // passes no seed context (e.g. the SQL Lens preview). Explicit caller
  // seed variables always win.
  const merged = { ...PRISMA_DEMO_VARIABLES, ...(seed?.variables ?? {}) };
  if (bare && bare in merged) {
    return toLiteral(merged[bare] as string | number | boolean | null);
  }
  params.push({ name: paramName, source: t });
  return `/* param:${paramName} */`;
}

/** `{ equals, contains, startsWith, endsWith, gt, gte, lt, lte, in, not }`. */
function parseOperator(value: string): { sql: string; values: string[]; like?: 'contains' | 'startsWith' | 'endsWith' } | null {
  const body = bodyOf(value.trim());
  if (!body) return null;
  const pairs = splitArgs(body);
  if (pairs.length !== 1) return null;
  const [{ key, value: v }] = pairs;
  switch (key) {
    case 'equals':
      return { sql: '=', values: [v] };
    case 'not':
      return { sql: '<>', values: [v] };
    case 'contains':
      return { sql: 'LIKE', values: [v], like: 'contains' };
    case 'startsWith':
      return { sql: 'LIKE', values: [v], like: 'startsWith' };
    case 'endsWith':
      return { sql: 'LIKE', values: [v], like: 'endsWith' };
    case 'gt':
      return { sql: '>', values: [v] };
    case 'gte':
      return { sql: '>=', values: [v] };
    case 'lt':
      return { sql: '<', values: [v] };
    case 'lte':
      return { sql: '<=', values: [v] };
    case 'in':
      return { sql: 'IN', values: [v] };
    default:
      return null;
  }
}


/**
 * `where` body → SQL predicate. Handles flat equality, `{ op: value }`
 * operators, and top-level `AND:` / `OR:` lists; anything deeper (nested
 * `NOT`, relation filters) is an honest `null` → caller reports untranslatable.
 */
function whereSql(
  whereBody: string | null,
  seed: SeedContext | undefined,
  params: unknown[],
  columns?: string[],
): string | null {
  if (!whereBody) return null;
  const pairs = splitArgs(whereBody)
    .map(shorthand)
    .filter((p) => p.value !== '');
  if (pairs.length === 0) return null;

  // The seed universe has no such column (soft-delete tombstones,
  // relation FKs, …): an honest miss, never a runtime engine error.
  if (columns && pairs.some((p) => p.key !== 'AND' && p.key !== 'OR' && p.key !== 'NOT' && !columns.includes(p.key))) {
    return null;
  }

  const renderGroup = (items: { field: string; value: string }[]): string | null => {
    const conds: string[] = [];
    for (const { field, value } of items) {
      if (columns && !columns.includes(field)) return null;
      const op = parseOperator(value);
      if (op) {
        if (op.sql === 'IN') {
          const list = bodyOf(op.values[0].trim());
          if (!list) return null;
          const elems = splitArgs(list)
            .map((e) => (e.value !== '' ? e.value : e.key))
            .map((e) => literalFor(e, seed, params, field));
          conds.push(`${field} IN (${elems.join(', ')})`);
          continue;
        }
        const lits = op.values.map((v) => literalFor(v, seed, params, field));
        if (op.sql === 'LIKE' && op.like) {
          // Resolve the operand first, then wrap: quoted literals merge into
          // one pattern (`email LIKE '%mina%'`); unresolved values (variable
          // markers, numbers) concatenate (`'%' || value || '%'`).
          const [pre, post] =
            op.like === 'contains' ? ['%', '%'] : op.like === 'startsWith' ? ['', '%'] : ['%', ''];
          const quoted = /^'[\s\S]*'$/.exec(lits[0]);
          if (quoted) {
            const inner = lits[0].slice(1, -1);
            conds.push(`${field} LIKE '${pre}${inner}${post}'`);
          } else {
            const parts = [pre ? "'%'" : null, lits[0], post ? "'%'" : null].filter(
              (p): p is string => !!p,
            );
            conds.push(`${field} LIKE ${parts.join(' || ')}`);
          }
          continue;
        }
        conds.push(`${field} ${op.sql} ${lits[0]}`);
        continue;
      }
      conds.push(`${field} = ${literalFor(value, seed, params, field)}`);
    }
    if (conds.length === 0) return null;
    return conds.length === 1 ? conds[0] : `(${conds.join(' AND ')})`;
  };

  // Top-level AND:/OR: lists hold arrays of single-key objects.
  const logic = pairs.filter((p) => (p.key === 'AND' || p.key === 'OR') && p.value.trim().startsWith('['));
  if (logic.length > 0) {
    if (logic.length !== pairs.length) return null;
    const groups: string[] = [];
    for (const { key, value } of logic) {
      const inner = value.trim().slice(1, -1);
      const operands = splitArgs(inner)
        .map((o) => (o.value !== '' ? o.value : o.key))
        .map((o) => bodyOf(o.trim()))
        .filter((b): b is string => b !== null);
      const rendered = operands
        .map((b) =>
          renderGroup(
            splitArgs(b)
              .map(shorthand)
              .filter((p) => p.value !== '')
              .map((p) => ({ field: p.key, value: p.value })),
          ),
        )
        .filter((s): s is string => !!s);
      if (rendered.length !== operands.length) return null;
      // Each operand is wrapped on its own so the lens reads the logic shape:
      // `((name = 'Alex') OR (email LIKE '%mina%'))`.
      const wrapped = rendered.map((s) => (/^\(.*\)$/.test(s) ? s : `(${s})`));
      groups.push(key === 'OR' ? `(${wrapped.join(' OR ')})` : `(${wrapped.join(' AND ')})`);
    }
    return groups.length === 1 ? groups[0] : `(${groups.join(' AND ')})`;
  }

  if (pairs.some((p) => p.key === 'AND' || p.key === 'OR' || p.key === 'NOT')) return null;
  return renderGroup(pairs.map((p) => ({ field: p.key, value: p.value })));
}

/** Resolve the physical table + scalar columns for a model (schema wins, seed fallback). */
function modelShape(
  model: string,
  schema: PrismaSchema | undefined,
  seed: SeedContext | undefined,
): { table: string; columns: string[] } {
  const table = tableFor(model);
  const fromSchema = schema ? findModel(schema, model)?.columns : undefined;
  if (fromSchema?.length) return { table, columns: fromSchema };
  const seedCols = seed?.tables[table]?.[0] ? Object.keys(seed.tables[table][0]) : undefined;
  // No schema AND no seed rows for this model: the table does not exist in
  // the seed universe. Callers turn this into an honest "untranslatable".
  if (!seedCols) return { table, columns: [] };
  return { table, columns: seedCols };
}

/**
 * A relation step the schema cannot turn into SQL yet — honest, non-executable
 * (every runner skips `--` statements) and named in the SQL Lens with the exact
 * reason, so a learner sees WHY the second query is missing instead of a blank.
 */
function relationComment(label: string, reason: string): GeneratedStatement {
  return { sql: `-- ${label}: ${reason}`, params: [], label };
}

/**
 * Phase 10 — the second query Prisma sends for `include: { rel: true }`.
 *
 * Real SQL whenever the schema declares both sides of the relation:
 *   · the CHILD owns the FK (`User.posts` — `Post.authorId` points back):
 *       `SELECT <post cols> FROM posts WHERE authorId IN (SELECT id FROM users [WHERE …])`
 *   · the OWNER owns the FK (`Post.author` — `Post.authorId` points out):
 *       `SELECT <user cols> FROM users WHERE id IN (SELECT authorId FROM posts [WHERE …])`
 *
 * The subquery is what makes this executable for ANY parent filter shape (a
 * literal id, a bound variable, `email`, `findMany()` with no filter at all):
 * the generator never guesses the parent row's key, and the statement is
 * labelled `role: 'relation'` because it is a follow-up load — the call itself
 * resolves to the parent read.
 */
function relationLoadStatement(
  rel: string,
  model: string,
  parentTable: string,
  predicate: string | null,
  params: unknown[],
  schema: PrismaSchema | undefined,
  seed: SeedContext | undefined,
): GeneratedStatement {
  const owner = schema ? findModel(schema, model) : undefined;
  const field = owner?.fields.find((f) => f.name === rel);
  if (!schema || !owner || !field) {
    return relationComment(`include ${rel}`, 'no schema declares this relation');
  }
  const target = resolveRelation(schema, owner, field);
  if (!target.targetModel) {
    return relationComment(`include ${rel}`, `model '${field.baseType}' is not in this schema`);
  }
  const targetColumns = modelShape(target.targetModel.name, schema, seed).columns;
  if (targetColumns.length === 0) {
    return relationComment(`include ${rel}`, `table '${target.childTable}' has no columns in this schema`);
  }
  const where = predicate ? ` WHERE ${predicate}` : '';

  if (relationIsExecutable(target)) {
    // The TARGET model owns the FK: load children by the parent's key.
    const inner = `SELECT ${target.referencedKey} FROM ${parentTable}${where}`;
    return {
      sql: `SELECT ${targetColumns.join(', ')} FROM ${target.childTable} WHERE ${target.foreignKey} IN (${inner});`,
      params,
      label: `include ${rel}`,
      role: 'relation',
    };
  }

  // The OWNER owns the FK: the relation is one parent row, loaded by the FK
  // value the owner's own rows carry (`Post.author` → the `author` row).
  const ownerFk = owner.fields.find(
    (f) =>
      f.relationFields.length > 0 &&
      f.baseType.toLowerCase() === target.targetModel!.name.toLowerCase(),
  );
  if (ownerFk?.relationFields[0]) {
    const targetKey = ownerFk.relationReferences[0] ?? 'id';
    const inner = `SELECT ${ownerFk.relationFields[0]} FROM ${parentTable}${where}`;
    return {
      sql: `SELECT ${targetColumns.join(', ')} FROM ${target.childTable} WHERE ${targetKey} IN (${inner});`,
      params,
      label: `include ${rel}`,
      role: 'relation',
    };
  }
  return relationComment(
    `include ${rel}`,
    `the FK column for '${rel}' is implicit in this schema, so there is no column to load by`,
  );
}

/** One `{ … }` row per `create` payload element (`[{…}]`, `{…}`, or `[]`). */
function createPayloadRows(payload: string): string[] {
  const trimmed = payload.trim();
  if (trimmed.startsWith('[')) {
    const list = balancedSpan(trimmed, 0);
    if (!list) return [];
    return splitArgs(list.trim().slice(1, -1))
      .map((e) => bodyOf((e.value !== '' ? e.value : e.key).trim()))
      .filter((r): r is string => r !== null);
  }
  const body = bodyOf(trimmed);
  return body ? [body] : [];
}

/**
 * Phase 10 — nested writes as REAL statements, but only where the FK value is
 * knowable from the learner's own code:
 *
 *   · `parentKey` given (an `update` whose `where` names the parent row) → a
 *     nested `create` row without an explicit FK gets `parentKey`, and
 *     `connect: { id: N }` becomes `UPDATE child SET fk = parentKey WHERE id = N`.
 *   · the row carries the FK scalar itself → used verbatim.
 *
 * Anything else — `create` of a NEW parent (its id does not exist yet),
 * `disconnect` on a to-many list, `set` — stays an honest comment: this
 * generator never invents the id a database is about to generate.
 */
function nestedWriteStatements(
  relation: string,
  op: string,
  payload: string,
  model: string,
  parentKey: string | null,
  schema: PrismaSchema | undefined,
  seed: SeedContext | undefined,
): GeneratedStatement[] {
  const owner = schema ? findModel(schema, model) : undefined;
  const field = owner?.fields.find((f) => f.name === relation);
  if (!schema || !owner || !field) {
    return [relationComment(`nested ${op} on ${relation}`, 'no schema declares this relation')];
  }
  const target = resolveRelation(schema, owner, field);
  if (!target.targetModel) {
    return [relationComment(`nested ${op} on ${relation}`, `model '${field.baseType}' is not in this schema`)];
  }
  const childColumns = modelShape(target.targetModel.name, schema, seed).columns;
  if (childColumns.length === 0) {
    return [
      relationComment(`nested ${op} on ${relation}`, `table '${target.childTable}' has no columns in this schema`),
    ];
  }
  if (!target.foreignKey) {
    return [
      relationComment(
        `nested ${op} on ${relation}`,
        `the FK column for '${relation}' is implicit in this schema, so no child row can be written`,
      ),
    ];
  }
  const fk = target.foreignKey;
  const childTable = target.childTable!;

  if (op === 'create') {
    const rows = createPayloadRows(payload);
    if (rows.length === 0) {
      return [relationComment(`nested create on ${relation}`, 'the payload carries no `{ … }` row')];
    }
    const out: GeneratedStatement[] = [];
    for (const row of rows) {
      const entries = scalarDataEntries(row);
      const carriesFk = entries.some((e) => e.field === fk);
      if (!carriesFk && parentKey === null) {
        out.push(
          relationComment(
            `nested create on ${relation}`,
            `the ${fk} of the parent row is generated by the database, so this child INSERT is not knowable statically`,
          ),
        );
        continue;
      }
      const fields = entries.map((e) => e.field);
      const values = entries.map((e) => literalFor(e.value, seed, [], e.field));
      if (!carriesFk) {
        fields.push(fk);
        values.push(parentKey!);
      }
      out.push({
        sql: `INSERT INTO ${childTable} (${fields.join(', ')}) VALUES (${values.join(', ')});`,
        params: [],
        label: `nested create ${relation}`,
        role: 'relation',
      });
    }
    return out;
  }

  if (op === 'connect' || op === 'connectOrCreate') {
    // `connect: { id: N }` names the CHILD row to attach; the parent's key has
    // to come from the caller (`where:` on an update), or nothing can be set.
    const inner = bodyOf(payload.trim());
    const whereBody =
      op === 'connectOrCreate' && inner ? bodyOf(argValue(inner, 'where') ?? null) : inner;
    const pairs = whereBody ? splitArgs(whereBody).filter((p) => p.value.trim() !== '') : [];
    const childKey = pairs[0];
    if (parentKey === null || !childKey) {
      return [
        relationComment(
          `nested ${op} on ${relation}`,
          'attaching an existing child row needs the parent key (a `where:` on an update) — statically unknown here',
        ),
      ];
    }
    return [
      {
        sql: `UPDATE ${childTable} SET ${fk} = ${parentKey} WHERE ${childKey.key} = ${literalFor(childKey.value, seed, [], childKey.key)};`,
        params: [],
        label: `nested ${op} ${relation}`,
        role: 'relation',
      },
    ];
  }

  return [
    relationComment(
      `nested ${op} on ${relation}`,
      'this nested operation has no standalone SQL equivalent in the seed universe',
    ),
  ];
}

function genFind(
  code: string,
  model: string,
  method: PrismaMethod,
  schema: PrismaSchema | undefined,
  seed: SeedContext | undefined,
): GenerateResult {
  const args = bodyOf(callArgs(code, method, model));
  // No args object: `findMany()` with zero args is a legal full-table scan.
  const body = args ?? '';
  const { table, columns } = modelShape(model, schema, seed);
  if (columns.length === 0) {
    return {
      ok: false,
      statements: [],
      method,
      model,
      reason: `Table '${table}' does not exist.`,
    };
  }

  const selectBody = bodyOf(argValue(body, 'select') ?? null);
  const includeBody = bodyOf(argValue(body, 'include') ?? null);
  const selected = selectFields(selectBody);
  const included = includeNames(includeBody);
  if (selected && included.length > 0) {
    return {
      ok: false,
      statements: [],
      method,
      model,
      reason: '`select` and `include` cannot be combined at the same level.',
    };
  }
  const projection = selected ?? columns;

  const whereBody = bodyOf(argValue(body, 'where') ?? null);
  const params: unknown[] = [];
  const predicate = whereBody ? whereSql(whereBody, seed, params, columns) : null;
  if (whereBody && !predicate) {
    return {
      ok: false,
      statements: [],
      method,
      model,
      reason: 'This `where` shape has no SQL equivalent in the seed universe.',
    };
  }

  const orderBody = bodyOf(argValue(body, 'orderBy') ?? null);
  const orders = orderEntries(orderBody);

  let limit: number | null = null;
  let offset: number | null = null;
  const takeRaw = argValue(body, 'take');
  const skipRaw = argValue(body, 'skip');
  const cursorRaw = argValue(body, 'cursor');
  if (takeRaw !== null) {
    const n = Number(takeRaw.trim());
    if (!Number.isInteger(n)) {
      return { ok: false, statements: [], method, model, reason: '`take` must be an integer literal.' };
    }
    limit = n;
  }
  if (skipRaw !== null) {
    const n = Number(skipRaw.trim());
    if (!Number.isInteger(n)) {
      return { ok: false, statements: [], method, model, reason: '`skip` must be an integer literal.' };
    }
    offset = n;
  }
  if (cursorRaw !== null) {
    return { ok: false, statements: [], method, model, reason: 'Cursor pagination needs a live cursor row — out of scope.' };
  }

  let sql = `SELECT ${projection.join(', ')} FROM ${table}`;
  if (predicate) sql += ` WHERE ${predicate}`;
  for (const o of orders) sql += sql.includes('ORDER BY') ? `, ${o.field} ${o.dir}` : ` ORDER BY ${o.field} ${o.dir}`;
  if (limit !== null) sql += ` LIMIT ${limit}`;
  if (offset !== null) sql += ` OFFSET ${offset}`;
  sql += ';';

  const statements: GeneratedStatement[] = [{ sql, params, label: 'read' }];
  // Relation loads are second queries in Prisma: real follow-up SQL when the
  // schema declares the FK (Phase 10), an honest non-executable note otherwise.
  for (const rel of included) {
    statements.push(relationLoadStatement(rel, model, table, predicate, params, schema, seed));
  }
  return { ok: true, statements, method, model };
}

/** `data: { … }` entries, split off from nested relation ops (`posts: {…}`). */
function scalarDataEntries(dataBody: string): { field: string; value: string }[] {
  return splitArgs(dataBody)
    .map(shorthand)
    .filter((p) => p.value !== '')
    .filter((p) => {
      const v = p.value.trim();
      return !(v.startsWith('{') && /create|connect|connectOrCreate|set|disconnect|delete|update|upsert/.test(v));
    })
    .map((p) => ({ field: p.key, value: p.value }));
}

/** Nested relation ops inside `data: { … }` (`posts: { create: […] }`). */
function nestedOps(dataBody: string): { relation: string; op: string; payload: string }[] {
  const out: { relation: string; op: string; payload: string }[] = [];
  for (const { key, value } of splitArgs(dataBody)) {
    const inner = bodyOf(value.trim());
    if (!inner) continue;
    const ops = splitArgs(inner);
    if (ops.length === 0) continue;
    if (!/create|connect|connectOrCreate|set|disconnect|delete|update|upsert/.test(ops[0].key)) continue;
    for (const { key: op, value: payload } of ops) {
      if (/create|connect|connectOrCreate|set|disconnect|delete|update|upsert/.test(op)) {
        out.push({ relation: key, op, payload });
      }
    }
  }
  return out;
}

function genCreate(
  code: string,
  model: string,
  method: 'create' | 'createMany',
  schema: PrismaSchema | undefined,
  seed: SeedContext | undefined,
): GenerateResult {
  const args = bodyOf(callArgs(code, method, model));
  if (args === null) {
    return { ok: false, statements: [], method, model, reason: `Could not read the \`${method}\` argument object.` };
  }
  const { table, columns } = modelShape(model, schema, seed);
  if (columns.length === 0) {
    return {
      ok: false,
      statements: [],
      method,
      model,
      reason: `Table '${table}' does not exist.`,
    };
  }
  const params: unknown[] = [];

  if (method === 'createMany') {
    const dataRaw = argValue(args, 'data');
    const list = dataRaw?.trim().startsWith('[') ? balancedSpan(dataRaw.trim(), 0) : null;
    if (!list) {
      return { ok: false, statements: [], method, model, reason: '`createMany` needs `data: [ … ]`.' };
    }
    const inner = list.trim().slice(1, -1);
    const rows = splitArgs(inner).map((e) => bodyOf((e.value !== '' ? e.value : e.key).trim()));
    if (rows.some((r) => r === null)) {
      return { ok: false, statements: [], method, model, reason: 'Every `createMany` row must be a `{ … }` object.' };
    }
    const parsed = (rows as string[]).map((r) => scalarDataEntries(r));
    const cols = [...new Set(parsed.flatMap((r) => r.map((e) => e.field)))];
    if (cols.length === 0) {
      return { ok: false, statements: [], method, model, reason: '`createMany` rows carry no scalar fields.' };
    }
    const tuples = parsed.map(
      (row) =>
        `(${cols.map((c) => literalFor(row.find((e) => e.field === c)?.value ?? 'NULL', seed, params, c)).join(', ')})`,
    );
    return {
      ok: true,
      method,
      model,
      statements: [{ sql: `INSERT INTO ${table} (${cols.join(', ')}) VALUES ${tuples.join(', ')};`, params, label: 'bulk insert' }],
    };
  }

  const dataBody = bodyOf(argValue(args, 'data') ?? null);
  if (dataBody === null) {
    return { ok: false, statements: [], method, model, reason: '`create` needs `data: { … }`.' };
  }
  const entries = scalarDataEntries(dataBody);
  if (entries.length === 0) {
    return { ok: false, statements: [], method, model, reason: '`create` data carries no scalar fields.' };
  }
  const statements: GeneratedStatement[] = [
    {
      sql: `INSERT INTO ${table} (${entries.map((e) => e.field).join(', ')}) VALUES (${entries.map((e) => literalFor(e.value, seed, params, e.field)).join(', ')});`,
      params,
      label: 'parent insert',
    },
  ];
  // Nested writes fan out into follow-up statements, in source order. A
  // `create` has no parent key yet (`data` is what CREATES it), so only rows
  // that carry the FK scalar themselves become real child INSERTs; the rest
  // stay honest notes naming the statically-unknown key (Phase 10).
  for (const { relation, op, payload } of nestedOps(dataBody)) {
    statements.push(
      ...nestedWriteStatements(relation, op, payload, model, null, schema, seed),
    );
  }
  return { ok: true, statements, method, model };
}

/**
 * The parent-key literal an update's `where` names (`where: { id: 2 }` → `2`).
 * Prefers the model's `@id` column, else the single scalar pair. `null` when
 * the `where` names no single scalar (compound or relational filters) — nested
 * writes then stay honest notes instead of guessing a key.
 */
function parentKeyLiteral(
  whereBody: string | null,
  model: string,
  schema: PrismaSchema | undefined,
  seed: SeedContext | undefined,
  params: unknown[],
): string | null {
  const pairs = wherePairs(whereBody);
  if (pairs.length === 0) return null;
  const owner = schema ? findModel(schema, model) : undefined;
  const key = owner ? primaryKeyOf(owner) : 'id';
  const pair = pairs.find((p) => p.field === key) ?? (pairs.length === 1 ? pairs[0] : null);
  if (!pair) return null;
  return literalFor(pair.value, seed, params, pair.field);
}

function genUpdate(
  code: string,
  model: string,
  method: 'update' | 'updateMany' | 'upsert' | 'delete' | 'deleteMany',
  schema: PrismaSchema | undefined,
  seed: SeedContext | undefined,
): GenerateResult {
  const args = bodyOf(callArgs(code, method, model));
  if (args === null) {
    return { ok: false, statements: [], method, model, reason: `Could not read the \`${method}\` argument object.` };
  }
  const { table, columns } = modelShape(model, schema, seed);
  if (columns.length === 0) {
    return {
      ok: false,
      statements: [],
      method,
      model,
      reason: `Table '${table}' does not exist.`,
    };
  }
  const params: unknown[] = [];
  const whereBody = bodyOf(argValue(args, 'where') ?? null);
  const predicate = whereBody ? whereSql(whereBody, seed, params, columns) : null;
  if (whereBody && !predicate && method !== 'upsert') {
    return { ok: false, statements: [], method, model, reason: 'This `where` shape has no SQL equivalent in the seed universe.' };
  }

  if (method === 'upsert') {
    // Prisma tries UPDATE, falls back to INSERT. The seed cannot know which
    // branch fires, so the lens runs the UPDATE probe: zero affected rows
    // means "would have inserted" (P2002-style labs assert the count).
    const updateBody = bodyOf(argValue(args, 'update') ?? null);
    const createBody = bodyOf(argValue(args, 'create') ?? null);
    if (updateBody === null || createBody === null) {
      return { ok: false, statements: [], method, model, reason: '`upsert` needs `where`, `update` and `create`.' };
    }
    const sets = scalarDataEntries(updateBody);
    const setSql = sets.map((e) => `${e.field} = ${literalFor(e.value, seed, params, e.field)}`).join(', ');
    const creates = scalarDataEntries(createBody);
    const insertSql =
      creates.length > 0
        ? `INSERT INTO ${table} (${creates.map((e) => e.field).join(', ')}) VALUES (${creates.map((e) => literalFor(e.value, seed, params, e.field)).join(', ')});`
        : null;
    const statements: GeneratedStatement[] = [];
    // An empty `update: {}` is a no-op probe ("insert-or-leave"): the branch
    // decision is the row's existence, so the lens emits a SELECT probe
    // instead of a zero-column UPDATE.
    if (!setSql && predicate) {
      statements.push({ sql: `SELECT 1 FROM ${table} WHERE ${predicate} LIMIT 1;`, params, label: 'upsert probe (existence check)' });
    } else if (setSql && predicate) {
      statements.push({ sql: `UPDATE ${table} SET ${setSql} WHERE ${predicate};`, params, label: 'upsert probe (update branch)' });
    }
    if (insertSql) {
      statements.push({ sql: `-- upsert fallback (insert branch): ${insertSql}`, params: [], label: 'upsert fallback' });
    }
    if (statements.length === 0) {
      return { ok: false, statements: [], method, model, reason: '`upsert` carries no scalar update or create fields.' };
    }
    return { ok: true, statements, method, model };
  }

  if (method === 'delete' || method === 'deleteMany') {
    if (!predicate) {
      return { ok: false, statements: [], method, model, reason: `\`${method}\` needs a translatable \`where\` — unconditional deletes never run.` };
    }
    return { ok: true, statements: [{ sql: `DELETE FROM ${table} WHERE ${predicate};`, params, label: 'delete' }], method, model };
  }

  const dataBody = bodyOf(argValue(args, 'data') ?? null);
  if (dataBody === null) {
    return { ok: false, statements: [], method, model, reason: `\`${method}\` needs \`data: { … }\`.` };
  }
  const sets = scalarDataEntries(dataBody)
    .map((e) => `${e.field} = ${literalFor(e.value, seed, params, e.field)}`)
    .join(', ');
  if (!sets) {
    return { ok: false, statements: [], method, model, reason: `\`${method}\` data carries no scalar fields.` };
  }
  // Atomic numeric ops (`increment`, `decrement`, …) are expressions, not
  // literals — the lens rewrites them to the SQL the engine understands.
  const atomic = scalarAtomicSets(dataBody, seed, params);
  const setSql = atomic ?? sets;
  if (!predicate) {
    return { ok: false, statements: [], method, model, reason: `\`${method}\` needs a translatable \`where\` — unconditional writes never run.` };
  }
  const statements: GeneratedStatement[] = [
    { sql: `UPDATE ${table} SET ${setSql} WHERE ${predicate};`, params, label: 'update' },
  ];
  // Nested writes on an UPDATE do know the parent key: the caller's own `where`
  // names the row (`where: { id: 2 }`), so a nested `create` gets `authorId = 2`
  // and a nested `connect` becomes a real child UPDATE (Phase 10).
  const parentKey = parentKeyLiteral(whereBody, model, schema, seed, params);
  for (const { relation, op, payload } of nestedOps(dataBody)) {
    statements.push(
      ...nestedWriteStatements(relation, op, payload, model, parentKey, schema, seed),
    );
  }
  return { ok: true, statements, method, model };
}

/** `field: { increment: 1 }` → `field = field + 1` (and siblings). */
function scalarAtomicSets(
  dataBody: string,
  seed: SeedContext | undefined,
  params: unknown[],
): string | null {
  const entries = splitArgs(dataBody).map(shorthand).filter((p) => p.value !== '');
  let used = false;
  const sets = entries.map(({ key: field, value }) => {
    const body = bodyOf(value.trim());
    if (!body) return `${field} = ${literalFor(value, seed, params, field)}`;
    const pairs = splitArgs(body);
    if (pairs.length !== 1) return `${field} = ${literalFor(value, seed, params, field)}`;
    const [{ key, value: v }] = pairs;
    const lit = literalFor(v, seed, params, field);
    switch (key) {
      case 'increment':
        used = true;
        return `${field} = ${field} + ${lit}`;
      case 'decrement':
        used = true;
        return `${field} = ${field} - ${lit}`;
      case 'multiply':
        used = true;
        return `${field} = ${field} * ${lit}`;
      case 'divide':
        used = true;
        return `${field} = ${field} / ${lit}`;
      case 'set':
        used = true;
        return `${field} = ${lit}`;
      default:
        return `${field} = ${literalFor(value, seed, params, field)}`;
    }
  });
  return used ? sets.join(', ') : null;
}



/** `$transaction([ … ])` and `$transaction(async (tx) => …)` → inner calls in order. */
function genTransaction(code: string, seed: SeedContext | undefined, schema: PrismaSchema | undefined): GenerateResult {
  const txCall = /(?:prisma|tx)\s*\.\s*\$transaction\s*\(/.exec(code);
  if (!txCall) {
    return { ok: false, statements: [], method: '$transaction', reason: 'No `$transaction(` call found.' };
  }
  let i = txCall.index + txCall[0].length;
  while (i < code.length && /\s/.test(code[i])) i++;
  const argSpan = code[i] === '[' || code[i] === '{' ? balancedSpan(code, i) : null;

  // Array form: every `prisma.<model>.<method>({ … })` element, in order.
  if (argSpan?.startsWith('[')) {
    const inner = argSpan.slice(1, -1);
    const calls = splitArgs(inner).map((e) => (e.value !== '' ? e.value : e.key));
    const statements: GeneratedStatement[] = [];
    let n = 0;
    for (const call of calls) {
      const { method } = extractPrismaTarget(call);
      if (!method || method === '$transaction') {
        return { ok: false, statements: [], method: '$transaction', reason: 'A `$transaction([...])` element is not a client call.' };
      }
      const sub = generatePrismaSql(call, { schema, seed });
      if (!sub.ok) {
        return { ok: false, statements: [], method: '$transaction', reason: `Element ${n + 1}: ${sub.reason ?? 'untranslatable'}.` };
      }
      n++;
      for (const s of sub.statements) {
        if (s.sql.trim().startsWith('--')) continue;
        statements.push({ ...s, label: `tx step ${n}: ${s.label}` });
      }
    }
    if (statements.length === 0) {
      return { ok: false, statements: [], method: '$transaction', reason: 'No executable statements inside `$transaction([...])`.' };
    }
    return { ok: true, statements, method: '$transaction', rowEffect: 'sum' };
  }

  // Interactive form: every `tx.<model>.<method>({ … })` inside the callback.
  const txCalls = [...code.matchAll(/tx\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)];
  if (txCalls.length > 0) {
    const statements: GeneratedStatement[] = [];
    let n = 0;
    for (const m of txCalls) {
      // `tx.<model>.<method>(…)` rewrites to a `prisma.` call so the recursive
      // translation takes the same path as every other client call.
      const call = code.slice(m.index).replace(/^tx\s*\./, 'prisma.');
      const sub = generatePrismaSql(call, { schema, seed });
      if (!sub.ok) {
        // The seed universe is single-table (`users`): a step touching any
        // other model (a `posts` write inside a checkout transaction) has no
        // SQL of its own. Skip the step, keep the translatable ones — the
        // row-effect aggregate still grades the visible writes honestly.
        const skippedTable = /Table '([^']+)' does not exist/.exec(sub.reason ?? '');
        if (skippedTable) {
          statements.push({
            sql: `-- tx step ${n + 1}: ${sub.reason}`,
            params: [],
            label: `tx step ${n + 1}: skipped (${skippedTable[1]} not in seed)`,
          });
          n++;
          continue;
        }
        return { ok: false, statements: [], method: '$transaction', reason: `Callback step ${n + 1}: ${sub.reason ?? 'untranslatable'}.` };
      }
      n++;
      for (const s of sub.statements) {
        if (s.sql.trim().startsWith('--')) continue;
        statements.push({ ...s, label: `tx step ${n}: ${s.label}` });
      }
    }
    if (statements.length === 0) {
      return { ok: false, statements: [], method: '$transaction', reason: 'No executable statements inside the transaction callback.' };
    }
    return { ok: true, statements, method: '$transaction', rowEffect: 'last' };
  }

  void seed;
  return { ok: false, statements: [], method: '$transaction', reason: 'Empty `$transaction` — nothing to run.' };
}

/**
 * Translate one Prisma client call into executable SQL. Dispatches on the
 * detected method; anything without a `prisma.<model>.<method>(…)` call
 * (CLI / schema.prisma / URL / Zod / middleware labs) is an honest miss.
 */
export function generatePrismaSql(code: string, options: GenerateOptions = {}): GenerateResult {
  // `$transaction` first: `prisma.$transaction([ prisma.user.update(…) ])` also
  // contains a client call, so the inner-call regex would otherwise win.
  if (/(?:prisma|tx)\s*\.\s*\$transaction\s*\(/.test(code)) {
    return genTransaction(code, options.seed, options.schema);
  }
  const { model, method } = extractPrismaTarget(code);
  if (!method || !model) {
    return { ok: false, statements: [], reason: 'No `prisma.<model>.<method>(…)` call found.' };
  }
  const m = method as PrismaMethod;
  switch (m) {
    case 'findMany':
    case 'findUnique':
    case 'findFirst':
      return genFind(code, model, m, options.schema, options.seed);
    case 'create':
    case 'createMany':
      return genCreate(code, model, m, options.schema, options.seed);
    case 'update':
    case 'updateMany':
    case 'upsert':
    case 'delete':
    case 'deleteMany':
      return genUpdate(code, model, m, options.schema, options.seed);
    case '$transaction':
      return genTransaction(code, options.seed, options.schema);
    default:
      return { ok: false, statements: [], method: m, model, reason: `Method \`${method}\` is not translatable.` };
  }
}




/**
 * Render one statement's `param:` markers with the values the statement
 * recorded — the ONE substitution path shared by the submit pipeline and the
 * proxy executor (never two drifting copies).
 *
 * Markers are matched to their recorded param by NAME, never by position:
 * params are recorded in EVALUATION order (`where` before `data`), which is
 * the reverse of how those values appear in the finished statement.
 *
 * Resolution order, most specific first:
 *   1. the learner's own expression when the caller bound it (`where: { id:
 *      someId }` with `someId` in the seed context);
 *   2. the FIELD the marker belongs to, through the demo universe (`where: {
 *      email: buyerEmail }` → the seeded `email`), which is what keeps the SQL
 *      Lens and the executor working on real seed rows when only the caller
 *      could know the real value;
 *   3. nothing to bind (`name: req.body.title`) → an honest `NULL`, never a
 *      guessed literal.
 *
 * Literals never reach this function — `literalFor` renders them verbatim.
 */
export function renderGeneratedSql(stmt: GeneratedStatement, seed?: SeedContext): string {
  const merged: Record<string, unknown> = { ...PRISMA_DEMO_VARIABLES, ...(seed?.variables ?? {}) };
  const bound = (key: string | undefined): string | null => {
    const name = (key ?? '').trim();
    if (!name || !(name in merged)) return null;
    const value = merged[name];
    if (value === undefined) return null;
    return toLiteral(value as string | number | boolean | null);
  };
  const records = stmt.params as { name?: string; source?: string }[];
  const used = new Set<number>();
  return stmt.sql.replace(/\/\*\s*param:([^*]+?)\s*\*\//g, (_match, rawName) => {
    const marker = String(rawName).trim();
    const at = records.findIndex((r, i) => !used.has(i) && (r?.name ?? '').trim() === marker);
    if (at >= 0) used.add(at);
    const record = at >= 0 ? records[at] : undefined;
    const source = (record?.source ?? '').trim();
    // 1. the learner's own expression, when the caller bound that name.
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(source)) {
      const direct = bound(source);
      if (direct !== null) return direct;
    }
    // 2. the FIELD this marker belongs to (the demo universe), else 3. NULL.
    return bound(marker) ?? 'NULL';
  });
}
