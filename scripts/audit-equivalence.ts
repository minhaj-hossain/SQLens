/**
 * scripts/audit-equivalence.ts — Phase-5 author guardrail (audit instrument).
 *
 * For EVERY exact-result task it proves two things that a "solution passes its
 * own validator" check cannot:
 *
 *   1. APPROACH FAIRNESS — a semantically equivalent rewrite of the reference
 *      solution still passes (operator aliases, keyword case, whitespace, and a
 *      CTE re-wrap). A false-reject means a learner who solved it a legal
 *      different way is told they are wrong.
 *
 *   2. NO FALSE-ACCEPT — a variant that CHANGES the result set (the load-bearing
 *      WHERE clause removed) must FAIL. If it passes, the task is graded by
 *      something content-blind and a wrong answer scores.
 *
 * It also asserts `strictConstruct: true` still accepts the task's OWN solution,
 * which catches an author enabling a strict rule their reference answer does not
 * satisfy (that task would be impossible to complete).
 *
 * Run: npx tsx scripts/audit-equivalence.ts  (wired as npm run audit:equivalence:tasks)
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { validateTaskSolution, isReadOnlySelect } from '../src/lib/sql-engine/validator';
import { serializeCellValue } from '../src/lib/sql-engine/state-verification';

interface Finding {
  taskId: string;
  kind: 'FALSE_REJECT' | 'FALSE_ACCEPT' | 'STRICT_IMPOSSIBLE' | 'EXEC_ERROR';
  detail: string;
}

const findings: Finding[] = [];
let tasksChecked = 0;
let rewritesRun = 0;
/** Variants whose dataset differed from the baseline (not form-equivalent). */
let skippedNonEquivalent = 0;

/** Replace text only OUTSIDE string literals. */
function mapOutsideLiterals(sql: string, fn: (chunk: string) => string): string {
  let out = '';
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      while (j < sql.length && sql[j] !== quote) j++;
      out += sql.slice(i, Math.min(j + 1, sql.length));
      i = j + 1;
      continue;
    }
    let j = i;
    while (j < sql.length && sql[j] !== "'" && sql[j] !== '"') j++;
    out += fn(sql.slice(i, j));
    i = j;
  }
  return out;
}

/** Find the top-level WHERE clause span, or null when there is none. */
function topLevelWhereSpan(sql: string): [number, number] | null {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inStr) {
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '(') { depth++; continue; }
    if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
    if (depth !== 0) continue;
    const upper = sql.slice(i, i + 5).toUpperCase();
    if (upper === 'WHERE' && (i === 0 || /[\s,;)]/.test(sql[i - 1]))) {
      let end = sql.length;
      for (const kw of ['GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET']) {
        const idx = sql.toUpperCase().indexOf(kw, i);
        if (idx !== -1 && idx < end) end = idx;
      }
      return [i, end];
    }
  }
  return null;
}

/** Canonical multiset key for a result set (order-insensitive). */
function rowKeys(rows: any[]): string[] {
  return (rows || [])
    .map((r) => Object.keys(r || {}).sort().map((k) => serializeCellValue(r[k])).join('\u0001'))
    .sort();
}
function sameRows(a: any[], b: any[]): boolean {
  const ka = rowKeys(a);
  const kb = rowKeys(b);
  return ka.length === kb.length && ka.every((k, i) => k === kb[i]);
}

