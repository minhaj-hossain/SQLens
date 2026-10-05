/**
 * Phase 9 — Prisma editor surfaces: ERD, type inference, schema tab.
 * Covers the spec's "still open" items that Phases 9/11 closed.
 */
import { describe, expect, it } from 'vitest';
import {
  buildErdDiagramFromSource,
  layoutErdDiagram,
} from '../../src/lib/prisma-engine/prisma-erd';
import {
  inferResultType,
  tsTypeOf,
} from '../../src/lib/prisma-engine/prisma-type-inference';
import { PRISMA_SEED_SCHEMA } from '../../src/lib/prisma-engine/prisma-submit-pipeline';

describe('Phase 9 — ERD model', () => {
  it('builds boxes + an executable relation edge from the seed schema', () => {
    const diagram = buildErdDiagramFromSource(PRISMA_SEED_SCHEMA);
    expect(diagram.models.map((m) => m.name)).toEqual(['User', 'Post']);
    // The list-loader direction: User.posts loads posts by the parent key.
    const edge = diagram.relations.find((r) => r.from === 'User' && r.to === 'Post');
    expect(edge).toBeDefined();
    expect(edge!.foreignKey).toBe('authorId');
    expect(edge!.referencedKey).toBe('id');
    expect(edge!.executable).toBe(true);
    // The FK-owning direction reports its columns honestly, but is NOT a
    // child-list load — drawn dashed, never executed as one.
    const owner = diagram.relations.find((r) => r.from === 'Post' && r.to === 'User');
    expect(owner).toBeDefined();
    expect(owner!.executable).toBe(false);
    expect(owner!.foreignKey).toBe('authorId');
    expect(owner!.note).toBeTruthy();
  });

  it('is honest about relations whose target the schema never declares', () => {
    const diagram = buildErdDiagramFromSource(`model User {\n  id Int @id\n  ghosts Ghost[]\n}`);
    expect(diagram.models.map((m) => m.name)).toEqual(['User']);
    expect(diagram.notes.join('\n')).toMatch(/Ghost/);
  });

  it('lays out deterministically: same input, same boxes and paths', () => {
    const diagram = buildErdDiagramFromSource(PRISMA_SEED_SCHEMA);
    const a = layoutErdDiagram(diagram, { columns: 2 });
    const b = layoutErdDiagram(diagram, { columns: 2 });
    expect(a).toEqual(b);
    expect(a.boxes).toHaveLength(2);
    for (const edge of a.edges) expect(edge.path.startsWith('M ')).toBe(true);
  });
});

describe('Phase 9 — result type inference', () => {
  it('names runtime types the way a TypeScript reader expects', () => {
    expect(tsTypeOf(1)).toBe('number');
    expect(tsTypeOf('a')).toBe('string');
    expect(tsTypeOf(null)).toBe('null');
  });

  it('refuses to invent a shape for empty results or errors', () => {
    const empty = inferResultType({ columns: ['id'], rows: [], rowCount: 0 } as never);
    expect(empty.observed).toBe(false);
    expect(empty.tsType).toBeNull();
  });
});
