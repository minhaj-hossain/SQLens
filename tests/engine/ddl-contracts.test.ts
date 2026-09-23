import { describe, it, expect } from 'vitest';
import { extractDdlColumns, extractDdlTableColumns } from '../../src/lib/sql-engine/ddl-columns';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { runAndGradeSubmission, SubmitHooks } from '../../src/lib/sql-engine/submit-pipeline';
import { QueryExecutionResult } from '../../src/types/database';
import { ValidationRule } from '../../src/types/curriculum';
import { Day_27_MODULE } from '../../src/content/modules/day-27-ddl-creating-tables';

/**
 * DDL column contract (Workstream A — DDL audit follow-up):
 *   - extractDdlColumns reads the contract FROM the statement (CREATE/ALTER);
 *   - validator rule 2 fails DDL with "Missing column 'x'" (named feedback);
 *   - the result-grid path for SELECT is unchanged;
 *   - end-to-end: the real Day 27 task rejects a dropped column AND a wrong
 *     type KIND (verifyColumnTypes), passing only on the reference solution.
 */
describe('DDL column contract (Workstream A)', () => {
  // ---------------------------------------------------------------- extractor
  describe('extractDdlColumns', () => {
    it('reads CREATE TABLE columns and skips table-level constraints', () => {
      const cols = extractDdlColumns(
        "CREATE TABLE reviews (review_id INT AUTO_INCREMENT PRIMARY KEY, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), author VARCHAR(40) UNIQUE, FOREIGN KEY (author) REFERENCES users(username), PRIMARY KEY (review_id));"
      );
      expect(cols).toEqual(['review_id', 'rating', 'author']);
    });

    it('handles IF NOT EXISTS and quoted identifiers', () => {
      expect(extractDdlColumns('CREATE TABLE IF NOT EXISTS t (`id` INT, name VARCHAR(20));')).toEqual([
        'id',
        'name',
      ]);
    });

    it('reads ALTER ... ADD COLUMN (multiple ADDs) and ignores ADD constraints', () => {
      expect(
        extractDdlColumns(
          'ALTER TABLE products ADD COLUMN tagline VARCHAR(120), ADD COLUMN featured BOOLEAN;'
        )
      ).toEqual(['tagline', 'featured']);
      expect(extractDdlTableColumns('ALTER TABLE products ADD UNIQUE (name);')).toEqual([]);
    });

    it('returns [] for SELECT/DML/DROP-only statements', () => {
      expect(extractDdlColumns('SELECT id FROM t;')).toEqual([]);
      expect(extractDdlColumns('DROP TABLE IF EXISTS staging;')).toEqual([]);
      expect(extractDdlColumns("INSERT INTO t (a) VALUES (1);")).toEqual([]);
    });
  });

  // ----------------------------------------------------------------- validator
  describe('validator rule 2 — DDL branch', () => {
    const ddlResult: QueryExecutionResult = {
      success: true,
      columns: [],
      rows: [],
      rowCount: 1,
      executionTimeMs: 1,
      affectedRows: 1,
    };

    it('names a missing column against the STATEMENT, not the empty result grid', () => {
      const rule: ValidationRule = { requiredColumns: ['tag_id', 'tag_name'] };
      const out = validateTaskSolution('CREATE TABLE product_tags (tag_id INT);', ddlResult, rule);
      expect(out.passed).toBe(false);
      expect(out.feedback).toMatch(/Missing column 'tag_name'/);
      expect(out.feedback).toMatch(/declares: \[tag_id\]/);
    });

    it('passes when every required column is declared', () => {
      const rule: ValidationRule = { requiredColumns: ['tag_id', 'tag_name'] };
      const out = validateTaskSolution(
        'CREATE TABLE product_tags (tag_id INT, tag_name VARCHAR(50));',
        ddlResult,
        rule
      );
      expect(out.passed).toBe(true);
    });

    it('keeps the result-grid path for SELECT projections', () => {
      const rule: ValidationRule = { requiredColumns: ['city'] };
      const selResult: QueryExecutionResult = { ...ddlResult, columns: ['name'] };
      const out = validateTaskSolution('SELECT name FROM customers;', selResult, rule);
      expect(out.passed).toBe(false);
      expect(out.feedback).toMatch(/Missing column 'city'/);
      expect(out.feedback).toMatch(/outputs: \[name\]/);
    });
  });

  // ----------------------------------------------------------------- end-to-end
  describe('end-to-end on the real Day 27 task (day20-c1-t1)', () => {
    const task = Day_27_MODULE.concepts[0].tasks[0];

    function makeHooks(): SubmitHooks {
      const ex = new SqlExecutor();
      ex.allowDdlOverwrite = true;
      return {
        execute: (s: string) => ex.executeQuery(s),
        getDatabaseState: () => ex.getDatabaseState(),
        getCommittedState: () => ex.getCommittedState(),
        getTransactionState: () => ex.getTransactionState(),
        resetDatabase: () => ex.resetDatabase(),
      };
    }

    it('the task carries the contract (requiredColumns + verifyColumnTypes)', () => {
      expect(task.id).toBe('day20-c1-t1');
      expect(task.validation.requiredColumns).toEqual(['tag_id', 'tag_name']);
      expect(task.validation.verifyColumnTypes).toBe(true);
    });

    it('the reference solution passes', () => {
      const out = runAndGradeSubmission({
        task,
        sql: task.solutionSql,
        hooks: makeHooks(),
        surface: 'lesson',
        record: false,
      });
      expect(out.passed).toBe(true);
      expect(out.feedback).not.toMatch(/Missing column/);
    });

    it('a dropped column fails with NAMED feedback at the validation stage', () => {
      const out = runAndGradeSubmission({
        task,
        sql: 'CREATE TABLE product_tags (tag_id INT);',
        hooks: makeHooks(),
        surface: 'lesson',
        record: false,
      });
      expect(out.passed).toBe(false);
      expect(out.feedback).toMatch(/Missing column 'tag_name'/);
    });

    it('a wrong type KIND fails (verifyColumnTypes), naming the column', () => {
      const out = runAndGradeSubmission({
        task,
        sql: 'CREATE TABLE product_tags (tag_id INT, tag_name INT);',
        hooks: makeHooks(),
        surface: 'lesson',
        record: false,
      });
      expect(out.passed).toBe(false);
      expect(out.feedback).toMatch(/was declared as a number type/);
      expect(out.feedback).toMatch(/requires a text type/);
    });
  });
});