import { SQL_KEYWORDS } from './highlight-sql';

const MAJOR_CLAUSES = [
  'SELECT',
  'FROM',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'JOIN',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'LIMIT',
  'OFFSET',
  'UNION',
  'WITH',
];

/** Uppercase known keywords and put major clauses on their own lines. */
export function formatSql(value: string): string {
  if (!value.trim()) return value;

  let formatted = value;
  const stringLiterals: string[] = [];
  formatted = formatted.replace(/'(?:[^'\\]|\\.)*'/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });

  const keywords = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of keywords) {
    if (kw.toUpperCase() === 'FULL JOIN') continue;
    const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(regex, kw);
  }

  for (const clause of MAJOR_CLAUSES) {
    const regex = new RegExp(`(?<!\\n)\\b${clause}\\b`, 'g');
    formatted = formatted.replace(regex, (match, offset) =>
      offset === 0 ? match : `\n${match}`,
    );
  }

  formatted = formatted.replace(/__STR_LITERAL_(\d+)__/g, (_, idx) => {
    return stringLiterals[Number(idx)] || '';
  });

  return formatted
    .split('\n')
    .map((line) => line.trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n');
}
