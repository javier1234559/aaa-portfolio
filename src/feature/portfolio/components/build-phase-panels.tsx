"use client";

import * as React from "react";
import { Github, Layout } from "lucide-react";

import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import { cn } from "@/lib/utils";
import type { PortfolioProject } from "@/feature/portfolio/types";

const BUILD_COMMIT_PAGE = 6;
const BUILD_JIRA_PAGE = 8;

function flattenJiraRows(project: PortfolioProject) {
  const rows: { key: string; title: string; stream: string; done: boolean }[] = [];
  for (const g of project.build.jiraGroups) {
    for (const t of g.tickets) {
      rows.push({
        key: t.key,
        title: t.summary,
        stream: g.status,
        done: Boolean(t.closedAt),
      });
    }
  }
  return rows;
}

export function BuildCommitsPanel({
  commits,
  repoUrl,
}: {
  commits: PortfolioProject["build"]["githubActivity"];
  repoUrl: string | null;
}) {
  const sorted = React.useMemo(
    () => [...commits].sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [commits],
  );
  const { page, setPage, pageItems, total } = usePagedItems(sorted, BUILD_COMMIT_PAGE, [commits]);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-2">
        <h5 className="flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
          <Github className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          Recent commits
        </h5>
        {repoUrl ? (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[9px] font-mono uppercase tracking-wide text-primary hover:underline"
          >
            Open repo →
          </a>
        ) : null}
      </div>
      {pageItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No synced commits yet.</p>
      ) : (
        <div className="divide-y divide-border font-mono">
          {pageItems.map((c) => (
            <div
              key={c.sha}
              className="group relative flex gap-3 border-l-4 border-transparent py-3 pl-3 transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary"
            >
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center self-start rounded-sm bg-primary px-1.5 py-px text-[10px] font-medium leading-tight text-primary-foreground transition-colors group-hover:bg-primary-foreground group-hover:text-primary group-hover:ring-1 group-hover:ring-white/40"
                >
                  {c.sha.slice(0, 7)}
                </a>
              ) : (
                <span className="inline-flex shrink-0 items-center self-start rounded-sm bg-primary px-1.5 py-px text-[10px] font-medium leading-tight text-primary-foreground transition-colors group-hover:bg-primary-foreground group-hover:text-primary">
                  {c.sha.slice(0, 7)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-white">
                  {c.message}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground transition-colors group-hover:text-white/85">
                  {c.date?.slice(0, 10) ?? "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {total > BUILD_COMMIT_PAGE ? (
        <TablePaginationBar
          page={page}
          pageSize={BUILD_COMMIT_PAGE}
          total={total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

export function BuildJiraPanel({ project }: { project: PortfolioProject }) {
  const rows = React.useMemo(() => flattenJiraRows(project), [project]);
  const { page, setPage, pageItems, total } = usePagedItems(rows, BUILD_JIRA_PAGE, [project]);
  return (
    <div>
      <div className="mb-4 border-b border-border pb-2">
        <h5 className="flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
          <Layout className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          Jira activity
        </h5>
      </div>
      {pageItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No tickets in snapshot.</p>
      ) : (
        <div className="divide-y divide-border">
          {pageItems.map((t) => (
            <div
              key={t.key}
              className="group relative flex flex-col gap-1 border-l-4 border-transparent py-3 pl-3 transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-mono text-xs font-semibold text-muted-foreground transition-colors group-hover:text-white/90">
                  {t.key}
                </span>
                <span className="min-w-0 text-sm font-medium text-foreground transition-colors group-hover:text-white">
                  {t.title}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="max-w-[10rem] truncate text-[10px] font-mono uppercase tracking-tight text-muted-foreground transition-colors group-hover:text-white/80 sm:max-w-xs">
                  {t.stream}
                </span>
                <span
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                    t.done
                      ? "bg-primary text-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary"
                      : "border border-primary/45 bg-card text-primary group-hover:border-white/40 group-hover:bg-primary-foreground group-hover:text-primary",
                  )}
                >
                  {t.done ? "Done" : "Open"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {total > BUILD_JIRA_PAGE ? (
        <TablePaginationBar page={page} pageSize={BUILD_JIRA_PAGE} total={total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}

