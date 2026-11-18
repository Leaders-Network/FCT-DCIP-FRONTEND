import { describe, expect, it } from 'vitest';
import { paginate, recentMonths } from './pagination';

const items = Array.from({ length: 23 }, (_, index) => index + 1);

describe('paginate', () => {
  it('returns the requested page', () => {
    expect(paginate(items, 2, 10)).toEqual({
      pageItems: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      currentPage: 2,
      totalPages: 3,
      totalRecords: 23,
    });
  });

  it('returns a short last page', () => {
    expect(paginate(items, 3, 10).pageItems).toEqual([21, 22, 23]);
  });

  it('clamps a page past the end to the last page', () => {
    const slice = paginate(items, 9, 10);
    expect(slice.currentPage).toBe(3);
    expect(slice.pageItems).toEqual([21, 22, 23]);
  });

  it('treats an empty list as a single empty page', () => {
    expect(paginate([], 4, 10)).toEqual({ pageItems: [], currentPage: 1, totalPages: 1, totalRecords: 0 });
  });

  it('guards against a zero or invalid limit', () => {
    expect(paginate(items, 1, 0).pageItems).toEqual([1]);
    expect(paginate(items, Number.NaN, 5).currentPage).toBe(1);
  });
});

describe('recentMonths', () => {
  it('lists months newest first and crosses the year boundary', () => {
    const months = recentMonths(3, new Date(2026, 0, 31));
    expect(months.map((month) => month.value)).toEqual(['2026-01', '2025-12', '2025-11']);
    expect(months[0].label).toBe('January 2026');
  });
});
