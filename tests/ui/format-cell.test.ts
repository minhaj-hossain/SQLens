import { describe, it, expect } from 'vitest';
import {
  formatCell,
  inferCellType,
  resolveCellType,
  cellAlign,
  moneyColumnName,
  cellTypeFromSchema,
} from '../../src/lib/format-cell';

/**
 * Regression tests for the type-aware cell formatter powering DataGrid.
 * Locks the "readable data" contract: money keeps 2 decimals, integers stay
 * integers, float dust is stripped, money wins on money-lookalike columns.
 */
describe('formatCell', () => {
  it('keeps 2 decimals for money — never degrades 120.00 to 120', () => {
    expect(formatCell(120, 'money')).toBe('120.00');
    expect(formatCell(15.99, 'money')).toBe('15.99');
    expect(formatCell(120.0, 'money')).toBe('120.00');
    expect(formatCell(0, 'money')).toBe('0.00');
  });

  it('renders schema decimals without redundant trailing zeros when whole', () => {
    expect(formatCell(120, 'decimal')).toBe('120');
    expect(formatCell(15.99, 'decimal')).toBe('15.99');
    expect(formatCell(12.5, 'decimal')).toBe('12.50');
  });

  it('strips float dust from plain numbers but preserves integers', () => {
    expect(formatCell(0.1 + 0.2, 'number')).toBe('0.3');
    expect(formatCell(28, 'number')).toBe('28');
    expect(formatCell(45.5, 'number')).toBe('45.5');
  });

  it('keeps ISO dates stable and null as NULL', () => {
    expect(formatCell('2026-08-21', 'date')).toBe('2026-08-21');
    expect(formatCell(null, 'date')).toBe('NULL');
    expect(formatCell('1995-03-01', 'string')).toBe('1995-03-01');
  });
});

describe('inferCellType', () => {
  it('labels money-lookalike columns money even when the values are integers', () => {
    expect(inferCellType('price', [120, 15.99])).toBe('money');
    expect(inferCellType('total_price', [120, 0])).toBe('money');
    expect(inferCellType('Order.Unit_Price', [4.99])).toBe('money');
    expect(inferCellType('quantity', [1, 2, 3])).toBe('number');
  });

  it('distinguishes integers, decimals and null-only columns', () => {
    expect(inferCellType('quantity_in_stock', [10, 0, 3])).toBe('number');
    expect(inferCellType('rating', [4.5, 3.75])).toBe('decimal');
    expect(inferCellType('email', [null, null])).toBe('null');
  });

  it('detects date-like strings and booleans', () => {
    expect(inferCellType('order_date', ['2026-08-21', '2026-09-01'])).toBe('date');
    expect(inferCellType('in_stock', [true, false])).toBe('boolean');
  });

  it('falls back to string for mixed or untyped data', () => {
    expect(inferCellType('note', ['a', null, 'b'])).toBe('string');
    expect(inferCellType('mix', [1, 'a'])).toBe('string');
  });
});

describe('resolveCellType — precedence', () => {
  it('explicit override wins', () => {
    expect(resolveCellType('price', [120], { explicit: 'string' })).toBe('string');
  });

  it('schema type applies, with money name bias on decimals', () => {
    expect(resolveCellType('price', [120], { schemaType: 'decimal' })).toBe('money');
    expect(resolveCellType('quantity', [5], { schemaType: 'number' })).toBe('number');
    expect(resolveCellType('signup_date', ['2026-08-21'], { schemaType: 'date' })).toBe('date');
  });

  it('falls back to value inference with no schema', () => {
    expect(resolveCellType('name', ['a'], undefined)).toBe('string');
    expect(resolveCellType('price', [120], undefined)).toBe('money');
  });
});

describe('cellAlign & helpers', () => {
  it('right-aligns numeric types with tabular-nums', () => {
    expect(cellAlign('money')).toBe('text-right tabular-nums');
    expect(cellAlign('number')).toBe('text-right tabular-nums');
    expect(cellAlign('date')).toBe('tabular-nums');
    expect(cellAlign('string')).toBe('');
  });

  it('maps schema types deterministically', () => {
    expect(cellTypeFromSchema('decimal')).toBe('decimal');
    expect(cellTypeFromSchema('date')).toBe('date');
    expect(cellTypeFromSchema('bogus')).toBe('unknown');
  });

  it('moneyColumnName catches qualified and alias names', () => {
    expect(moneyColumnName('price')).toBe(true);
    expect(moneyColumnName('unit_price')).toBe(true);
    expect(moneyColumnName('products.price')).toBe(true);
    expect(moneyColumnName('quantity_in_stock')).toBe(false);
    expect(moneyColumnName('name')).toBe(false);
  });
});