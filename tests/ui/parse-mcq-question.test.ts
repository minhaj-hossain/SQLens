import { describe, expect, it } from 'vitest';
import { parseMcqQuestion } from '../../src/lib/parse-mcq-question';

// Exact strings pulled from src/content/modules/*.ts
const DAY03_FACTS =
  "A table has 4 students:\n• 2 in CSE\n• 3 aged >= 21\n• Only 1 student who is BOTH in CSE and aged >= 21\n\nHow many rows does `WHERE department = 'CSE' AND age >= 21` return?";
const DAY02_FACTS =
  "The students table has 5 rows:\n• 3 in 'CSE'\n• 1 in 'EEE'\n• 1 in 'BBA'\n\nHow many rows does `WHERE department != 'EEE'` return?";
const DAY09_FACTS =
  'The price column contains these values:\n• $10\n• $20\n• NULL\n• $30\n\nWhat does `AVG(price)` return?';
const DAY37_FACTS =
  'A subquery returns these values:\n• 4\n• 7\n• NULL\n\nWhat does `WHERE id NOT IN (subquery)` return?';
const DAY01_LEGACY = 'What does this query do?\nSELECT age\nFROM students;';
const DAY01_LEGACY_ALIAS =
  'What does this query do?\nSELECT name AS student_name\nFROM students;';
const DAY02_LEGACY =
  'How many rows will this query return on our students table?\nSELECT * FROM students WHERE age = 21;';

describe('parseMcqQuestion — single-line questions', () => {
  it('returns the whole line as the question', () => {
    expect(parseMcqQuestion('Where must the DISTINCT keyword be placed in a SQL query?')).toEqual({
      lead: '',
      facts: [],
      question: 'Where must the DISTINCT keyword be placed in a SQL query?',
      code: [],
    });
  });

  it('keeps inline backticks intact for the renderer', () => {
    const parsed = parseMcqQuestion('What does `WHERE NOT (price < 50)` evaluate to?');
    expect(parsed.question).toBe('What does `WHERE NOT (price < 50)` evaluate to?');
    expect(parsed.code).toEqual([]);
  });
});

describe('parseMcqQuestion — structured fact lists', () => {
  it('splits the Day 3 AND-count question into lead, facts, and ask', () => {
    const parsed = parseMcqQuestion(DAY03_FACTS);
    expect(parsed.lead).toBe('A table has 4 students:');
    expect(parsed.facts).toEqual([
      '2 in CSE',
      '3 aged >= 21',
      'Only 1 student who is BOTH in CSE and aged >= 21',
    ]);
    expect(parsed.question).toBe(
      "How many rows does `WHERE department = 'CSE' AND age >= 21` return?",
    );
    expect(parsed.code).toEqual([]);
  });

  it('splits the Day 2 department-count question', () => {
    const parsed = parseMcqQuestion(DAY02_FACTS);
    expect(parsed.lead).toBe('The students table has 5 rows:');
    expect(parsed.facts).toEqual(["3 in 'CSE'", "1 in 'EEE'", "1 in 'BBA'"]);
    expect(parsed.question).toBe("How many rows does `WHERE department != 'EEE'` return?");
  });

  it('splits the Day 9 AVG-with-NULL question', () => {
    const parsed = parseMcqQuestion(DAY09_FACTS);
    expect(parsed.lead).toBe('The price column contains these values:');
    expect(parsed.facts).toEqual(['$10', '$20', 'NULL', '$30']);
    expect(parsed.question).toBe('What does `AVG(price)` return?');
  });

  it('splits the Day 37 NOT IN NULL-poisoning question', () => {
    const parsed = parseMcqQuestion(DAY37_FACTS);
    expect(parsed.lead).toBe('A subquery returns these values:');
    expect(parsed.facts).toEqual(['4', '7', 'NULL']);
    expect(parsed.question).toBe('What does `WHERE id NOT IN (subquery)` return?');
  });

  it('keeps fact values verbatim (no marker residue)', () => {
    const parsed = parseMcqQuestion(DAY03_FACTS);
    for (const fact of parsed.facts) {
      expect(fact.startsWith('•')).toBe(false);
      expect(fact.startsWith('-')).toBe(false);
    }
  });
});

describe('parseMcqQuestion — legacy question + SQL code layout', () => {
  it('routes SQL lines into code, keeping the question as lead', () => {
    expect(parseMcqQuestion(DAY01_LEGACY)).toEqual({
      lead: 'What does this query do?',
      facts: [],
      question: '',
      code: ['SELECT age', 'FROM students;'],
    });
  });

  it('handles AS-alias queries without misclassifying the question', () => {
    const parsed = parseMcqQuestion(DAY01_LEGACY_ALIAS);
    expect(parsed.lead).toBe('What does this query do?');
    expect(parsed.code).toEqual(['SELECT name AS student_name', 'FROM students;']);
  });

  it('handles a single-line query body', () => {
    const parsed = parseMcqQuestion(DAY02_LEGACY);
    expect(parsed.lead).toBe('How many rows will this query return on our students table?');
    expect(parsed.code).toEqual(['SELECT * FROM students WHERE age = 21;']);
    expect(parsed.facts).toEqual([]);
  });
});

describe('parseMcqQuestion — safety', () => {
  it('never loses text for an unrecognized multi-line mix', () => {
    const parsed = parseMcqQuestion('Setup line\nStray trailing thought.');
    expect(parsed.question).toContain('Stray trailing thought.');
  });

  it('treats bullet lines starting with * as facts, not SQL', () => {
    const parsed = parseMcqQuestion('Known values:\n* 42\n\nWhat is the answer?');
    expect(parsed.facts).toEqual(['42']);
    expect(parsed.question).toBe('What is the answer?');
  });

  it('collapses a question written before facts into the lead', () => {
    const parsed = parseMcqQuestion('Prices are:\n• $10\n• $20\n\nWhat does AVG return?');
    expect(parsed.lead).toBe('Prices are:');
    expect(parsed.question).toBe('What does AVG return?');
  });
});