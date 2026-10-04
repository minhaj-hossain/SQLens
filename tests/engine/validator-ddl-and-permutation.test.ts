import { describe, it, expect } from 'vitest';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';
import type { QueryExecutionResult } from '../../src/types/database';
import type { ValidationRule } from '../../src/types/curriculum';

describe('Validator Engine — Phase 1 Hardening', () => {
  const dummyResult: QueryExecutionResult = {
    success: true,
    columns: [],
    rows: [],
    rowCount: 0,
    executionTimeMs: 1,
  };

  describe('Native DDL & Procedural Rules (Step 1.1 & 1.2)', () => {
    it('enforces WITH CHECK OPTION with clear guidance', () => {
      const rule: ValidationRule = { requireWithCheckOption: true };
      const failed = validateTaskSolution(
        'CREATE VIEW v_active AS SELECT id FROM users WHERE active = 1;',
        dummyResult,
        rule
      );
      expect(failed.passed).toBe(false);
      expect(failed.feedback).toContain('WITH CHECK OPTION');
      expect(failed.feedback).not.toContain('filter should use');

      const passed = validateTaskSolution(
        'CREATE VIEW v_active AS SELECT id FROM users WHERE active = 1 WITH CHECK OPTION;',
        dummyResult,
        rule
      );
      expect(passed.passed).toBe(true);
    });

    it('enforces OR REPLACE with clear guidance', () => {
      const rule: ValidationRule = { requireOrReplace: true };
      const failed = validateTaskSolution(
        'CREATE VIEW v_stock AS SELECT id, qty FROM products;',
        dummyResult,
        rule
      );
      expect(failed.passed).toBe(false);
      expect(failed.feedback).toContain('CREATE OR REPLACE');
      expect(failed.feedback).not.toContain('filter should use');

      const passed = validateTaskSolution(
        'CREATE OR REPLACE VIEW v_stock AS SELECT id, qty FROM products;',
        dummyResult,
        rule
      );
      expect(passed.passed).toBe(true);
    });

    it('enforces DROP <object> with domain-specific feedback', () => {
      const ruleProc: ValidationRule = { requireDropObject: 'PROCEDURE' };
      const failed = validateTaskSolution(
        'CREATE PROCEDURE sp_test() BEGIN SELECT 1; END; CALL sp_test();',
        dummyResult,
        ruleProc
      );
      expect(failed.passed).toBe(false);
      expect(failed.feedback).toContain('DROP PROCEDURE');
      expect(failed.feedback).not.toContain('filter should use');

      const passed = validateTaskSolution(
        'CREATE PROCEDURE sp_test() BEGIN SELECT 1; END; CALL sp_test(); DROP PROCEDURE sp_test;',
        dummyResult,
        ruleProc
      );
      expect(passed.passed).toBe(true);
    });

    it('enforces UPDATE statement in multi-statement scripts', () => {
      const rule: ValidationRule = { requireUpdate: true };
      const failed = validateTaskSolution('SELECT * FROM orders;', dummyResult, rule);
      expect(failed.passed).toBe(false);
      expect(failed.feedback).toContain('UPDATE statement');

      const passed = validateTaskSolution(
        'UPDATE orders SET status = "shipped" WHERE id = 1;',
        dummyResult,
        rule
      );
      expect(passed.passed).toBe(true);
    });
  });

  describe('Consistent Column Permutation Matching & Bug Fixes (Step 1.3)', () => {
    it('rejects inverted column logic when column names match (fixing rowKey cell multiset bug)', () => {
      // Expected result: winner = Alice, loser = Bob
      const expected: QueryExecutionResult = {
        success: true,
        columns: ['winner', 'loser'],
        rows: [{ winner: 'Alice', loser: 'Bob' }],
        rowCount: 1,
        executionTimeMs: 1,
      };

      // Learner query returned: winner = Bob, loser = Alice (inverted logic!)
      const invertedResult: QueryExecutionResult = {
        success: true,
        columns: ['winner', 'loser'],
        rows: [{ winner: 'Bob', loser: 'Alice' }],
        rowCount: 1,
        executionTimeMs: 1,
      };

      const rule: ValidationRule = { requireExactResult: true };
      const verdict = validateTaskSolution(
        'SELECT winner, loser FROM matches;',
        invertedResult,
        rule,
        expected
      );

      // In the old validator, Object.values().sort() made ['Alice', 'Bob'] === ['Alice', 'Bob'] and falsely passed!
      // In the hardened validator, column names align to index [0, 1], so it correctly fails.
      expect(verdict.passed).toBe(false);
      expect(verdict.feedback).toContain('The returned data does not match the expected result set');
    });

    it('accepts legitimate column re-ordering when values align consistently', () => {
      const expected: QueryExecutionResult = {
        success: true,
        columns: ['name', 'city'],
        rows: [
          { name: 'Alice', city: 'Dhaka' },
          { name: 'Bob', city: 'Sylhet' },
        ],
        rowCount: 2,
        executionTimeMs: 1,
      };

      // Learner returned SELECT city, name
      const reorderedResult: QueryExecutionResult = {
        success: true,
        columns: ['city', 'name'],
        rows: [
          { city: 'Dhaka', name: 'Alice' },
          { city: 'Sylhet', name: 'Bob' },
        ],
        rowCount: 2,
        executionTimeMs: 1,
      };

      const rule: ValidationRule = { requireExactResult: true };
      const verdict = validateTaskSolution(
        'SELECT city, name FROM customers;',
        reorderedResult,
        rule,
        expected
      );

      expect(verdict.passed).toBe(true);
      expect(verdict.feedback).toContain('Success');
    });
  });

  describe('Enhanced Column Count & Projection Diagnostics (Step 1.4)', () => {
    it('provides clear actionable guidance showing expected column names when column count differs', () => {
      const expected: QueryExecutionResult = {
        success: true,
        columns: ['customer_id', 'name', 'email'],
        rows: [{ customer_id: 1, name: 'Alice', email: 'alice@example.com' }],
        rowCount: 1,
        executionTimeMs: 1,
      };

      // Learner wrote SELECT *
      const starResult: QueryExecutionResult = {
        success: true,
        columns: ['customer_id', 'name', 'email', 'phone', 'city', 'country', 'created_at'],
        rows: [{ customer_id: 1, name: 'Alice', email: 'a@b.com', phone: '123', city: 'D', country: 'BD', created_at: 'now' }],
        rowCount: 1,
        executionTimeMs: 1,
      };

      const rule: ValidationRule = { requireExactResult: true };
      const verdict = validateTaskSolution('SELECT * FROM customers;', starResult, rule, expected);

      expect(verdict.passed).toBe(false);
      expect(verdict.feedback).toContain('Your query returned 7 column(s)');
      expect(verdict.feedback).toContain('[customer_id, name, email]');
      expect(verdict.feedback).toContain('Explicitly specify only the requested columns in your SELECT clause');
    });
  });
});
