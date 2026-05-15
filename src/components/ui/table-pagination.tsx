"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
};

const chevronBtn =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-muted/80 disabled:pointer-events-none disabled:text-muted-foreground/35";

/** Minimal range + chevrons (flat, no outline buttons). */
export function TablePaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  const rangeLabel =
    total === 0 ? "No results" : `${start} - ${end} of ${total} results`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-6 border-t border-border/80 px-3 py-2.5 sm:gap-10 sm:px-4",
        className,
      )}
    >
      <p className="mr-auto min-w-0 text-sm tabular-nums text-foreground/80">{rangeLabel}</p>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={chevronBtn}
          disabled={safePage <= 1 || total === 0}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          className={chevronBtn}
          disabled={safePage >= totalPages || total === 0}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/**
 * Client-side pagination over an array. Resets to page 1 when `resetDeps` change.
 * `page` is clamped to valid range when `total` shrinks.
 */
export function usePagedItems<T>(
  items: readonly T[],
  pageSize: number,
  resetDeps: React.DependencyList,
) {
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page when source list/project identity changes
    setPage(1);
  }, resetDeps); // eslint-disable-line react-hooks/exhaustive-deps -- opaque dependency bundle from callers

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep page valid when total shrinks
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageItems = React.useMemo(
    () => (total === 0 ? [] : items.slice((safePage - 1) * pageSize, safePage * pageSize)),
    [items, safePage, pageSize, total],
  );

  return { page: safePage, setPage, totalPages, pageItems, total };
}
