export interface PageSlice<T> {
  pageItems: T[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

// Slices one page out of a list held in memory. An out-of-range page is
// clamped, so a filter that shrinks the list never leaves an empty page.
export function paginate<T>(items: T[], page: number, limit: number): PageSlice<T> {
  const safeLimit = Math.max(1, Math.floor(limit) || 1);
  const totalRecords = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / safeLimit));
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (currentPage - 1) * safeLimit;

  return {
    pageItems: items.slice(start, start + safeLimit),
    currentPage,
    totalPages,
    totalRecords,
  };
}

export interface MonthOption {
  /** YYYY-MM, the format the enforcement API expects */
  value: string;
  label: string;
}

// The most recent `count` months, newest first, starting with the month of `now`.
export function recentMonths(count: number, now: Date = new Date()): MonthOption[] {
  const options: MonthOption[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    options.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
  }
  return options;
}
