"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Box,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Github,
  Layers,
  MessageSquare,
  Plus,
  Target,
  Users,
} from "lucide-react";

import { PhaseMarkdownWorkspace } from "@/feature/portfolio/components/phase-markdown-workspace";
import {
  PhaseDotStrip,
  phaseDatesFromMilestones,
  PortfolioDeliveryProgressFallback,
} from "@/feature/portfolio/components/project-milestone-rail";
import { BuildCommitsPanel, BuildJiraPanel } from "@/feature/portfolio/components/build-phase-panels";
import { SalesMeetingsPanel } from "@/feature/portfolio/components/sales-meetings-panel";
import { RouteNames } from "@/constants";
import { cn } from "@/lib/utils";
import type { PortfolioProject } from "@/feature/portfolio/types";
import type { UiHealth, UiPhase } from "@/feature/portfolio/types-display";
import { UI_PHASES } from "@/feature/portfolio/types-display";
import { firstOpenJiraTicket, githubWebUrl } from "@/feature/portfolio/lib/project-detail-artifacts";
import {
  commercialForecastValue,
  commercialStatusLabel,
  formatMoney,
} from "@/feature/portfolio/lib/portfolio-commercial";
import { mapPortfolioToUiProject, portfolioProgress } from "@/feature/portfolio/lib/map-portfolio-display";
import { phaseTabIntro } from "@/feature/portfolio/lib/phase-tab-intro";
import { portfolioStakeholders } from "@/feature/portfolio/lib/portfolio-stakeholders";

