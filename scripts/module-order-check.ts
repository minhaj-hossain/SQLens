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
// 35 registered modules + 3 newly-registered DDL/schema-design modules (Days 28-30) = 38 total.
assert('38 modules loaded', ALL_MODULES.length === 38, String(ALL_MODULES.length));
const newModuleIds = [
  'case-conditional-logic',
  'string-functions',
  'date-functions',
  'set-operations',
  'window-ranking',
  'window-running-metrics',
  'dml-transactions',
  'ddl-column-constraints',
  'ddl-schema-evolution',
  'schema-design-normalization',
  'security-production-safety',
  'capstone-bookstore',
  'interview-gauntlet',
];
const ordered = getModulesByOrder(ALL_MODULES);
// The three new modules must slot in at Day 10/11/12 (orders 10, 11, 12),
// which pushes legacy day-10..day-16 back by 3 slots. The legacy relative
// order (days 1-9 then 10-25) is validated separately below.
const first9 = ordered.slice(0, 9);
assert(
  'canonical order: first 9 are legacy day-01..day-09',
  first9.every((m, i) => m.id === `day-${String(i + 1).padStart(2, '0')}`),
  first9.map((m) => m.id).join(',')
);
assert(
  'orders 10–12 are exactly the three new modules',
  ordered.slice(9, 12).map((m) => m.id).join(',') === newModuleIds.slice(0, 3).join(','),
  ordered.slice(9, 12).map((m) => m.id).join(',')
);
assert(
  'order 17 is set-operations (after legacy day-13, before day-14)',
  ordered[16].id === 'set-operations',
  ordered[16]?.id ?? 'undefined'
);
assert(
  'order 23–24 are the two window modules (after day-18, before day-19)',
  ordered[22].id === 'window-ranking' && ordered[23].id === 'window-running-metrics',
  [ordered[22]?.id, ordered[23]?.id].join(',')
);
assert(
  'order 26 is dml-transactions (after day-19, before day-20)',
  ordered[25].id === 'dml-transactions',
  ordered[26]?.id ?? 'undefined'
);
assert(
  'orders 28-30 are the DDL + normalization modules (after day-20, before day-21/performance)',
  ordered[27].id === 'ddl-column-constraints' &&
    ordered[28].id === 'ddl-schema-evolution' &&
    ordered[29].id === 'schema-design-normalization',
  [ordered[27]?.id, ordered[28]?.id, ordered[29]?.id].join(',')
);
assert(
  'order 32 is security-production-safety (after Day 31 performance, before capstone)',
  ordered[31].id === 'security-production-safety',
  ordered[31]?.id ?? 'undefined'
);
assert(
  'order 33 is capstone-bookstore (after Day 32 security, before day-22)',
  ordered[32].id === 'capstone-bookstore',
  ordered[32]?.id ?? 'undefined'
);
assert(
  'order 37 is interview-gauntlet (after day-24, before day-25 graduation)',
  ordered[36].id === 'interview-gauntlet',
  ordered[36]?.id ?? 'undefined'
);

// ── 2. Legacy modules keep their original relative order ─────────────────────
// The three inserted modules (10-12) shift legacy absolute positions, but the
// relative order of the 25 legacy modules must be exactly day-01..day-25.
const legacySorted = getModulesByOrder(
  ALL_MODULES.filter((m) => !newModuleIds.includes(m.id))
);
assert(
  'legacy modules keep relative day-01..day-25 order',
  legacySorted.every((m, i) => m.id === `day-${String(i + 1).padStart(2, '0')}`),
  legacySorted.map((m) => m.id).join(',')
);

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
assert('last module (canonical order) is day-25', lastModule.id === 'day-25', lastModule.id);
assert('day-25 has no next module', getNextModule(lastModule, ALL_MODULES) === undefined);

// Display labels fall back to Day N for legacy modules
assert('display label fallback works', getModuleDisplayLabel(ALL_MODULES[0]) === 'Day 1');

// ── 4. Insertion safety (the reason this system exists) ─────────────────────
// A brand-new probe module proves a future module can slot in without touching
// any existing ID. Use a real future feature (set-operations, order 17) and a
// fresh probe (never an existing ID) with a fractional order.
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
// Probe is inserted directly BEFORE case-conditional-logic (order 10).
assert('case-conditional-logic now follows the probe', getNextModule(probe, expanded)?.id === 'case-conditional-logic', getNextModule(probe, expanded)?.id ?? 'undefined');
assert('first module unchanged after insertion', isFirstModule(expanded[0], expanded) && getModuleOrder(expanded[0]) === 1);
const day25Module = ALL_MODULES.find((m) => m.id === 'day-25');
assert('last module unchanged after insertion', !!day25Module && isLastModule(day25Module, expanded), day25Module ? String(isLastModule(day25Module, expanded)) : 'day-25 missing');
assert('original 38 modules untouched by probe test', ALL_MODULES.length === 38, String(ALL_MODULES.length));

console.log(failures === 0 ? '\n✅ Module order system verified.' : `\n❌ ${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
