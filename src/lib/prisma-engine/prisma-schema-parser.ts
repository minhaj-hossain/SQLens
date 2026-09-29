/**
 * Prisma schema AST parser — Phase 4.
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads a `schema.prisma` source string into model definitions so the
 * generator (`prisma-sql-generator.ts`) can translate client calls without
 * guessing. Relation fields (`Post[]`, `User`, back-references) resolve from
 * the AST, never from hard-coded model knowledge.
 *
 * Pure + dependency-free (no imports at all): safe anywhere, including
 * static-only surfaces. Only the single-table seed (`users`) is *executed*
 * by the runner; everything else in the schema is structural knowledge for
 * ERD rendering, `include` expansion, and nested-write fan-out.
 */

export interface PrismaSchemaField {
  /** Field name as written (`id`, `posts`, `authorId`). */
  name: string;
  /** Raw type token (`Int`, `String`, `Post[]`, `User?`, …). */
  type: string;
  /** Bare model/scalar name with `[]` / `?` stripped (`Post`, `User`, `Int`). */
  baseType: string;
  /** `true` for list fields (`Post[]`). */
  isList: boolean;
  /** `true` for optional fields (`User?`). */
  isOptional: boolean;
  /** `true` for scalar columns (persisted); `false` for relation fields. */
  isScalar: boolean;
  /** Raw attribute list (`@id`, `@unique`, `@relation(...)`, …). */
  attributes: string[];
  /** `@relation(fields: [...])` — the FK columns this field owns. */
  relationFields: string[];
  /** `@relation(references: [...])` — the target columns. */
  relationReferences: string[];
}

export interface PrismaSchemaModel {
  /** Model name as written (`User`, `Post`). */
  name: string;
  fields: PrismaSchemaField[];
  /** Scalar column names in declaration order (the physical table shape). */
  columns: string[];
  /** Relation field names (navigation only — never selected by default). */
  relations: string[];
}

export interface PrismaSchemaEnum {
  name: string;
  values: string[];
}

export interface PrismaSchema {
  models: PrismaSchemaModel[];
  enums: PrismaSchemaEnum[];
  /** Lookup by lower-cased model name. */
  byName: Map<string, PrismaSchemaModel>;
}

/** Prisma scalar types — everything else is a relation to another model/enum. */
const SCALAR_TYPES = new Set([
  'String',
  'Boolean',
  'Int',
  'BigInt',
  'Float',
  'Decimal',
  'DateTime',
  'Json',
  'Bytes',
]);

function stripWrapping(type: string): { base: string; isList: boolean; isOptional: boolean } {
  let t = type.trim();
  let isOptional = false;
  let isList = false;
  if (t.endsWith('?')) {
    isOptional = true;
    t = t.slice(0, -1).trim();
  }
  if (t.endsWith('[]')) {
    isList = true;
    t = t.slice(0, -2).trim();
  }
  return { base: t, isList, isOptional };
}

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  let inString: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      current += ch;
      if (ch === inString && text[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === ')' || ch === ']' || ch === '}') depth--;
    if ((ch === '\n' || ch === ';') && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseListAttr(attr: string, key: string): string[] {
  const m = new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`).exec(attr);
  if (!m) return [];
  return m[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseField(line: string): PrismaSchemaField | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) return null;
  const m = /^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_?[\]]*)\s*(.*)$/.exec(trimmed);
  if (!m) return null;
  const [, name, rawType, rest] = m;
  const { base, isList, isOptional } = stripWrapping(rawType);
  const attributes = splitTopLevel(rest.replace(/\/\/.*$/, '').trim()).filter((s) =>
    s.startsWith('@'),
  );
  const relationFields: string[] = [];
  const relationReferences: string[] = [];
  for (const attr of attributes) {
    if (attr.startsWith('@relation')) {
      relationFields.push(...parseListAttr(attr, 'fields'));
      relationReferences.push(...parseListAttr(attr, 'references'));
    }
  }
  return {
    name,
    type: rawType,
    baseType: base,
    isList,
    isOptional,
    isScalar: SCALAR_TYPES.has(base),
    attributes,
    relationFields,
    relationReferences,
  };
}


/**
 * Parse `schema.prisma` source into models + enums. Never throws: an empty
 * or unparseable source yields an empty schema (callers treat "no model"
 * as "cannot translate" — honest, never guessed).
 */
export function parsePrismaSchema(source: string): PrismaSchema {
  const models: PrismaSchemaModel[] = [];
  const enums: PrismaSchemaEnum[] = [];
  const byName = new Map<string, PrismaSchemaModel>();

  const blockRe = /\b(model|enum)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(source)) !== null) {
    const kind = m[1];
    const name = m[2];
    // Brace-balanced body: strings/comments cannot fake the depth.
    let depth = 0;
    let end = -1;
    let inString: string | null = null;
    for (let i = m.index + m[0].length - 1; i < source.length; i++) {
      const ch = source[i];
      if (inString) {
        if (ch === inString && source[i - 1] !== '\\') inString = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        inString = ch;
        continue;
      }
      if (ch === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i++;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) continue;
    const body = source.slice(m.index + m[0].length, end);
    if (kind === 'enum') {
      // Enum bodies are bare identifiers separated by whitespace, `;`, or
      // `,` — on one line (`enum R { A B }`) or one per line. Strip comments,
      // then split on all separators at once.
      const values = body
        .split('\n')
        .map((line) => line.replace(/\/\/.*$/, ' '))
        .join('\n')
        .split(/[\s;,]+/)
        .map((v) => v.trim())
        .filter((v) => v && /^[A-Za-z_][A-Za-z0-9_]*$/.test(v));
      enums.push({ name, values });
      continue;
    }
    const fields: PrismaSchemaField[] = [];
    for (const line of splitTopLevel(body)) {
      const field = parseField(line);
      if (field) fields.push(field);
    }
    const columns = fields.filter((f) => f.isScalar).map((f) => f.name);
    const relations = fields.filter((f) => !f.isScalar).map((f) => f.name);
    const model: PrismaSchemaModel = { name, fields, columns, relations };
    models.push(model);
    byName.set(name.toLowerCase(), model);
  }

  return { models, enums, byName };
}

/** Lower-cased lookup; `undefined` when the schema never declares the model. */
export function findModel(schema: PrismaSchema, modelName: string): PrismaSchemaModel | undefined {
  return schema.byName.get(modelName.toLowerCase());
}
