import { describe, it, expect } from 'vitest';
import { formatSql } from '../../src/lib/format-sql';

describe('formatSql — DDL vocabulary (Workstream C)', () => {
  it('uppercases data types while keeping precision as-typed', () => {
    expect(formatSql('create table t (id int, price decimal(10,2));')).toBe(
      'CREATE TABLE t (id INT, price DECIMAL(10,2));',
    );
  });

  it('uppercases IF [NOT] EXISTS modifiers', () => {
    expect(formatSql('drop table if exists staging;')).toContain('DROP TABLE IF EXISTS staging;');
    expect(formatSql('create table if not exists t (id int);')).toContain(
      'CREATE TABLE IF NOT EXISTS t (id INT);',
    );
  });

  it('uppercases CHECK / constraint keywords and VIEW forms', () => {
    expect(formatSql('create table t (score int check (score > 0));')).toContain(
      'score INT CHECK (score > 0)',
    );
    expect(formatSql('create or replace view v as select 1;')).toContain(
      'CREATE OR REPLACE VIEW',
    );
  });
});