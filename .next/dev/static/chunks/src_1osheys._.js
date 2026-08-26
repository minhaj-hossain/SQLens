(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/config/curriculum-schedule.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Curriculum Module Publish Schedule
 * ====================================
 * Use this file to manually control when specific modules unlock, regardless
 * of a learner's individual completion timing.
 *
 * ─── FORMAT ─────────────────────────────────────────────────────────────────
 * Map module IDs to ISO 8601 datetime strings. The module will NOT unlock for
 * any user until the real clock passes this timestamp, even if they've
 * completed the prior module and waited the usual 24-hour period.
 *
 * Values here take precedence over any `scheduledPublishDate` field set
 * directly inside a module's content file.
 *
 * ─── USE CASES ───────────────────────────────────────────────────────────────
 *  • Cohort-based launches: release modules on fixed calendar dates.
 *  • Beta gating: hold advanced modules while content is being polished.
 *  • Holiday pauses: prevent unlock during a scheduled course break.
 *
 * ─── EXAMPLES ────────────────────────────────────────────────────────────────
 *  'day-05': '2024-12-01T18:00:00',   // Day 5 unlocks no earlier than Dec 1
 *  'day-10': '2024-12-06T18:00:00',   // Day 10 unlocks no earlier than Dec 6
 *
 * ─── LEAVING EMPTY ───────────────────────────────────────────────────────────
 * An empty map means all modules follow the default 1-day completion gate only.
 */ __turbopack_context__.s([
    "MODULE_PUBLISH_SCHEDULE",
    ()=>MODULE_PUBLISH_SCHEDULE
]);
const MODULE_PUBLISH_SCHEDULE = {
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/config/learning.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LEARNING_CONFIG",
    ()=>LEARNING_CONFIG
]);
const LEARNING_CONFIG = {
    // Learning day cycle configuration:
    // Starts at 6:00 PM (18:00) and ends at 5:59 PM (17:59:59) the next day.
    DAILY_RESET_HOUR: 18,
    DAILY_RESET_MINUTE: 0,
    // Progression rules
    MAX_MODULES_PER_LEARNING_DAY: 1,
    SEQUENTIAL_ENFORCEMENT: true,
    // App Defaults
    INITIAL_MODULE_ID: 'day-01',
    // Storage keys
    STORAGE_KEY: 'sql_mastery_progress_v1',
    THEME_STORAGE_KEY: 'sql_mastery_theme_v1'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/config/roadmap.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROADMAP_MILESTONES",
    ()=>ROADMAP_MILESTONES
]);
const ROADMAP_MILESTONES = [
    {
        id: 'milestone-1',
        number: 1,
        title: 'Milestone 1',
        subtitle: 'Core Retrieval, Filtering & Shaping',
        description: 'Master single-table operations: SELECT syntax, precise column selection, conditional filtering, ranges, pattern matching, sorting, and pagination.',
        daysRange: 'Days 1–8',
        moduleIds: [
            'day-01',
            'day-02',
            'day-03',
            'day-04',
            'day-05',
            'day-06',
            'day-07',
            'day-08'
        ]
    },
    {
        id: 'milestone-2',
        number: 2,
        title: 'Milestone 2',
        subtitle: 'Aggregation & Relationships',
        description: 'Combine tables and summarize insights: aggregate metrics, group-by slicing, multi-table JOINs, relational modeling, and fan-out prevention.',
        daysRange: 'Days 9–16',
        moduleIds: [
            'day-09',
            'day-10',
            'day-11',
            'day-12',
            'day-13',
            'day-14',
            'day-15',
            'day-16'
        ]
    },
    {
        id: 'milestone-3',
        number: 3,
        title: 'Milestone 3',
        subtitle: 'Modification, Advanced Queries & Transactions',
        description: 'Safely modify data, craft subqueries and CTEs, protect multi-step operations with transactions, and build complete production-grade backend queries.',
        daysRange: 'Days 17–25',
        moduleIds: [
            'day-17',
            'day-18',
            'day-19',
            'day-20',
            'day-21',
            'day-22',
            'day-23',
            'day-24',
            'day-25'
        ]
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/auth-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authClient",
    ()=>authClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/better-auth/dist/client/react/index.mjs [app-client] (ecmascript) <locals>");
;
const authClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$better$2d$auth$2f$dist$2f$client$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAuthClient"])();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/progress/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INITIAL_USER_STATE",
    ()=>INITIAL_USER_STATE,
    "loadNavSnapshot",
    ()=>loadNavSnapshot,
    "loadUserLearningState",
    ()=>loadUserLearningState,
    "loadUserState",
    ()=>loadUserState,
    "resetAllProgress",
    ()=>resetAllProgress,
    "resetNavSnapshot",
    ()=>resetNavSnapshot,
    "resetUserState",
    ()=>resetUserState,
    "saveNavSnapshot",
    ()=>saveNavSnapshot,
    "saveUserLearningState",
    ()=>saveUserLearningState,
    "saveUserState",
    ()=>saveUserState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/learning.ts [app-client] (ecmascript)");
;
const INITIAL_USER_STATE = {
    currentModuleId: 'day-01',
    currentConceptIndex: 0,
    currentTaskIndex: 0,
    currentStepType: 'concept_theory',
    challengeTaskIndex: 0,
    taskAttempts: {},
    completedTasks: {},
    completedConcepts: {},
    completedModules: {},
    unlockedModuleIds: [
        'day-01'
    ],
    lastActiveTimestamp: new Date().toISOString(),
    bypassDailyLock: false,
    simulatedTimeOffsetHours: 0
};
function loadUserState() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].STORAGE_KEY);
        if (!raw) return INITIAL_USER_STATE;
        const parsed = JSON.parse(raw);
        return {
            ...INITIAL_USER_STATE,
            ...parsed
        };
    } catch (e) {
        console.error('Failed to load learning state from localStorage:', e);
        return INITIAL_USER_STATE;
    }
}
function saveUserState(state) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save learning state:', e);
    }
}
function resetUserState() {
    if ("TURBOPACK compile-time truthy", 1) {
        localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].STORAGE_KEY);
    }
    return INITIAL_USER_STATE;
}
const NAV_KEY = 'sql_mastery_nav_v1';
const VALID_TABS = [
    'learning-path',
    'home',
    'practice',
    'schema',
    'settings'
];
const VALID_STAGES = [
    'lesson',
    'practice',
    'concept_complete',
    'challenge',
    'day_complete'
];
function loadNavSnapshot() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = localStorage.getItem(NAV_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const tab = VALID_TABS.includes(parsed.tab) ? parsed.tab : 'learning-path';
        const stage = VALID_STAGES.includes(parsed.stage) ? parsed.stage : 'lesson';
        return {
            moduleId: typeof parsed.moduleId === 'string' ? parsed.moduleId : 'day-01',
            conceptIndex: Number.isFinite(parsed.conceptIndex) ? Number(parsed.conceptIndex) : 0,
            taskIndex: Number.isFinite(parsed.taskIndex) ? Number(parsed.taskIndex) : 0,
            stage,
            tab
        };
    } catch (e) {
        console.error('Failed to load navigation snapshot:', e);
        return null;
    }
}
function saveNavSnapshot(snapshot) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        localStorage.setItem(NAV_KEY, JSON.stringify(snapshot));
    } catch (e) {
        console.error('Failed to save navigation snapshot:', e);
    }
}
function resetNavSnapshot() {
    if ("TURBOPACK compile-time truthy", 1) {
        localStorage.removeItem(NAV_KEY);
    }
}
const loadUserLearningState = loadUserState;
const saveUserLearningState = saveUserState;
const resetAllProgress = resetUserState;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/progress/unlock-calculator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatTimeRemaining",
    ()=>formatTimeRemaining,
    "getEffectiveNow",
    ()=>getEffectiveNow,
    "getLearningCycleId",
    ()=>getLearningCycleId,
    "getModuleUnlockStatus",
    ()=>getModuleUnlockStatus,
    "getNextUnlockTime",
    ()=>getNextUnlockTime,
    "isConceptCompleted",
    ()=>isConceptCompleted,
    "isModuleChallengeUnlocked",
    ()=>isModuleChallengeUnlocked,
    "isModuleConceptsCompleted",
    ()=>isModuleConceptsCompleted,
    "isModuleFullyComplete",
    ()=>isModuleFullyComplete
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/learning.ts [app-client] (ecmascript)");
;
function getEffectiveNow(simulatedOffsetHours = 0) {
    const now = new Date();
    if (simulatedOffsetHours !== 0) {
        now.setHours(now.getHours() + simulatedOffsetHours);
    }
    return now;
}
function getLearningCycleId(date) {
    const d = new Date(date);
    // If time is before 18:00, it belongs to yesterday's 18:00 cycle
    if (d.getHours() < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].DAILY_RESET_HOUR) {
        d.setDate(d.getDate() - 1);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}@18:00`;
}
function getNextUnlockTime(completedAtDate) {
    const unlock = completedAtDate instanceof Date ? new Date(completedAtDate.getTime()) : new Date(completedAtDate);
    if (isNaN(unlock.getTime())) {
        const fallback = new Date();
        fallback.setHours(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].DAILY_RESET_HOUR, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].DAILY_RESET_MINUTE, 0, 0);
        return fallback;
    }
    // If completed after or at 18:00, the next boundary is tomorrow 18:00.
    // If completed before 18:00, the next boundary is today 18:00.
    if (unlock.getHours() >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].DAILY_RESET_HOUR) {
        unlock.setDate(unlock.getDate() + 1);
    }
    unlock.setHours(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].DAILY_RESET_HOUR, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$learning$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEARNING_CONFIG"].DAILY_RESET_MINUTE, 0, 0);
    return unlock;
}
function formatTimeRemaining(targetTime, currentTime) {
    const target = targetTime instanceof Date ? targetTime : new Date(targetTime);
    let current;
    if (typeof currentTime === 'number') {
        current = getEffectiveNow(currentTime);
    } else if (currentTime instanceof Date) {
        current = currentTime;
    } else if (typeof currentTime === 'string') {
        current = new Date(currentTime);
    } else {
        current = getEffectiveNow();
    }
    const targetMs = isNaN(target.getTime()) ? 0 : target.getTime();
    const currentMs = isNaN(current.getTime()) ? 0 : current.getTime();
    const diffMs = targetMs - currentMs;
    if (diffMs <= 0) return '0h 0m 0s';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(diffMs % (1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor(diffMs % (1000 * 60) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}
function isConceptCompleted(concept, moduleId, state) {
    // 1. Direct record in completedConcepts map
    if (state.completedConcepts && state.completedConcepts[concept.id]) {
        return true;
    }
    // 2. Module record has it in completedConcepts list
    const moduleProgress = state.completedModules?.[moduleId];
    if (moduleProgress?.completedConcepts?.includes(concept.id)) {
        return true;
    }
    // 3. Entire module is already marked completed
    if (moduleProgress?.completedAt) {
        return true;
    }
    // 4. If concept has tasks, check if all tasks were completed
    if (concept.tasks && concept.tasks.length > 0) {
        const allTasksDone = concept.tasks.every((task)=>state.taskAttempts?.[task.id]?.completed || moduleProgress?.completedTasks?.includes(task.id));
        if (allTasksDone) {
            return true;
        }
    }
    return false;
}
function isModuleConceptsCompleted(module, state) {
    if (state.completedModules?.[module.id]?.completedAt) {
        return true;
    }
    if (!module.concepts || module.concepts.length === 0) {
        return true;
    }
    return module.concepts.every((concept)=>isConceptCompleted(concept, module.id, state));
}
function isModuleFullyComplete(module, state) {
    const record = state.completedModules?.[module.id];
    // No completion record at all → definitely not done
    if (!record) return false;
    // All concept lessons must be done
    if (!isModuleConceptsCompleted(module, state)) return false;
    // If the module has a challenge, it must also be completed
    if (module.challenge && !record.challengeCompleted && !record.completedAt) {
        return false;
    }
    return true;
}
function isModuleChallengeUnlocked(module, allModules, state) {
    if (!module.challenge) {
        return {
            isUnlocked: false,
            isCompleted: false,
            reason: 'No challenge exists for this module.'
        };
    }
    const moduleStatus = getModuleUnlockStatus(module, allModules, state);
    if (!moduleStatus.isUnlocked && !moduleStatus.isCompleted) {
        return {
            isUnlocked: false,
            isCompleted: false,
            reason: moduleStatus.reason || `Day ${module.day} is currently locked.`
        };
    }
    const isCompleted = Boolean(state.completedModules?.[module.id]?.challengeCompleted || state.completedModules?.[module.id]?.completedAt);
    const conceptsDone = isModuleConceptsCompleted(module, state);
    if (!conceptsDone && !isCompleted) {
        const totalConcepts = module.concepts.length;
        const completedCount = module.concepts.filter((c)=>isConceptCompleted(c, module.id, state)).length;
        return {
            isUnlocked: false,
            isCompleted: false,
            reason: `Complete all Day ${module.day} concept lessons & practice tasks first (${completedCount}/${totalConcepts} completed).`
        };
    }
    return {
        isUnlocked: true,
        isCompleted
    };
}
function getModuleUnlockStatus(module, allModules, state) {
    // Gate 0 — Day 1 is always unlocked
    if (module.day === 1 || module.id === 'day-01') {
        // A day only counts as "completed" when every concept AND the final
        // challenge (if any) is finished — never for a partial progress record.
        const isCompleted = isModuleFullyComplete(module, state);
        return {
            isUnlocked: true,
            isCompleted,
            isCurrent: state.currentModuleId === module.id
        };
    }
    const hasRecord = !!state.completedModules[module.id];
    if (hasRecord) {
        // Keep the module unlocked so learners can always return and continue, but
        // only report "completed" once all concepts AND the challenge are done.
        return {
            isUnlocked: true,
            isCompleted: isModuleFullyComplete(module, state),
            isCurrent: state.currentModuleId === module.id
        };
    }
    // Bypass mode — skip all time/schedule gates; only require previous completion
    if (state.bypassDailyLock) {
        const prevModule = allModules.find((m)=>m.day === module.day - 1);
        const prevCompleted = prevModule ? !!state.completedModules[prevModule.id] : true;
        return {
            isUnlocked: prevCompleted,
            isCompleted: false,
            isCurrent: state.currentModuleId === module.id,
            reason: prevCompleted ? undefined : 'Previous module must be completed first'
        };
    }
    // Gate 1 — Find previous module
    const prevModule = allModules.find((m)=>m.day === module.day - 1);
    if (!prevModule) {
        return {
            isUnlocked: true,
            isCompleted: false,
            isCurrent: false
        };
    }
    // Gate 2 — Previous module must have a completion record
    const prevCompletionRecord = state.completedModules[prevModule.id];
    if (!prevCompletionRecord) {
        return {
            isUnlocked: false,
            isCompleted: false,
            isCurrent: false,
            reason: `Complete Day ${prevModule.day} (${prevModule.shortTitle}) first.`
        };
    }
    // Gate 3 — Previous module must be FULLY complete (concepts + challenge)
    if (!isModuleFullyComplete(prevModule, state)) {
        const totalConcepts = prevModule.concepts?.length ?? 0;
        const completedCount = prevModule.concepts?.filter((c)=>isConceptCompleted(c, prevModule.id, state)).length ?? 0;
        const challengePending = prevModule.challenge && !prevCompletionRecord.challengeCompleted;
        const reason = challengePending ? `Finish the Day ${prevModule.day} Independent Challenge to unlock Day ${module.day}.` : `Finish all Day ${prevModule.day} concept lessons first (${completedCount}/${totalConcepts} done).`;
        return {
            isUnlocked: false,
            isCompleted: false,
            isCurrent: false,
            reason
        };
    }
    const now = getEffectiveNow(state.simulatedTimeOffsetHours);
    const prevCompletedDate = new Date(prevCompletionRecord.completedAt);
    const nextUnlockDate = getNextUnlockTime(prevCompletedDate);
    // Gate 4 — Respect scheduledPublishDate if set on this module
    if (module.scheduledPublishDate) {
        const publishDate = new Date(module.scheduledPublishDate);
        if (!isNaN(publishDate.getTime()) && now.getTime() < publishDate.getTime()) {
            return {
                isUnlocked: false,
                isCompleted: false,
                isCurrent: false,
                unlockTime: publishDate,
                countdownFormatted: formatTimeRemaining(publishDate, now),
                reason: `Scheduled for release on ${publishDate.toLocaleDateString()} at ${publishDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })} (${formatTimeRemaining(publishDate, now)} remaining).`
            };
        }
    }
    // Gate 5 — 6 PM learning-cycle gate
    const prevCycle = prevCompletionRecord.learningDayCycleId;
    const currentCycle = getLearningCycleId(now);
    const isPastUnlockTime = now.getTime() >= nextUnlockDate.getTime();
    const isDifferentCycle = prevCycle !== currentCycle;
    if (isPastUnlockTime || isDifferentCycle) {
        return {
            isUnlocked: true,
            isCompleted: false,
            isCurrent: state.currentModuleId === module.id,
            unlockTime: nextUnlockDate
        };
    }
    return {
        isUnlocked: false,
        isCompleted: false,
        isCurrent: false,
        unlockTime: nextUnlockDate,
        countdownFormatted: formatTimeRemaining(nextUnlockDate, now),
        reason: `Unlocks at 6:00 PM on next learning day (${formatTimeRemaining(nextUnlockDate, now)} remaining).`
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/sql-engine/executor.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SqlExecutor",
    ()=>SqlExecutor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sql-engine/parser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$database$2f$tables$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/database/tables.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$database$2f$schema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/database/schema.ts [app-client] (ecmascript)");
;
;
;
function getRowValue(row, colExpr) {
    if (!row) return undefined;
    if (row[colExpr] !== undefined) return row[colExpr];
    const lowerExpr = colExpr.toLowerCase();
    for (const k of Object.keys(row)){
        if (k.toLowerCase() === lowerExpr) return row[k];
    }
    const pureCol = colExpr.includes('.') ? colExpr.split('.')[1] : colExpr;
    if (row[pureCol] !== undefined) return row[pureCol];
    const lowerPure = pureCol.toLowerCase();
    for (const k of Object.keys(row)){
        if (k.toLowerCase() === lowerPure) return row[k];
    }
    return undefined;
}
function splitLogicalClauses(expr, operator) {
    const parts = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let inBetween = false;
    const len = expr.length;
    for(let i = 0; i < len; i++){
        const ch = expr[i];
        if ((ch === "'" || ch === '"') && (i === 0 || expr[i - 1] !== '\\')) {
            if (!inString) {
                inString = true;
                stringChar = ch;
            } else if (stringChar === ch) {
                inString = false;
            }
            current += ch;
            continue;
        }
        if (inString) {
            current += ch;
            continue;
        }
        if (ch === '(') {
            depth++;
            current += ch;
            continue;
        }
        if (ch === ')') {
            depth--;
            current += ch;
            continue;
        }
        if (depth === 0) {
            const rest = expr.slice(i);
            if (/^\bBETWEEN\b/i.test(rest)) {
                inBetween = true;
            }
            if (inBetween && /^\bAND\b/i.test(rest)) {
                inBetween = false;
                current += rest.slice(0, 3);
                i += 2;
                continue;
            }
            if (operator === 'OR' && /^\bOR\b/i.test(rest)) {
                parts.push(current.trim());
                current = '';
                i += 1;
                continue;
            }
            if (operator === 'AND' && /^\bAND\b/i.test(rest)) {
                parts.push(current.trim());
                current = '';
                i += 2;
                continue;
            }
        }
        current += ch;
    }
    if (current.trim()) {
        parts.push(current.trim());
    }
    return parts;
}
class SqlExecutor {
    db;
    transactionBackup = null;
    inTransaction = false;
    constructor(initialDb){
        if (initialDb) {
            this.db = JSON.parse(JSON.stringify(initialDb));
        } else {
            this.db = {
                tables: JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$database$2f$tables$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INITIAL_TABLES"])),
                schemas: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$database$2f$schema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DATABASE_SCHEMAS"]
            };
        }
    }
    getDatabaseState() {
        return this.db;
    }
    resetDatabase(initialDb) {
        if (initialDb) {
            this.db = JSON.parse(JSON.stringify(initialDb));
        } else {
            this.db = {
                tables: JSON.parse(JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$database$2f$tables$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INITIAL_TABLES"])),
                schemas: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$database$2f$schema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DATABASE_SCHEMAS"]
            };
        }
        this.transactionBackup = null;
        this.inTransaction = false;
    }
    executeQuery(sql) {
        return this.execute(sql);
    }
    execute(sql) {
        const startTime = performance.now();
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSql"])(sql);
        if (parsed.error) {
            return {
                success: false,
                columns: [],
                rows: [],
                rowCount: 0,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
                error: parsed.error
            };
        }
        try {
            if (parsed.type === 'CTE') {
                return this.executeCte(parsed, startTime);
            }
            if (parsed.type === 'EXPLAIN') {
                return this.executeExplain(parsed, startTime);
            }
            if (parsed.type === 'DDL') {
                return this.executeDdl(parsed, startTime);
            }
            if (parsed.type === 'TRANSACTION') {
                return this.handleTransaction(parsed, startTime);
            }
            if (parsed.type === 'SELECT') {
                return this.executeSelect(parsed, startTime);
            }
            if (parsed.type === 'INSERT') {
                return this.executeInsert(parsed, startTime);
            }
            if (parsed.type === 'UPDATE') {
                return this.executeUpdate(parsed, startTime);
            }
            if (parsed.type === 'DELETE') {
                return this.executeDelete(parsed, startTime);
            }
            return {
                success: false,
                columns: [],
                rows: [],
                rowCount: 0,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
                error: 'Unsupported statement type'
            };
        } catch (err) {
            return {
                success: false,
                columns: [],
                rows: [],
                rowCount: 0,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
                error: err.message || 'Execution error'
            };
        }
    }
    executeCte(parsed, startTime) {
        const cteName = parsed.cteName?.toLowerCase();
        const cteSql = parsed.cteQuery;
        const mainSql = parsed.mainQuery;
        if (!cteName || !cteSql || !mainSql) {
            throw new Error('Invalid Common Table Expression syntax');
        }
        // Execute inner CTE query
        const cteRes = this.execute(cteSql);
        if (!cteRes.success) {
            throw new Error(`Error executing CTE '${parsed.cteName}': ${cteRes.error}`);
        }
        // Register temporary table
        const hadTableBefore = !!this.db.tables[cteName];
        const prevTableData = this.db.tables[cteName];
        this.db.tables[cteName] = cteRes.rows;
        try {
            const mainRes = this.execute(mainSql);
            mainRes.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
            return mainRes;
        } finally{
            if (hadTableBefore) {
                this.db.tables[cteName] = prevTableData;
            } else {
                delete this.db.tables[cteName];
            }
        }
    }
    executeExplain(parsed, startTime) {
        const target = parsed.explainTarget || '';
        const parsedTarget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSql"])(target);
        const targetTable = parsedTarget.fromTable || 'products';
        const columns = [
            'id',
            'select_type',
            'table',
            'type',
            'possible_keys',
            'key',
            'rows',
            'Extra'
        ];
        const rows = [
            {
                id: 1,
                select_type: 'SIMPLE',
                table: targetTable,
                type: parsedTarget.whereClause ? 'ref' : 'ALL',
                possible_keys: parsedTarget.whereClause ? 'PRIMARY, idx_lookup' : null,
                key: parsedTarget.whereClause ? 'idx_lookup' : null,
                rows: this.db.tables[targetTable.toLowerCase()]?.length || 10,
                Extra: parsedTarget.whereClause ? 'Using index condition; Using where' : ''
            }
        ];
        return {
            success: true,
            columns,
            rows,
            rowCount: rows.length,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
        };
    }
    executeDdl(parsed, startTime) {
        const cmd = parsed.ddlCommand || '';
        // CREATE TABLE
        const createMatch = cmd.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"']?[\w_]+[`"']?)/i);
        if (createMatch) {
            const tbl = createMatch[1].replace(/[`"']/g, '').toLowerCase();
            if (!this.db.tables[tbl]) {
                this.db.tables[tbl] = [];
            }
            return {
                success: true,
                columns: [
                    'status'
                ],
                rows: [
                    {
                        status: `Table '${tbl}' created successfully (0 rows affected)`
                    }
                ],
                rowCount: 1,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
            };
        }
        // ALTER TABLE
        const alterMatch = cmd.match(/ALTER\s+TABLE\s+([`"']?[\w_]+[`"']?)\s+ADD\s+COLUMN\s+([`"']?[\w_]+[`"']?)\s+([a-zA-Z0-9_()]+)(?:\s+DEFAULT\s+([\s\S]+))?/i);
        if (alterMatch) {
            const tbl = alterMatch[1].replace(/[`"']/g, '').toLowerCase();
            const colName = alterMatch[2].replace(/[`"']/g, '');
            const defVal = alterMatch[4] ? alterMatch[4].replace(/^['"]|['"]$/g, '').trim() : null;
            if (this.db.tables[tbl]) {
                this.db.tables[tbl] = this.db.tables[tbl].map((row)=>({
                        ...row,
                        [colName]: defVal ?? null
                    }));
            }
            return {
                success: true,
                columns: [
                    'status'
                ],
                rows: [
                    {
                        status: `Table '${tbl}' altered: column '${colName}' added successfully`
                    }
                ],
                rowCount: 1,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
            };
        }
        return {
            success: true,
            columns: [
                'status'
            ],
            rows: [
                {
                    status: 'DDL command executed successfully'
                }
            ],
            rowCount: 1,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
        };
    }
    handleTransaction(parsed, startTime) {
        const cmd = parsed.transactionCommand;
        if (cmd === 'BEGIN') {
            this.inTransaction = true;
            this.transactionBackup = JSON.parse(JSON.stringify(this.db));
            return {
                success: true,
                columns: [
                    'status'
                ],
                rows: [
                    {
                        status: 'Transaction started (atomicity active)'
                    }
                ],
                rowCount: 1,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
                transactionStatus: 'in_transaction'
            };
        } else if (cmd === 'COMMIT') {
            this.inTransaction = false;
            this.transactionBackup = null;
            return {
                success: true,
                columns: [
                    'status'
                ],
                rows: [
                    {
                        status: 'Transaction committed successfully'
                    }
                ],
                rowCount: 1,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
                transactionStatus: 'committed'
            };
        } else if (cmd === 'ROLLBACK') {
            if (this.transactionBackup) {
                this.db = this.transactionBackup;
                this.transactionBackup = null;
            }
            this.inTransaction = false;
            return {
                success: true,
                columns: [
                    'status'
                ],
                rows: [
                    {
                        status: 'Transaction rolled back (changes reverted)'
                    }
                ],
                rowCount: 1,
                executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
                transactionStatus: 'rolled_back'
            };
        }
        return {
            success: false,
            columns: [],
            rows: [],
            rowCount: 0,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
            error: 'Unknown transaction command'
        };
    }
    executeSelect(query, startTime) {
        const tableName = query.fromTable?.toLowerCase();
        if (!tableName || !this.db.tables[tableName]) {
            throw new Error(`Table '${query.fromTable}' does not exist in database.`);
        }
        // 1. FROM clause - load base rows with alias/table prefixed keys
        const fromAlias = query.fromAlias || tableName;
        let currentRows = this.db.tables[tableName].map((r)=>{
            const row = {
                ...r
            };
            Object.keys(r).forEach((k)=>{
                row[`${tableName}.${k}`] = r[k];
                if (fromAlias) row[`${fromAlias}.${k}`] = r[k];
            });
            return row;
        });
        // 2. JOINs
        if (query.joins && query.joins.length > 0) {
            for (const join of query.joins){
                const joinTable = join.table.toLowerCase();
                const joinAlias = join.alias || joinTable;
                const targetData = this.db.tables[joinTable];
                if (!targetData) {
                    throw new Error(`Table '${join.table}' in JOIN clause does not exist.`);
                }
                const newRows = [];
                const leftKey = join.onLeft;
                const rightKey = join.onRight;
                for (const row of currentRows){
                    let matched = false;
                    for (const targetRow of targetData){
                        const vLeft = getRowValue(row, leftKey);
                        const vRight = getRowValue(targetRow, rightKey);
                        const vLeftAlt = getRowValue(row, rightKey);
                        const vRightAlt = getRowValue(targetRow, leftKey);
                        if (vLeft !== undefined && vRight !== undefined && vLeft == vRight || vLeftAlt !== undefined && vRightAlt !== undefined && vLeftAlt == vRightAlt) {
                            const merged = {
                                ...row
                            };
                            Object.keys(targetRow).forEach((k)=>{
                                merged[`${joinTable}.${k}`] = targetRow[k];
                                if (joinAlias) merged[`${joinAlias}.${k}`] = targetRow[k];
                                if (merged[k] === undefined) merged[k] = targetRow[k];
                            });
                            newRows.push(merged);
                            matched = true;
                        }
                    }
                    if (!matched && join.type === 'LEFT') {
                        const nullTarget = {};
                        const schema = this.db.schemas[joinTable];
                        if (schema) {
                            schema.columns.forEach((col)=>{
                                nullTarget[col.name] = null;
                                nullTarget[`${joinTable}.${col.name}`] = null;
                                if (joinAlias) nullTarget[`${joinAlias}.${col.name}`] = null;
                            });
                        } else if (targetData.length > 0) {
                            Object.keys(targetData[0]).forEach((k)=>{
                                nullTarget[k] = null;
                                nullTarget[`${joinTable}.${k}`] = null;
                                if (joinAlias) nullTarget[`${joinAlias}.${k}`] = null;
                            });
                        }
                        newRows.push({
                            ...row,
                            ...nullTarget
                        });
                    }
                }
                currentRows = newRows;
            }
        }
        // 3. WHERE clause filtering
        if (query.whereClause) {
            currentRows = currentRows.filter((row)=>this.evaluateWhere(query.whereClause, row));
        }
        // 4. GROUP BY & Aggregations
        let finalColumns = [];
        let projectedRows = [];
        const hasAggregates = query.columns?.some((c)=>!!c.aggregate);
        const hasGroupBy = query.groupBy && query.groupBy.length > 0;
        if (hasGroupBy || hasAggregates) {
            const groups = {};
            if (hasGroupBy) {
                currentRows.forEach((row)=>{
                    const key = query.groupBy.map((col)=>String(getRowValue(row, col) ?? '')).join('___');
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(row);
                });
            } else {
                groups['all'] = currentRows;
            }
            for (const key of Object.keys(groups)){
                const groupRows = groups[key];
                const projected = {};
                // Calculate projections
                query.columns?.forEach((col)=>{
                    const colName = col.alias || (col.expression.includes('.') ? col.expression.split('.')[1] : col.expression);
                    if (col.aggregate) {
                        projected[colName] = this.computeAggregate(col.aggregate, col.aggregateArg || '', groupRows);
                    } else {
                        // Take first row value for grouped columns
                        projected[colName] = groupRows[0] ? getRowValue(groupRows[0], col.expression) : null;
                    }
                });
                // HAVING filter check with direct aggregate evaluation over groupRows
                if (query.havingClause) {
                    let evaluatedHaving = query.havingClause;
                    // 1. Replace aliases
                    query.columns?.forEach((col)=>{
                        const alias = col.alias || col.expression;
                        if (col.aggregate && alias) {
                            const fullAggPattern = new RegExp(`\\b${col.aggregate}\\s*\\([^)]*\\)`, 'gi');
                            evaluatedHaving = evaluatedHaving.replace(fullAggPattern, alias);
                        }
                    });
                    // 2. Evaluate remaining inline aggregates: e.g. COUNT(oi.order_item_id)
                    const inlineAggs = evaluatedHaving.match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(([^)]*)\)/gi);
                    if (inlineAggs) {
                        for (const aggExpr of inlineAggs){
                            const parts = aggExpr.match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(([^)]*)\)/i);
                            if (parts) {
                                const val = this.computeAggregate(parts[1].toUpperCase(), parts[2], groupRows);
                                evaluatedHaving = evaluatedHaving.replace(aggExpr, String(val));
                            }
                        }
                    }
                    if (this.evaluateWhere(evaluatedHaving, projected)) {
                        projectedRows.push(projected);
                    }
                } else {
                    projectedRows.push(projected);
                }
            }
        } else {
            // 5. Standard SELECT projection
            const isSelectAll = query.columns?.some((c)=>c.expression.trim() === '*');
            if (isSelectAll) {
                projectedRows = currentRows;
                if (currentRows.length > 0) {
                    finalColumns = Object.keys(currentRows[0]);
                } else {
                    const schema = this.db.schemas[tableName];
                    finalColumns = schema ? schema.columns.map((c)=>c.name) : [];
                }
            } else {
                projectedRows = currentRows.map((row)=>{
                    const projected = {};
                    query.columns?.forEach((col)=>{
                        const outputCol = col.alias || (col.expression.includes('.') ? col.expression.split('.')[1] : col.expression);
                        const srcCol = col.expression;
                        // Check computed expressions (e.g., quantity * unit_price)
                        if (srcCol.includes('*')) {
                            const [c1, c2] = srcCol.split('*').map((s)=>s.trim());
                            const val1 = Number(getRowValue(row, c1)) || 0;
                            const val2 = Number(getRowValue(row, c2)) || 0;
                            projected[outputCol] = val1 * val2;
                        } else if (!col.windowFunction) {
                            projected[outputCol] = getRowValue(row, srcCol) !== undefined ? getRowValue(row, srcCol) : null;
                        }
                    });
                    return projected;
                });
            }
        }
        // Window Functions (e.g. ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...))
        const windowCols = query.columns?.filter((c)=>!!c.windowFunction);
        if (windowCols && windowCols.length > 0) {
            windowCols.forEach((winCol)=>{
                const win = winCol.windowFunction;
                const partKey = win.partitionBy;
                const orderKey = win.orderBy;
                const outName = winCol.alias || winCol.expression;
                // Group rows by partition
                const partitions = {};
                projectedRows.forEach((r)=>{
                    const pk = partKey ? String(getRowValue(r, partKey) ?? '') : 'all';
                    if (!partitions[pk]) partitions[pk] = [];
                    partitions[pk].push(r);
                });
                // Compute rank within each partition
                Object.values(partitions).forEach((partRows)=>{
                    if (orderKey) {
                        partRows.sort((a, b)=>{
                            const va = Number(getRowValue(a, orderKey)) || 0;
                            const vb = Number(getRowValue(b, orderKey)) || 0;
                            return win.direction === 'ASC' ? va - vb : vb - va;
                        });
                    }
                    partRows.forEach((r, idx)=>{
                        r[outName] = idx + 1;
                    });
                });
            });
        }
        // 6. DISTINCT
        if (query.isDistinct) {
            const seen = new Set();
            projectedRows = projectedRows.filter((row)=>{
                const hash = JSON.stringify(row);
                if (seen.has(hash)) return false;
                seen.add(hash);
                return true;
            });
        }
        // 7. ORDER BY
        if (query.orderBy && query.orderBy.length > 0) {
            projectedRows.sort((a, b)=>{
                for (const ord of query.orderBy){
                    const valA = getRowValue(a, ord.column);
                    const valB = getRowValue(b, ord.column);
                    if (valA === valB) continue;
                    if (valA === null || valA === undefined) return ord.direction === 'ASC' ? 1 : -1;
                    if (valB === null || valB === undefined) return ord.direction === 'ASC' ? -1 : 1;
                    if (typeof valA === 'number' && typeof valB === 'number') {
                        return ord.direction === 'ASC' ? valA - valB : valB - valA;
                    }
                    const cmp = String(valA).localeCompare(String(valB));
                    return ord.direction === 'ASC' ? cmp : -cmp;
                }
                return 0;
            });
        }
        // 8. LIMIT & OFFSET
        if (query.offset !== undefined) {
            projectedRows = projectedRows.slice(query.offset);
        }
        if (query.limit !== undefined) {
            projectedRows = projectedRows.slice(0, query.limit);
        }
        // Determine final columns list
        if (projectedRows.length > 0) {
            finalColumns = Object.keys(projectedRows[0]);
        } else if (finalColumns.length === 0) {
            finalColumns = query.columns?.map((c)=>c.alias || c.expression) || [];
        }
        return {
            success: true,
            columns: finalColumns,
            rows: projectedRows,
            rowCount: projectedRows.length,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
        };
    }
    evaluateWhere(whereExpr, row) {
        let trimmed = whereExpr.trim();
        while(trimmed.startsWith('(') && trimmed.endsWith(')')){
            let depth = 0;
            let wrapsAll = true;
            for(let i = 0; i < trimmed.length - 1; i++){
                if (trimmed[i] === '(') depth++;
                else if (trimmed[i] === ')') depth--;
                if (depth === 0) {
                    wrapsAll = false;
                    break;
                }
            }
            if (wrapsAll) {
                trimmed = trimmed.slice(1, -1).trim();
            } else {
                break;
            }
        }
        // Handle OR expressions
        const orParts = splitLogicalClauses(trimmed, 'OR');
        if (orParts.length > 1) {
            return orParts.some((part)=>this.evaluateWhere(part, row));
        }
        // Handle AND expressions
        const andParts = splitLogicalClauses(trimmed, 'AND');
        if (andParts.length > 1) {
            return andParts.every((part)=>this.evaluateWhere(part, row));
        }
        // Negation: NOT <expr> (e.g. `NOT (category_id = 1)`, `NOT price > 50`)
        // Evaluate the inner expression and invert the boolean result.
        if (/^NOT\s+/i.test(trimmed)) {
            const inner = trimmed.replace(/^NOT\s+/i, '').trim();
            return !this.evaluateWhere(inner, row);
        }
        // IS NULL / IS NOT NULL
        const isNullMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+IS\s+(NOT\s+)?NULL$/i);
        if (isNullMatch) {
            const col = isNullMatch[1].replace(/[`"']/g, '');
            const not = !!isNullMatch[2];
            const val = getRowValue(row, col);
            const isNull = val === null || val === undefined || val === '';
            return not ? !isNull : isNull;
        }
        // LIKE / ILIKE (e.g. name LIKE '%mouse%')
        const likeMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?(I?LIKE)\s+['"]([\s\S]*?)['"]$/i);
        if (likeMatch) {
            const col = likeMatch[1].replace(/[`"']/g, '');
            const not = !!likeMatch[2];
            const pattern = likeMatch[4];
            const val = String(getRowValue(row, col) ?? '');
            const regexStr = '^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$';
            const regex = new RegExp(regexStr, 'i');
            const matches = regex.test(val);
            return not ? !matches : matches;
        }
        // IN / NOT IN with literal list or subquery
        const inMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?IN\s*\(([\s\S]+?)\)$/i);
        if (inMatch) {
            const col = inMatch[1].replace(/[`"']/g, '');
            const not = !!inMatch[2];
            const inBody = inMatch[3].trim();
            // Check if subquery inside IN: (SELECT col FROM table ...)
            if (/^SELECT\b/i.test(inBody)) {
                let subquery = inBody;
                // Check for correlated subquery replacement
                subquery = subquery.replace(/p1\.category_id/g, String(getRowValue(row, 'category_id') ?? ''));
                const subRes = this.execute(subquery);
                const colName = subRes.columns[0];
                const items = subRes.rows.map((r)=>r[colName]);
                const val = getRowValue(row, col);
                // If items contains NULL, SQL NOT IN returns false / unknown!
                if (not && items.includes(null)) {
                    return false;
                }
                const has = items.some((item)=>String(item ?? '').toLowerCase() === String(val ?? '').toLowerCase());
                return not ? !has : has;
            }
            const items = inBody.split(',').map((s)=>s.trim().replace(/^['"]|['"]$/g, ''));
            const val = String(getRowValue(row, col) ?? '');
            const has = items.some((item)=>item.toLowerCase() === val.toLowerCase());
            return not ? !has : has;
        }
        // BETWEEN x AND y
        const betweenMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s+(NOT\s+)?BETWEEN\s+([\d.]+)\s+AND\s+([\d.]+)$/i);
        if (betweenMatch) {
            const col = betweenMatch[1].replace(/[`"']/g, '');
            const not = !!betweenMatch[2];
            const min = Number(betweenMatch[3]);
            const max = Number(betweenMatch[4]);
            const val = Number(getRowValue(row, col));
            const isBetween = val >= min && val <= max;
            return not ? !isBetween : isBetween;
        }
        // Comparison operators (=, !=, <>, <=, >=, <, >) with literal or subquery
        const compMatch = trimmed.match(/^([`"']?[\w_.]+[`"']?)\s*(=|!=|<>|<=|>=|<|>)\s*([\s\S]+)$/);
        if (compMatch) {
            const col = compMatch[1].replace(/[`"']/g, '');
            const op = compMatch[2];
            let target = compMatch[3].trim();
            // Check if target is a subquery: (SELECT AVG(...) ...)
            if (/^\(SELECT[\s\S]+\)$/i.test(target)) {
                let subquery = target.replace(/^\(|\)$/g, '').trim();
                // Handle correlated category_id substitution if present: p2.category_id = p1.category_id
                const catVal = getRowValue(row, 'category_id');
                if (catVal !== undefined) {
                    subquery = subquery.replace(/p1\.category_id/g, String(catVal));
                }
                const subRes = this.execute(subquery);
                if (subRes.success && subRes.rows.length > 0) {
                    const colName = subRes.columns[0];
                    target = String(subRes.rows[0][colName] ?? 0);
                }
            }
            // Check if target has CURDATE() or INTERVAL
            if (/CURDATE\(\)/i.test(target)) {
                // Anchor CURDATE to '2024-03-01' matching seed dataset
                const anchorDate = new Date('2024-03-01T00:00:00Z');
                const intervalMatch = target.match(/INTERVAL\s+(\d+)\s+(DAY|MONTH|YEAR)/i);
                if (intervalMatch) {
                    const num = parseInt(intervalMatch[1], 10);
                    const unit = intervalMatch[2].toUpperCase();
                    if (unit === 'DAY') anchorDate.setUTCDate(anchorDate.getUTCDate() - num);
                    if (unit === 'MONTH') anchorDate.setUTCMonth(anchorDate.getUTCMonth() - num);
                    if (unit === 'YEAR') anchorDate.setUTCFullYear(anchorDate.getUTCFullYear() - num);
                }
                target = anchorDate.toISOString().split('T')[0];
            }
            let targetVal = target.replace(/^['"]|['"]$/g, '').replace(/[`"']/g, '');
            if (getRowValue(row, targetVal) !== undefined && !target.startsWith("'") && !target.startsWith('"')) {
                targetVal = getRowValue(row, targetVal);
            }
            const rowVal = isNaN(Number(col)) || getRowValue(row, col) !== undefined ? getRowValue(row, col) : Number(col);
            const numRow = Number(rowVal);
            const numTarget = Number(targetVal);
            const isNumeric = !isNaN(numRow) && !isNaN(numTarget) && typeof rowVal !== 'string';
            const v1 = isNumeric ? numRow : String(rowVal ?? '').toLowerCase();
            const v2 = isNumeric ? numTarget : String(targetVal ?? '').toLowerCase();
            switch(op){
                case '=':
                    return v1 == v2;
                case '!=':
                case '<>':
                    return v1 != v2;
                case '<':
                    return v1 < v2;
                case '>':
                    return v1 > v2;
                case '<=':
                    return v1 <= v2;
                case '>=':
                    return v1 >= v2;
            }
        }
        return true;
    }
    computeAggregate(func, arg, rows) {
        const cleanArg = arg.trim();
        if (func === 'COUNT') {
            if (cleanArg === '*' || cleanArg === '1') {
                return rows.length;
            }
            if (/^DISTINCT\s+/i.test(cleanArg)) {
                const col = cleanArg.replace(/^DISTINCT\s+/i, '').trim();
                const set = new Set(rows.map((r)=>getRowValue(r, col)).filter((v)=>v !== null && v !== undefined));
                return set.size;
            }
            return rows.filter((r)=>{
                const val = getRowValue(r, cleanArg);
                return val !== null && val !== undefined;
            }).length;
        }
        const values = rows.map((r)=>{
            if (cleanArg.includes('*')) {
                const [c1, c2] = cleanArg.split('*').map((s)=>s.trim());
                const v1 = Number(getRowValue(r, c1)) || 0;
                const v2 = Number(getRowValue(r, c2)) || 0;
                return v1 * v2;
            }
            return Number(getRowValue(r, cleanArg));
        }).filter((v)=>!isNaN(v));
        if (values.length === 0) return 0;
        if (func === 'SUM') {
            return Math.round(values.reduce((a, b)=>a + b, 0) * 100) / 100;
        }
        if (func === 'AVG') {
            return Math.round(values.reduce((a, b)=>a + b, 0) / values.length * 100) / 100;
        }
        if (func === 'MIN') {
            return Math.min(...values);
        }
        if (func === 'MAX') {
            return Math.max(...values);
        }
        return 0;
    }
    executeInsert(query, startTime) {
        const table = query.insertTable?.toLowerCase();
        if (!table || !this.db.tables[table]) {
            throw new Error(`Table '${query.insertTable}' does not exist.`);
        }
        if (table === 'products' && query.insertValues?.category_id) {
            const catExists = this.db.tables.categories.some((c)=>c.category_id === query.insertValues?.category_id);
            if (!catExists) {
                throw new Error(`Cannot add or update child row: a foreign key constraint fails (category_id ${query.insertValues.category_id} not found in categories).`);
            }
        }
        this.db.tables[table].push({
            ...query.insertValues
        });
        return {
            success: true,
            columns: [
                'status',
                'affected_rows'
            ],
            rows: [
                {
                    status: 'Row inserted successfully',
                    affected_rows: 1
                }
            ],
            rowCount: 1,
            affectedRows: 1,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
        };
    }
    executeUpdate(query, startTime) {
        const table = query.updateTable?.toLowerCase();
        if (!table || !this.db.tables[table]) {
            throw new Error(`Table '${query.updateTable}' does not exist.`);
        }
        let affected = 0;
        this.db.tables[table] = this.db.tables[table].map((row)=>{
            if (!query.whereClause || this.evaluateWhere(query.whereClause, row)) {
                affected++;
                return {
                    ...row,
                    ...query.updateSet
                };
            }
            return row;
        });
        return {
            success: true,
            columns: [
                'status',
                'affected_rows'
            ],
            rows: [
                {
                    status: `Updated ${affected} row(s)`,
                    affected_rows: affected
                }
            ],
            rowCount: 1,
            affectedRows: affected,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
        };
    }
    executeDelete(query, startTime) {
        const table = query.deleteTable?.toLowerCase();
        if (!table || !this.db.tables[table]) {
            throw new Error(`Table '${query.deleteTable}' does not exist.`);
        }
        const initialLen = this.db.tables[table].length;
        this.db.tables[table] = this.db.tables[table].filter((row)=>{
            if (!query.whereClause) return false;
            return !this.evaluateWhere(query.whereClause, row);
        });
        const affected = initialLen - this.db.tables[table].length;
        return {
            success: true,
            columns: [
                'status',
                'affected_rows'
            ],
            rows: [
                {
                    status: `Deleted ${affected} row(s)`,
                    affected_rows: affected
                }
            ],
            rowCount: 1,
            affectedRows: affected,
            executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/sql-engine/parser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseSql",
    ()=>parseSql,
    "stripComments",
    ()=>stripComments
]);
function stripComments(rawSql) {
    // 1. Remove block comments /* ... */
    let cleaned = rawSql.replace(/\/\*[\s\S]*?\*\//g, '');
    // 2. Remove line comments line by line
    const lines = cleaned.split('\n');
    const nonCommentLines = lines.map((line)=>{
        let inQuote = null;
        let commentStartIdx = -1;
        for(let i = 0; i < line.length; i++){
            const char = line[i];
            // Handle quotes
            if ((char === "'" || char === '"' || char === '`') && (i === 0 || line[i - 1] !== '\\')) {
                if (!inQuote) {
                    inQuote = char;
                } else if (inQuote === char) {
                    inQuote = null;
                }
            } else if (!inQuote) {
                // Check for -- comment or # comment
                if (char === '-' && line[i + 1] === '-') {
                    commentStartIdx = i;
                    break;
                } else if (char === '#') {
                    commentStartIdx = i;
                    break;
                }
            }
        }
        if (commentStartIdx !== -1) {
            return line.substring(0, commentStartIdx);
        }
        return line;
    });
    return nonCommentLines.join(' ').replace(/\s+/g, ' ').trim();
}
function parseSql(rawSql) {
    // Clean comments and normalize whitespace
    const cleanSql = stripComments(rawSql);
    // Strip trailing or leading semicolons
    const sql = cleanSql.replace(/^;+|;+$/g, '').trim();
    if (!sql) {
        return {
            type: 'UNKNOWN',
            raw: rawSql,
            normalized: '',
            error: 'Empty query'
        };
    }
    // Transaction keywords
    if (/^BEGIN(\s+TRANSACTION)?/i.test(sql) || /^START\s+TRANSACTION/i.test(sql)) {
        return {
            type: 'TRANSACTION',
            raw: rawSql,
            normalized: sql,
            transactionCommand: 'BEGIN'
        };
    }
    if (/^COMMIT/i.test(sql)) {
        return {
            type: 'TRANSACTION',
            raw: rawSql,
            normalized: sql,
            transactionCommand: 'COMMIT'
        };
    }
    if (/^ROLLBACK/i.test(sql)) {
        return {
            type: 'TRANSACTION',
            raw: rawSql,
            normalized: sql,
            transactionCommand: 'ROLLBACK'
        };
    }
    // CTE (WITH cte_name AS (...) SELECT ...)
    const cteMatch = sql.match(/^WITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(([\s\S]+?)\)\s*(SELECT[\s\S]+)$/i);
    if (cteMatch) {
        const cteName = cteMatch[1].trim();
        const cteQuery = cteMatch[2].trim();
        const mainQuery = cteMatch[3].trim();
        const mainParsed = parseSelect(mainQuery, rawSql);
        return {
            ...mainParsed,
            type: 'CTE',
            raw: rawSql,
            normalized: sql,
            cteName,
            cteQuery,
            mainQuery
        };
    }
    // EXPLAIN query
    if (/^EXPLAIN\s+/i.test(sql)) {
        const targetQuery = sql.replace(/^EXPLAIN\s+/i, '').trim();
        return {
            type: 'EXPLAIN',
            raw: rawSql,
            normalized: sql,
            explainTarget: targetQuery
        };
    }
    // DDL Commands (CREATE TABLE, ALTER TABLE, DROP TABLE, CREATE INDEX)
    if (/^(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(UNIQUE\s+)?INDEX)/i.test(sql)) {
        return {
            type: 'DDL',
            raw: rawSql,
            normalized: sql,
            ddlCommand: sql
        };
    }
    // Handle SELECT
    if (/^SELECT\b/i.test(sql)) {
        return parseSelect(sql, rawSql);
    }
    // Handle INSERT
    if (/^INSERT\s+INTO\b/i.test(sql)) {
        return parseInsert(sql, rawSql);
    }
    // Handle UPDATE
    if (/^UPDATE\b/i.test(sql)) {
        return parseUpdate(sql, rawSql);
    }
    // Handle DELETE
    if (/^DELETE\s+FROM\b/i.test(sql)) {
        return parseDelete(sql, rawSql);
    }
    return {
        type: 'UNKNOWN',
        raw: rawSql,
        normalized: sql,
        error: 'Unsupported or unparseable SQL statement'
    };
}
function findTopLevelKeyword(sql, keyword) {
    let parenDepth = 0;
    let inQuote = null;
    const upperSql = sql.toUpperCase();
    const kw = keyword.toUpperCase();
    for(let i = 0; i <= sql.length - kw.length; i++){
        const char = sql[i];
        if ((char === "'" || char === '"' || char === '`') && (i === 0 || sql[i - 1] !== '\\')) {
            if (!inQuote) inQuote = char;
            else if (inQuote === char) inQuote = null;
        } else if (!inQuote) {
            if (char === '(') parenDepth++;
            else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
            else if (parenDepth === 0) {
                const isWordStart = i === 0 || /[\s,;()]/.test(sql[i - 1]);
                const isWordEnd = i + kw.length === sql.length || /[\s,;()]/.test(sql[i + kw.length]);
                if (isWordStart && isWordEnd && upperSql.substring(i, i + kw.length) === kw) {
                    return i;
                }
            }
        }
    }
    return -1;
}
function parseSelect(sql, rawSql) {
    const query = {
        type: 'SELECT',
        raw: rawSql,
        normalized: sql,
        columns: [],
        joins: [],
        orderBy: [],
        groupBy: []
    };
    try {
        let remaining = sql;
        // Extract LIMIT & OFFSET from tail (at top level)
        const limitIdx = findTopLevelKeyword(remaining, 'LIMIT');
        if (limitIdx !== -1) {
            const limitSection = remaining.substring(limitIdx).trim();
            const limitMatch = limitSection.match(/^LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?$/i);
            if (limitMatch) {
                query.limit = parseInt(limitMatch[1], 10);
                if (limitMatch[2]) {
                    query.offset = parseInt(limitMatch[2], 10);
                }
                remaining = remaining.substring(0, limitIdx).trim();
            }
        }
        // Extract ORDER BY (at top level)
        const orderIdx = findTopLevelKeyword(remaining, 'ORDER BY');
        if (orderIdx !== -1) {
            const orderSection = remaining.substring(orderIdx).replace(/^ORDER\s+BY\s+/i, '').trim();
            const orderExprs = orderSection.split(',').map((s)=>s.trim());
            for (const expr of orderExprs){
                const parts = expr.split(/\s+/);
                const col = parts[0].replace(/[`"']/g, '');
                const dir = parts[1] && parts[1].toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                query.orderBy?.push({
                    column: col,
                    direction: dir
                });
            }
            remaining = remaining.substring(0, orderIdx).trim();
        }
        // Extract HAVING (at top level)
        const havingIdx = findTopLevelKeyword(remaining, 'HAVING');
        if (havingIdx !== -1) {
            query.havingClause = remaining.substring(havingIdx).replace(/^HAVING\s+/i, '').trim();
            remaining = remaining.substring(0, havingIdx).trim();
        }
        // Extract GROUP BY (at top level)
        const groupIdx = findTopLevelKeyword(remaining, 'GROUP BY');
        if (groupIdx !== -1) {
            const groupSection = remaining.substring(groupIdx).replace(/^GROUP\s+BY\s+/i, '').trim();
            query.groupBy = groupSection.split(',').map((s)=>s.trim().replace(/[`"']/g, ''));
            remaining = remaining.substring(0, groupIdx).trim();
        }
        // Extract WHERE (at top level)
        const whereIdx = findTopLevelKeyword(remaining, 'WHERE');
        if (whereIdx !== -1) {
            query.whereClause = remaining.substring(whereIdx).replace(/^WHERE\s+/i, '').trim();
            remaining = remaining.substring(0, whereIdx).trim();
        }
        // Extract FROM & JOINs (at top level)
        const fromIdx = findTopLevelKeyword(remaining, 'FROM');
        if (fromIdx === -1) {
            return {
                ...query,
                error: 'Missing FROM clause in SELECT query'
            };
        }
        const selectSection = remaining.substring(0, fromIdx).replace(/^SELECT\s+/i, '').trim();
        const fromSection = remaining.substring(fromIdx).replace(/^FROM\s+/i, '').trim();
        // Check DISTINCT
        if (/^DISTINCT\s+/i.test(selectSection)) {
            query.isDistinct = true;
        }
        const cleanSelectSection = selectSection.replace(/^DISTINCT\s+/i, '').trim();
        // Parse Columns
        query.columns = parseColumnList(cleanSelectSection);
        // Parse FROM table and joins
        parseFromAndJoins(fromSection, query);
        return query;
    } catch (err) {
        return {
            ...query,
            error: err.message || 'Error parsing SQL query'
        };
    }
}
function parseColumnList(str) {
    const cols = [];
    // Split columns safely respecting commas inside parentheses
    const parts = [];
    let current = '';
    let parenDepth = 0;
    for(let i = 0; i < str.length; i++){
        const char = str[i];
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
        if (char === ',' && parenDepth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) {
        parts.push(current.trim());
    }
    for (const part of parts){
        const cleanPart = part.trim();
        const col = {
            raw: cleanPart,
            expression: cleanPart.replace(/^[`"']|[`"']$/g, '')
        };
        // Check window function: ROW_NUMBER() OVER (PARTITION BY cat ORDER BY price DESC) AS rank
        const windowMatch = cleanPart.match(/^(ROW_NUMBER|RANK|DENSE_RANK)\s*\(\)\s*OVER\s*\(([\s\S]*?)\)(?:\s+(?:AS\s+)?([`"']?[\w_]+[`"']?))?$/i);
        if (windowMatch) {
            const funcType = windowMatch[1].toUpperCase();
            const overBody = windowMatch[2].trim();
            const alias = windowMatch[3]?.replace(/[`"']/g, '').trim() || `${funcType.toLowerCase()}_result`;
            const partMatch = overBody.match(/PARTITION\s+BY\s+([`"']?[\w_.]+[`"']?)/i);
            const orderMatch = overBody.match(/ORDER\s+BY\s+([`"']?[\w_.]+[`"']?)(?:\s+(ASC|DESC))?/i);
            col.expression = alias;
            col.alias = alias;
            col.windowFunction = {
                type: funcType,
                partitionBy: partMatch ? partMatch[1].replace(/[`"']/g, '').trim() : undefined,
                orderBy: orderMatch ? orderMatch[1].replace(/[`"']/g, '').trim() : undefined,
                direction: orderMatch && orderMatch[2] && orderMatch[2].toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
            };
            cols.push(col);
            continue;
        }
        // Check alias AS or whitespace
        const asMatch = cleanPart.match(/^([\s\S]+?)\s+(?:AS\s+)?([`"']?[\w_]+[`"']?)$/i);
        if (asMatch && !cleanPart.includes('(')) {
            col.expression = asMatch[1].trim().replace(/[`"']/g, '');
            col.alias = asMatch[2].replace(/[`"']/g, '').trim();
        } else if (asMatch && cleanPart.includes('(') && cleanPart.endsWith(asMatch[2])) {
            col.expression = asMatch[1].trim();
            col.alias = asMatch[2].replace(/[`"']/g, '').trim();
        }
        // Check aggregates
        const aggMatch = col.expression.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(([\s\S]*)\)$/i);
        if (aggMatch) {
            col.aggregate = aggMatch[1].toUpperCase();
            col.aggregateArg = aggMatch[2].trim().replace(/[`"']/g, '');
            if (!col.alias) {
                col.alias = `${col.aggregate.toLowerCase()}_${col.aggregateArg.replace(/[^a-zA-Z0-9_]/g, '')}`;
            }
        }
        cols.push(col);
    }
    return cols;
}
function parseFromAndJoins(fromSection, query) {
    // Check for JOIN keywords
    const joinParts = fromSection.split(/\b(INNER\s+JOIN|LEFT\s+JOIN|JOIN)\b/i);
    const baseTableExpr = joinParts[0].trim();
    const baseParts = baseTableExpr.split(/\s+(?:AS\s+)?/i);
    query.fromTable = baseParts[0].trim().replace(/[`"']/g, '');
    if (baseParts[1]) {
        query.fromAlias = baseParts[1].trim().replace(/[`"']/g, '');
    }
    for(let i = 1; i < joinParts.length; i += 2){
        const joinType = /LEFT/i.test(joinParts[i]) ? 'LEFT' : 'INNER';
        const joinBody = joinParts[i + 1]?.trim() || '';
        const onMatch = joinBody.match(/^([`"']?[\w_]+[`"']?)(?:\s+(?:AS\s+)?([`"']?[\w_]+[`"']?))?\s+ON\s+([\w_.]+)\s*=\s*([\w_.]+)/i);
        if (onMatch) {
            query.joins?.push({
                type: joinType,
                table: onMatch[1].replace(/[`"']/g, ''),
                alias: onMatch[2]?.replace(/[`"']/g, ''),
                onLeft: onMatch[3].replace(/[`"']/g, ''),
                onRight: onMatch[4].replace(/[`"']/g, '')
            });
        }
    }
}
function parseInsert(sql, rawSql) {
    const match = sql.match(/INSERT\s+INTO\s+([`"']?[\w_]+[`"']?)\s*\(([\s\S]+?)\)\s*VALUES\s*\(([\s\S]+?)\)/i);
    if (!match) {
        return {
            type: 'INSERT',
            raw: rawSql,
            normalized: sql,
            error: 'Invalid INSERT syntax. Expected INSERT INTO table (cols) VALUES (vals)'
        };
    }
    const table = match[1].replace(/[`"']/g, '');
    const cols = match[2].split(',').map((s)=>s.trim().replace(/[`"']/g, ''));
    const vals = match[3].split(',').map((s)=>s.trim().replace(/^['"]|['"]$/g, ''));
    const insertValues = {};
    cols.forEach((col, idx)=>{
        const rawVal = vals[idx];
        const num = Number(rawVal);
        insertValues[col] = !isNaN(num) && rawVal !== '' ? num : rawVal;
    });
    return {
        type: 'INSERT',
        raw: rawSql,
        normalized: sql,
        insertTable: table,
        insertValues
    };
}
function parseUpdate(sql, rawSql) {
    const match = sql.match(/UPDATE\s+([`"']?[\w_]+[`"']?)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i);
    if (!match) {
        return {
            type: 'UPDATE',
            raw: rawSql,
            normalized: sql,
            error: 'Invalid UPDATE syntax'
        };
    }
    const table = match[1].replace(/[`"']/g, '');
    const setExpr = match[2];
    const whereClause = match[3]?.trim();
    const updateSet = {};
    setExpr.split(',').forEach((part)=>{
        const [c, v] = part.split('=').map((s)=>s.trim());
        if (c && v !== undefined) {
            const cleanVal = v.replace(/^['"]|['"]$/g, '');
            const num = Number(cleanVal);
            updateSet[c.replace(/[`"']/g, '')] = !isNaN(num) && cleanVal !== '' ? num : cleanVal;
        }
    });
    return {
        type: 'UPDATE',
        raw: rawSql,
        normalized: sql,
        updateTable: table,
        updateSet,
        whereClause
    };
}
function parseDelete(sql, rawSql) {
    const match = sql.match(/DELETE\s+FROM\s+([`"']?[\w_]+[`"']?)(?:\s+WHERE\s+([\s\S]+))?$/i);
    if (!match) {
        return {
            type: 'DELETE',
            raw: rawSql,
            normalized: sql,
            error: 'Invalid DELETE syntax'
        };
    }
    return {
        type: 'DELETE',
        raw: rawSql,
        normalized: sql,
        deleteTable: match[1].replace(/[`"']/g, ''),
        whereClause: match[2]?.trim()
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/sql-engine/validator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateTaskSolution",
    ()=>validateTaskSolution
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sql-engine/parser.ts [app-client] (ecmascript)");
;
// Levenshtein distance for fuzzy typo suggestion
function levenshtein(a, b) {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array.from({
        length: bn + 1
    }, (_, i)=>[
            i
        ]);
    for(let j = 0; j <= an; j++)matrix[0][j] = j;
    for(let i = 1; i <= bn; i++){
        for(let j = 1; j <= an; j++){
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion / deletion
                );
            }
        }
    }
    return matrix[bn][an];
}
function validateTaskSolution(userSql, result, rule) {
    const cleanSql = userSql.trim();
    // Check Trailing Semicolon Hint
    if (!cleanSql.endsWith(';')) {
    // We don't fail just for a missing semicolon, but we can give feedback if something else fails
    }
    // Check Common Aggregate in WHERE Trap (only within the WHERE clause and not part of a subquery or HAVING)
    const whereMatch = cleanSql.match(/\bWHERE\b((?:(?!\bSELECT\b)[\s\S])*?)(?:\bGROUP\s+BY\b|\bHAVING\b|\bORDER\s+BY\b|\bLIMIT\b|\)|;|$)/i);
    if (whereMatch && whereMatch[1]) {
        const whereText = whereMatch[1];
        if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(whereText)) {
            return {
                passed: false,
                feedback: `⚠️ Syntax Trap: Aggregate functions like COUNT() or SUM() cannot be used directly in a WHERE clause. Filter aggregates using the HAVING clause after GROUP BY instead.`
            };
        }
    }
    // Check Missing Quotes around text literals in WHERE (excluding column comparisons like p2.cat_id = p1.cat_id)
    const unquotedMatch = cleanSql.match(/\bWHERE\b\s+([a-zA-Z0-9_.]+)\s*(=|!=|LIKE)\s*([a-zA-Z][a-zA-Z0-9_]*)(?!\s*[\(.])/i);
    if (unquotedMatch) {
        const rhs = unquotedMatch[3].toUpperCase();
        const isKeywordOrNumber = [
            'NULL',
            'TRUE',
            'FALSE',
            'SELECT',
            'AS',
            'AND',
            'OR',
            'NOT'
        ].includes(rhs) || /^\d+$/.test(rhs);
        // Don't flag if it's a known table alias or table column
        const isTableAlias = [
            'P1',
            'P2',
            'P',
            'C',
            'O',
            'OI',
            'S',
            'R',
            'CAT',
            'AC'
        ].includes(rhs);
        if (!isKeywordOrNumber && !isTableAlias) {
            return {
                passed: false,
                feedback: `💡 Quote Reminder: Text values in SQL must be enclosed in single quotes (e.g., '${unquotedMatch[3]}' instead of ${unquotedMatch[3]}).`
            };
        }
    }
    if (!result.success) {
        return {
            passed: false,
            feedback: `SQL Error: ${result.error}`
        };
    }
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSql"])(userSql);
    // 1. Check Target Table
    if (rule.targetTable) {
        let fromTable = parsed.fromTable?.toLowerCase() || parsed.insertTable?.toLowerCase() || parsed.updateTable?.toLowerCase() || parsed.deleteTable?.toLowerCase();
        if (parsed.type === 'CTE' && parsed.cteQuery) {
            const cteParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSql"])(parsed.cteQuery);
            const mainParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSql"])(parsed.mainQuery || '');
            if (cteParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase() || mainParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase() || cleanSql.toLowerCase().includes(rule.targetTable.toLowerCase())) {
                fromTable = rule.targetTable.toLowerCase();
            }
        } else if (parsed.type === 'EXPLAIN' && parsed.explainTarget) {
            const expParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sql$2d$engine$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSql"])(parsed.explainTarget);
            if (expParsed.fromTable?.toLowerCase() === rule.targetTable.toLowerCase()) {
                fromTable = rule.targetTable.toLowerCase();
            }
        } else if (parsed.type === 'DDL') {
            if (cleanSql.toLowerCase().includes(rule.targetTable.toLowerCase())) {
                fromTable = rule.targetTable.toLowerCase();
            }
        }
        if (!fromTable || fromTable !== rule.targetTable.toLowerCase()) {
            return {
                passed: false,
                feedback: `You are querying the table '${fromTable || 'unknown'}', but this task requires querying the '${rule.targetTable}' table. Check your FROM clause.`
            };
        }
    }
    // 2. Check Required Columns & provide typo suggestions
    if (rule.requiredColumns && rule.requiredColumns.length > 0) {
        const resultCols = result.columns.map((c)=>c.toLowerCase());
        for (const reqCol of rule.requiredColumns){
            if (!resultCols.includes(reqCol.toLowerCase())) {
                // Look for possible typo in returned columns
                const typoCandidates = result.columns.filter((c)=>levenshtein(c.toLowerCase(), reqCol.toLowerCase()) <= 2);
                let typoHint = '';
                if (typoCandidates.length > 0) {
                    typoHint = ` Did you mean '${reqCol}' instead of '${typoCandidates[0]}'?`;
                }
                return {
                    passed: false,
                    feedback: `Missing column '${reqCol}'.${typoHint} Your query currently outputs: [${result.columns.join(', ')}].`
                };
            }
        }
    }
    // 3. Check Forbidden Columns (e.g. user ran SELECT * when specific columns were requested)
    if (rule.forbiddenColumns && rule.forbiddenColumns.length > 0) {
        const resultCols = result.columns.map((c)=>c.toLowerCase());
        for (const forb of rule.forbiddenColumns){
            if (resultCols.includes(forb.toLowerCase())) {
                return {
                    passed: false,
                    feedback: `You're querying the correct table, but returning extra columns (found '${forb}'). Explicitly specify only the requested columns in your SELECT clause.`
                };
            }
        }
    }
    // 4. Check Required Aliases (e.g., AS customer_name)
    if (rule.requiredAliases) {
        for (const [orig, alias] of Object.entries(rule.requiredAliases)){
            const aliasFound = result.columns.some((c)=>c.toLowerCase() === alias.toLowerCase());
            if (!aliasFound) {
                return {
                    passed: false,
                    feedback: `Make sure to alias '${orig}' to '${alias}' using the AS keyword (e.g., SELECT ${orig} AS ${alias}).`
                };
            }
        }
    }
    // 5. Check JOIN requirements
    if (rule.requireJoin && !parsed.joins?.length && !cleanSql.toUpperCase().includes('JOIN')) {
        return {
            passed: false,
            feedback: `This task requires joining multiple tables using the JOIN keyword (e.g. FROM table_a JOIN table_b ON table_a.id = table_b.a_id).`
        };
    }
    // 6. Check GROUP BY requirements
    if (rule.requireGroupBy && !parsed.groupBy?.length && !cleanSql.toUpperCase().includes('GROUP BY')) {
        return {
            passed: false,
            feedback: `This task requires aggregating rows by categories or entities using the GROUP BY clause.`
        };
    }
    // 7. Check HAVING requirements
    if (rule.requireHaving && !parsed.havingClause && !cleanSql.toUpperCase().includes('HAVING')) {
        return {
            passed: false,
            feedback: `This task requires filtering aggregated groups using the HAVING clause after GROUP BY.`
        };
    }
    // 8. Check LIMIT
    if (rule.requireLimit !== undefined) {
        if (typeof rule.requireLimit === 'number') {
            if (parsed.limit !== rule.requireLimit) {
                return {
                    passed: false,
                    feedback: `Almost there! This task specifically requires a LIMIT of ${rule.requireLimit}. Currently LIMIT is ${parsed.limit ?? 'not set'}.`
                };
            }
        } else {
            if (rule.requireLimit.exact && parsed.limit !== rule.requireLimit.exact) {
                return {
                    passed: false,
                    feedback: `This task requires LIMIT ${rule.requireLimit.exact}. Currently LIMIT is ${parsed.limit || 'not specified'}.`
                };
            }
        }
    }
    // 9. Check OFFSET
    if (rule.requireOffset !== undefined) {
        if (parsed.offset !== rule.requireOffset) {
            return {
                passed: false,
                feedback: `This task requires an OFFSET of ${rule.requireOffset} (e.g. LIMIT ... OFFSET ${rule.requireOffset}).`
            };
        }
    }
    // 10. Check ORDER BY
    if (rule.requireOrderBy && rule.requireOrderBy.length > 0) {
        if (!parsed.orderBy || parsed.orderBy.length === 0) {
            return {
                passed: false,
                feedback: `Remember to sort the results using the ORDER BY clause.`
            };
        }
        for (const reqOrd of rule.requireOrderBy){
            const match = parsed.orderBy.find((o)=>o.column.toLowerCase() === reqOrd.column.toLowerCase());
            if (!match) {
                return {
                    passed: false,
                    feedback: `Make sure to sort by '${reqOrd.column}'.`
                };
            }
            if (reqOrd.direction && match.direction !== reqOrd.direction) {
                return {
                    passed: false,
                    feedback: `Sort direction for '${reqOrd.column}' should be ${reqOrd.direction} (e.g. ORDER BY ${reqOrd.column} ${reqOrd.direction}).`
                };
            }
        }
    }
    // 11. Check DISTINCT
    if (rule.requireDistinct) {
        if (!parsed.isDistinct && !userSql.toUpperCase().includes('DISTINCT')) {
            return {
                passed: false,
                feedback: `This task requires returning distinct (unique) rows. Use the DISTINCT keyword after SELECT.`
            };
        }
    }
    // 12. Check WHERE
    if (rule.requireWhere) {
        if (!parsed.whereClause && !parsed.havingClause) {
            return {
                passed: false,
                feedback: `This task requires filtering with a WHERE clause.`
            };
        }
        if (rule.whereContainsTerms) {
            const upperSql = userSql.toUpperCase();
            for (const term of rule.whereContainsTerms){
                if (!upperSql.includes(term.toUpperCase())) {
                    return {
                        passed: false,
                        feedback: `Your filter should use '${term}' to check the condition.`
                    };
                }
            }
        }
    }
    // 13. Check Expected Row Count
    if (rule.expectedRowCount !== undefined) {
        // For DML (INSERT/UPDATE/DELETE) the executor returns a single status row,
        // so rowCount is always 1. The meaningful count is `affectedRows`.
        const countedRows = result.affectedRows !== undefined && result.affectedRows !== null ? result.affectedRows : result.rowCount;
        if (typeof rule.expectedRowCount === 'number') {
            if (countedRows !== rule.expectedRowCount) {
                return {
                    passed: false,
                    feedback: `Your query returned ${countedRows} row(s), but ${rule.expectedRowCount} row(s) were expected. Check your WHERE condition, JOINs, or LIMIT.`
                };
            }
        } else {
            if (rule.expectedRowCount.min !== undefined && countedRows < rule.expectedRowCount.min) {
                return {
                    passed: false,
                    feedback: `Your query returned too few rows (${countedRows}). Check your filtering logic.`
                };
            }
            if (rule.expectedRowCount.max !== undefined && countedRows > rule.expectedRowCount.max) {
                return {
                    passed: false,
                    feedback: `Your query returned too many rows (${countedRows}). Check your filtering conditions or LIMIT.`
                };
            }
        }
    }
    // 14. Custom Validator
    if (rule.customValidator) {
        const custom = rule.customValidator(parsed, result);
        if (!custom.valid) {
            return {
                passed: false,
                feedback: custom.message || 'The query result does not match all required criteria.'
            };
        }
    }
    return {
        passed: true,
        feedback: 'Success! Your query produced the expected results and meets all criteria.'
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/use-close-on-outside.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCloseOnOutside",
    ()=>useCloseOnOutside
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useCloseOnOutside(ref, isOpen, onClose) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCloseOnOutside.useEffect": ()=>{
            if (!isOpen) return;
            const handlePointerDown = {
                "useCloseOnOutside.useEffect.handlePointerDown": (e)=>{
                    const target = e.target;
                    if (ref.current && target && !ref.current.contains(target)) {
                        onClose();
                    }
                }
            }["useCloseOnOutside.useEffect.handlePointerDown"];
            // mousedown/touchstart fire before click and before any focus changes,
            // making this the most reliable "click outside" signal.
            document.addEventListener('mousedown', handlePointerDown);
            document.addEventListener('touchstart', handlePointerDown, {
                passive: true
            });
            return ({
                "useCloseOnOutside.useEffect": ()=>{
                    document.removeEventListener('mousedown', handlePointerDown);
                    document.removeEventListener('touchstart', handlePointerDown);
                }
            })["useCloseOnOutside.useEffect"];
        }
    }["useCloseOnOutside.useEffect"], [
        isOpen,
        onClose,
        ref
    ]);
}
_s(useCloseOnOutside, "OD7bBpZva5O2jO+Puf00hKivP7c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1osheys._.js.map