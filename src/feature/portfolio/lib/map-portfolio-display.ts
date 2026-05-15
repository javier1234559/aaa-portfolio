import {
  commercialDisplayPrimary,
  commercialForecastValue,
  commercialStatusLabel,
} from "@/feature/portfolio/lib/portfolio-commercial";
import type { PortfolioPhase, PortfolioProject } from "@/feature/portfolio/types";
import type { UiHealth, UiPhase, UiProject } from "@/feature/portfolio/types-display";

const PHASE_MAP: Record<PortfolioPhase, UiPhase> = {
  sales: "Sales",
  discovery: "Discovery",
  build: "Build",
  qa: "QA",
  uat: "UAT",
  maintenance: "Maintenance",
};

function jiraTicketCount(p: PortfolioProject): { total: number; closed: number } {
  let total = 0;
  let closed = 0;
  for (const g of p.build.jiraGroups) {
    for (const t of g.tickets) {
      total += 1;
      if (t.closedAt) closed += 1;
    }
  }
  return { total, closed };
}

function hashProgress(slug: string): number {
  let s = 0;
  for (let i = 0; i < slug.length; i += 1) s += slug.charCodeAt(i);
  return 20 + (s % 55);
}

export function portfolioProgress(p: PortfolioProject): number {
  const { total, closed } = jiraTicketCount(p);
  if (total === 0) return hashProgress(p.slug);
  return Math.min(100, Math.round((closed / total) * 100));
}

function blockedish(p: PortfolioProject): boolean {
  for (const g of p.build.jiraGroups) {
    const st = g.status.toLowerCase();
    if (st.includes("block") || st.includes("risk")) return true;
  }
  return false;
}

export function portfolioHealth(p: PortfolioProject, progress: number): UiHealth {
  if (p.currentPhase === "maintenance") return "Maintenance";
  if (blockedish(p)) return "At Risk";
  if (p.currentPhase === "uat" && progress < 40) return "Critical";
  if (
    (p.currentPhase === "qa" || p.currentPhase === "build") &&
    progress < 25
  ) {
    return "At Risk";
  }
  return "Healthy";
}

function displayProjectId(slug: string): string {
  const compact = slug.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const body = (compact || "PRJ").slice(0, 8);
  return `PRJ-${body}`;
}

function nextMilestoneFrom(p: PortfolioProject): UiProject["nextMilestone"] {
  const lastGithub = p.build.githubActivity[0];
  const date = lastGithub?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  let title = p.uat.handoffSummary?.trim();
  if (!title) title = p.qa.notes?.trim();
  if (!title) {
    const nextMeet = p.sales.meetings[0];
    title = nextMeet ? nextMeet.meeting : "Delivery sync";
  }
  title = title.slice(0, 72);
  return {
    id: `${p.slug}-next`,
    title,
    date,
    status: "In Progress",
  };
}

export function mapPortfolioToUiProject(p: PortfolioProject): UiProject {
  const progress = portfolioProgress(p);
  const ownerName =
    p.maintenance.owner && p.maintenance.owner !== "—"
      ? p.maintenance.owner
      : "AAA Delivery";
  return {
    slug: p.slug,
    id: displayProjectId(p.slug),
    client: p.clientName,
    name: p.projectName,
    description: p.description,
    currentPhase: PHASE_MAP[p.currentPhase],
    health: portfolioHealth(p, progress),
    owner: {
      id: `${p.slug}-owner`,
      name: ownerName,
      role: "Delivery Lead",
    },
    progress,
    nextMilestone: nextMilestoneFrom(p),
    isPublished: /^https?:\/\//i.test(p.clientDashboardPath.trim()),
    clientDashboardPath: p.clientDashboardPath,
    revenueLabel: p.commercial ? commercialDisplayPrimary(p.commercial) : "—",
    revenueForecast: p.commercial ? commercialForecastValue(p.commercial) : 0,
    commercialStatus: p.commercial
      ? commercialStatusLabel(p.commercial.status)
      : undefined,
  };
}

export { rollupPortfolioCommercial } from "@/feature/portfolio/lib/portfolio-commercial";

export function mapPortfolioProjectsToUi(
  projects: PortfolioProject[],
): UiProject[] {
  return projects.map(mapPortfolioToUiProject);
}

export function uniqueClientCount(projects: PortfolioProject[]): number {
  return new Set(projects.map((p) => p.clientName)).size;
}
