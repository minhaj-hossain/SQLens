import React from 'react';

interface StructuredStoryContentProps {
  story: string;
  meaningText?: string;
  isTaskDone?: boolean;
}

/**
 * Helper to render inline formatting like backticks `command` or technical badges.
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-800/80 text-zinc-100 font-mono text-[12px] border border-white/[0.08]"
        >
          {code}
        </code>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export const StructuredStoryContent: React.FC<StructuredStoryContentProps> = ({
  story,
  meaningText,
  isTaskDone,
}) => {
  if (!story) return null;

  // Pattern A: Numbered list format (e.g. "Let us run our diagnosis:\n1. ...\n2. ...")
  const numberedListPattern = /(?:^|\n)\s*\d+\.\s+/;
  if (numberedListPattern.test(story)) {
    const lines = story.split('\n').map((l) => l.trim()).filter(Boolean);
    const introLines: string[] = [];
    const listItems: string[] = [];

    for (const line of lines) {
      if (/^\d+\.\s+/.test(line)) {
        listItems.push(line.replace(/^\d+\.\s+/, ''));
      } else if (listItems.length === 0) {
        introLines.push(line);
      } else {
        // Appended to last list item if wrapped
        listItems[listItems.length - 1] += ' ' + line;
      }
    }

    return (
      <div className="space-y-3">
        {introLines.length > 0 && (
          <p className="text-[14px] sm:text-[15px] text-zinc-200 leading-relaxed font-normal">
            {renderInlineFormatting(introLines.join(' '))}
          </p>
        )}

        <div className="space-y-2 pt-0.5">
          {listItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#18181b]/70 border border-white/[0.06] text-xs sm:text-[13px] leading-relaxed transition-colors hover:border-white/10"
            >
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 border border-white/10 shadow-sm">
                {idx + 1}
              </span>
              <div className="text-zinc-200 flex-1">
                {renderInlineFormatting(item)}
              </div>
            </div>
          ))}
        </div>

        {isTaskDone && meaningText && (
          <p className="text-xs sm:text-sm text-zinc-300 border-l-2 border-emerald-500/50 pl-3 py-1 italic leading-relaxed animate-in fade-in duration-300">
            {renderInlineFormatting(meaningText)}
          </p>
        )}
      </div>
    );
  }

  // Pattern B: Inlined sequential steps (e.g. "Step 1: ... Step 2: ...")
  if (/Step\s+1\s*:[\s\S]+Step\s+2\s*:/i.test(story)) {
    const rawChunks = story.split(/(?=Step\s+\d+\s*:)/i).map((s) => s.trim()).filter(Boolean);
    const steps: { label: string; text: string }[] = [];
    const preText: string[] = [];

    for (const chunk of rawChunks) {
      const match = chunk.match(/^(Step\s+\d+)\s*:\s*([\s\S]*)$/i);
      if (match) {
        steps.push({ label: match[1], text: match[2].trim() });
      } else {
        preText.push(chunk);
      }
    }

    return (
      <div className="space-y-3">
        {preText.length > 0 && (
          <p className="text-[14px] sm:text-[15px] text-zinc-200 leading-relaxed font-normal">
            {renderInlineFormatting(preText.join(' '))}
          </p>
        )}

        <div className="space-y-2 pt-0.5">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#18181b]/70 border border-white/[0.06] text-xs sm:text-[13px] leading-relaxed transition-colors hover:border-white/10"
            >
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px] font-semibold shrink-0 mt-0.5 border border-white/10 shadow-sm">
                {st.label}
              </span>
              <div className="text-zinc-200 flex-1">
                {renderInlineFormatting(st.text)}
              </div>
            </div>
          ))}
        </div>

        {isTaskDone && meaningText && (
          <p className="text-xs sm:text-sm text-zinc-300 border-l-2 border-emerald-500/50 pl-3 py-1 italic leading-relaxed animate-in fade-in duration-300">
            {renderInlineFormatting(meaningText)}
          </p>
        )}
      </div>
    );
  }

  // Pattern C: Standard multi-paragraph or single-paragraph text
  const paragraphs = story.split('\n').map((p) => p.trim()).filter(Boolean);

  return (
    <div className="space-y-2.5">
      {paragraphs.map((p, idx) => (
        <p key={idx} className="text-[14px] sm:text-[15px] text-zinc-200 leading-relaxed font-normal">
          {renderInlineFormatting(p)}
        </p>
      ))}

      {isTaskDone && meaningText && (
        <p className="text-xs sm:text-sm text-zinc-300 border-l-2 border-emerald-500/50 pl-3 py-1 italic leading-relaxed animate-in fade-in duration-300">
          {renderInlineFormatting(meaningText)}
        </p>
      )}
    </div>
  );
};