function healthBadgeClass(health: UiHealth): string {
  switch (health) {
    case "Healthy":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
    case "At Risk":
      return "border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-50";
    case "Critical":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "Maintenance":
      return "border-border bg-muted text-foreground";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function SnapshotMeta({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-muted/25 px-3 py-2.5">
      <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <div
        className={cn(
          "mt-1 truncate text-sm font-semibold text-foreground",
          mono && "font-mono text-xs font-medium",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function phaseTabStatusIcon(phase: UiPhase, currentPhase: UiPhase) {
  const phases = UI_PHASES;
  const currentIndex = phases.indexOf(currentPhase);
  const targetIndex = phases.indexOf(phase);
  if (targetIndex < currentIndex) {
    return <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" aria-hidden />;
  }
  if (targetIndex === currentIndex) {
    return <Activity className="h-3 w-3 shrink-0 text-primary" aria-hidden />;
  }
  return <span className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/25" aria-hidden />;
}

function PhaseExternalLinks({ project, phase }: { project: PortfolioProject; phase: UiPhase }) {
  const links: { label: string; href: string }[] = [];
  if (phase === "QA") {
    if (project.qa.notionSummaryUrl) links.push({ label: "Notion workspace", href: project.qa.notionSummaryUrl });
    if (project.qa.loomEmbedUrl) links.push({ label: "Loom / recording", href: project.qa.loomEmbedUrl });
  }
  if (phase === "UAT" && project.uat.testEnvUrl) {
    links.push({ label: "Staging environment", href: project.uat.testEnvUrl });
  }
  if (!links.length) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-muted/50"
        >
          {l.label} →
        </a>
      ))}
    </div>
  );
}

export function ProjectDetailView({ project }: { project: PortfolioProject }) {
  const ui = mapPortfolioToUiProject(project);
  const progress = portfolioProgress(project);
  const [activeTab, setActiveTab] = React.useState<UiPhase>(ui.currentPhase);
  const tabIntro = phaseTabIntro(activeTab, project.slug);

  const phaseDateLookup = React.useMemo(
    () => phaseDatesFromMilestones(project.milestones),
    [project.milestones],
  );
  const hasPhaseDates = Object.keys(phaseDateLookup).length > 0;

  const team = portfolioStakeholders(project);
  const gh = githubWebUrl(project.githubRepo);
  const openTicket = firstOpenJiraTicket(project);
  const jiraOpen = project.build.jiraGroups.reduce(
    (n, g) => n + g.tickets.filter((t) => !t.closedAt).length,
    0,
  );
  const jiraTotal = project.build.jiraGroups.reduce((n, g) => n + g.tickets.length, 0);
  const commercial = project.commercial;

  const operationalLinks: {
    label: string;
    href: string;
    icon: typeof Layers;
  }[] = [];
  if (project.qa.notionSummaryUrl) {
    operationalLinks.push({
      label: "Notion workspace",
      href: project.qa.notionSummaryUrl,
      icon: Layers,
    });
  }
  if (gh) {
    operationalLinks.push({
      label: "GitHub repository",
      href: gh,
      icon: Github,
    });
  }
  if (project.jiraProjectKey) {
    operationalLinks.push({
      label: `Jira · ${project.jiraProjectKey}`,
      href: "#",
      icon: Target,
    });
  }
  operationalLinks.push({
    label: `Slack · ${project.slackContactChannel}`,
    href: "#",
    icon: MessageSquare,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full min-w-0 space-y-6 pb-16"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
          <Link href={RouteNames.App} className="transition-colors hover:text-brand-green">
            Dashboard
          </Link>
          <ChevronRight size={10} className="text-muted-foreground/50" />
          <span className="text-brand-dark">{project.clientName}</span>
        </div>

        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-brand-green shadow-sm">
            <Box size={24} />
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                {project.projectName}
              </h1>
              <div className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                {ui.currentPhase}
              </div>
              {ui.currentPhase === "Maintenance" ? (
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Maintenance mode
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Delivery active
                </span>
              )}
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-brand-gray line-clamp-2">{project.description}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {project.slug}
              <span className="text-muted-foreground/50"> · </span>
              {ui.id}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-widest text-muted-foreground">
            <Activity className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            Project snapshot
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-muted/20 p-3 sm:min-h-[5.5rem]">
            <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">Phase</p>
            <p className="mt-2 font-display text-xl font-bold tabular-nums tracking-tight text-foreground">{ui.currentPhase}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Portfolio stream</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3 sm:min-h-[5.5rem]">
            <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">Health</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                  healthBadgeClass(ui.health),
                )}
              >
                {ui.health}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">From Jira snapshot + phase rules</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3 sm:col-span-2 lg:col-span-1 sm:min-h-[5.5rem]">
            <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">Progress</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold tabular-nums text-foreground">{progress}</span>
              <span className="text-lg font-semibold text-muted-foreground">%</span>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">Jira roll-up</p>
            {!hasPhaseDates ? <PortfolioDeliveryProgressFallback pct={progress} compact /> : null}
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3 sm:col-span-2 sm:min-h-[5.5rem] lg:col-span-1">
            <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">Jira (synced)</p>
            <p className="mt-2 font-display text-xl font-bold tabular-nums text-foreground">{jiraOpen}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Open · {jiraTotal} total in snapshot
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:col-span-2 lg:col-span-1 sm:min-h-[5.5rem]">
            <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">Revenue</p>
            {commercial ? (
              <>
                <p className="mt-2 font-display text-xl font-bold tabular-nums text-foreground">
                  {ui.revenueLabel}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {commercialStatusLabel(commercial.status)}
                  {commercial.proposalAmount != null && commercial.contractedAmount != null
                    ? ` · Proposal ${formatMoney(commercial.proposalAmount, commercial.currency)}`
                    : null}
                </p>
                <p className="mt-1 text-[11px] font-medium text-primary">
                  Forecast {formatMoney(commercialForecastValue(commercial), commercial.currency)}
                  {commercial.collectedAmount > 0
                    ? ` · Collected ${formatMoney(commercial.collectedAmount, commercial.currency)}`
                    : null}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Not set — add <code className="text-xs">commercial:</code> in YAML or use{" "}
                <span className="font-medium">@ceo-init</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <SnapshotMeta label="Client">{project.clientName}</SnapshotMeta>
          <SnapshotMeta label="Slug" mono>
            {project.slug}
          </SnapshotMeta>
          <SnapshotMeta label="Engagement">{project.engagementType}</SnapshotMeta>
          <SnapshotMeta label="Portfolio ID" mono>
            {ui.id}
          </SnapshotMeta>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Layers size={12} className="text-primary" aria-hidden />
            Config-driven
          </span>
        </div>

        <div className="mt-10 border-t border-border pt-8">
          <PhaseDotStrip recordedPhase={ui.currentPhase} phaseDates={phaseDateLookup} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/20 px-4 py-3">
          <h2 className="text-xs font-mono font-medium uppercase tracking-widest text-muted-foreground">
            People & links
          </h2>
        </div>
        <div className="grid md:grid-cols-2 md:divide-x md:divide-border">
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-widest text-muted-foreground">
                <Users className="h-3 w-3 shrink-0" aria-hidden />
                Strategic stakeholders
              </h3>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                aria-label="Add member"
              >
                <Plus size={14} />
              </button>
            </div>
            <div>
              {team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-3 transition-colors last:border-b-0 hover:border-primary/35"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-tight text-foreground">{member.name}</p>
                    <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-muted/5 p-4 sm:p-5">
            <h3 className="mb-1 flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-widest text-muted-foreground">
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              Asset directory
            </h3>
            <div className="flex flex-col divide-y divide-border">
              {operationalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between gap-3 py-3 transition-all hover:pl-1.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors group-hover:border-primary group-hover:bg-primary/10">
                      <link.icon size={14} strokeWidth={2} />
                    </div>
                    <span className="truncate text-xs font-semibold uppercase tracking-wider text-foreground">
                      {link.label}
                    </span>
                  </div>
                  <span className="shrink-0 text-[9px] font-mono uppercase tracking-tight text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Open →
                  </span>
                </a>
              ))}
              <a
                href={project.clientDashboardPath}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 py-3 transition-all hover:pl-1.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary group-hover:bg-primary/15">
                    <ArrowUpRight size={14} strokeWidth={2} />
                  </div>
                  <span className="truncate text-xs font-semibold uppercase tracking-wider text-primary">
                    Client dashboard
                  </span>
                </div>
                <span className="shrink-0 text-[9px] font-mono uppercase tracking-tight text-primary/80 opacity-0 transition-opacity group-hover:opacity-100">
                  Open →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex min-w-0 flex-wrap border-b border-border bg-card [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {UI_PHASES.map((phase) => {
            const isCurrent = ui.currentPhase === phase;
            const isActive = activeTab === phase;
            return (
              <button
                key={phase}
                type="button"
                onClick={() => setActiveTab(phase)}
                className={cn(
                  "relative flex min-w-0 shrink-0 items-center gap-2 px-3 py-3.5 text-[10px] font-mono font-medium uppercase tracking-widest transition-colors sm:flex-1 sm:justify-center sm:px-4",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {phaseTabStatusIcon(phase, ui.currentPhase)}
                <span className="truncate">{phase}</span>
                {isCurrent && !isActive ? (
                  <span
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary/80 sm:right-3"
                    title="Portfolio recorded phase"
                  />
                ) : null}
                {isActive ? (
                  <motion.div
                    layoutId="projectPhaseTabIndicator"
                    className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-primary sm:left-2 sm:right-2"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-b border-border"
          >
            <div className="p-5 sm:p-8">
              <div className="grid gap-10 md:grid-cols-5 md:gap-12">
                <div className="space-y-6 md:col-span-2">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {tabIntro.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tabIntro.body}</p>
                  </div>
                  {activeTab === "Build" && openTicket ? (
                    <div className="border-l-4 border-primary-foreground bg-primary px-4 py-4 text-primary-foreground shadow-sm">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/90">
                        <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Attention required
                      </p>
                      <p className="text-xs leading-relaxed opacity-95">
                        <span className="font-semibold">{openTicket.key}</span> — {openTicket.summary}. Stream:{" "}
                        <span className="font-medium">{openTicket.status}</span>
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-10 md:col-span-3">
                  {activeTab === "Build" ? (
                    <>
                      <BuildCommitsPanel commits={project.build.githubActivity} repoUrl={gh} />
                      <BuildJiraPanel project={project} />
                    </>
                  ) : null}
                  {activeTab === "Sales" ? <SalesMeetingsPanel meetings={project.sales.meetings} /> : null}
                  {activeTab === "Discovery" ? (
                    <PhaseMarkdownWorkspace
                      documents={project.discovery.documents}
                      heading="Discovery workspace"
                      emptyLabel="Add markdown files under config/projects/<slug>/discovery/."
                    />
                  ) : null}
                  {activeTab === "QA" ? (
                    <>
                      <PhaseExternalLinks project={project} phase="QA" />
                      <PhaseMarkdownWorkspace
                        documents={project.qa.documents}
                        heading="QA notes"
                        emptyLabel="Add markdown files under config/projects/<slug>/qa/."
                      />
                    </>
                  ) : null}
                  {activeTab === "UAT" ? (
                    <>
                      <PhaseExternalLinks project={project} phase="UAT" />
                      <PhaseMarkdownWorkspace
                        documents={project.uat.documents}
                        heading="UAT pack"
                        emptyLabel="Add markdown files under config/projects/<slug>/uat/."
                      />
                    </>
                  ) : null}
                  {activeTab === "Maintenance" ? (
                    <PhaseMarkdownWorkspace
                      documents={project.maintenance.documents}
                      heading="Maintenance runbooks"
                      emptyLabel="Add markdown files under config/projects/<slug>/maintenance/."
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
      {project.comments.length > 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
            Internal notes
          </h3>
          <div className="space-y-3">
            {project.comments.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
              >
                <p className="text-xs text-brand-gray">
                  {c.at}
                  {c.phase ? ` · ${c.phase}` : ""} · {c.author}
                </p>
                <p className="mt-1 text-brand-dark">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
