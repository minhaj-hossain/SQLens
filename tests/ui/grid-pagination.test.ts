import { describe, it, expect } from 'vitest';
import { paginate } from '../../src/lib/grid-pagination';

/**
 * Regressions for DataGrid's pagination math — locked slice boundaries so
 * "Showing N–M of K" footers and page controls stay correct.
 */
describe('paginate', () => {
  it('returns the whole range when pagination is disabled', () => {
    expect(paginate(42, 0, 0)).toEqual({ start: 0, end: 42, pages: 1, page: 0 });
  });

  it('slices exact page sizes and reports page counts', () => {
    expect(paginate(42, 0, 15)).toEqual({ start: 0, end: 15, pages: 3, page: 0 });
    expect(paginate(42, 1, 15)).toEqual({ start: 15, end: 30, pages: 3, page: 1 });
    expect(paginate(42, 2, 15)).toEqual({ start: 30, end: 42, pages: 3, page: 2 });
  });

  it('clamps out-of-range pages instead of wrapping', () => {
    expect(paginate(5, 7, 5)).toEqual({ start: 0, end: 5, pages: 1, page: 0 });
    expect(paginate(42, 99, 15).page).toBe(2);
  });

  it('handles empty datasets safely', () => {
    expect(paginate(0, 0, 10)).toEqual({ start: 0, end: 0, pages: 1, page: 0 });
  });
});