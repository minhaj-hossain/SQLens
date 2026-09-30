/**
 * Prisma ERD model — Phase 9.
 * ─────────────────────────────────────────────────────────────────────────────
 * The data half of the live ERD: parse a `schema.prisma` into boxes (models with
 * their columns), relations (with the FK that makes each one real) and the
 * deterministic layout the SVG renderer draws.
 *
 * Everything here is DERIVED from the same AST the translator uses
 * (`prisma-schema-parser.ts`), so the diagram can never disagree with the SQL:
 * a relation the graph marks executable is exactly a relation
 * `prisma-sql-generator.ts` turns into a second query, and a relation it cannot
 * resolve is listed as a note instead of being drawn as if it were wired.
 *
 * Pure + dependency-free apart from the parser: safe in tests, audits and the
 * standalone playground.
 */


import {
  parsePrismaSchema,
  relationIsExecutable,
  resolveRelation,
  tableNameForModel,
  type PrismaSchema,
  type PrismaSchemaField,
  type PrismaSchemaModel,
} from './prisma-schema-parser';



/** Column badges the ERD shows (`PK`, `FK`, `UQ`, `?`, `[]`). */
export type ErdFieldFlag = 'pk' | 'fk' | 'unique' | 'optional' | 'list';

export interface ErdField {
  /** Column name (`authorId`). */
  name: string;
  /** Type exactly as written in the schema (`Post[]`, `String?`). */
  type: string;
  /** Engine-side type the seed uses (`INTEGER`, `TEXT`, …). */
  sqlType: string;
  flags: ErdFieldFlag[];
}

export interface ErdModelBox {
  /** Model name (`User`). */
  name: string;
  /** Physical table the generated SQL touches (`users`). */
  table: string;
  fields: ErdField[];
  /** Relation field names declared on this model (`posts`). */
  relations: string[];
}

export type ErdRelationKind = 'one-to-many' | 'one-to-one' | 'many-to-many';

export interface ErdRelation {
  /** Stable id (`User.posts->Post`). */
  id: string;
  /** Model that DECLARES the relation field (the loading side). */
  from: string;
  /** The relation field name (`posts`). */
  fromField: string;
  /** Model on the other side (`Post`). */
  to: string;
  /** The back-reference field name on the other side (`author`), when named. */
  toField?: string;
  /** FK column and the key it references (`authorId` → `id`). */
  foreignKey?: string;
  referencedKey?: string;
  kind: ErdRelationKind;
  /**
   * `true` when the generator can run this as a real second query.
   *
   * Only the CHILD-list direction is executable (`User.posts` loads posts by
   * the parent's key). The FK-owning direction (`Post.author`) still reports
   * its FK columns — but as a note, not an executable edge: it loads ONE
   * parent row through the owner's own FK value, which the list-loader the
   * generator implements does not do.
   */
  executable: boolean;
  /** Honest reason when it cannot (rendered instead of a solid edge). */
  note?: string;
}

export interface ErdDiagram {
  models: ErdModelBox[];
  relations: ErdRelation[];
  /** Honest notes about the schema itself (targets it never declares). */
  notes: string[];
}

/** Prisma scalar → the type the in-browser engine stores it as. */
const SQL_TYPES: Record<string, string> = {
  Int: 'INTEGER',
  BigInt: 'INTEGER',
  String: 'TEXT',
  Boolean: 'BOOLEAN',
  Float: 'REAL',
  Decimal: 'REAL',
  DateTime: 'DATETIME',
  Json: 'JSON',
  Bytes: 'BLOB',
};

/** Engine-side type for a Prisma type token (`Int?` → `INTEGER`). */
export function sqlTypeFor(prismaType: string): string {
  const base = prismaType.replace(/[?[\]]/g, '').trim();
  return SQL_TYPES[base] ?? base.toUpperCase();
}

/**
 * Badges for one field. `fk` is marked on the column a `@relation(fields: […])`
 * owns — Prisma writes the attribute on the RELATION field (`author`) while the
 * column (`authorId`) is a plain scalar, so the model's relation fields are
 * consulted, not the field itself.
 */
function flagsFor(field: PrismaSchemaField, fkColumns: Set<string>): ErdFieldFlag[] {
  const flags: ErdFieldFlag[] = [];
  if (field.isScalar && field.attributes.some((a) => a.startsWith('@id'))) flags.push('pk');
  if (field.isScalar && field.attributes.some((a) => a.startsWith('@unique'))) flags.push('unique');
  if (field.isScalar && fkColumns.has(field.name)) flags.push('fk');
  if (field.isList) flags.push('list');
  if (field.isOptional) flags.push('optional');
  return flags;
}

/**
 * Build the ERD from a parsed schema. The relation list is derived per relation
 * FIELD (so `User.posts` and `Post.author` appear as the two sides of one
 * relation) and each entry states whether its SQL is executable today.
 */
