"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Box,
  CheckSquare,
  ChevronRight,
  Code,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Github,
  Layers,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import { RouteNames } from "@/constants";
import { cn } from "@/lib/utils";
import type { PortfolioProject } from "@/feature/portfolio/types";
import type { UiPhase } from "@/feature/portfolio/types-display";
import { UI_PHASES } from "@/feature/portfolio/types-display";
import {
  artifactsForPhase,
  firstOpenJiraTicket,
  githubWebUrl,
  type DetailArtifact,
} from "@/feature/portfolio/lib/project-detail-artifacts";
import { mapPortfolioToUiProject, portfolioProgress } from "@/feature/portfolio/lib/map-portfolio-display";

const phaseIcons: Record<
  UiPhase,
  React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
> = {
  Sales: MessageSquare,
  Discovery: Target,
  Build: Code,
  QA: ShieldCheck,
  UAT: CheckSquare,
  Maintenance: Settings2,
};

const ARTIFACT_PAGE_SIZE = 8;

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-dotted border-border py-3.5 text-sm last:border-b-0">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 text-right text-sm font-medium text-foreground">{children}</div>
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
  const [selectedArtifactId, setSelectedArtifactId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const baseArtifacts = React.useMemo(
    () => artifactsForPhase(project, activeTab),
    [project, activeTab],
  );

  React.useEffect(() => {
    const list = artifactsForPhase(project, activeTab);
    setSelectedArtifactId(list[0]?.id ?? null);
    setSearchTerm("");
  }, [activeTab, project]);

  const activeArtifacts = React.useMemo(
    () =>
      baseArtifacts.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [baseArtifacts, searchTerm],
  );

  const selectedArtifact =
    activeArtifacts.find((a) => a.id === selectedArtifactId) ?? activeArtifacts[0];

  const {
    page: artifactListPage,
    setPage: setArtifactListPage,
    pageItems: pagedArtifacts,
    total: artifactListTotal,
  } = usePagedItems(activeArtifacts, ARTIFACT_PAGE_SIZE, [activeTab, searchTerm]);

  const team = deliveryTeam(project, ui.owner.name);
  const gh = githubWebUrl(project.githubRepo);
  const openTicket = firstOpenJiraTicket(project);
  const jiraOpen = project.build.jiraGroups.reduce(
    (n, g) => n + g.tickets.filter((t) => !t.closedAt).length,
    0,
  );
  const jiraTotal = project.build.jiraGroups.reduce((n, g) => n + g.tickets.length, 0);
  const firstDoc = project.discovery.docs[0];

  const engineeringRows: {
    title: string;
    sub: string;
    date: string;
    icon: typeof Github;
    status: "Active" | "Jira" | "Doc";
    href: string | null;
  }[] = [];
  if (gh) {
    engineeringRows.push({
      title: project.githubRepo ?? "Repository",
      sub: `${project.build.githubActivity.length} synced commits`,
      date: "GitHub",
      icon: Github,
      status: "Active",
      href: gh,
    });
  }
  engineeringRows.push({
    title: project.jiraProjectKey ? `${project.jiraProjectKey} board` : "Jira backlog",
    sub: `${jiraOpen} open · ${jiraTotal} total`,
    date: "Jira",
    icon: Target,
    status: "Jira",
    href: null,
  });
  if (firstDoc) {
    engineeringRows.push({
      title: firstDoc.name,
      sub: firstDoc.path,
      date: firstDoc.kind,
      icon: FileText,
      status: "Doc",
      href: null,
    });
  }

  const operationalLinks: {
    label: string;
    href: string;
    icon: typeof Layers;
    wrap: string;
    iconWrap: string;
  }[] = [];
  if (project.qa.notionSummaryUrl) {
    operationalLinks.push({
      label: "Notion workspace",
      href: project.qa.notionSummaryUrl,
      icon: Layers,
      wrap: "text-indigo-600",
      iconWrap: "bg-indigo-50",
    });
  }
  if (gh) {
    operationalLinks.push({
      label: "GitHub repository",
      href: gh,
      icon: Github,
      wrap: "text-brand-dark",
      iconWrap: "bg-muted",
    });
  }
  if (project.jiraProjectKey) {
    operationalLinks.push({
      label: `Jira · ${project.jiraProjectKey}`,
      href: "#",
      icon: Target,
      wrap: "text-blue-600",
      iconWrap: "bg-blue-50",
    });
  }
  operationalLinks.push({
    label: `Slack · ${project.slackContactChannel}`,
    href: "#",
    icon: MessageSquare,
    wrap: "text-violet-600",
    iconWrap: "bg-violet-50",
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-brand-green shadow-sm">
              <Box size={24} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                  {project.projectName}
                </h1>
                <div className="rounded bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-brand-green">
                  {ui.currentPhase === "Maintenance" ? "In maintenance" : "In production"}
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-brand-gray">{project.description}</p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 self-start rounded-lg border border-border p-2 text-brand-gray transition-colors hover:bg-muted hover:text-brand-green"
            aria-label="Edit (placeholder)"
          >
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm sm:px-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overview</h2>
          <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
        </div>
        <DetailRow label="Client">{project.clientName}</DetailRow>
        <DetailRow label="Slug">
          <span className="font-mono text-xs">{project.slug}</span>
        </DetailRow>
        <DetailRow label="Engagement">{project.engagementType}</DetailRow>
        <DetailRow label="Current phase">{ui.currentPhase}</DetailRow>
        <DetailRow label="Health">{ui.health}</DetailRow>
        <div className="flex items-end justify-between gap-4 border-b border-dotted border-border py-3.5 last:border-b-0">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Progress</span>
          <div className="flex flex-col items-end gap-2">
            <span className="font-display text-3xl font-bold tabular-nums text-foreground">
              {progress}
              <span className="text-lg text-muted-foreground">%</span>
            </span>
            <div className="h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-muted sm:w-56">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Global status & intent</h2>
          <button
            type="button"
            className="p-2 text-brand-gray transition-all hover:text-brand-green"
            aria-label="Edit summary"
          >
            <Edit3 size={12} />
          </button>
        </div>
        <div className="prose prose-sm max-w-none leading-relaxed text-brand-dark">
          <p className="mb-6 text-base font-medium leading-relaxed text-brand-gray sm:text-lg">
            This initiative delivers <span className="text-brand-dark">{project.projectName}</span> for{" "}
            <span className="text-brand-dark">{project.clientName}</span>. Engagement type: {project.engagementType}.
            Current stream: <span className="font-semibold text-brand-dark">{ui.currentPhase}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
              <Target size={12} className="text-brand-green" /> {project.engagementType}
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
              <Layers size={12} className="text-brand-green" /> Config-driven portfolio
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
              <Box size={12} className="text-brand-green" /> Phase: {ui.currentPhase}
            </span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">People & links</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="px-5 py-5 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gray">Delivery team</h3>
              <button
                type="button"
                className="p-2 text-brand-gray transition-all hover:rotate-90 hover:text-brand-green"
                aria-label="Add member"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {team.map((member) => (
                <div key={member.id} className="group flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-[11px] font-bold uppercase tracking-tighter text-brand-dark transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-none text-brand-dark">{member.name}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-gray">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-muted/15 px-5 py-5 sm:px-6">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-gray">Operational links</h3>
            <div className="space-y-2">
              {operationalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center rounded-xl border border-border bg-card px-3 py-3 transition-all hover:border-brand-green/20 hover:bg-muted"
                >
                  <div
                    className={cn(
                      "mr-3 shrink-0 rounded-lg p-2 transition-transform group-hover:scale-105",
                      link.iconWrap,
                      link.wrap,
                    )}
                  >
                    <link.icon size={14} />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-brand-gray transition-colors group-hover:text-brand-dark">
                    {link.label}
                  </span>
                  <ExternalLink
                    size={14}
                    className="shrink-0 text-brand-gray/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-green"
                  />
                </a>
              ))}
              <a
                href={project.clientDashboardPath}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center rounded-xl border border-border bg-card px-3 py-3 transition-all hover:border-brand-green/20 hover:bg-muted"
              >
                <div className="mr-3 shrink-0 rounded-lg bg-brand-green/10 p-2 text-brand-green transition-transform group-hover:scale-105">
                  <ExternalLink size={14} />
                </div>
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-brand-gray group-hover:text-brand-dark">
                  Client dashboard
                </span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-brand-gray/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-green"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex min-w-0 gap-1 overflow-x-auto border-b border-border bg-muted/30 p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {UI_PHASES.map((phase) => {
            const Icon = phaseIcons[phase];
            const isCurrent = ui.currentPhase === phase;
            const isActive = activeTab === phase;
            return (
              <button
                key={phase}
                type="button"
                onClick={() => setActiveTab(phase)}
                className={cn(
                  "relative flex min-w-[5.5rem] shrink-0 items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-[9px] font-bold uppercase tracking-widest transition-all sm:min-w-0 sm:flex-1 sm:px-3 sm:text-[10px]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-brand-gray hover:bg-muted",
                )}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{phase}</span>
                {isCurrent && !isActive ? (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-primary sm:right-2 sm:top-2" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="border-b border-border p-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
            <Input
              variant="default"
              type="search"
              placeholder="Filter context…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2.5 pl-9 pr-4 text-[11px]"
            />
          </div>
        </div>

        {activeTab === "Build" ? (
          <div className="space-y-6 border-b border-border p-5 sm:p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
                  <Github size={14} className="text-brand-green" /> Engineering stream
                </h4>
                {gh ? (
                  <a
                    href={gh}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-brand-green hover:underline"
                  >
                    Open repo →
                  </a>
                ) : null}
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {engineeringRows.map((log, i) => {
                  const row = (
                    <div className="flex flex-col gap-3 p-4 transition-colors group hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                      <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                        <div className="rounded-xl bg-muted p-2.5 transition-transform group-hover:scale-105 sm:p-3">
                          <log.icon size={18} className="text-brand-dark sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-brand-dark">{log.title}</p>
                          <p className="text-[11px] font-medium tracking-tight text-brand-gray">{log.sub}</p>
                          <p className="text-[10px] italic text-brand-gray/50">{log.date}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "self-start rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest sm:self-center",
                          log.status === "Active" && "bg-brand-green/10 text-brand-green",
                          log.status === "Jira" && "bg-blue-500/15 text-blue-700 dark:text-blue-300",
                          log.status === "Doc" && "bg-orange-500/15 text-orange-800 dark:text-orange-300",
                        )}
                      >
                        {log.status}
                      </span>
                    </div>
                  );
                  return log.href ? (
                    <a key={i} href={log.href} target="_blank" rel="noopener noreferrer" className="block">
                      {row}
                    </a>
                  ) : (
                    <div key={i}>{row}</div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
                  <AlertCircle size={14} className="text-red-500" /> Delivery attention
                </h4>
                <Link
                  href={RouteNames.projectDetail(project.slug)}
                  className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:underline"
                >
                  Refresh data →
                </Link>
              </div>
              {openTicket ? (
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500 shadow-sm shadow-red-500/20" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-dark">
                        {openTicket.key} — {openTicket.summary}
                      </p>
                      <p className="mt-0.5 text-[10px] text-brand-gray">
                        Status group: <span className="font-bold">{openTicket.status}</span>
                      </p>
                    </div>
                  </div>
                  <span className="self-start rounded-full bg-primary/15 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-primary sm:self-center">
                    Open
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-4 text-sm text-brand-gray">
                  No open Jira tickets in the synced snapshot.
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="p-3 sm:p-4">
          {activeArtifacts.length > 0 ? (
            <>
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Stream items
              </p>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {pagedArtifacts.map((artifact) => (
                  <button
                    key={artifact.id}
                    type="button"
                    onClick={() => setSelectedArtifactId(artifact.id)}
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                      selectedArtifactId === artifact.id ||
                        (!selectedArtifactId && selectedArtifact?.id === artifact.id)
                        ? "bg-brand-green/5"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "min-w-0 truncate text-[12px] font-bold",
                        selectedArtifactId === artifact.id ? "text-brand-green" : "text-brand-dark",
                      )}
                    >
                      {artifact.title}
                    </span>
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gray">
                        {artifact.type}
                      </span>
                      <span className="text-[9px] text-brand-gray/50">{artifact.date}</span>
                    </div>
                  </button>
                ))}
              </div>
              <TablePaginationBar
                page={artifactListPage}
                pageSize={ARTIFACT_PAGE_SIZE}
                total={artifactListTotal}
                onPageChange={setArtifactListPage}
              />
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-[10px] font-bold uppercase tracking-widest text-brand-gray transition-all hover:border-brand-green/30 hover:text-brand-green"
              >
                <Plus size={12} /> Add artifact
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center text-brand-gray">
              <Box size={32} strokeWidth={1} className="mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No stream data</p>
            </div>
          )}
        </div>

        {activeTab !== "Build" && selectedArtifact ? (
          <div className="border-t border-border bg-muted/10 p-3 sm:p-4">
            <ArtifactDetailCard project={project} artifact={selectedArtifact} uiId={ui.id} />
          </div>
        ) : activeTab !== "Build" && !selectedArtifact ? (
          <div className="flex flex-col items-center justify-center border-t border-dashed border-border py-16 text-brand-gray opacity-40">
            <Box size={40} strokeWidth={1} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Select stream context</p>
          </div>
        ) : null}
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

function ArtifactDetailCard({
  project,
  artifact,
  uiId,
}: {
  project: PortfolioProject;
  artifact: DetailArtifact;
  uiId: string;
}) {
  return (
    <div className="flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border bg-muted/20 p-8">
        <div className="flex items-center gap-5">
          <div className="rounded-2xl border border-border bg-card p-4 text-brand-green shadow-sm">
            <FileText size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-brand-dark">{artifact.title}</h2>
              <span className="rounded-md bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                Portfolio
              </span>
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
              Source: {artifact.source} · {artifact.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl p-3 text-brand-gray transition-all hover:bg-muted hover:text-brand-green"
            aria-label="Edit"
          >
            <Edit3 size={18} />
          </button>
          <button
            type="button"
            className="rounded-xl p-3 text-brand-gray transition-all hover:bg-muted hover:text-brand-green"
            aria-label="Preview"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            className="rounded-xl p-3 text-brand-gray transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
            aria-label="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-10 p-12">
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase leading-none tracking-widest text-brand-gray">
              Context
            </h4>
            <p className="text-justify text-base leading-relaxed text-brand-dark">
              {project.description}
            </p>
          </div>

          <div className="space-y-1 border-y border-border py-8">
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-brand-gray">Workspace</h4>
            <DetailRow label="Slug">
              <span className="font-mono text-xs">{project.slug}</span>
            </DetailRow>
            <DetailRow label="API">
              <span className="break-all font-mono text-[11px] font-normal">{project.apiBaseUrl}</span>
            </DetailRow>
            {project.prototypeUrl ? <DetailRow label="Prototype">Linked</DetailRow> : null}
            <div className="pt-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-brand-gray">Client channel</h4>
              <div className="flex items-center justify-between rounded-xl border border-brand-green/10 bg-brand-green/5 px-4 py-4">
                <div className="flex items-center gap-3 text-xs font-bold text-brand-green">
                  <ShieldCheck size={20} /> Dashboard configured
                </div>
                <span className="text-[9px] font-bold uppercase text-brand-green/60">Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl border border-border bg-muted/50 p-8">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-gray">
                Operational trace
              </p>
              <p className="font-mono text-xs font-bold text-brand-dark">
                {uiId}-ARTI-{artifact.id.slice(0, 6).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase leading-none text-brand-gray">Artifact</p>
                <p className="text-[10px] font-bold text-brand-dark">{artifact.type}</p>
              </div>
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500 ring-4 ring-green-500/25 dark:ring-green-400/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
