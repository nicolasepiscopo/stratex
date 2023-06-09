import { useState } from "react";

interface UsePaginatedResultsOptions {
  pageSize: number;
}

export function usePaginatedResults <T>(results: T[], { pageSize }: UsePaginatedResultsOptions = { pageSize: 10 }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(results.length / pageSize);
  const paginatedResults = results.slice(page * pageSize, (page + 1) * pageSize);

  return {
    page,
    setPage,
    pageCount,
    paginatedResults,
  } as const;
}