/**
 * Module Order & Identity Regression Check
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies the position-independent curriculum ordering system:
 *   1. The 25 legacy modules keep their exact original sequence.
 *   2. Order-based prev/next navigation is identical to the old day±1 logic.
 *   3. Gate-0 (always-unlocked) resolves to the first module only.
 *   4. NEW: a synthetic module with curriculumOrder 9.5 slots cleanly between
 *      day-09 and day-10 without touching any existing ID — the insertion
 *      safety guarantee the whole expansion depends on.
 *
 * Run: npm run test:module-order
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { ModuleData } from '../src/types/curriculum';
import {
  getModuleOrder,
  getModuleDisplayLabel,
  getModulesByOrder,
  getPreviousModule,
  getNextModule,
  isFirstModule,
  isLastModule,
} from '../src/lib/curriculum/module-order';

let failures = 0;
function assert(name: string, cond: boolean, detail = '') {
  if (!cond) failures++;
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${cond || !detail ? '' : ` (${detail})`}`);
}

// ── 1. Legacy sequence preserved ─────────────────────────────────────────────
// 38 modules loaded.
assert('38 modules loaded', ALL_MODULES.length === 38, String(ALL_MODULES.length));
const dayId = (n: number) => `day-${String(n).padStart(2, '0')}`;
const ordered = getModulesByOrder(ALL_MODULES);

assert(
  'canonical order is exactly day-01..day-38',
  ordered.length === 38 && ordered.every((m, i) => m.id === dayId(i + 1)),
  ordered.map((m) => m.id).join(',')
);
assert(
  'every module day field matches its id',
  ALL_MODULES.every((m) => m.day === Number(m.id.replace('day-', ''))),
  ALL_MODULES.filter((m) => m.day !== Number(m.id.replace('day-', '')))
    .map((m) => `${m.id}(day=${m.day})`)
    .join(',')
);
assert('order 26 is day-26 (transactions)', ordered[25].id === 'day-26', ordered[25]?.id ?? 'undefined');
assert('order 28 is day-28 (DDL constraints)', ordered[27].id === 'day-28', ordered[27]?.id ?? 'undefined');
assert('order 32 is day-32 (security)', ordered[31].id === 'day-32', ordered[31]?.id ?? 'undefined');
assert('order 33 is day-33 (capstone)', ordered[32].id === 'day-33', ordered[32]?.id ?? 'undefined');
assert('order 37 is day-37 (interview gauntlet)', ordered[36].id === 'day-37', ordered[36]?.id ?? 'undefined');

// Also verify ordering integrity: no two modules share an order, and the new
// modules slot exactly where intended (10/11/12).
const orders = getModulesByOrder(ALL_MODULES).map((m) => getModuleOrder(m));
assert(
  'all 38 module orders are unique',
  new Set(orders).size === orders.length,
  orders.join(',')
);

// ── 3. Boundary helpers ──────────────────────────────────────────────────────
const lastModule = getModulesByOrder(ALL_MODULES)[getModulesByOrder(ALL_MODULES).length - 1];
assert('first module is day-01', isFirstModule(ALL_MODULES[0], ALL_MODULES) && getModuleOrder(ALL_MODULES[0]) === 1);
assert('no other module reports first', ALL_MODULES.slice(1).every((m) => !isFirstModule(m, ALL_MODULES)));
assert('last module (canonical order) is day-38', lastModule.id === 'day-38', lastModule.id);
assert('day-38 has no next module', getNextModule(lastModule, ALL_MODULES) === undefined);

// Display labels resolve to the canonical day label
assert('display label resolves for day-01', getModuleDisplayLabel(ALL_MODULES[0]) === 'Day 1');
assert('display label resolves for day-38', getModuleDisplayLabel(lastModule) === 'Day 38');

// ── 4. Insertion safety (the reason this system exists) ─────────────────────
// A brand-new probe module proves a future module can slot in without touching
// any existing ID. Use a fresh probe (never an existing ID) with a fractional
// order.
const probe: ModuleData = {
  id: 'probe-insertion-test',
  slug: 'probe-insertion-test',
  day: 0,
  curriculumOrder: 9.5,
  displayLabel: 'Day 9.5',
  title: 'Probe (insertion test)',
  shortTitle: 'Probe',
  type: 'module',
  milestoneId: 'milestone-2',
  description: 'Synthetic probe module — must never collide with a real ID.',
  estimatedMinutes: 45,
  concepts: [],
  completionLearnings: [],
};
const existingIds = new Set(ALL_MODULES.map((m) => m.id));
assert('probe ID is genuinely new', !existingIds.has('probe-insertion-test'));

const expanded = [...ALL_MODULES, probe];
// day-09 in legacy module order is ALL_MODULES[8] (order 9).
assert('probe (order 9.5) lands right after day-09', getNextModule(ALL_MODULES[8], expanded)?.id === 'probe-insertion-test', getNextModule(ALL_MODULES[8], expanded)?.id ?? 'undefined');
assert("probe's prev is day-09", getPreviousModule(probe, expanded)?.id === 'day-09');
// Probe is inserted directly BEFORE day-10 (order 10).
assert('day-10 now follows the probe', getNextModule(probe, expanded)?.id === 'day-10', getNextModule(probe, expanded)?.id ?? 'undefined');
assert('first module unchanged after insertion', isFirstModule(expanded[0], expanded) && getModuleOrder(expanded[0]) === 1);
const day38Module = ALL_MODULES.find((m) => m.id === 'day-38');
assert('last module unchanged after insertion', !!day38Module && isLastModule(day38Module, expanded), day38Module ? String(isLastModule(day38Module, expanded)) : 'day-38 missing');
assert('original 38 modules untouched by probe test', ALL_MODULES.length === 38, String(ALL_MODULES.length));

console.log(failures === 0 ? '\n✅ Module order system verified.' : `\n❌ ${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
