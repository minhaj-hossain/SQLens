import React, { useState } from 'react';
import { Copy, Check, Braces } from 'lucide-react';

interface JsonViewerProps {
  data: unknown;
  className?: string;
}

/**
 * Tokenize formatted JSON and return syntax-highlighted React elements.
 */
function highlightJson(jsonStr: string): React.ReactNode[] {
  const tokenRegex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],])/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(jsonStr)) !== null) {
    if (match.index > lastIndex) {
      elements.push(jsonStr.substring(lastIndex, match.index));
    }
    const token = match[0];
    let cls = 'text-text';
    if (/^"/.test(token)) {
      if (/:$/.test(token)) {
        // Property key
        cls = 'text-func font-medium';
      } else {
        // String value
        cls = 'text-keyword';
      }
    } else if (/true|false/.test(token)) {
      cls = 'text-accent font-semibold';
    } else if (/null/.test(token)) {
      cls = 'text-text-faint italic';
    } else if (!isNaN(Number(token))) {
      cls = 'text-amber-400 font-mono';
    } else {
      cls = 'text-text-faint';
    }
    elements.push(
      <span key={match.index} className={cls}>
        {token}
      </span>,
    );
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < jsonStr.length) {
    elements.push(jsonStr.substring(lastIndex));
  }
  return elements;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const formatted = JSON.stringify(data, null, 2);
  const isArray = Array.isArray(data);
  const itemCount = isArray
    ? (data as unknown[]).length
    : data && typeof data === 'object'
      ? Object.keys(data as Record<string, unknown>).length
      : 1;

  const handleCopy = () => {
    if (!formatted) return;
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      id="prisma-json-viewer-container"
      className={`relative flex flex-col bg-surface-2 rounded-xl border border-border overflow-hidden ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-surface border-b border-border text-xs">
        <div className="flex items-center gap-2">
          <Braces className="w-3.5 h-3.5 text-func" />
          <span className="font-mono text-[11px] font-semibold text-text uppercase tracking-wider">
            Hydrated Prisma Object
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-mono border border-border">
            {isArray ? `${itemCount} items` : `${itemCount} fields`}
          </span>
        </div>

        <button
          id="copy-json-btn"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text text-[11px] font-mono border border-border transition cursor-pointer"
          title="Copy formatted JSON to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy JSON</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3 sm:p-4 overflow-x-auto max-h-[340px] font-mono text-xs leading-relaxed">
        <pre className="m-0 whitespace-pre">
          {highlightJson(formatted ?? 'null')}
        </pre>
      </div>
    </div>
  );
};
