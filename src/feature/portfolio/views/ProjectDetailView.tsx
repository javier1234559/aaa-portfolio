"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Box,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Github,
  Layout,
  Layers,
  MessageSquare,
  Plus,
  Target,
  Users,
} from "lucide-react";

import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import {
  PhaseDotStrip,
  phaseDatesFromMilestones,
  PortfolioDeliveryProgressFallback,
} from "@/feature/portfolio/components/project-milestone-rail";
import { RouteNames } from "@/constants";
import { cn } from "@/lib/utils";
import type { PortfolioProject } from "@/feature/portfolio/types";
import type { UiHealth, UiPhase } from "@/feature/portfolio/types-display";
import { UI_PHASES } from "@/feature/portfolio/types-display";
import { firstOpenJiraTicket, githubWebUrl } from "@/feature/portfolio/lib/project-detail-artifacts";
import { mapPortfolioToUiProject, portfolioProgress } from "@/feature/portfolio/lib/map-portfolio-display";

const LIST_PAGE = 8;
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

function buildPhaseContext(project: PortfolioProject): string {
  const extra = [project.qa.notes?.trim(), project.uat.handoffSummary?.trim()]
    .filter(Boolean)
    .join(" ");
  if (extra) return extra;
  return project.description;
}

function BuildCommitsPanel({
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

function BuildJiraPanel({ project }: { project: PortfolioProject }) {
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

function phaseContextBody(project: PortfolioProject, phase: UiPhase): string {
  switch (phase) {
    case "Sales":
    case "Discovery":
      return project.description;
    case "Build":
      return buildPhaseContext(project);
    case "QA":
      return project.qa.notes?.trim() || project.description;
    case "UAT": {
      const parts = [project.uat.handoffSummary?.trim()];
      if (project.uat.testEnvUrl) parts.push(`Staging: ${project.uat.testEnvUrl}`);
      return parts.filter(Boolean).join(" ") || project.description;
    }
    case "Maintenance": {
      const bits: string[] = [];
      if (project.maintenance.owner && project.maintenance.owner !== "—") {
        bits.push(`Owner: ${project.maintenance.owner}`);
      }
      if (project.maintenance.channel && project.maintenance.channel !== "—") {
        bits.push(`Channel: ${project.maintenance.channel}`);
      }
      if (project.maintenance.notes?.trim()) bits.push(project.maintenance.notes.trim());
      return bits.length ? bits.join(" · ") : project.description;
    }
    default:
      return project.description;
  }
}

function SalesMeetingsPanel({ meetings }: { meetings: PortfolioProject["sales"]["meetings"] }) {
  const { page, setPage, pageItems, total } = usePagedItems(meetings, LIST_PAGE, [meetings]);
  if (!meetings.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No meetings in config.</p>;
  }
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <h5 className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
          Phase meetings
        </h5>
      </div>
      <div className="divide-y divide-border">
        {pageItems.map((m) => (
          <div
            key={m.id}
            className="group relative border-l-4 border-transparent py-4 pl-4 transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary"
          >
            <p className="font-mono text-[10px] text-muted-foreground transition-colors group-hover:text-white/85">{m.date}</p>
            <p className="mt-1 font-display text-lg font-semibold uppercase tracking-tight text-foreground transition-colors group-hover:text-white">
              {m.title}
            </p>
            {m.tool ? (
              <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-white/75">
                {m.tool}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      {total > LIST_PAGE ? (
        <TablePaginationBar page={page} pageSize={LIST_PAGE} total={total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}

function DiscoveryDocsPanel({ docs }: { docs: PortfolioProject["discovery"]["docs"] }) {
  const { page, setPage, pageItems, total } = usePagedItems(docs, LIST_PAGE, [docs]);
  if (!docs.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No discovery docs.</p>;
  }
  return (
    <div>
      <div className="mb-4 border-b border-border pb-2">
        <h5 className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
          Workspace artifacts
        </h5>
      </div>
      <div className="divide-y divide-border">
        {pageItems.map((d) => (
          <div
            key={d.id}
            className="group relative border-l-4 border-transparent py-3 pl-3 transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-mono uppercase text-muted-foreground transition-colors group-hover:bg-primary-foreground/15 group-hover:text-white">
                {d.kind}
              </span>
              <span className="text-sm font-medium text-foreground transition-colors group-hover:text-white">{d.name}</span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground transition-colors group-hover:text-white/80">{d.path}</p>
          </div>
        ))}
      </div>
      {total > LIST_PAGE ? (
        <TablePaginationBar page={page} pageSize={LIST_PAGE} total={total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}

function QAPanel({ project }: { project: PortfolioProject }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-2">
        <h5 className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">QA surface</h5>
      </div>
      {project.qa.notionSummaryUrl ? (
        <a
          href={project.qa.notionSummaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted/50"
        >
          Open Notion workspace →
        </a>
      ) : null}
      {project.qa.loomEmbedUrl ? (
        <a
          href={project.qa.loomEmbedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium text-primary hover:underline"
        >
          Loom / recording
        </a>
      ) : null}
      {project.qa.notes.trim() ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{project.qa.notes}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No QA notes in YAML.</p>
      )}
    </div>
  );
}

function UATPanel({ project }: { project: PortfolioProject }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-2">
        <h5 className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">UAT pack</h5>
      </div>
      {project.uat.testEnvUrl ? (
        <a
          href={project.uat.testEnvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Staging environment →
        </a>
      ) : null}
      {project.uat.handoffSummary.trim() ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{project.uat.handoffSummary}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No handoff summary.</p>
      )}
      {project.uat.credentialHints.length > 0 ? (
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {project.uat.credentialHints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MaintenancePanel({ project }: { project: PortfolioProject }) {
  return (
    <div className="divide-y divide-border">
      <div className="group relative border-l-4 border-transparent py-3 pl-3 transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-white/85">
          Owner
        </p>
        <p className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-white">{project.maintenance.owner}</p>
      </div>
      <div className="group relative border-l-4 border-transparent py-3 pl-3 transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-white/85">
          Channel
        </p>
        <p className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-white">{project.maintenance.channel}</p>
      </div>
      <div className="group relative border-l-4 border-transparent py-3 pl-3 transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-white/85">
          Notes
        </p>
        <p className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-white/90">{project.maintenance.notes || "—"}</p>
      </div>
    </div>
  );
}

function deliveryTeam(project: PortfolioProject, leadName: string) {
  const rows: { id: string; name: string; role: string }[] = [
    { id: `${project.slug}-lead`, name: leadName, role: "Delivery Lead" },
  ];
  if (project.clientContact?.trim() && project.clientContact !== project.clientName) {
    rows.push({
      id: `${project.slug}-client`,
      name: project.clientContact.trim(),
      role: "Client contact",
    });
  }
  return rows;
}

export function ProjectDetailView({ project }: { project: PortfolioProject }) {
  const ui = mapPortfolioToUiProject(project);
  const progress = portfolioProgress(project);
  const [activeTab, setActiveTab] = React.useState<UiPhase>(ui.currentPhase);

  const phaseDateLookup = React.useMemo(
    () => phaseDatesFromMilestones(project.milestones),
    [project.milestones],
  );
  const hasPhaseDates = Object.keys(phaseDateLookup).length > 0;

  const team = deliveryTeam(project, ui.owner.name);
  const gh = githubWebUrl(project.githubRepo);
  const openTicket = firstOpenJiraTicket(project);
  const jiraOpen = project.build.jiraGroups.reduce(
    (n, g) => n + g.tickets.filter((t) => !t.closedAt).length,
    0,
  );
  const jiraTotal = project.build.jiraGroups.reduce((n, g) => n + g.tickets.length, 0);

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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                    <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                      Phase context — {activeTab}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                      Details & intelligence
                    </h3>
                    <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
                      {phaseContextBody(project, activeTab)}
                    </p>
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
                  {activeTab === "Discovery" ? <DiscoveryDocsPanel docs={project.discovery.docs} /> : null}
                  {activeTab === "QA" ? <QAPanel project={project} /> : null}
                  {activeTab === "UAT" ? <UATPanel project={project} /> : null}
                  {activeTab === "Maintenance" ? <MaintenancePanel project={project} /> : null}
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
