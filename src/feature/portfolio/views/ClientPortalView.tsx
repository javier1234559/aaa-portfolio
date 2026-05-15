"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Activity, ExternalLink, MessageSquare } from "lucide-react";

import { ActivePhaseContent } from "@/feature/portfolio/components/active-phase-content";
import {
  PhaseDotStrip,
  phaseDatesFromMilestones,
} from "@/feature/portfolio/components/project-milestone-rail";
import { clientPhaseTabIntro } from "@/feature/portfolio/lib/client-phase-tab-intro";
import { githubWebUrl } from "@/feature/portfolio/lib/project-detail-artifacts";
import {
  mapPortfolioToUiProject,
  portfolioProgress,
} from "@/feature/portfolio/lib/map-portfolio-display";
import type { PortfolioProject } from "@/feature/portfolio/types";
import type { UiPhase } from "@/feature/portfolio/types-display";
import { cn } from "@/lib/utils";

function healthBadgeClass(health: string): string {
  switch (health) {
    case "Healthy":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
    case "At Risk":
      return "border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-50";
    case "Critical":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function ClientPortalView({ project }: { project: PortfolioProject }) {
  const ui = mapPortfolioToUiProject(project);
  const progress = portfolioProgress(project);
  const activePhase = ui.currentPhase as UiPhase;
  const intro = clientPhaseTabIntro(activePhase);
  const gh = githubWebUrl(project.githubRepo);

  const phaseDateLookup = React.useMemo(
    () => phaseDatesFromMilestones(project.milestones),
    [project.milestones],
  );

  const slackSlug = project.slackContactChannel
    .replace(/^#/, "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-w-0 space-y-6 pb-12"
    >
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div>
          <div className="flex min-w-0 items-start gap-4">
            <div className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold uppercase text-primary-foreground">
              {project.clientName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
                Client portal
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {project.projectName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {project.engagementType} · {project.clientName}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
                Current phase
              </p>
              <p className="mt-1 font-display text-lg font-bold text-foreground">{activePhase}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
                Delivery progress
              </p>
              <p className="mt-1 font-display text-lg font-bold tabular-nums text-foreground">{progress}%</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
                Health
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  healthBadgeClass(ui.health),
                )}
              >
                {ui.health}
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-8">
            <PhaseDotStrip recordedPhase={activePhase} phaseDates={phaseDateLookup} />
          </div>
        </div>
      </section>


      <a
        href="#"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40 sm:p-6"
      >
        <div className="flex min-w-0 items-center gap-3">
          <MessageSquare className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Questions?</p>
            <p className="text-sm font-semibold text-foreground">
              Reach your team on #{slackSlug || "client-comms"}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
      </a>

      {project.prototypeUrl ? (
        <a
          href={project.prototypeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-sm font-semibold text-foreground">Open live prototype</span>
          </div>
          <span className="text-xs font-medium text-primary">→</span>
        </a>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/15 px-5 py-3 sm:px-6">
          <p className="flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-primary" aria-hidden />
            {activePhase} · current delivery
          </p>
        </div>
        <div className="p-5 sm:p-8">
          <div className="grid gap-10 md:grid-cols-5 md:gap-12">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {intro.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intro.body}</p>
            </div>
            <div className="md:col-span-3">
              <ActivePhaseContent project={project} phase={activePhase} repoUrl={gh} clientMode />
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
