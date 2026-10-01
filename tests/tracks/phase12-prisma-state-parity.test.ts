/**
 * Phase 12 — Prisma final-state grading parity (Task 0.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * The SQL track grades mutations by FINAL DATABASE STATE: an UPDATE that hits
 * the wrong row reports the same `affectedRows` as the right one, so only a
 * state comparison can tell them apart (`docs/GRADING_POLICY.md` Rule 2). The
 * Prisma pipeline was missing that layer — `where: { id: 2 }` and
 * `data: { name: 'HACKED' }` both scored as passes (empirically proven before
 * this task landed). These tests pin the parity layer:
 *
 *   1. the classifier (`isStateGradedPrismaTask`) separates mutations from reads;
 *   2. a CLEAN mutating reference passes the layer (`stateOk: true`);
 *   3. wrong-row and wrong-value variants FAIL at `stage: 'final-state'`,
 *      including through the REAL `submitForTask` router (the UI path);
 *   4. reads stay result-graded (`stateOk` undefined);
 *   5. hosts without the snapshot hook keep the legacy verdicts (no crash);
 *   6. Task 0.2: NO executable reference renders `NULL` in a write position, so
 *      the final-state layer is active on every mutating task (corpus sweep),
 *      and the original `prisma10-c1-t1` probes now FAIL.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import {
  isExecutablePrismaTask,
  isStateGradedPrismaTask,
  prismaSeedContext,
  runAndGradePrismaSubmission,
  schemaForTask,
} from '../../src/lib/prisma-engine/prisma-submit-pipeline';
import {
  generatePrismaSql,
  renderGeneratedSql,
} from '../../src/lib/prisma-engine/prisma-sql-generator';
import { submitForTask } from '../../src/lib/track-submit';
import type { PracticeTask } from '../../src/types/curriculum';

function allPrismaTasks(): PracticeTask[] {
  return PRISMA_MODULES.flatMap((mod) => [
    ...mod.concepts.flatMap((c) => c.tasks),
    ...(mod.challenge?.tasks ?? []),
  ]);
}

function taskById(id: string): PracticeTask {
  const hit = allPrismaTasks().find((t) => t.id === id);
  if (!hit) throw new Error('No Prisma task ' + id);
  return hit;
}

/** Full UI-parity hooks (matches `SqlExecutorProvider` + the phase8 harness). */
function fullHooks(exec: SqlExecutor) {
  exec.allowDdlOverwrite = true;
  return {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
    getCommittedState: () => exec.getCommittedState(),
    getTransactionState: () => exec.getTransactionState(),
    resetDatabase: () => exec.resetDatabase(),
  };
}

/**
 * The clean mutating reference used for the probe battery: `prisma10-c1-t2`
 * renders no unresolved params (`UPDATE users SET name = 'Alexandra' WHERE
 * name = 'Alex'`), so the state layer is active on it today.
 */
function cleanUpdateTask(): PracticeTask {
  return taskById('prisma10-c1-t2');
}

function submitGraded(task: PracticeTask, code: string, hooks: ReturnType<typeof fullHooks>) {
  return runAndGradePrismaSubmission({ task, code, hooks, surface: 'lesson', record: false });
}

/** Learner variant: same statement SHAPE as the reference, different target row. */
const WRONG_ROW_UPDATE_MANY = [
  'export async function renameAll() {',
  '  return await prisma.user.updateMany({',
  "    where: { name: 'Mina' },",
  "    data: { name: 'Alexandra' },",
  '  });',
  '}',
].join('\n');

/** Learner variant: right row, wrong value. */
const WRONG_VALUE_UPDATE_MANY = [
  'export async function renameAll() {',
  '  return await prisma.user.updateMany({',
  "    where: { name: 'Alex' },",
  "    data: { name: 'HACKED' },",
  '  });',
  '}',
].join('\n');

