/**
 * InlineContent — inline markdown renderer for explanation strings:
 * **bold** → semibold emphasis, `code` → mono code chip, (*text*) → muted italic.
 * Shared by the concept lesson view and the truth-eval blocks.
 */
export function InlineContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\(\*[^*]+\*\)|`.*?`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-text">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('(*') && part.endsWith('*)')) {
          return (
            <em key={i} className="text-text-faint">
              <InlineContent text={part.slice(2, -2)} />
            </em>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="font-mono text-xs text-editor-text bg-surface-2 px-1.5 py-0.5 rounded border border-border-soft mx-0.5 font-medium"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}