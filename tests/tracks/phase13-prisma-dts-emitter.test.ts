import { describe, expect, it } from 'vitest';
import { parsePrismaSchema } from '../../src/lib/prisma-engine/prisma-schema-parser';
import { emitMonacoDtsFromAst } from '../../src/lib/prisma-engine/prisma-dts-emitter';
import { PRISMA_SEED_SCHEMA } from '../../src/lib/prisma-engine/prisma-submit-pipeline';

describe('Phase 13 — Prisma Monaco DTS Emitter', () => {
  it('emits User and Post interfaces and client delegates from the seed schema', () => {
    const schema = parsePrismaSchema(PRISMA_SEED_SCHEMA);
    const dts = emitMonacoDtsFromAst(schema);

    // Model interfaces
    expect(dts).toContain('export interface User {');
    expect(dts).toContain('id: number;');
    expect(dts).toContain('name: string;');
    expect(dts).toContain('email: string;');
    expect(dts).toContain('posts: Post[];');

    expect(dts).toContain('export interface Post {');
    expect(dts).toContain('title: string;');
    expect(dts).toContain('authorId: number;');
    expect(dts).toContain('author: User;');

    // Delegates
    expect(dts).toContain('user: {');
    expect(dts).toContain('findMany(args?:');
    expect(dts).toContain('findUnique(args:');
    expect(dts).toContain('post: {');

    // Utility methods and globals
    expect(dts).toContain('$transaction<T>(input: any): Promise<T>;');
    expect(dts).toContain('export declare const prisma: PrismaClient;');
    expect(dts).toContain('declare global {');
  });

  it('emits custom models, optionals, and enums from a multi-model schema', () => {
    const customSchemaSource = `
enum Role {
  ADMIN
  USER
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String
  products Product[]
}

model Product {
  id         Int       @id @default(autoincrement())
  title      String
  price      Float
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId Int?
  createdAt  DateTime  @default(now())
}
`;
    const schema = parsePrismaSchema(customSchemaSource);
    const dts = emitMonacoDtsFromAst(schema);

    // Enums
    expect(dts).toContain("export type Role = 'ADMIN' | 'USER';");

    // Custom models
    expect(dts).toContain('export interface Category {');
    expect(dts).toContain('products: Product[];');

    expect(dts).toContain('export interface Product {');
    expect(dts).toContain('price: number;');
    expect(dts).toContain('category?: Category;');
    expect(dts).toContain('categoryId?: number;');
    expect(dts).toContain('createdAt: Date;');

    // Custom delegates
    expect(dts).toContain('category: {');
    expect(dts).toContain('product: {');
    expect(dts).not.toContain('user: {'); // User is not in this custom schema
  });
});
