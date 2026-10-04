'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import type { OnMount, Monaco } from '@monaco-editor/react';

import { parsePrismaSchema } from '@/lib/prisma-engine/prisma-schema-parser';
import { emitMonacoDtsFromAst } from '@/lib/prisma-engine/prisma-dts-emitter';

// Configure Monaco to load from local static assets (same-origin /monaco/vs)
// Safe loader configuration without top-level loader.init execution
if (typeof window !== 'undefined') {
  loader.config({
    paths: {
      vs: '/monaco/vs',
    },
  });
}

function InteractiveEditorFallback({
  value,
  onChange,
  minHeight = '180px',
  placeholder,
  readOnly,
  textareaRef,
}: {
  value?: string;
  onChange?: (val: string) => void;
  minHeight?: string;
  placeholder?: string;
  readOnly?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const displayCode = value ?? placeholder ?? '';
  const lines = displayCode ? displayCode.split('\n') : [''];

  return (
    <div
      className="flex w-full h-full min-h-[160px] bg-[#0d0d12] text-[#f4f4f5] font-mono text-[13px] leading-[22px] overflow-hidden relative cursor-text select-text"
      style={{ minHeight }}
      aria-label="Editor loading preview"
    >
      <div className="w-[46px] shrink-0 py-3 pr-2.5 text-right text-[#52525b] border-r border-[#18181c] select-none opacity-80 pointer-events-none">
        {lines.map((_, i) => (
          <div key={i} className="leading-[22px]">
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck={false}
        className="flex-1 py-3 px-4 font-mono text-[13px] leading-[22px] bg-transparent text-[#f4f4f5] resize-none outline-none border-none whitespace-pre overflow-auto focus:ring-0 selection:bg-[#f4c43033]"
      />
    </div>
  );
}



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
  schemaSource?: string;
}

const DEFAULT_PRISMA_DECLARATIONS = `
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
declare global {
  const prisma: PrismaClient;
  const Prisma: typeof Prisma;
}
`;

let monacoGlobalConfigured = false;
let currentExtraLib: { dispose: () => void } | null = null;
let currentSchemaSignature = '';

export function updateMonacoPrismaTypes(monaco: Monaco, schemaSource?: string) {
  const ts = monaco.languages.typescript.typescriptDefaults;
  const signature = schemaSource?.trim() || 'default';

  if (currentSchemaSignature === signature && currentExtraLib) {
    return;
  }

  if (currentExtraLib) {
    currentExtraLib.dispose();
    currentExtraLib = null;
  }

  try {
    const dts = schemaSource?.trim()
      ? emitMonacoDtsFromAst(parsePrismaSchema(schemaSource))
      : DEFAULT_PRISMA_DECLARATIONS;
    currentExtraLib = ts.addExtraLib(dts, 'file:///node_modules/@prisma/client/index.d.ts');
    currentSchemaSignature = signature;
  } catch {
    currentExtraLib = ts.addExtraLib(DEFAULT_PRISMA_DECLARATIONS, 'file:///node_modules/@prisma/client/index.d.ts');
    currentSchemaSignature = 'fallback';
  }
}

function setupMonaco(monaco: Monaco) {
  if (monacoGlobalConfigured) return;
  monacoGlobalConfigured = true;

  // 1. Setup Theme: High-contrast Dark with vibrant, distinctive syntax tokens
  monaco.editor.defineTheme('sqlens-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Control flow & language keywords (await, return, const, let, function, async, export, import)
      { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
      { token: 'keyword.control', foreground: 'c084fc', fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: 'fb923c' },

      // Types & Classes (User, Post, PrismaClient, String, Int, Boolean, DateTime)
      { token: 'type', foreground: '38bdf8', fontStyle: 'bold' },
      { token: 'type.identifier', foreground: '38bdf8', fontStyle: 'bold' },

      // Functions & Methods (findMany, findUnique, create, update, delete, count)
      { token: 'function', foreground: '60a5fa' },
      { token: 'member', foreground: '7dd3fc' }, // Object property keys & clauses (where, select, include, data, orderBy)
      { token: 'attribute.name', foreground: '7dd3fc' },

      // Prisma Schema annotations (@id, @unique, @default, @relation, @@id, @@index)
      { token: 'annotation', foreground: 'f4c430', fontStyle: 'bold' },
      { token: 'annotation.block', foreground: 'fbbf24', fontStyle: 'bold' },

      // Literals
      { token: 'string', foreground: '4ade80' },
      { token: 'string.escape', foreground: '86efac' },
      { token: 'number', foreground: 'facc15' },
      { token: 'number.float', foreground: 'facc15' },

      // Comments & Docs
      { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      { token: 'comment.doc', foreground: '94a3b8', fontStyle: 'italic' },

      // Delimiters & Operators
      { token: 'delimiter', foreground: '94a3b8' },
      { token: 'delimiter.bracket', foreground: '94a3b8' },
      { token: 'operator', foreground: 'fb923c' },
      { token: 'operator.optional', foreground: 'fb923c', fontStyle: 'bold' },
      { token: 'operator.list', foreground: 'fb923c', fontStyle: 'bold' },

      // Identifiers & standard variables
      { token: 'identifier', foreground: 'f1f5f9' },
    ],
    colors: {
      'editor.background': '#0d0d12',
      'editor.foreground': '#f1f5f9',
      'editorCursor.foreground': '#f4c430',
      'editor.lineHighlightBackground': '#18181f60',
      'editorLineNumber.foreground': '#52525b',
      'editorLineNumber.activeForeground': '#f4c430',
      'editor.selectionBackground': '#f4c43026',
      'editor.inactiveSelectionBackground': '#f4c43014',
      'editorBracketMatch.background': '#f4c43020',
      'editorBracketMatch.border': '#f4c43060',
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
  ts.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // 3. Register Prisma Language with comprehensive Monarch tokenizer
  monaco.languages.register({ id: 'prisma' });
  monaco.languages.setMonarchTokensProvider('prisma', {
    keywords: [
      'model',
      'enum',
      'datasource',
      'generator',
      'type',
      'view',
    ],
    typeKeywords: [
      'String',
      'Boolean',
      'Int',
      'BigInt',
      'Float',
      'Decimal',
      'DateTime',
      'Json',
      'Bytes',
      'Unsupported',
    ],
    builtins: [
      'autoincrement',
      'now',
      'cuid',
      'uuid',
      'dbgenerated',
      'auto',
      'sequence',
      'env',
    ],
    configKeys: [
      'provider',
      'url',
      'directUrl',
      'output',
      'previewFeatures',
      'engineType',
      'binaryTargets',
      'fields',
      'references',
      'onDelete',
      'onUpdate',
      'map',
      'name',
    ],
    tokenizer: {
      root: [
        // Comments & Documentation
        [/\/\/\/.*$/, 'comment.doc'],
        [/\/\/.*$/, 'comment'],

        // Block annotations (@@id, @@unique, @@index, @@map)
        [/@@[a-zA-Z_]\w*/, 'annotation.block'],

        // Field annotations (@id, @unique, @default, @relation, @updatedAt, @map)
        [/@[a-zA-Z_]\w*/, 'annotation'],

        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@builtins': 'function',
            '@configKeys': 'member',
            '@default': 'identifier',
          },
        }],

        // Strings
        [/"([^"\\]|\\.)*"/, 'string'],

        // Numbers
        [/\b\d+(\.\d+)?\b/, 'number'],

        // Field modifiers & operators
        [/[?]/, 'operator.optional'],
        [/\[\]/, 'operator.list'],
        [/[=:]/, 'operator'],

        // Brackets & delimiters
        [/[{}()\[\]]/, '@brackets'],
        [/[,.]/, 'delimiter'],
      ],
    },
  });
}

let monacoLoadPromise: Promise<Monaco> | null = null;

function loadMonacoInstance(): Promise<Monaco> {
  if (typeof window === 'undefined') {
    return new Promise(() => {});
  }
  if ((window as any).monaco && (window as any).monaco.editor) {
    return Promise.resolve((window as any).monaco);
  }
  if (monacoLoadPromise) {
    return monacoLoadPromise;
  }

  monacoLoadPromise = new Promise<Monaco>((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="loader.js"]');
    const onScriptLoaded = () => {
      try {
        const req = (window as any).require;
        if (!req) {
          reject(new Error('window.require not found after loader.js'));
          return;
        }
        req.config({
          paths: {
            vs: '/monaco/vs',
          },
        });
        req(['vs/editor/editor.main'], (monacoInstance: Monaco) => {
          const m = (window as any).monaco || monacoInstance;
          loader.config({ monaco: m });
          setupMonaco(m);
          resolve(m);
        }, (err: any) => {
          console.warn('[Monaco] Local AMD load failed, trying CDN fallback:', err);
          req.config({
            paths: {
              vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs',
            },
          });
          req(['vs/editor/editor.main'], (monacoFallback: Monaco) => {
            const m = (window as any).monaco || monacoFallback;
            loader.config({ monaco: m });
            setupMonaco(m);
            resolve(m);
          }, reject);
        });
      } catch (err) {
        reject(err);
      }
    };

    if ((window as any).require) {
      onScriptLoaded();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', onScriptLoaded);
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = '/monaco/vs/loader.js';
    script.async = true;
    script.onload = onScriptLoaded;
    script.onerror = () => {
      console.warn('[Monaco] /monaco/vs/loader.js failed to load, falling back to CDN script');
      const cdnScript = document.createElement('script');
      cdnScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/loader.js';
      cdnScript.async = true;
      cdnScript.onload = onScriptLoaded;
      cdnScript.onerror = reject;
      document.body.appendChild(cdnScript);
    };
    document.body.appendChild(script);
  });

  return monacoLoadPromise;
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
      minHeight = '220px',
      height = '260px',
      className = '',
      error,
      errorPosition,
      schemaSource,
    },
    ref,
  ) {
    const editorInstanceRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const fallbackTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const onRunRef = useRef(onRun);
    onRunRef.current = onRun;

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.focus();
        } else {
          fallbackTextareaRef.current?.focus();
        }
      },
      format: () => {
        editorInstanceRef.current?.getAction('editor.action.formatDocument')?.run();
      },
      applySuggestion: (text: string) => {
        const editor = editorInstanceRef.current;
        if (editor) {
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
        } else {
          onChange(value ? `${value} ${text}` : text);
        }
      },
      setValue: (val: string) => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.setValue(val);
        } else {
          onChange(val);
        }
      },
      getValue: () => {
        return editorInstanceRef.current?.getValue() ?? value;
      },
      textarea: fallbackTextareaRef.current,
    }));

    // Re-evaluate TypeScript declarations whenever schemaSource or language changes
    useEffect(() => {
      const monaco = monacoRef.current;
      if (monaco && language === 'typescript') {
        updateMonacoPrismaTypes(monaco, schemaSource);
      }
    }, [schemaSource, language]);

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
      if (language === 'typescript') {
        updateMonacoPrismaTypes(monaco, schemaSource);
      }
      monaco.editor.setTheme('sqlens-dark');

      // Command + Enter / Ctrl + Enter to run
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        const currentCode = editor.getValue();
        if (onRunRef.current) {
          onRunRef.current(currentCode);
        }
      });
    };

    const [monacoReady, setMonacoReady] = useState(false);

    useEffect(() => {
      let isMounted = true;
      loadMonacoInstance()
        .then(() => {
          if (isMounted) setMonacoReady(true);
        })
        .catch((err) => console.error('[Monaco] Load error:', err));
      return () => {
        isMounted = false;
      };
    }, []);

    const effectiveHeight = height && height !== '100%' ? height : minHeight || '260px';

    if (!monacoReady) {
      return (
        <div
          className={`w-full relative overflow-hidden rounded-b-xl border-t border-border-soft ${className}`}
          style={{ minHeight: effectiveHeight, height: effectiveHeight }}
        >
          <InteractiveEditorFallback
            value={value}
            onChange={onChange}
            minHeight={effectiveHeight}
            placeholder={placeholder}
            readOnly={readOnly}
            textareaRef={fallbackTextareaRef}
          />
        </div>
      );
    }

    return (
      <div
        className={`w-full relative overflow-hidden rounded-b-xl border-t border-border-soft ${className}`}
        style={{ minHeight: effectiveHeight, height: effectiveHeight }}
        onClick={() => {
          if (editorInstanceRef.current) {
            editorInstanceRef.current.focus();
          } else {
            fallbackTextareaRef.current?.focus();
          }
        }}
      >
        <Editor
          height={effectiveHeight}
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
