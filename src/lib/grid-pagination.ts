/**
 * Pure pagination math for DataGrid — kept framework-free and deterministic so
 * tests (tests/ui/grid-pagination.test.ts) lock the slice boundaries.
 */

export interface PageSlice {
  start: number;
  end: number;
  pages: number;
  page: number;
}

/**
 * Returns the row slice for `page` over `total` rows at `pageSize`.
 * - pageSize <= 0 disables pagination (single page, full range).
 * - out-of-range pages clamp to the nearest valid page.
 */
export function paginate(total: number, page: number, pageSize: number): PageSlice {
  const pages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safe = pageSize > 0 ? Math.min(Math.max(page, 0), pages - 1) : 0;
  const start = pageSize > 0 ? safe * pageSize : 0;
  const end = pageSize > 0 ? Math.min(start + pageSize, total) : total;
  return { start, end, pages, page: safe };
}