/** Generate the equivalent rewrites that must ALL still pass. */
function equivalents(sql: string, hasOrderRequirement: boolean): Array<[string, string]> {
  const out: Array<[string, string]> = [];

  // 1. Comparison-operator alias: <> and != are the same operator.
  const swapped = mapOutsideLiterals(sql, (s) =>
    s.includes('<>') ? s.replace(/<>/g, '!=') : s.replace(/!=/g, '<>')
  );
  if (swapped !== sql) out.push(['operator alias (<> <-> !=)', swapped]);

  // 2. Keyword/identifier case is insignificant.
  const folded = mapOutsideLiterals(sql, (s) => {
    const kw = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
      'OFFSET', 'JOIN', 'INNER', 'LEFT', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN',
      'BETWEEN', 'LIKE', 'IS', 'NULL', 'DISTINCT', 'ASC', 'DESC', 'UNION', 'EXISTS',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'BY'];
    let r = s;
    for (const k of kw) r = r.replace(new RegExp(`\\b${k}\\b`, 'g'), k.toLowerCase());
    return r;
  });
  if (folded !== sql) out.push(['keyword case (lowercase)', folded]);

  // 3. Whitespace is insignificant.
  const squashed = mapOutsideLiterals(sql, (s) => s.replace(/\s+/g, ' ')).replace(/;\s*$/, '');
  if (squashed !== mapOutsideLiterals(sql, (s) => s).replace(/;\s*$/, '')) {
    out.push(['whitespace (single-spaced)', squashed]);
  }

  // 4. CTE re-wrap: the same rows reachable through a derived table. Skipped when
  //    the query's own sort/limit cannot survive the wrap (outer order would be
  //    lost), where the rule requires ordering, or when the query is already a CTE.
  const upper = sql.toUpperCase();
  const tailSensitive = hasOrderRequirement || /ORDER\s+BY|LIMIT|OFFSET/.test(upper);
  if (!tailSensitive && !/^\s*WITH\b/i.test(sql) && !/UNION|EXCEPT|INTERSECT/.test(upper)) {
    const inner = sql.replace(/;\s*$/, '');
    // Re-select the solution's OUTPUT columns by alias: the executor merges
    // prefixed keys, so a bare `SELECT * FROM _v` would duplicate every
    // column. Aggregates (COUNT(*) AS c) must be projected as their alias
    // (`c`) — re-applying the aggregate outside would collapse the groups.
    // When a select item has no plain re-selectable form, skip the rewrite
    // rather than generating a semantically different query.
    const m = inner.match(/^\s*SELECT\s+(DISTINCT\s+)?([\s\S]+?)\s+FROM\s+/i);
    if (m) {
      const distinctKw = m[1] ? 'DISTINCT ' : '';
      const parts: string[] = [];
      let cur = '';
      let depth = 0;
      let inStr: string | null = null;
      for (let i = 0; i < m[2].length; i++) {
        const ch = m[2][i];
        if (inStr) {
          cur += ch;
          if (ch === inStr) inStr = null;
          continue;
        }
        if (ch === "'" || ch === '"') { inStr = ch; cur += ch; continue; }
        if (ch === '(') depth++;
        if (ch === ')') depth = Math.max(0, depth - 1);
        if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
        cur += ch;
      }
      if (cur.trim()) parts.push(cur);
      const projItems: string[] = [];
      let skippable = false;
      for (const p of parts) {
        const t = p.trim();
        if (t === '*') { projItems.push('*'); continue; }
        const aliasM = t.match(/\s+AS\s+([`"']?[\w_]+[`"']?)\s*$/i);
        if (aliasM) { projItems.push(aliasM[1].replace(/[`"']/g, '')); continue; }
        if (/\(/.test(t)) { skippable = true; break; } // aggregate/fn w/o alias
        projItems.push(t);
      }
      if (!skippable && projItems.length > 0) {
        out.push(['CTE re-wrap', `WITH _v AS (${inner}) SELECT ${distinctKw}${projItems.join(', ')} FROM _v;`]);
      }
    }
  }

  // --- P1 batch — Milestone-4 shape families --------------------------------
  // Every variant still flows through the row-equality guard in the caller
  // (a rewrite whose dataset differs is dropped, never a false-reject), so
  // these can be aggressive about form while staying honest about content.

  // 5. Comment header + trailing semicolon tolerance.
  const commented = `-- approach-fairness rewrite\n${sql.trim().replace(/;\s*$/, '')};`;
  if (commented !== sql) out.push(['leading comment + trailing semicolon', commented]);

  // 6. BETWEEN → inclusive range expansion (and the reverse via keyword-case
  //    family doesn't apply here; this direction is the one learners rewrite).
  const unBeted = mapOutsideLiterals(sql, (s) =>
    s.replace(/\b([A-Za-z_][\w.]*)\s+BETWEEN\s+(-?[\w.]+)\s+AND\s+(-?[\w.]+)/gi, '$1 >= $2 AND $1 <= $3'),
  );
  if (unBeted !== sql) out.push(['BETWEEN → >= AND <=', unBeted]);

  // 7. COALESCE ↔ IFNULL (both are registered equivalents in the dialect).
  const coaToIf = mapOutsideLiterals(sql, (s) => s.replace(/\bCOALESCE\s*\(/gi, 'IFNULL('));
  if (coaToIf !== sql) out.push(['COALESCE → IFNULL', coaToIf]);
  const ifToCoa = mapOutsideLiterals(sql, (s) => s.replace(/\bIFNULL\s*\(/gi, 'COALESCE('));
  if (ifToCoa !== sql) out.push(['IFNULL → COALESCE', ifToCoa]);

  // 8. Integer cursor step (keyset pagination): `col > 5` ≡ `col >= 6` and
  //    `col < 5` ≡ `col <= 4` for integer data. On non-integer datasets the
  //    forms genuinely differ — the row-equality guard drops the variant then.
  const stepped = mapOutsideLiterals(sql, (s) =>
    s
      .replace(/\b([A-Za-z_][\w.]*)\s*>\s*(\d+)(?!\.\d)/g, (_, c, n) => `${c} >= ${Number(n) + 1}`)
      .replace(/\b([A-Za-z_][\w.]*)\s*<\s*(\d+)(?!\.\d)/g, (_, c, n) => `${c} <= ${Number(n) - 1}`),
  );
  if (stepped !== sql) out.push(['integer cursor step (> n → >= n+1)', stepped]);

  // 9. JSON path quoting (MySQL-legal): '$.a.b' ≡ '$."a"."b"' ≡ '$["a"]'.
  //    Path literals only — any other string literal is untouched.
  const quotedSeg = sql.replace(/'(\$\.([\w]+(?:\.[\w]+)*)+)'/g, (_m, p: string) =>
    `'${p.split('.').map((seg, i) => (i === 0 ? seg : `"${seg}"`)).join('.')}'`,
  );
  if (quotedSeg !== sql) out.push(['JSON path quoted segments ($.a → $."a")', quotedSeg]);
  const bracketPath = sql.replace(/'\$\.([\w]+)'/g, (_m, seg: string) => `'$["${seg}"]'`);
  if (bracketPath !== sql) out.push(['JSON path bracket form ($.a → $["a"])', bracketPath]);

  return out;
}

for (const mod of ALL_MODULES as any[]) {
  const conceptGroups: Array<[string, any[]]> = (mod.concepts ?? []).map((c: any) => [c.id, c.tasks ?? []]);
  if (mod.challenge?.tasks) conceptGroups.push(['challenge', mod.challenge.tasks]);

  for (const [groupKey, groupTasks] of conceptGroups) {
    // One executor per module, tasks in curriculum order — mirrors the app, so
    // DDL from earlier tasks is present (required by later tasks).
    const ex = new SqlExecutor();

    for (const task of groupTasks) {
      if (task.databaseLifecycle === 'fresh') ex.resetDatabase();

      // Replay EVERY task's statement on the module session BEFORE deciding
      // whether it is auditable. A `databaseLifecycle: 'inherit'` task can
      // depend on state created by earlier tasks whose own solutions are
      // non-read-only (BEGIN/INSERT/COMMIT, DDL). Skipping them left the
      // session empty and reported spurious false rejects — e.g. day-26
      // `tx-c1-t3` expects 3 rows inserted by the two preceding INSERT tasks.
      // Errors here are intentionally ignored; `audit-all-tasks.ts` is the
      // script that reports them.
      if (task.solutionSql) {
        try {
          ex.executeQuery(task.solutionSql);
        } catch {
          /* reported by audit-all-tasks */
        }
      }

      if (!task.validation?.requireExactResult) continue;
      if (task.validation.expectFailure) continue;
      if (!task.solutionSql || !isReadOnlySelect(task.solutionSql)) continue;

      const label = `${mod.id}/${groupKey}/${task.id}`;
      tasksChecked++;

      // Re-running the (read-only) reference solution yields the expected set.
      let expected: any;
      try {
        expected = ex.executeQuery(task.solutionSql);
      } catch (e) {
        findings.push({ taskId: label, kind: 'EXEC_ERROR', detail: e instanceof Error ? e.message : String(e) });
        continue;
      }
      if (!expected.success) continue; // covered by audit-all-tasks

      // --- 1. approach fairness -------------------------------------------------
      // Variants run on the SAME module-session executor as `expected`, not a
      // fresh one: tasks with `databaseLifecycle: 'inherit'` depend on rows
      // created by earlier tasks in the module (e.g. transaction inserts), so a
      // fresh executor would report a false reject for a correct rewrite.
      // Safe because every task here passed `isReadOnlySelect`, so running the
      // rewrite cannot mutate the session.
      const hasOrderRequirement = !!(task.validation.requireOrderBy && task.validation.requireOrderBy.length);
      // P1: reference answers for tasks carrying `judgment[]` — the audits
      // simulate a perfect learner (right SQL + right reasoning).
      const judgmentAnswers = task.validation.judgment?.map((j: { correctIndex: number }) => j.correctIndex);
      for (const [name, variant] of equivalents(task.solutionSql, hasOrderRequirement)) {
        rewritesRun++;
        let vr;
        try {
          vr = ex.executeQuery(variant);
        } catch (e) {
          findings.push({ taskId: label, kind: 'EXEC_ERROR', detail: `${name} threw: ${e instanceof Error ? e.message : String(e)}` });
          continue;
        }
        // P1 guard: a "form" rewrite that changes the ROWS was never a form
        // rewrite (e.g. the integer-cursor step on decimal data) — it is not a
        // fairness candidate at all, so drop it silently but count it. Engine-
        // side equivalence of these operators is proven separately by
        // tests/engine/equivalence.test.ts; this gate proves the VALIDATOR
        // accepts equivalent forms.
        if (vr.success && !sameRows(vr.rows, expected.rows)) {
          skippedNonEquivalent++;
          continue;
        }
        const o = validateTaskSolution(variant, vr, task.validation, expected, judgmentAnswers);
        if (!o.passed) {
          findings.push({ taskId: label, kind: 'FALSE_REJECT', detail: `${name}: ${o.feedback}` });
        }
      }

      // --- 2. no false-accept ---------------------------------------------------
      const span = topLevelWhereSpan(task.solutionSql);
      if (span) {
        const stripped = task.solutionSql.slice(0, span[0]) + task.solutionSql.slice(span[1]);
        const sr = ex.executeQuery(stripped);
        if (sr.success && !sameRows(sr.rows, expected.rows)) {
          rewritesRun++;
          const o = validateTaskSolution(stripped, sr, task.validation, expected, judgmentAnswers);
          if (o.passed) {
            findings.push({
              taskId: label,
              kind: 'FALSE_ACCEPT',
              detail: `dropping the WHERE clause yields a DIFFERENT result set but still passes: ${task.solutionSql.slice(span[0], span[1]).trim().slice(0, 70)}`,
            });
          }
        }
      }

      // --- 3. strict rules must accept the reference answer ---------------------
      if (task.validation.strictConstruct) {
        const r = ex.executeQuery(task.solutionSql);
        const o = validateTaskSolution(task.solutionSql, r, task.validation, expected, judgmentAnswers);
        if (!o.passed) {
          findings.push({ taskId: label, kind: 'STRICT_IMPOSSIBLE', detail: o.feedback });
        }
      }
    }
  }
}

console.log(`audit-equivalence: tasks=${tasksChecked} rewrites=${rewritesRun} skipped-non-equivalent=${skippedNonEquivalent} findings=${findings.length}`);
if (findings.length > 0) {
  for (const f of findings) console.log(`  ${f.kind.padEnd(18)} ${f.taskId}\n      ${f.detail}`);
  process.exit(1);
}
console.log('OK — every exact-result task is approach-fair, content-sensitive, and self-consistent.');
