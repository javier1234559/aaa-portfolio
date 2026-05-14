"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import { RouteNames } from "@/constants";
import type { UiProject } from "@/feature/portfolio/types-display";
import { PhaseBadge } from "@/feature/portfolio/components/phase-badge";

const PAGE_SIZE = 10;

export function PortfolioProjectTable({ projects }: { projects: UiProject[] }) {
  const orderKey = projects.map((p) => p.slug).join("|");
  const { page, setPage, pageItems, total } = usePagedItems(projects, PAGE_SIZE, [orderKey]);

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:px-6">
                Project & client
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:px-6">
                Current phase
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:px-6">
                Lead
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:px-6">
                Timeline
              </th>
              <th className="w-36 whitespace-nowrap px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:px-6 md:w-40">
                Progress
              </th>
              <th className="w-10 px-2 py-3 md:px-3" aria-hidden />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.map((project) => (
              <tr key={project.slug} className="group transition-colors hover:bg-muted/40">
                <td className="max-w-[200px] px-4 py-4 align-middle md:max-w-[260px] md:px-6 md:py-4">
                  <Link
                    href={RouteNames.projectDetail(project.slug)}
                    className="flex min-w-0 flex-col"
                  >
                    <span className="truncate text-xs font-medium text-muted-foreground">
                      {project.client}
                    </span>
                    <span className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                      {project.name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-4 align-middle md:px-6">
                  <PhaseBadge phase={project.currentPhase} />
                </td>
                <td className="px-4 py-4 align-middle md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {project.owner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-medium text-foreground">
                        {project.owner.name}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {project.owner.role}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="max-w-[220px] px-4 py-4 align-middle md:px-6">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[11px] font-medium leading-snug text-foreground">
                      Next: {project.nextMilestone.title}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">
                      {project.nextMilestone.date}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right align-middle md:px-6">
                  <div className="ml-auto flex max-w-[140px] flex-col items-end">
                    <span className="mb-1 text-xs font-bold tabular-nums text-foreground">
                      {project.progress}%
                    </span>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4 text-right text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:px-3">
                  <Link href={RouteNames.projectDetail(project.slug)} aria-label="Open project">
                    <ChevronRight size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePaginationBar
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
