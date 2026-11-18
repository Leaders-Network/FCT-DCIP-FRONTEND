import { useEffect, useMemo, useState } from 'react';
import { paginate } from '@/utils/pagination';

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Pages through a list that is already loaded in memory. Pass the current
// search or filter values as `resetKey` so changing them jumps back to page 1.
export function useClientPagination<T>(items: T[], initialLimit = 10, resetKey?: unknown) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const slice = useMemo(() => paginate(items, page, limit), [items, page, limit]);

  const setLimit = (nextLimit: number) => {
    setLimitState(nextLimit);
    setPage(1);
  };

  return {
    ...slice,
    limit,
    setPage,
    setLimit,
  };
}
