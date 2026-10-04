/**
 * Prisma Monaco DTS Emitter — Phase 1.
 * ─────────────────────────────────────────────────────────────────────────────
 * Translates a parsed `PrismaSchema` AST (`prisma-schema-parser.ts`) into
 * valid TypeScript `.d.ts` declaration source.
 *
 * Emits:
 *   1. Model interfaces (`export interface User { ... }`)
 *   2. Enums as union string types (`export type Role = 'ADMIN' | 'USER';`)
 *   3. Model delegates on `PrismaClient` (with `findMany`, `findUnique`,
 *      `create`, `update`, `delete`, `upsert`, `count`, etc.)
 *   4. Client utility methods (`$transaction`, `$queryRaw`, `$executeRaw`, `$extends`)
 *   5. Known Prisma error classes (`PrismaClientKnownRequestError`, etc.)
 *   6. Global declarations so `prisma` is resolved whether code is a module or script.
 */

import { PrismaSchema } from './prisma-schema-parser';

function mapScalarToTs(type: string): string {
  switch (type) {
    case 'Int':
    case 'Float':
    case 'Decimal':
    case 'BigInt':
      return 'number';
    case 'String':
      return 'string';
    case 'Boolean':
      return 'boolean';
    case 'DateTime':
      return 'Date';
    case 'Json':
      return 'any';
    case 'Bytes':
      return 'Uint8Array';
    default:
      // References another model or enum
      return type;
  }
}

export function emitMonacoDtsFromAst(schema: PrismaSchema): string {
  const parts: string[] = [];

  // 1. Error namespace and known classes
  parts.push(`export namespace Prisma {
  export class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
  }
  export class PrismaClientValidationError extends Error {}
  export class PrismaClientInitializationError extends Error {}
}
`);

  // 2. Enums as union types
  for (const en of schema.enums) {
    const values = en.values.map((v) => `'${v}'`).join(' | ');
    parts.push(`export type ${en.name} = ${values || 'string'};\n`);
  }

  // 3. Model interfaces
  for (const model of schema.models) {
    let modelDef = `export interface ${model.name} {\n`;
    for (const field of model.fields) {
      const baseType = field.isScalar ? mapScalarToTs(field.baseType) : field.baseType;
      const opt = field.isOptional ? '?' : '';
      const list = field.isList ? '[]' : '';
      modelDef += `  ${field.name}${opt}: ${baseType}${list};\n`;
    }
    modelDef += `}\n`;
    parts.push(modelDef);
  }

  // 4. PrismaClient interface with delegates for all models in this schema
  let clientDef = `export interface PrismaClient {\n`;
  for (const model of schema.models) {
    const delegate = model.name.charAt(0).toLowerCase() + model.name.slice(1);
    clientDef += `  ${delegate}: {
    findMany(args?: { where?: any; select?: any; include?: any; orderBy?: any; skip?: number; take?: number; cursor?: any; distinct?: any }): Promise<${model.name}[]>;
    findUnique(args: { where: any; select?: any; include?: any }): Promise<${model.name} | null>;
    findFirst(args?: { where?: any; select?: any; include?: any; orderBy?: any; skip?: number; distinct?: any }): Promise<${model.name} | null>;
    create(args: { data: any; select?: any; include?: any }): Promise<${model.name}>;
    createMany(args: { data: any[]; skipDuplicates?: boolean }): Promise<{ count: number }>;
    update(args: { where: any; data: any; select?: any; include?: any }): Promise<${model.name}>;
    updateMany(args: { where?: any; data: any }): Promise<{ count: number }>;
    upsert(args: { where: any; create: any; update: any; select?: any; include?: any }): Promise<${model.name}>;
    delete(args: { where: any; select?: any; include?: any }): Promise<${model.name}>;
    deleteMany(args?: { where?: any }): Promise<{ count: number }>;
    count(args?: { where?: any; select?: any }): Promise<number>;
    aggregate(args: any): Promise<any>;
    groupBy(args: any): Promise<any>;
  };\n`;
  }

  clientDef += `  $transaction<T>(input: any): Promise<T>;
  $queryRaw<T = any>(query: TemplateStringsArray | string, ...values: any[]): Promise<T>;
  $executeRaw(query: TemplateStringsArray | string, ...values: any[]): Promise<number>;
  $extends(extension: any): PrismaClient;
}\n`;

  parts.push(clientDef);
  parts.push(`export declare const prisma: PrismaClient;\n`);
  parts.push(`export declare const Prisma: typeof Prisma;\n`);
  parts.push(`declare global {\n  const prisma: PrismaClient;\n  const Prisma: typeof Prisma;\n}\n`);

  return parts.join('\n');
}
