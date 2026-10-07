/**
 * Tests for task hydration compatibility & schema editor surfaces.
 * Prevents regressions where legacy TypeScript client code saved in localStorage
 * from earlier curriculum revisions is hydrated into newly overhauled schema/cli tasks.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  isSavedCodeCompatibleWithTask,
  editorSchemaTab,
  editorSurface,
  defaultEditorTab,
} from '../../src/lib/track-submit';
import { prismaSnippetTask, prismaReadTask } from '../../src/content/prisma/phase6-tasks';
import { PrismaTaskHeaderMeta } from '../../src/components/learning/prisma/PrismaTaskHeaderMeta';
import { SQLEditor } from '../../src/components/learning/SQLEditor';

// Mock MonacoCodeEditor for lightweight SSR rendering
vi.mock('../../src/components/learning/MonacoCodeEditor', () => ({
  MonacoCodeEditor: (props: any) => (
    <div data-testid="mock-monaco-editor" data-language={props.language}>
      {props.value}
    </div>
  ),
}));

describe('isSavedCodeCompatibleWithTask', () => {
  const schemaTask = prismaSnippetTask({
    id: 'prisma01-c1-t1',
    title: 'Define User model',
    description: 'Add name String',
    instructions: ['Declare name String'],
    scaffold: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    why: 'reason',
    rows: 1,
    workspaceMode: 'schema',
    code0: 'model User {\n\n}',
    code1: 'model User {\n  name String\n}',
    need: ['model User', 'name String'],
  });

  const queryTask = prismaReadTask({
    id: 'prisma02-c1-t1',
    title: 'Query Users',
    description: 'Read users',
    instructions: ['Call findMany'],
    scaffold: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    why: 'reason',
    rows: 1,
    rtype: 'User[]',
    code0: 'export async function getUsers() {}',
    code1: 'export async function getUsers() { return await prisma.user.findMany(); }',
  });

  const cliTask = prismaSnippetTask({
    id: 'prisma06-c1-t1',
    title: 'Run prisma generate',
    description: 'CLI command',
    instructions: ['run npx prisma generate'],
    scaffold: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    why: 'reason',
    rows: 1,
    workspaceMode: 'cli',
    code0: 'npx prisma',
    code1: 'npx prisma generate',
    need: ['npx prisma generate'],
  });

  const legacyTsCode = `export async function getUserById(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
}`;

  it('rejects legacy TypeScript code for a schema task', () => {
    expect(isSavedCodeCompatibleWithTask(schemaTask, legacyTsCode)).toBe(false);
  });

  it('rejects raw SQL for a schema task', () => {
    expect(isSavedCodeCompatibleWithTask(schemaTask, 'SELECT * FROM users;')).toBe(false);
  });

  it('accepts valid PSL model code for a schema task', () => {
    expect(isSavedCodeCompatibleWithTask(schemaTask, 'model User {\n  name String\n}')).toBe(true);
  });

  it('rejects PSL model code for a query task', () => {
    expect(isSavedCodeCompatibleWithTask(queryTask, 'model User {\n  id Int @id\n}')).toBe(false);
  });

  it('accepts valid TypeScript probe code for a query task', () => {
    expect(isSavedCodeCompatibleWithTask(queryTask, legacyTsCode)).toBe(true);
  });

  it('rejects TypeScript code for a CLI task', () => {
    expect(isSavedCodeCompatibleWithTask(cliTask, legacyTsCode)).toBe(false);
  });

  it('accepts valid CLI command for a CLI task', () => {
    expect(isSavedCodeCompatibleWithTask(cliTask, 'npx prisma generate')).toBe(true);
  });

  it('rejects empty or whitespace-only code', () => {
    expect(isSavedCodeCompatibleWithTask(schemaTask, '')).toBe(false);
    expect(isSavedCodeCompatibleWithTask(schemaTask, '   \n  ')).toBe(false);
    expect(isSavedCodeCompatibleWithTask(schemaTask, null)).toBe(false);
    expect(isSavedCodeCompatibleWithTask(schemaTask, undefined)).toBe(false);
  });
});

describe('Schema mode workspace chrome and tabs', () => {
  const schemaTask = prismaSnippetTask({
    id: 'prisma01-c1-t1',
    title: 'Define User model',
    description: 'Add name String',
    instructions: ['Declare name String'],
    scaffold: 'SELECT 1;',
    solutionSql: 'SELECT 1;',
    why: 'reason',
    rows: 1,
    workspaceMode: 'schema',
    code0: 'model User {\n\n}',
    code1: 'model User {\n  name String\n}',
    need: ['model User', 'name String'],
  });

  it('omits secondary schema tab for schema tasks without custom schemaSource', () => {
    expect(editorSchemaTab(schemaTask)).toBeUndefined();
    expect(defaultEditorTab(schemaTask)).toBe('editor');
  });

  it('sets fileLabel to schema.prisma and expectedType to null for schema tasks', () => {
    const surface = editorSurface(schemaTask);
    expect(surface.fileLabel).toBe('schema.prisma');
    expect(surface.expectedType).toBeNull();
  });

  it('renders TARGET: schema.prisma and hides MODEL chip in PrismaTaskHeaderMeta for schema mode', () => {
    const html = renderToStaticMarkup(<PrismaTaskHeaderMeta task={schemaTask} />);
    expect(html).toContain('schema.prisma');
    expect(html).toContain('TARGET');
    expect(html).not.toContain('TypeScript Client');
    expect(html).not.toContain('MODEL');
  });

  it('renders SQLEditor with schema.prisma and without TYPESCRIPT tab in schema mode', () => {
    const surface = editorSurface(schemaTask);
    const html = renderToStaticMarkup(
      <SQLEditor
        value="model User {\n  name String\n}"
        onChange={vi.fn()}
        onRunAndCheck={vi.fn()}
        fileLabel={surface.fileLabel}
        showQuickChips={false}
        schemaTab={editorSchemaTab(schemaTask)}
        defaultTab={defaultEditorTab(schemaTask)}
      />,
    );

    expect(html).toContain('schema.prisma');
    expect(html).not.toContain('TYPESCRIPT');
    expect(html).not.toContain('Active: users');
  });
});
