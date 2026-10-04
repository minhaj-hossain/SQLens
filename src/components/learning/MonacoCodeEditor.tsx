'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { OnMount, Monaco } from '@monaco-editor/react';

// Dynamic import with ssr: false to prevent Next.js SSR window crash
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[160px] bg-editor-bg text-text-faint font-mono text-xs">
      Loading editor...
    </div>
  ),
});

export interface MonacoCodeEditorHandle {
  focus: () => void;
  format: () => void;
  applySuggestion: (text: string) => void;
  setValue: (val: string) => void;
  getValue: () => string;
  textarea: HTMLTextAreaElement | null;
}

export interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'typescript' | 'sql' | 'prisma';
  onRun?: (code: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
  height?: string;
  className?: string;
  error?: string | null;
  errorPosition?: { line?: number; column?: number; length?: number } | null;
}

const PRISMA_DECLARATIONS = `
export namespace Prisma {
  export class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
  }
  export class PrismaClientValidationError extends Error {}
  export class PrismaClientInitializationError extends Error {}
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'ADMIN' | 'MEMBER';
  createdAt?: Date;
  posts?: Post[];
}

export interface Post {
  id: number;
  title: string;
  authorId: number;
  author?: User;
}

export interface PrismaClient {
  user: {
    findMany(args?: any): Promise<User[]>;
    findUnique(args: any): Promise<User | null>;
    findFirst(args?: any): Promise<User | null>;
    create(args: any): Promise<User>;
    createMany(args: any): Promise<{ count: number }>;
    update(args: any): Promise<User>;
    updateMany(args: any): Promise<{ count: number }>;
    delete(args: any): Promise<User>;
    deleteMany(args?: any): Promise<{ count: number }>;
    upsert(args: any): Promise<User>;
    count(args?: any): Promise<number>;
    aggregate(args: any): Promise<any>;
    groupBy(args: any): Promise<any>;
  };
  post: {
    findMany(args?: any): Promise<Post[]>;
    findUnique(args: any): Promise<Post | null>;
    findFirst(args?: any): Promise<Post | null>;
    create(args: any): Promise<Post>;
    createMany(args: any): Promise<{ count: number }>;
    update(args: any): Promise<Post>;
    updateMany(args: any): Promise<{ count: number }>;
    delete(args: any): Promise<Post>;
    deleteMany(args?: any): Promise<{ count: number }>;
    upsert(args: any): Promise<Post>;
    count(args?: any): Promise<number>;
  };
  $transaction<T>(input: any): Promise<T>;
  $queryRaw<T = any>(query: TemplateStringsArray | string, ...values: any[]): Promise<T>;
  $executeRaw(query: TemplateStringsArray | string, ...values: any[]): Promise<number>;
  $extends(extension: any): PrismaClient;
}

export declare const prisma: PrismaClient;
export declare const Prisma: typeof Prisma;
`;

let monacoConfigured = false;

function setupMonaco(monaco: Monaco) {
  if (monacoConfigured) return;
  monacoConfigured = true;

  // 1. Setup Theme
  monaco.editor.defineTheme('sqlens-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'f4f4f5', fontStyle: 'bold' },
      { token: 'type', foreground: 'f4c430' },
      { token: 'identifier', foreground: 'a1a1aa' },
      { token: 'string', foreground: 'f4c430' },
      { token: 'number', foreground: 'a1a1aa' },
      { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
      { token: 'annotation', foreground: 'f4c430' },
      { token: 'delimiter', foreground: '71717a' },
    ],
    colors: {
      'editor.background': '#0d0d10',
      'editor.foreground': '#f4f4f5',
      'editorCursor.foreground': '#f4c430',
      'editor.lineHighlightBackground': '#18181c50',
      'editorLineNumber.foreground': '#71717a',
      'editorLineNumber.activeForeground': '#f4c430',
      'editor.selectionBackground': '#f4c4302e',
      'editor.inactiveSelectionBackground': '#f4c4301a',
    },
  });

  // 2. Setup TypeScript Compiler Options & Declarations
  const ts = monaco.languages.typescript.typescriptDefaults;
  ts.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTextFiles: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowJs: true,
  });

  ts.addExtraLib(PRISMA_DECLARATIONS, 'file:///node_modules/@prisma/client/index.d.ts');

  // 3. Register Prisma Language
  monaco.languages.register({ id: 'prisma' });
  monaco.languages.setMonarchTokensProvider('prisma', {
    keywords: ['model', 'enum', 'datasource', 'generator', 'type'],
    typeKeywords: ['String', 'Boolean', 'Int', 'BigInt', 'Float', 'Decimal', 'DateTime', 'Json', 'Bytes', 'Unsupported'],
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/@@?[a-zA-Z_]\w*/, 'annotation'],
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@default': 'identifier',
          },
        }],
        [/"[^"]*"/, 'string'],
        [/[{}()\[\]]/, '@brackets'],
        [/\d+/, 'number'],
      ],
    },
  });
}

