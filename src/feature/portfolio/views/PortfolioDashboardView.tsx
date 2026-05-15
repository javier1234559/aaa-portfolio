"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Filter,
  Plus,
  TrendingUp,
} from "lucide-react";

import { formatMoney } from "@/feature/portfolio/lib/portfolio-commercial";
import type { PortfolioCommercialRollup } from "@/feature/portfolio/lib/portfolio-commercial";
import type { UiProject } from "@/feature/portfolio/types-display";
import { PortfolioProjectTable } from "@/feature/portfolio/components/portfolio-project-table";
import { PortfolioRevenueChart } from "@/feature/portfolio/components/portfolio-revenue-chart";
import type { PortfolioProject } from "@/feature/portfolio/types";
import { RouteNames } from "@/constants";

export function PortfolioDashboardView({
  projects,
  portfolioRows,
  stats,
}: {
  projects: UiProject[];
  portfolioRows: PortfolioProject[];
  stats: {
    total: number;
    clientCount: number;
    inBuild: number;
    maintenance: number;
    revenue: PortfolioCommercialRollup;
  };
}) {
  const { revenue } = stats;
  const hasRevenue = revenue.projectsWithCommercial > 0;
  const [showNewProject, setShowNewProject] = React.useState(false);
  const [newProjectStep, setNewProjectStep] = React.useState(1);
  const [newProjectName, setNewProjectName] = React.useState("");

  const statCards = [
    {
      label: "Total Portfolio",
      value: stats.total,
      sub: `Across ${stats.clientCount} client${stats.clientCount === 1 ? "" : "s"}`,
      icon: Activity,
      color: "text-brand-green",
    },
    {
      label: "In Build Phase",
      value: stats.inBuild,
      sub: "Highest effort phase",
      icon: TrendingUp,
      color: "text-violet-600",
    },
    {
      label: "Completed (MTN)",
      value: stats.maintenance,
      sub: "In maintenance phase",
      icon: CheckCircle2,
      color: "text-blue-600",
    },
    ...(hasRevenue
      ? [
          {
            label: "Revenue forecast",
            value: formatMoney(revenue.totalForecast, revenue.currency),
            sub: `${formatMoney(revenue.totalContracted, revenue.currency)} contracted · ${revenue.projectsWithCommercial} with $ data`,
            icon: TrendingUp,
            color: "text-emerald-600",
            isText: true as const,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display mb-1 text-4xl font-bold tracking-tight text-brand-dark">
            Portfolio Intelligence
          </h1>
          <p className="text-sm text-brand-gray">
            Central command for all client delivery operations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowNewProject(true);
              setNewProjectStep(1);
            }}
            className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      <motion.div
        className={
          hasRevenue
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
            : "grid grid-cols-1 gap-6 md:grid-cols-3"
        }
      >
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/25"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-xl bg-muted p-2 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-brand-gray opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-gray">
                {stat.label}
              </p>
              <h3
                className={
                  "isText" in stat && stat.isText
                    ? "font-display text-2xl font-bold text-brand-dark"
                    : "font-display text-3xl font-bold text-brand-dark"
                }
              >
                {stat.value}
              </h3>
              <p className="mt-1 text-[10px] text-brand-gray">{stat.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {hasRevenue ? <PortfolioRevenueChart projects={portfolioRows} /> : null}

      <motion.div className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-border bg-card p-2 text-brand-green">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-dark">Execution Streams</h2>
              <p className="mt-0.5 text-[10px] uppercase leading-none tracking-widest text-brand-gray">
                Stream-level delivery mapping
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-brand-gray">
              <span className="h-2 w-2 rounded-full bg-brand-green" />
              Active
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-brand-gray">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Milestone
            </div>
          </div>
        </div>

        <div className="thin-scrollbar overflow-x-auto p-8">
          <div className="min-w-[900px]">
            <div className="mb-6 grid grid-cols-[200px_1fr]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">
                Workspace
              </div>
              <div className="grid grid-cols-12 gap-1 px-4">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                  (m) => (
                    <div key={m} className="text-center text-[10px] font-bold text-brand-gray">
                      {m}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-5">
              {projects.map((project, idx) => (
                <Link
                  key={project.slug}
                  href={RouteNames.projectDetail(project.slug)}
                  className="grid cursor-pointer grid-cols-[200px_1fr] items-center group"
                >
                  <div className="flex flex-col border-r border-border pr-8">
                    <span className="truncate text-xs font-bold text-brand-dark transition-colors group-hover:text-brand-green">
                      {project.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-tighter text-brand-gray">
                      {project.client}
                    </span>
                  </div>
                  <div className="relative grid h-8 grid-cols-12 items-center gap-1 px-4">
                    <div
                      className={`relative h-3 rounded-full transition-all duration-500 ${
                        project.health === "Healthy"
                          ? "bg-brand-green/70"
                          : project.health === "At Risk"
                            ? "bg-amber-500/70"
                            : project.health === "Critical"
                              ? "bg-red-500/70"
                              : "bg-blue-400/70"
                      }`}
                      style={{
                        gridColumn: `${(idx % 4) + 1} / span ${Math.floor(project.progress / 15) + 3}`,
                        opacity: 0.8,
                      }}
                    >
                      <div className="absolute right-0 top-1/2 z-10 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-sm transition-transform group-hover:scale-125" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-tight text-brand-dark">
              Active Stream
            </h2>
            <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-primary">
              Real-time
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-brand-gray transition-colors hover:bg-muted"
            >
              <Filter size={14} />
              Filters
            </button>
          </div>
        </div>

        <PortfolioProjectTable projects={projects} />
      </div>

      <AnimatePresence>
        {showNewProject ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewProject(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl"
            >
              <div className="border-b border-border bg-muted/50 p-8">
                <h3 className="font-display text-2xl font-bold text-brand-dark">
                  Initiate New Project
                </h3>
                <p className="mt-1 text-xs uppercase tracking-widest text-brand-gray">
                  Step {newProjectStep} of 2
                </p>
              </div>

              <div className="p-8">
                {newProjectStep === 1 ? (
                  <div className="space-y-6">
                    <p className="text-sm font-medium leading-relaxed text-brand-gray">
                      Enter the client project name to generate the operational environment.
                    </p>
                    <div className="space-y-2">
                      <label className="pl-1 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
                        Project Identifier
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp / Logistics Engine"
                        className="font-display w-full rounded-xl border-2 border-transparent bg-muted p-4 text-lg outline-none transition-all focus:border-brand-green/20 focus:bg-background"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!newProjectName}
                      onClick={() => setNewProjectStep(2)}
                      className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50 disabled:grayscale"
                    >
                      Initialize Project Structure
                    </button>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                    <div className="list-decimal space-y-4 rounded-2xl border border-primary/15 bg-primary/5 p-6 text-sm font-medium text-primary">
                      <div className="flex gap-4">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          01
                        </span>
                        <p>Clone the master repository template to your local workspace.</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          02
                        </span>
                        <div className="space-y-2">
                          <p>
                            Open{" "}
                            <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-primary">
                              Claude Code
                            </code>{" "}
                            or{" "}
                            <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-primary">
                              Cursor
                            </code>{" "}
                            and execute:
                          </p>
                          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 select-all dark:bg-slate-900">
                            /init-project &quot;{newProjectName}&quot;
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          03
                        </span>
                        <p>Upload current proposals and transcripts to sync the AI intelligence hub.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewProject(false)}
                      className="w-full rounded-full bg-foreground py-4 font-semibold text-background shadow-lg transition-opacity hover:opacity-90"
                    >
                      Complete Setup
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
