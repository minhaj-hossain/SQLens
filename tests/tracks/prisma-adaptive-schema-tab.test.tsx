/**
 * Phase 18 (Phase 6 of overhaul) — Adaptive Schema Tab Activation & Relation Pill.
 * Covers:
 *  1. activeTab and schemaSource propagation in prismaReadTask and prismaSnippetTask.
 *  2. defaultEditorTab resolution for relation-modeling tasks.
 *  3. SQLEditor persistent relation pill rendering for multi-model schemas.
 *  4. Default 'schema' tab rendering schema surface directly.
 *  5. Single-model schemas omitting the relation indicator pill.
 *  6. Controlled view in PrismaSchemaTab rendering the ERD diagram.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { prismaReadTask, prismaSnippetTask } from '../../src/content/prisma/phase6-tasks';
import { defaultEditorTab, editorSchemaTab } from '../../src/lib/track-submit';
import { Prisma_04_MODULE } from '../../src/content/prisma/modules/prisma-04-relations';
import { Prisma_03_MODULE } from '../../src/content/prisma/modules/prisma-03-models-constraints';
import { SQLEditor } from '../../src/components/learning/SQLEditor';
import { PrismaSchemaTab } from '../../src/components/learning/prisma/PrismaSchemaTab';

// Mock MonacoCodeEditor for lightweight SSR rendering
vi.mock('../../src/components/learning/MonacoCodeEditor', () => ({
  MonacoCodeEditor: (props: any) => (
    <div data-testid="mock-monaco-editor" data-language={props.language}>
      {props.value}
    </div>
  ),
}));

describe('Phase 6: Adaptive Schema Tab Activation', () => {
  it('forwards activeTab and schemaSource through task factories', () => {
    const customSchema = `model Product {\n  id Int @id\n  category Category @relation(fields: [categoryId], references: [id])\n  categoryId Int\n}\n\nmodel Category {\n  id Int @id\n  products Product[]\n}`;

    const task = prismaSnippetTask({
      id: 'test-relation-snippet',
      title: 'Snippet Test',
      description: 'Test relation',
      instructions: ['write code'],
      hint: 'hint',
      scaffold: 'SELECT 1;',
      solutionSql: 'SELECT 1;',
      why: 'reason',
      rows: 1,
      code0: 'model A {}',
      code1: 'model A {}',
      need: ['model A'],
      activeTab: 'schema',
      schemaSource: customSchema,
    });

    expect(task.prisma?.activeTab).toBe('schema');
    expect(task.prisma?.schemaSource).toBe(customSchema);
    expect(defaultEditorTab(task)).toBe('schema');

    const schemaTab = editorSchemaTab(task);
    expect(schemaTab).toBeDefined();
    expect(schemaTab?.source).toBe(customSchema);
  });

  it('configures activeTab: schema on Day 4 relation modeling tasks', () => {
    const tasks = Prisma_04_MODULE.concepts.flatMap((c) => c.tasks);
    const c1t1 = tasks.find((t) => t.id === 'prisma04-c1-t1');
    const c2t2 = tasks.find((t) => t.id === 'prisma04-c2-t2');
    const c3t1 = tasks.find((t) => t.id === 'prisma04-c3-t1');
    const c3t2 = tasks.find((t) => t.id === 'prisma04-c3-t2');

    expect(c1t1).toBeDefined();
    expect(defaultEditorTab(c1t1!)).toBe('schema');

    expect(c2t2).toBeDefined();
    expect(defaultEditorTab(c2t2!)).toBe('schema');
    expect(c2t2?.prisma?.schemaSource).toContain('Profile');

    expect(c3t1).toBeDefined();
    expect(defaultEditorTab(c3t1!)).toBe('schema');
    expect(c3t1?.prisma?.schemaSource).toContain('Category');

    expect(c3t2).toBeDefined();
    expect(defaultEditorTab(c3t2!)).toBe('schema');
    expect(c3t2?.prisma?.schemaSource).toContain('PostCategory');
  });

  it('configures schemaSource on Day 3 enum and constraint tasks', () => {
    const tasks = Prisma_03_MODULE.concepts.flatMap((c) => c.tasks);
    const c2t1 = tasks.find((t) => t.id === 'prisma03-c2-t1');
    const c2t2 = tasks.find((t) => t.id === 'prisma03-c2-t2');

    expect(c2t1).toBeDefined();
    expect(c2t1?.prisma?.schemaSource).toContain('enum Role');

    expect(c2t2).toBeDefined();
    expect(c2t2?.prisma?.schemaSource).toContain('@@unique([name, email])');
  });

  it('renders the persistent relation indicator pill on multi-model schemas', () => {
    const schemaSource = `
      model User {
        id Int @id
        posts Post[]
      }
      model Post {
        id Int @id
        author User @relation(fields: [authorId], references: [id])
        authorId Int
      }
    `;

    const html = renderToStaticMarkup(
      <SQLEditor
        value="const x = 1;"
        onChange={vi.fn()}
        onRunAndCheck={vi.fn()}
        fileLabel="query.ts"
        showQuickChips={false}
        schemaTab={{
          label: 'schema.prisma',
          source: schemaSource,
          caption: 'Test schema',
        }}
        defaultTab="editor"
      />,
    );

    expect(html).toContain('id="erd-relation-pill"');
    expect(html).toContain('Schema: 2 models, 1 relation defined ↗');
  });

  it('renders schema surface directly when defaultTab is schema', () => {
    const schemaSource = `
      model User {
        id Int @id
        posts Post[]
      }
      model Post {
        id Int @id
        author User @relation(fields: [authorId], references: [id])
        authorId Int
      }
    `;

    const html = renderToStaticMarkup(
      <SQLEditor
        value="const x = 1;"
        onChange={vi.fn()}
        onRunAndCheck={vi.fn()}
        fileLabel="query.ts"
        showQuickChips={false}
        schemaTab={{
          label: 'schema.prisma',
          source: schemaSource,
          caption: 'Test schema',
        }}
        defaultTab="schema"
      />,
    );

    // Schema tab should be active
    expect(html).toContain('schema.prisma');
    expect(html).toContain('read-only');
    expect(html).toContain('id="erd-relation-pill"');
  });

  it('omits the relation indicator pill when schema has fewer than 2 models', () => {
    const singleModelSchema = `
      model User {
        id Int @id
        name String
      }
    `;

    const html = renderToStaticMarkup(
      <SQLEditor
        value="const x = 1;"
        onChange={vi.fn()}
        onRunAndCheck={vi.fn()}
        fileLabel="query.ts"
        showQuickChips={false}
        schemaTab={{
          label: 'schema.prisma',
          source: singleModelSchema,
          caption: 'Single model',
        }}
        defaultTab="editor"
      />,
    );

    expect(html).not.toContain('id="erd-relation-pill"');
    expect(html).not.toContain('relation defined');
  });

  it('PrismaSchemaTab renders ERD diagram view when activeView is diagram', () => {
    const schemaSource = `
      model User {
        id Int @id
        posts Post[]
      }
      model Post {
        id Int @id
        author User @relation(fields: [authorId], references: [id])
        authorId Int
      }
    `;

    const html = renderToStaticMarkup(
      <PrismaSchemaTab
        source={schemaSource}
        label="schema.prisma"
        caption="Relationship demo"
        activeView="diagram"
      />,
    );

    // Diagram SVG and ERD elements are rendered
    expect(html).toContain('<svg');
    expect(html).toContain('User');
    expect(html).toContain('Post');
  });
});