export const MonacoCodeEditor = forwardRef<MonacoCodeEditorHandle, MonacoCodeEditorProps>(
  function MonacoCodeEditor(
    {
      value,
      onChange,
      language = 'typescript',
      onRun,
      readOnly = false,
      placeholder,
      minHeight = '180px',
      height = '100%',
      className = '',
      error,
      errorPosition,
    },
    ref,
  ) {
    const editorInstanceRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const onRunRef = useRef(onRun);
    onRunRef.current = onRun;

    useImperativeHandle(ref, () => ({
      focus: () => {
        editorInstanceRef.current?.focus();
      },
      format: () => {
        editorInstanceRef.current?.getAction('editor.action.formatDocument')?.run();
      },
      applySuggestion: (text: string) => {
        const editor = editorInstanceRef.current;
        if (!editor) return;
        const selection = editor.getSelection();
        if (selection) {
          const op = {
            range: selection,
            text: text + ' ',
            forceMoveMarkers: true,
          };
          editor.executeEdits('quick-chip', [op]);
        } else {
          editor.trigger('keyboard', 'type', { text: text + ' ' });
        }
        editor.focus();
      },
      setValue: (val: string) => {
        editorInstanceRef.current?.setValue(val);
      },
      getValue: () => {
        return editorInstanceRef.current?.getValue() ?? value;
      },
      textarea: null,
    }));

    // Update error markers whenever error or errorPosition changes
    useEffect(() => {
      const editor = editorInstanceRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;
      const model = editor.getModel();
      if (!model) return;

      if (!error) {
        monaco.editor.setModelMarkers(model, 'sqlens', []);
        return;
      }

      const line = errorPosition?.line ?? 1;
      const startCol = errorPosition?.column ?? 1;
      const endCol = startCol + (errorPosition?.length ?? 10);

      monaco.editor.setModelMarkers(model, 'sqlens', [
        {
          startLineNumber: line,
          startColumn: startCol,
          endLineNumber: line,
          endColumn: endCol,
          message: error,
          severity: monaco.MarkerSeverity.Error,
        },
      ]);
    }, [error, errorPosition]);

    const handleMount: OnMount = (editor, monaco) => {
      editorInstanceRef.current = editor;
      monacoRef.current = monaco;
      setupMonaco(monaco);
      monaco.editor.setTheme('sqlens-dark');

      // Command + Enter / Ctrl + Enter to run
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        const currentCode = editor.getValue();
        if (onRunRef.current) {
          onRunRef.current(currentCode);
        }
      });
    };

    return (
      <div
        className={`w-full relative overflow-hidden rounded-b-xl border-t border-border-soft ${className}`}
        style={{ minHeight, height }}
      >
        <MonacoEditor
          height="100%"
          language={language}
          value={value}
          onChange={(val) => onChange(val ?? '')}
          onMount={handleMount}
          theme="sqlens-dark"
          options={{
            readOnly,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
            automaticLayout: true,
            tabSize: 2,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
          }}
        />
      </div>
    );
  },
);