export function buildErdDiagram(schema: PrismaSchema): ErdDiagram {
  const models: ErdModelBox[] = schema.models.map((model) => {
    const fkColumns = new Set(model.fields.flatMap((f) => f.relationFields));
    return {
      name: model.name,
      table: tableNameForModel(model.name),
      fields: model.fields.map((field) => ({
        name: field.name,
        type: field.type,
        sqlType: field.isScalar ? sqlTypeFor(field.type) : field.baseType,
        flags: flagsFor(field, fkColumns),
      })),
      relations: [...model.relations],
    };
  });

  const relations: ErdRelation[] = [];
  const notes: string[] = [];
  for (const model of schema.models as PrismaSchemaModel[]) {
    for (const field of model.fields) {
      if (field.isScalar) continue;
      const target = resolveRelation(schema, model, field);
      if (!target.targetModel) {
        notes.push(
          `${model.name}.${field.name} → ${field.baseType}: this schema declares no ${field.baseType} model, so the relation cannot be loaded.`,
        );
        continue;
      }
      const backRef = target.targetModel.fields.find(
        (f) => !f.isScalar && f.baseType.toLowerCase() === model.name.toLowerCase(),
      );
      const kind: ErdRelationKind = field.isList
        ? backRef?.isList
          ? 'many-to-many'
          : 'one-to-many'
        : 'one-to-one';
      const executable = relationIsExecutable(target);
      const entry: ErdRelation = {
        id: `${model.name}.${field.name}->${target.targetModel.name}`,
        from: model.name,
        fromField: field.name,
        to: target.targetModel.name,
        toField: backRef?.name,
        kind,
        executable,
      };
      if (executable) {
        entry.foreignKey = target.foreignKey;
        entry.referencedKey = target.referencedKey;
      } else if (target.foreignKey) {
        entry.foreignKey = target.foreignKey;
        entry.referencedKey = target.referencedKey;
        entry.note = `${model.name}.${field.name} owns the FK (${target.foreignKey}) — it loads one parent row, not a child list.`;
      } else {
        entry.note = `The FK column for ${model.name}.${field.name} is implicit in this schema — Prisma generates it, so the translator cannot build the follow-up query.`;
      }
      relations.push(entry);
    }
  }

  for (const model of schema.models) {
    if (model.columns.length === 0) {
      notes.push(`${model.name} declares no scalar column — the diagram shows it, but nothing can be selected from it.`);
    }
    if (!model.fields.some((f) => f.isScalar && f.attributes.some((a) => a.startsWith('@id')))) {
      notes.push(`${model.name} declares no @id field: reads fall back to an assumed \`id\` column.`);
    }
  }

  return { models, relations, notes };
}

/** Convenience for surfaces that only hold the schema TEXT (lens, playground). */
export function buildErdDiagramFromSource(source: string): ErdDiagram {
  return buildErdDiagram(parsePrismaSchema(source));
}

export interface ErdBoxLayout {
  model: ErdModelBox;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ErdEdgeLayout {
  relation: ErdRelation;
  /** SVG path (`M … C …`) between the two boxes. */
  path: string;
  /** Midpoint of the curve — where the label goes. */
  labelX: number;
  labelY: number;
}

export interface ErdLayout {
  boxes: ErdBoxLayout[];
  edges: ErdEdgeLayout[];
  width: number;
  height: number;
}

export interface ErdLayoutOptions {
  /** Boxes per row (default 2). */
  columns?: number;
  boxWidth?: number;
  /** Height of the model-name header row. */
  headerHeight?: number;
  /** Height of one field row. */
  rowHeight?: number;
  gapX?: number;
  gapY?: number;
  padding?: number;
}

/**
 * Deterministic grid layout: model N lands at `row = ⌊N / columns⌋`. Edges are
 * cubic curves — vertically between stacked boxes, horizontally between
 * neighbours — so the geometry is stable across renders and identical in tests.
 */
export function layoutErdDiagram(diagram: ErdDiagram, options: ErdLayoutOptions = {}): ErdLayout {
  const columns = Math.max(1, options.columns ?? 2);
  const boxWidth = options.boxWidth ?? 250;
  const headerHeight = options.headerHeight ?? 32;
  const rowHeight = options.rowHeight ?? 17;
  const gapX = options.gapX ?? 110;
  const gapY = options.gapY ?? 54;
  const padding = options.padding ?? 12;

  const boxes: ErdBoxLayout[] = [];
  let maxBottom = 0;
  diagram.models.forEach((model, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const height = headerHeight + model.fields.length * rowHeight + 12;
    const y = padding + row * (height + gapY);
    boxes.push({ model, x: padding + col * (boxWidth + gapX), y, width: boxWidth, height });
    maxBottom = Math.max(maxBottom, y + height);
  });

  const byName = new Map(boxes.map((box) => [box.model.name, box]));
  const edges: ErdEdgeLayout[] = [];
  for (const relation of diagram.relations) {
    const from = byName.get(relation.from);
    const to = byName.get(relation.to);
    if (!from || !to) continue;
    let path: string;
    let labelX: number;
    let labelY: number;
    if (Math.abs(from.y - to.y) < 4) {
      // Same row: right edge → left edge of the neighbouring box.
      const [left, right] = from.x <= to.x ? [from, to] : [to, from];
      const x1 = left.x + left.width;
      const x2 = right.x;
      const y1 = left.y + left.height / 2;
      const y2 = right.y + right.height / 2;
      const midX = (x1 + x2) / 2;
      path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
      labelX = midX;
      labelY = (y1 + y2) / 2 - 6;
    } else {
      // Different rows: bottom of the upper box → top of the lower box.
      const [upper, lower] = from.y < to.y ? [from, to] : [to, from];
      const x1 = upper.x + upper.width / 2;
      const y1 = upper.y + upper.height;
      const x2 = lower.x + lower.width / 2;
      const y2 = lower.y;
      const midY = (y1 + y2) / 2;
      path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      labelX = (x1 + x2) / 2;
      labelY = midY - 6;
    }
    edges.push({ relation, path, labelX, labelY });
  }

  const inRow = Math.min(diagram.models.length, columns) || 0;
  const width = padding * 2 + inRow * boxWidth + Math.max(0, inRow - 1) * gapX;
  return { boxes, edges, width, height: maxBottom + padding };
}
