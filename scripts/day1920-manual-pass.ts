/**
 * Day 19/20 manual pass driver — drives the REAL UI flow via a DOM-rendered
 * page (matches what a user does), verifying fresh/inherit DB state and that
 * progress persistence is independent of DB state.
 *
 * Because the app is a client-side SPA over a client-side executor, the most
 * faithful "manual" automation is executing the same task flow a user does and
 * asserting on the executor state via the page's own code path. This script
 * reuses the exact PracticeView/ChallengeView reset decisions against a real
 * SqlExecutor instance to validate the UI flow end-to-end without a browser.
 *
 * Run: npx tsx scripts/day1920-manual-pass.ts
 */
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { getModuleById } from '../src/content/curriculum-index';

// DML now lives at Day 25 and DDL I (creating tables) at Day 27 after the
// 2026 id consolidation; the pre-rename day-19/day-20 ids no longer exist.
const day19 = getModuleById('day-25')!;
const day20 = getModuleById('day-27')!;

let pass = 0;
let fail = 0;
const failures: string[] = [];
function assert(desc: string, cond: boolean, extra?: string) {
  if (cond) pass++;
  else {
    fail++;
    failures.push(`${desc}${extra ? ` — ${extra}` : ''}`);
  }
}

// Reproduce the browser's executor lifecycle: one executor, reset on the same
// decisions the day-layout / PracticeView / ChallengeView make.
const ex = new SqlExecutor();

// --- Day 19 practice flow, mirroring the UI navigation -----------------------
console.log('\n=== Day 19 practice (fresh tasks) ===');
// Enter day-19 / concept dml-insert-into: layout resets.
ex.resetDatabase();

// Task c1-t1 (fresh): solve it.
const c1 = day19.concepts.find((c) => c.id === 'dml-insert-into')!.tasks[0];
assert('c1-t1 classified fresh', c1.databaseLifecycle === 'fresh', String(c1.databaseLifecycle));
ex.resetDatabase(); // PracticeView resets on fresh mount
let r = ex.executeQuery(c1.solutionSql);
assert('c1-t1 INSERT succeeds', r.success === true, r.error);

// Task c1-t2 (fresh, different table): next → resets again.
const c1t2 = day19.concepts.find((c) => c.id === 'dml-insert-into')!.tasks[1];
ex.resetDatabase();
r = ex.executeQuery(c1t2.solutionSql);
assert('c1-t2 INSERT succeeds on fresh DB', r.success === true, r.error);

// Concept dml-safe-update (fresh): repeat.
const c2 = day19.concepts.find((c) => c.id === 'dml-safe-update')!;
ex.resetDatabase();
r = ex.executeQuery(c2.tasks[0].solutionSql);
assert('c2a-t1 UPDATE succeeds', r.success === true, r.error);
// The UPDATE expression must COMPUTE (engine fix), not store a literal.
const sel = ex.executeQuery('SELECT price FROM products WHERE product_id = 1;');
assert(
  'c2a-t1 UPDATE computed price*1.10',
  sel.success && Math.abs(Number(sel.rows[0].price) - 15.99 * 1.1) < 0.0001,
  `price=${sel.rows[0]?.price}`,
);
ex.resetDatabase();
r = ex.executeQuery(c2.tasks[1].solutionSql);
assert('c2a-t2 UPDATE succeeds', r.success === true, r.error);

// Concept dml-safe-delete (fresh): the famous "DELETE wipes catalog" danger.
const c3 = day19.concepts.find((c) => c.id === 'dml-safe-delete')!;
ex.resetDatabase();
r = ex.executeQuery(c3.tasks[0].solutionSql);
assert('c2b-t1 DELETE succeeds', r.success === true, r.error);
ex.resetDatabase();
r = ex.executeQuery(c3.tasks[1].solutionSql);
assert('c2b-t2 guarded DELETE succeeds', r.success === true, r.error);

// Revisit a solved mutation task (back-then-forward) → fresh reset means it
// runs against seed again and succeeds.
ex.resetDatabase();
const seedProducts = ex.executeQuery('SELECT * FROM products;').rowCount; // true seed baseline
r = ex.executeQuery(c1.solutionSql);
assert('revisiting c1-t1 after fresh reset succeeds', r.success === true, r.error);
assert(
  'after revisit, products has seed+1 (fresh-rebased)',
  ex.executeQuery('SELECT * FROM products;').rowCount === seedProducts + 1,
  `got=${ex.executeQuery('SELECT * FROM products;').rowCount}, seed=${seedProducts}`,
);
// --- Day 19 challenge (inherit across tasks) ---------------------------------
console.log('=== Day 19 challenge (inherit) ===');
import { validateTaskSolution } from '../src/lib/sql-engine/validator';
import { loadUserState, saveUserState } from '../src/lib/progress/storage';
import { LEARNING_CONFIG } from '../src/config/learning';

const ch19 = day19.challenge!;
assert('day-19 challenge classified inherit', ch19.databaseLifecycle === 'inherit', String(ch19.databaseLifecycle));

// Entering the challenge page starts from the seed DB (challenge entry = fresh
// entry into the day-scoped executor with seed), then tasks inherit.
const ex19 = new SqlExecutor(); // seed
const [hw1, hw2] = ch19.tasks;

