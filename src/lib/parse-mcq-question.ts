/**
 * ParsedMcqQuestion — structure extracted from an MCQ `question` string.
 *  - `lead`:     the setup/context line (e.g. "A table has 4 students:")
 *  - `facts`:    bullet items (lines starting with •, -, or *)
 *  - `question`: the actual ask (rendered emphasized)
 *  - `code`:     SQL lines shown in a highlighted code block (legacy format
 *                where the question is followed by raw SQL lines)
 */
export interface ParsedMcqQuestion {
  lead: string;
  facts: string[];
  question: string;
  code: string[];
}

const SQL_LINE_STRONG =
  /^(SELECT|FROM|UNION|INSERT INTO|UPDATE|DELETE FROM|CREATE|ALTER TABLE|DROP TABLE)\b/i;
const SQL_LINE_WEAK =
  /^(WHERE|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN)\b/i;

/**
 * A line is SQL code if it starts with a strong SQL keyword, or a weak one
 * (WHERE/ORDER BY/…) that also carries SQL syntax — so English sentences like
 * "Where must the DISTINCT keyword be placed?" are NOT misclassified.
 */
function isSqlLine(line: string): boolean {
  if (SQL_LINE_STRONG.test(line)) return true;
  if (!SQL_LINE_WEAK.test(line)) return false;
  return /[=(;]/.test(line) || /\b(ASC|DESC|LIMIT)\b/.test(line);
}

/**
 * Split an MCQ question into structured parts.
 *
 * Recognized layouts:
 *  1. Single line                          → { question }
 *  2. Question + SQL lines (legacy)        → { lead, code }
 *  3. Setup + facts + ask (structured)     → { lead, facts, question }
 */
export function parseMcqQuestion(raw: string): ParsedMcqQuestion {
  const lines = raw.split('\n');
  const facts: string[] = [];
  const code: string[] = [];
  const text: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^[•\-*]\s+/.test(line)) {
      facts.push(line.replace(/^[•\-*]\s+/, ''));
    } else if (isSqlLine(line)) {
      code.push(line);
    } else {
      text.push(line);
    }
  }

  // Empty / whitespace-only: return the raw text so nothing is lost.
  if (text.length === 0 && facts.length === 0) {
    return { lead: '', facts, question: raw.trim(), code };
  }
  // Simple one-line question.
  if (text.length === 1 && facts.length === 0 && code.length === 0) {
    return { lead: '', facts, question: text[0], code };
  }
  // Legacy layout: question line followed by SQL code lines.
  if (facts.length === 0 && code.length > 0) {
    return { lead: text[0] ?? '', facts, question: '', code };
  }
  // Structured fact list: first text line = lead, remaining = the ask.
  if (facts.length > 0) {
    if (text.length === 0) return { lead: '', facts, question: '', code };
    if (text.length === 1) return { lead: '', facts, question: text[0], code };
    return { lead: text[0], facts, question: text.slice(1).join(' '), code };
  }
  // Multiple text paragraphs, no facts/code: last one is the ask.
  return { lead: '', facts, question: text[text.length - 1] ?? '', code: [] };
}