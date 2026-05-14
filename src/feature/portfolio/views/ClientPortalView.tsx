"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
  Target,
} from "lucide-react";

import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import { RouteNames } from "@/constants";
import type { PortfolioProject } from "@/feature/portfolio/types";
import { UI_PHASES, type UiPhase } from "@/feature/portfolio/types-display";
import {
  mapPortfolioToUiProject,
  portfolioProgress,
} from "@/feature/portfolio/lib/map-portfolio-display";

const SALES_PAGE = 6;
const LOG_PAGE = 8;

type SalesRow = { kind: "meeting" | "doc"; id: string; title: string; sub: string };

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dotted border-border py-3 text-sm last:border-b-0">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 text-right text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export function ClientPortalView({ project }: { project: PortfolioProject }) {
  const ui = mapPortfolioToUiProject(project);
  const progress = portfolioProgress(project);
  const currentPhaseIndex = UI_PHASES.indexOf(ui.currentPhase as UiPhase);

  const slackSlug = project.slackContactChannel
    .replace(/^#/, "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const salesRows = React.useMemo((): SalesRow[] => {
    const rows: SalesRow[] = [];
    for (const m of project.sales.meetings) {
      rows.push({ kind: "meeting", id: m.id, title: m.title, sub: `Meeting • ${m.date}` });
    }
    for (const d of project.discovery.docs) {
      rows.push({ kind: "doc", id: d.id, title: d.name, sub: `${d.kind} • ${d.path}` });
    }
    return rows;
  }, [project]);

  const {
    page: salesPage,
    setPage: setSalesPage,
    pageItems: pagedSales,
    total: salesTotal,
  } = usePagedItems(salesRows, SALES_PAGE, [ui.currentPhase]);

  const logs = project.build.githubActivity;
  const {
    page: logPage,
    setPage: setLogPage,
    pageItems: pagedLogs,
    total: logTotal,
  } = usePagedItems(logs, LOG_PAGE, [ui.currentPhase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full min-w-0 space-y-6 pb-8"
    >
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand-green/5 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold uppercase text-primary-foreground shadow-lg">
              {project.clientName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold leading-tight text-brand-dark sm:text-3xl">
                {project.projectName}
              </h1>
              <p className="mt-2 text-xs text-muted-foreground">
                Operational channel for{" "}
                <span className="font-semibold text-foreground">{project.clientName}</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 px-4 py-1">
            <DetailRow label="Channel lead">{ui.owner.name}</DetailRow>
            <DetailRow label="Current sync">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
                Active
              </span>
            </DetailRow>
          </div>
        </div>
      </section>

      <a
        href="#"
        className="group flex items-center justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl transition hover:bg-slate-950 dark:bg-slate-950 sm:p-8"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="shrink-0 rounded-xl bg-white/10 p-3 text-sky-200 transition-transform group-hover:scale-105">
            <MessageSquare size={22} />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Operational discussion
            </p>
            <h2 className="truncate text-base font-bold text-white sm:text-lg">
              Join channel #{slackSlug || "aaa-portfolio"}
            </h2>
          </div>
        </div>
        <ArrowUpRight size={20} className="shrink-0 text-white/30 transition-colors group-hover:text-sky-200" />
      </a>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Delivery lifecycle
        </h2>
        <div className="space-y-6">
          {UI_PHASES.map((phase, idx) => {
            const isCompleted = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;
            return (
              <div
                key={phase}
                className={`flex items-start gap-4 ${idx > currentPhaseIndex ? "opacity-25" : ""}`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-[11px] font-bold transition-all duration-500 ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-foreground bg-card text-foreground shadow-md ring-2 ring-border"
                        : "border-border text-muted-foreground/50"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${isCurrent ? "text-brand-dark" : "text-brand-gray"}`}>
                    {phase}
                  </p>
                  {isCurrent ? (
                    <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Detail operational log
          </h2>
          <div className="flex w-fit items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
            <Target size={12} className="text-brand-green" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-brand-dark">
              {ui.currentPhase} feed
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {ui.currentPhase === "Sales" ? (
            <>
              <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4">
                <h3 className="text-xs font-bold text-brand-dark">Meetings & docs</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-brand-gray">
                  Items synced from portfolio config for this engagement.
                </p>
              </div>
              {salesTotal === 0 ? (
                <p className="text-sm text-brand-gray">No meetings or docs in config yet.</p>
              ) : (
                <>
                  <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    {pagedSales.map((row) => (
                      <div
                        key={`${row.kind}-${row.id}`}
                        className="group flex cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="shrink-0 rounded-lg bg-muted p-2.5 text-brand-gray transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-brand-dark group-hover:text-brand-green">
                              {row.title}
                            </p>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-tighter text-brand-gray">
                              {row.sub}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight
                          size={14}
                          className="shrink-0 text-brand-gray/30 group-hover:opacity-100"
                        />
                      </div>
                    ))}
                  </div>
                  <TablePaginationBar
                    page={salesPage}
                    pageSize={SALES_PAGE}
                    total={salesTotal}
                    onPageChange={setSalesPage}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {logTotal === 0 ? (
                <p className="text-sm text-brand-gray">
                  No GitHub activity in config yet. Run CI sync or add{" "}
                  <code className="rounded bg-muted px-1 font-mono text-xs">data_github_activity.json</code>.
                </p>
              ) : (
                <>
                  <div className="relative space-y-8 pl-2">
                    <div className="absolute bottom-0 left-[7px] top-2 w-px bg-border" />
                    {pagedLogs.map((log) => (
                      <div key={log.sha} className="group relative pl-8">
                        <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-border bg-muted transition-colors group-hover:border-brand-green group-hover:bg-brand-green" />
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
                          {log.date?.slice(0, 10) ?? "—"}
                        </p>
                        <h3 className="mb-1 text-sm font-bold text-brand-dark">{log.message.split("\n")[0]}</h3>
                        <a
                          href={log.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-brand-green underline-offset-4 hover:underline"
                        >
                          View commit
                        </a>
                      </div>
                    ))}
                  </div>
                  <TablePaginationBar
                    page={logPage}
                    pageSize={LOG_PAGE}
                    total={logTotal}
                    onPageChange={setLogPage}
                  />
                </>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gray sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2">
            <ShieldCheck size={12} /> Encrypted stream
          </p>
          <Link
            href={RouteNames.projectDetail(project.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-brand-green hover:underline"
          >
            Internal project view →
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
