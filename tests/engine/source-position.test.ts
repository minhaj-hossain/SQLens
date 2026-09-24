import { describe, it, expect } from 'vitest';
import {
  errorPositionFields,
  extractNamedToken,
  locateToken,
  maskNonTokenText,
  offsetToLineCol,
  shiftPosition,
  statementStartPosition,
} from '../../src/lib/sql-engine/source-position';

/**
 * M4 P4.17 — the engine now reports WHERE an error is, not just what failed.
 * These tests pin the source-map primitives: the mask must never let a name
 * inside a comment or a string literal be "located", the offsets must map to
 * the exact characters in the ORIGINAL text, and an ambiguous name must be
 * reported as first-of-many instead of as a confident position.
 */
describe('engine source positions (M4 P4.17)', () => {
  describe('maskNonTokenText', () => {
    it('blanks line, # and block comments but preserves length and newlines', () => {
      const sql = 'SELECT 1 -- emial\nFROM t /* emial */ WHERE x = 1';
      const mask = maskNonTokenText(sql);
      expect(mask.length).toBe(sql.length);
      expect(mask.split('\n').length).toBe(sql.split('\n').length);
      expect(mask).not.toContain('emial');
      expect(mask).toContain('SELECT 1');
    });

    it('blanks string literals, including escaped and doubled quotes', () => {
      const sql = `SELECT 'emial', 'it''s', "emial" FROM products`;
      const mask = maskNonTokenText(sql);
      expect(mask.toLowerCase()).not.toContain('emial');
      // `products` is real code and must stay visible.
      expect(mask).toContain('products');
    });
  });

  describe('offsetToLineCol', () => {
    it('is 1-based at the first char, after a newline, and on CRLF text', () => {
      expect(offsetToLineCol('SELECT 1', 0)).toEqual({ line: 1, col: 1 });
      expect(offsetToLineCol('SELECT 1', 7)).toEqual({ line: 1, col: 8 });
      expect(offsetToLineCol('a\nbc', 2)).toEqual({ line: 2, col: 1 });
      expect(offsetToLineCol('a\r\nbc', 3)).toEqual({ line: 2, col: 1 });
    });
  });

  describe('locateToken', () => {
    it('finds the token and counts every real occurrence', () => {
      const found = locateToken('SELECT emial FROM t WHERE emial > 1', 'emial');
      expect(found?.line).toBe(1);
      expect(found?.col).toBe(8);
      expect(found?.offsetStart).toBe(7);
      expect(found?.offsetEnd).toBe(12);
      expect(found?.occurrences).toBe(2);
    });

    it('never matches inside a string literal or a comment', () => {
      expect(locateToken("SELECT 'emial' FROM products", 'emial')).toBeNull();
      expect(locateToken('-- emial\nSELECT 1', 'emial')).toBeNull();
    });

    it('finds the real occurrence when the name also appears in a comment', () => {
      const found = locateToken('-- emial\nSELECT emial FROM products', 'emial');
      expect(found?.line).toBe(2);
      expect(found?.col).toBe(8);
      expect(found?.occurrences).toBe(1);
    });

    it('matches whole words only, case-insensitively', () => {
      expect(locateToken('SELECT email_address FROM t', 'email')).toBeNull();
      expect(locateToken('SELECT EMial FROM t', 'emial')?.col).toBe(8);
    });

    it('treats regex metacharacters in the token literally', () => {
      const found = locateToken('CREATE TABLE t (id VARCHR(20));', 'VARCHR');
      expect(found?.col).toBe(20);
      expect(found?.offsetEnd).toBe(25);
    });

    it('returns null for an empty token', () => {
      expect(locateToken('SELECT 1', '')).toBeNull();
    });
  });

  describe('extractNamedToken', () => {
    it('mirrors the editor priority: DDL type → missing type → table → column → near', () => {
      expect(extractNamedToken("Unknown data type 'VARCHR(20)' for column 'id'")).toEqual({
        token: 'VARCHR',
        kind: 'syntax',
        isDataType: true,
      });
      expect(extractNamedToken("Column 'id' needs a data type (e.g. id INT).")).toEqual({
        token: 'id',
        kind: 'generic',
        isDataType: false,
      });
      expect(extractNamedToken("Table 'custmers' does not exist.")).toEqual({
        token: 'custmers',
        kind: 'table',
        isDataType: false,
      });
      expect(extractNamedToken("Unknown column 'emial' in 'field list'")).toEqual({
        token: 'emial',
        kind: 'column',
        isDataType: false,
      });
      expect(extractNamedToken("Syntax error near 'FORM'")).toEqual({
        token: 'FORM',
        kind: 'syntax',
        isDataType: false,
      });
      expect(extractNamedToken('Unsupported statement type')).toEqual({
        kind: 'generic',
        isDataType: false,
      });
    });

    it('strips a table qualifier from a dotted column name', () => {
      expect(extractNamedToken('no such column: p.emial').token).toBe('emial');
    });
  });

  describe('statementStartPosition', () => {
    it('skips leading comments and whitespace to the first real word', () => {
      const sql = '-- note\n\n  MERGE INTO t VALUES (1);';
      const pos = statementStartPosition(sql);
      expect(pos?.line).toBe(3);
      expect(pos?.col).toBe(3);
      expect(pos?.offsetEnd).toBe((pos?.offsetStart ?? 0) + 'MERGE'.length);
    });

    it('returns null when there is no real SQL', () => {
      expect(statementStartPosition('-- just a note\n')).toBeNull();
      expect(statementStartPosition('')).toBeNull();
    });
  });

  describe('shiftPosition', () => {
    it('re-anchors a per-statement position onto the full multi-statement script', () => {
      const script = 'BEGIN;\nSELECT 1;\nSELECT emial FROM products;\nCOMMIT;';
      const statement = 'SELECT emial FROM products';
      const base = script.indexOf(statement);
      const local = locateToken(statement, 'emial');
      expect(local?.line).toBe(1);

      const shifted = shiftPosition(script, local!, base);
      expect(shifted.line).toBe(3);
      expect(shifted.col).toBe(8);
      expect(script.slice(shifted.offsetStart, shifted.offsetEnd)).toBe('emial');
    });
  });

  describe('errorPositionFields', () => {
    it('bundles the position with the occurrence count', () => {
      expect(errorPositionFields("Unknown column 'emial'", 'SELECT emial FROM t')).toEqual({
        errorPosition: { line: 1, col: 8, offsetStart: 7, offsetEnd: 12 },
        errorTokenOccurrences: 1,
      });
    });

    it('reports nothing when the name is unlocatable or the message quotes none', () => {
      expect(errorPositionFields("Unknown column 'emial'", "SELECT 'emial' FROM t")).toEqual({});
      expect(errorPositionFields('Unsupported statement type', 'SELECT 1')).toEqual({});
      expect(errorPositionFields(null, 'SELECT 1')).toEqual({});
    });
  });
});
