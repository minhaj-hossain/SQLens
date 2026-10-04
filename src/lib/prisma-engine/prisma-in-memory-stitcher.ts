/**
 * Prisma in-memory result stitcher — Phase 3.
 * ─────────────────────────────────────────────────────────────────────────────
 * Reconstructs the hydrated JavaScript object graph returned by Prisma Client
 * calls from the individual executed SQLite statements (parent rows + relation
 * rows) using schema AST FK relationships.
 *
 * Prisma Client executes two or more queries for queries with `include` or
 * nested writes, then stitches them into a single nested object graph in memory.
 * This stitcher replicates that behavior in-engine so the UI and tests can
 * inspect the real returned JavaScript/JSON object.
 */

import type { PrismaExecutionStep } from './prisma-proxy-executor';
import {
  resolveRelation,
  type PrismaSchema,
} from './prisma-schema-parser';

export interface StitchOptions {
  steps: PrismaExecutionStep[];
  schema?: PrismaSchema;
  method?: string;
  rowEffect?: 'sum' | 'last';
}

function rowsToObjects(
  columns: string[] = [],
  rows: any[] = [],
): Record<string, unknown>[] {
  return rows.map((row) => {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      return { ...row };
    }
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < columns.length; i++) {
      obj[columns[i]] = row[i];
    }
    return obj;
  });
}

function attachHeuristic(
  parents: Record<string, unknown>[],
  children: Record<string, unknown>[],
  relName: string,
  isList: boolean,
): void {
  for (const parent of parents) {
    const pId = parent.id;
    if (pId !== undefined) {
      const matched = children.filter((c) =>
        Object.entries(c).some(
          ([k, v]) => k.toLowerCase().endsWith('id') && v === pId,
        ),
      );
      parent[relName] = isList ? matched : (matched[0] ?? null);
    } else {
      parent[relName] = isList ? children : (children[0] ?? null);
    }
  }
}

/**
 * Reconstructs the in-memory JavaScript/JSON object returned by a Prisma Client execution.
 */
export function stitchPrismaExecution(options: StitchOptions): unknown {
  const { steps, schema, method, rowEffect } = options;

  if (!steps || steps.length === 0) return undefined;

  // Batch $transaction array form: resolves to an array of operation results.
  if (method === '$transaction' && rowEffect === 'sum') {
    return steps.map((step) => {
      if (step.result.rows && step.result.rows.length > 0) {
        const objs = rowsToObjects(step.result.columns, step.result.rows);
        return objs.length === 1 ? objs[0] : objs;
      }
      if (typeof step.result.affectedRows === 'number') {
        return { count: step.result.affectedRows };
      }
      return null;
    });
  }

  // Count query: returns a scalar integer.
  if (method === 'count') {
    const main = steps.find((s) => (s.role ?? 'main') !== 'relation') ?? steps[0];
    if (main?.result.rows && main.result.rows.length > 0) {
      const val = main.result.rows[0][0];
      return typeof val === 'number' ? val : Number(val) || 0;
    }
    return 0;
  }

  // Bulk mutations: return { count: n }.
  if (
    method === 'createMany' ||
    method === 'updateMany' ||
    method === 'deleteMany'
  ) {
    const main = steps.find((s) => (s.role ?? 'main') !== 'relation') ?? steps[0];
    return { count: main?.result.affectedRows ?? 0 };
  }

  // ExecuteRaw write count.
  if (method === '$executeRaw') {
    const main = steps.find((s) => (s.role ?? 'main') !== 'relation') ?? steps[0];
    return main?.result.affectedRows ?? 0;
  }

  // Main read or mutation step.
  const mainStep =
    [...steps].reverse().find((s) => (s.role ?? 'main') !== 'relation') ??
    steps[0];

  if (!mainStep || !mainStep.result.success) return undefined;

  const parentObjects = rowsToObjects(
    mainStep.result.columns,
    mainStep.result.rows,
  );

  // Relation steps (include / nested writes).
  const relationSteps = steps.filter((s) => s.role === 'relation');

  for (const relStep of relationSteps) {
    if (!relStep.result.success) continue;

    const relMatch = /^(?:include|nested\s+(?:create|connect|connectOrCreate|update))\s+([A-Za-z0-9_]+)/i.exec(
      relStep.label,
    );
    const relName = relMatch
      ? relMatch[1]
      : relStep.label.replace(/^include\s+/, '').trim();

    const childObjects = rowsToObjects(
      relStep.result.columns,
      relStep.result.rows,
    );

    // Locate the owner model and relation field from schema AST.
    let ownerModel = schema?.models.find(
      (m) =>
        m.fields.some((f) => f.name === relName) &&
        m.columns.some((c) => mainStep.result.columns.includes(c)),
    ) ?? schema?.models.find((m) => m.fields.some((f) => f.name === relName));

    const relField = ownerModel?.fields.find((f) => f.name === relName);

    if (schema && ownerModel && relField) {
      const target = resolveRelation(schema, ownerModel, relField);

      if (target.targetOwnsKey && target.foreignKey && target.referencedKey) {
        // Target owns FK (e.g., Post.authorId references User.id).
        const fk = target.foreignKey;
        const refKey = target.referencedKey;
        for (const parent of parentObjects) {
          const pVal = parent[refKey];
          const matched = childObjects.filter((c) => c[fk] === pVal);
          parent[relName] = relField.isList ? matched : (matched[0] ?? null);
        }
      } else {
        // Owner owns FK (e.g., Post.authorId points to User.id).
        const ownerFk = ownerModel.fields.find(
          (f) =>
            f.relationFields.length > 0 &&
            f.baseType.toLowerCase() === target.targetModel?.name.toLowerCase(),
        );
        if (ownerFk && ownerFk.relationFields[0]) {
          const fkCol = ownerFk.relationFields[0];
          const refCol = ownerFk.relationReferences[0] ?? 'id';
          for (const parent of parentObjects) {
            const fkVal = parent[fkCol];
            const matched = childObjects.find((c) => c[refCol] === fkVal) ?? null;
            parent[relName] = matched;
          }
        } else {
          attachHeuristic(parentObjects, childObjects, relName, relField.isList);
        }
      }
    } else {
      attachHeuristic(parentObjects, childObjects, relName, true);
    }
  }

  // Shape the final output based on method semantics.
  if (
    method === 'findUnique' ||
    method === 'findUniqueOrThrow' ||
    method === 'findFirst' ||
    method === 'findFirstOrThrow'
  ) {
    return parentObjects.length > 0 ? parentObjects[0] : null;
  }

  if (method === 'findMany' || method === '$queryRaw') {
    return parentObjects;
  }

  if (method === 'create' || method === 'update' || method === 'delete' || method === 'upsert') {
    if (parentObjects.length > 0) return parentObjects[0];
    if (typeof mainStep.result.affectedRows === 'number') {
      return { count: mainStep.result.affectedRows };
    }
    return null;
  }

  // Default shape: single object if unique/first, otherwise list.
  if (
    parentObjects.length === 1 &&
    method &&
    (method.includes('Unique') || method.includes('First'))
  ) {
    return parentObjects[0];
  }

  return parentObjects;
}