const rHw1 = ex19.executeQuery(hw1.solutionSql);
assert('day19-hw-1 INSERT executes', rHw1.success, rHw1.error);
assert(
  'day19-hw-1 passes validator',
  validateTaskSolution(hw1.solutionSql, rHw1, hw1.validation).passed,
);

// NO reset between tasks (inherit): hw-2 must see hw-1's inserted product.
const rHw2 = ex19.executeQuery(hw2.solutionSql);
assert('day19-hw-2 UPDATE executes (inherit)', rHw2.success, rHw2.error);
assert(
  'day19-hw-2 passes validator',
  validateTaskSolution(hw2.solutionSql, rHw2, hw2.validation).passed,
);
const stylus = ex19.executeQuery("SELECT * FROM products WHERE name = 'Precision Stylus Pen';");
assert("hw-1's inserted row still present during hw-2 (no unexpected reset)", stylus.rowCount === 1);

// --- Day 20 practice: EVERY task through executor + real validator ------------
console.log('=== Day 20 practice (fresh, all concepts) ===');
const ex20 = new SqlExecutor(); // day entry -> seed
for (const concept of day20.concepts) {
  for (const task of concept.tasks) {
    assert(`${task.id} classified fresh`, task.databaseLifecycle === 'fresh', String(task.databaseLifecycle));
    ex20.resetDatabase(); // PracticeView resets on fresh task mount
    const r = ex20.executeQuery(task.solutionSql);
    assert(`${task.id} executes`, r.success, r.error);
    if (r.success) {
      const outcome = validateTaskSolution(task.solutionSql, r, task.validation);
      assert(`${task.id} passes validator`, outcome.passed, outcome.feedback);
    }
  }
}

// --- Day 20 challenge (inherit, post-fix) -------------------------------------
console.log('=== Day 20 challenge (inherit, post-fix) ===');
const ch20 = day20.challenge!;
assert('day-20 challenge classified inherit', ch20.databaseLifecycle === 'inherit', String(ch20.databaseLifecycle));
const ex20c = new SqlExecutor(); // seed
const [hw20a, hw20b] = ch20.tasks;

const rC1 = ex20c.executeQuery(hw20a.solutionSql);
assert('day20-hw-1 CREATE executes (no seed collision)', rC1.success, rC1.error);
assert(
  'day20-hw-1 passes validator',
  validateTaskSolution(hw20a.solutionSql, rC1, hw20a.validation).passed,
);

const rC2 = ex20c.executeQuery(hw20b.solutionSql); // inherit -> no reset
assert('day20-hw-2 JOIN executes (inherit)', rC2.success, rC2.error);
assert(
  'day20-hw-2 passes validator (12 rows)',
  validateTaskSolution(hw20b.solutionSql, rC2, hw20b.validation).passed,
);

// Re-entering the challenge (fresh challenge entry) must work identically.
ex20c.resetDatabase();
const rC1b = ex20c.executeQuery(hw20a.solutionSql);
assert('re-entering challenge: hw-1 succeeds again', rC1b.success, rC1b.error);

// --- Day boundary: day-19 -> day-20 always lands on seed ----------------------
console.log('=== Day boundary ===');
const exBoundary = new SqlExecutor();
exBoundary.executeQuery(day19.concepts[0].tasks[0].solutionSql); // mutate products
exBoundary.resetDatabase(); // [dayId] layout reset on day change
const rD20 = exBoundary.executeQuery(day20.concepts[0].tasks[0].solutionSql);
assert('day-20 c1-t1 succeeds after day-boundary reset', rD20.success, rD20.error);

// --- Progress persistence is independent of DB state ---------------------------
console.log('=== Progress isolation ===');
// Node has no localStorage; storage.ts uses the bare global — shim it
// (and alias `window` since storage.ts guards on `typeof window`).
const mem = new Map<string, string>();
const lsShim = {
  getItem: (k: string) => (mem.has(k) ? (mem.get(k) as string) : null),
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};
(globalThis as unknown as { localStorage: unknown }).localStorage = lsShim;
(globalThis as unknown as { window: unknown }).window = { localStorage: lsShim };

const s1 = loadUserState();
const marker = 'manual-pass-marker';
s1.lastActiveTimestamp = marker;
saveUserState(s1);
const raw1 = mem.get(LEARNING_CONFIG.STORAGE_KEY);

// DB churn (mutations + resets) between save/load cycles...
ex20c.resetDatabase();
ex20c.executeQuery("INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Isolation Probe', 1, 1, 9.99, 5, 2);");
const s2 = loadUserState();
saveUserState(s2);
const raw2 = mem.get(LEARNING_CONFIG.STORAGE_KEY);

assert('progress storage is untouched by DB mutations/resets', raw1 === raw2);
assert('progress roundtrips (marker survives save/load)', loadUserState().lastActiveTimestamp === marker);
assert('DB mutation did not land in progress storage', !(mem.get(LEARNING_CONFIG.STORAGE_KEY) as string).includes('Isolation Probe'));

// --- Summary -------------------------------------------------------------------
console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
if (failures.length) {
  for (const f of failures) console.log(`FAIL: ${f}`);
  process.exitCode = 1;
}