describe('Phase 12 — Prisma final-state grading parity (Task 0.1)', () => {
  it('classifies mutating references as state-graded and reads / snippet labs as not', () => {
    // Mutations: reference translations carry UPDATE / INSERT verbs.
    expect(isStateGradedPrismaTask(taskById('prisma10-c1-t1'))).toBe(true);
    expect(isStateGradedPrismaTask(cleanUpdateTask())).toBe(true);
    expect(isStateGradedPrismaTask(taskById('prisma09-c1-t1'))).toBe(true); // create → INSERT
    // Reads translate to SELECT — result-graded, never state-graded.
    expect(isStateGradedPrismaTask(taskById('prisma07-c1-t1'))).toBe(false);
    // Snippet labs have no translatable call at all (CLI command lab).
    const snippet = taskById('prisma02-c1-t1');
    expect(isExecutablePrismaTask(snippet)).toBe(false);
    expect(isStateGradedPrismaTask(snippet)).toBe(false);
  });

  it('passes a clean mutating reference with stateOk: true (state layer active)', () => {
    const task = cleanUpdateTask();
    const outcome = submitGraded(task, task.prisma!.solutionCode, fullHooks(new SqlExecutor()));
    expect(outcome.passed).toBe(true);
    expect(outcome.stage).toBe('pass');
    // The layer ran and agreed — against the reference's OWN translated SQL,
    // not the read-probe `solutionSql` (which is a SELECT).
    expect(outcome.stateOk).toBe(true);
    expect(outcome.generatedSql).toEqual([
      "UPDATE users SET name = 'Alexandra' WHERE name = 'Alex';",
    ]);
    expect(outcome.result?.affectedRows).toBe(1);
  });

  it("fails a wrong-row write at 'final-state' where affectedRows alone cannot tell", () => {
    const task = cleanUpdateTask();
    const outcome = submitGraded(task, WRONG_ROW_UPDATE_MANY, fullHooks(new SqlExecutor()));
    expect(outcome.stage).toBe('final-state');
    expect(outcome.passed).toBe(false);
    expect(outcome.stateOk).toBe(false);
    // The execution layer alone saw a "perfect" single-row update — the exact
    // hole this layer closes (GRADING_POLICY.md Rule 2: read the `where` first).
    expect(outcome.result?.affectedRows).toBe(1);
    expect(outcome.generatedSql).toEqual([
      "UPDATE users SET name = 'Alexandra' WHERE name = 'Mina';",
    ]);
    expect(outcome.feedback).toMatch(/does not match the expected final state/i);
  });

  it("fails a wrong-value write at 'final-state' with the differing column — direct and through submitForTask", () => {
    const task = cleanUpdateTask();

    // Direct pipeline call: the state layer names the exact column.
    const outcome = submitGraded(task, WRONG_VALUE_UPDATE_MANY, fullHooks(new SqlExecutor()));
    expect(outcome.stage).toBe('final-state');
    expect(outcome.passed).toBe(false);
    expect(outcome.stateOk).toBe(false);
    expect(outcome.diffColumns).toEqual(['name']);
    expect(outcome.feedback).toMatch(/values differ in 'name'/i);
    expect(outcome.feedback).toContain("'HACKED'");
    expect(outcome.feedback).toContain("'Alexandra'");

    // The REAL UI path: `submitForTask` must forward the snapshot hook, so the
    // same wrong value fails on the router too (not only in direct calls).
    const routerOutcome = submitForTask({
      task,
      code: WRONG_VALUE_UPDATE_MANY,
      hooks: fullHooks(new SqlExecutor()),
      surface: 'lesson',
      record: false,
    });
    expect(routerOutcome.passed).toBe(false);
    expect(routerOutcome.stage).toBe('final-state');

    // ...while the reference itself still passes through the same router.
    const referenceOutcome = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: fullHooks(new SqlExecutor()),
      surface: 'lesson',
      record: false,
    });
    expect(referenceOutcome.passed).toBe(true);
    expect(referenceOutcome.stage).toBe('pass');
  });

  it('keeps reads result-graded: stateOk stays undefined', () => {
    const task = taskById('prisma07-c1-t1'); // findUnique — a translated SELECT
    const outcome = submitGraded(task, task.prisma!.solutionCode, fullHooks(new SqlExecutor()));
    expect(outcome.passed).toBe(true);
    expect(outcome.stage).toBe('pass');
    expect(outcome.generatedSql).toEqual(['SELECT id, name FROM users WHERE id = 1;']);
    // The final-state layer never ran: a read cannot change the database.
    expect(outcome.stateOk).toBeUndefined();
    expect(outcome.diffColumns).toBeUndefined();
  });

  it('keeps the legacy verdict for hosts without the snapshot hook (no crash, layer skipped)', () => {
    const task = cleanUpdateTask();
    const exec = new SqlExecutor();
    const outcome = runAndGradePrismaSubmission({
      task,
      code: WRONG_VALUE_UPDATE_MANY,
      // A host that predates Task 0.1 supplies no `getDatabaseState`.
      hooks: {
        execute: (sql: string) => exec.executeQuery(sql),
        resetDatabase: () => exec.resetDatabase(),
      },
      surface: 'lesson',
      record: false,
    });
    // Documented backward-compat fallback: without a snapshot the wrong value
    // still passes (the pre-0.1 verdict). The app router always supplies the
    // hook (asserted above), so learners never take this path.
    expect(outcome.passed).toBe(true);
    expect(outcome.stage).toBe('pass');
    expect(outcome.stateOk).toBeUndefined();
  });

  it('Task 0.2 landed: the original `prisma10-c1-t1` probes now FAIL', () => {
    // Task 0.2 bound the reference's `name` param, so the reference renders
    // `UPDATE users SET name = 'Alexandra' WHERE id = 1` (no NULL) and the
    // final-state layer is now active on this task — both original probes fail.
    const task = taskById('prisma10-c1-t1');
    const wrongRow = [
      'export async function rename(id: number, name: string) {',
      '  return await prisma.user.update({',
      '    where: { id: 2 },',
      '    data: { name },',
      '    select: { id: true, name: true },',
      '  });',
      '}',
    ].join('\n');
    const wrongValue = [
      'export async function rename(id: number, name: string) {',
      '  return await prisma.user.update({',
      '    where: { id: 1 },',
      "    data: { name: 'HACKED' },",
      '    select: { id: true, name: true },',
      '  });',
      '}',
    ].join('\n');

    const rowOutcome = submitGraded(task, wrongRow, fullHooks(new SqlExecutor()));
    expect(rowOutcome.passed).toBe(false);
    expect(rowOutcome.stage).toBe('final-state');
    expect(rowOutcome.stateOk).toBe(false);

    const valueOutcome = submitGraded(task, wrongValue, fullHooks(new SqlExecutor()));
    expect(valueOutcome.generatedSql).toEqual(["UPDATE users SET name = 'HACKED' WHERE id = 1;"]);
    expect(valueOutcome.passed).toBe(false);
    expect(valueOutcome.stage).toBe('final-state');
    expect(valueOutcome.stateOk).toBe(false);

    // The reference itself passes WITH the layer active (no NULL deferral).
    const reference = submitGraded(task, task.prisma!.solutionCode, fullHooks(new SqlExecutor()));
    expect(reference.generatedSql).toEqual(["UPDATE users SET name = 'Alexandra' WHERE id = 1;"]);
    expect(reference.passed).toBe(true);
    expect(reference.stage).toBe('pass');
    expect(reference.stateOk).toBe(true);
  });

  it('corpus sweep: no executable reference renders NULL in a write position (Task 0.2)', () => {
    const offenders: string[] = [];
    for (const task of allPrismaTasks()) {
      if (!task.prisma || !isExecutablePrismaTask(task)) continue;
      const seed = prismaSeedContext(task.prisma.demoVariables);
      const gen = generatePrismaSql(task.prisma.solutionCode, {
        schema: schemaForTask(task),
        seed,
      });
      if (!gen.ok) continue;
      for (const stmt of gen.statements) {
        if (stmt.sql.trim().startsWith('--')) continue;
        const rendered = renderGeneratedSql(stmt, seed).trim();
        // Only writes can carry a NULL-write defect; reads legitimately filter on NULL.
        if (!/^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\b/i.test(rendered)) continue;
        if (/\bNULL\b/.test(rendered)) offenders.push(`${task.id}: ${rendered}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('Task 0.3: no task carries `prisma.generatedSql`; the runtime lens is the single source', () => {
    // The authored preview field was dead (0 consumers) and drifted on most
    // tasks — it is removed, so its return is a content-level regression.
    const carriers: string[] = [];
    for (const task of allPrismaTasks()) {
      if (task.prisma && 'generatedSql' in task.prisma) carriers.push(task.id);
    }
    expect(carriers).toEqual([]);

    // The ONLY generated SQL is the runtime mirror of the statements that ran
    // (rendered by `SqlLensPanel` via `PrismaSubmitOutcome.generatedSql`).
    const executable = allPrismaTasks().filter((t) => isExecutablePrismaTask(t));
    expect(executable.length).toBeGreaterThan(0);
    const reference = submitGraded(
      executable[0],
      executable[0].prisma!.solutionCode,
      fullHooks(new SqlExecutor()),
    );
    expect(reference.generatedSql.length).toBeGreaterThan(0);
    expect(reference.generatedSql[0]).not.toContain('/* param:');
  });
});

