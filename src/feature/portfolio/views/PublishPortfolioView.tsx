"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ExternalLink, Globe, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import { RouteNames } from "@/constants";
import type { UiProject } from "@/feature/portfolio/types-display";
import { cn } from "@/lib/utils";

function formatLastSync(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PublishPortfolioView({ projects }: { projects: UiProject[] }) {
  const published = projects.filter((p) => p.isPublished);
  const [query, setQuery] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);
  const toastHide = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = React.useCallback((message: string) => {
    if (toastHide.current) clearTimeout(toastHide.current);
    setToast(message);
    toastHide.current = setTimeout(() => setToast(null), 4000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (toastHide.current) clearTimeout(toastHide.current);
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return published;
    return published.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [published, query]);

  const TABLE_PAGE_SIZE = 10;
  const { page, setPage, pageItems, total: tableTotal } = usePagedItems(
    filtered,
    TABLE_PAGE_SIZE,
    [query],
  );

  const triggerSync = React.useCallback(() => {
    showToast("Portal sync is not implemented yet.");
  }, [showToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="min-w-0 space-y-8"
    >
      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border border-border bg-popover px-4 py-3 text-center text-sm text-popover-foreground shadow-lg"
        >
          {toast}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display mb-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Public Channels
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage client-facing operational portals.
          </p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
              <Globe size={18} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold uppercase tracking-tight text-foreground">
                Active Shared Portals
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {tableTotal === 0
                  ? "No portals match filter"
                  : `${tableTotal} match${tableTotal === 1 ? "" : "es"} · ${published.length} published`}
              </p>
            </div>
          </div>
          <div className="relative min-w-0 max-w-md flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              variant="default"
              type="search"
              placeholder="Find portal…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full min-w-0 pl-9"
              aria-label="Filter portals"
            />
          </div>
        </div>

      <div className="thin-scrollbar min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:px-6">
                  Project name
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:px-6">
                  Last sync
                </th>
                <th className="w-28 whitespace-nowrap px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:w-32 md:px-6">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((project) => (
                <tr key={project.slug} className="group transition-colors hover:bg-muted/50">
                  <td className="min-w-0 px-4 py-4 align-middle md:px-6 md:py-4">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                        {project.name}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">{project.client}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 align-middle text-muted-foreground md:px-6">
                    {formatLastSync(project.nextMilestone.date)}
                  </td>
                  <td className="px-4 py-4 text-right align-middle md:px-6">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-9 w-9 text-muted-foreground hover:text-foreground")}
                        aria-label={`Sync portal ${project.name}`}
                        onClick={triggerSync}
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                        <Link
                          href={RouteNames.clientPortal(project.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open publish detail for ${project.name} (new tab)`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePaginationBar
          page={page}
          pageSize={TABLE_PAGE_SIZE}
          total={tableTotal}
          onPageChange={setPage}
        />
      </div>
    </motion.div>
  );
}
