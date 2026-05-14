import type { PortfolioProject } from "@/feature/portfolio/types";

/** Copied from aaa-client-dashboard `sprint-progress.json` → `data_sprint_progress.json`. */
export interface SprintProgressFile {
  sprints?: {
    cards?: { id: string; title: string; status: string }[];
  }[];
}

/** Copied from aaa-client-dashboard `github_activity.json` → `data_github_activity.json`. */
export interface DashboardGithubActivityFile {
  commits?: {
    sha: string;
    message: string;
    time: string;
    tag?: string;
    author?: string;
  }[];
}

function formatStatusLabel(status: string): string {
  const s = (status ?? "unknown").toLowerCase().replace(/-/g, "_");
  if (s === "done") return "Done";
  if (s === "todo" || s === "to_do") return "To do";
  if (s === "in_progress") return "In progress";
  if (s === "blocked") return "Blocked";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

const GROUP_ORDER = ["Done", "In progress", "Blocked", "To do"];

function sortJiraGroups(
  groups: PortfolioProject["build"]["jiraGroups"],
): PortfolioProject["build"]["jiraGroups"] {
  function rank(status: string): number {
    const i = GROUP_ORDER.indexOf(status);
    return i === -1 ? 100 : i;
  }
  return [...groups].sort((a, b) => {
    const d = rank(a.status) - rank(b.status);
    if (d !== 0) return d;
    return a.status.localeCompare(b.status);
  });
}

/** Last sprint occurrence wins per ticket id (dashboard cards move across sprints). */
export function sprintProgressToJiraGroups(
  data: SprintProgressFile | null,
): PortfolioProject["build"]["jiraGroups"] {
  if (!data?.sprints?.length) return [];

  const byId = new Map<
    string,
    { id: string; title: string; status: string }
  >();
  for (const sp of data.sprints) {
    if (!Array.isArray(sp.cards)) continue;
    for (const c of sp.cards) {
      if (c?.id && c.title) byId.set(c.id, c);
    }
  }

  const buckets = new Map<
    string,
    { key: string; summary: string; closedAt?: string }[]
  >();
  for (const c of byId.values()) {
    const label = formatStatusLabel(c.status);
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push({
      key: c.id,
      summary: c.title,
    });
  }

  const groups = Array.from(buckets.entries()).map(([status, tickets]) => ({
    status,
    tickets,
  }));
  return sortJiraGroups(groups);
}

export function dashboardGithubToActivity(
  data: DashboardGithubActivityFile | null,
  githubRepo: string | undefined,
  maxItems = 20,
): PortfolioProject["build"]["githubActivity"] {
  if (!data?.commits?.length) return [];
  const base = githubRepo?.includes("/")
    ? `https://github.com/${githubRepo}`
    : "https://github.com/Automation-Architecture/aaa-client-dashboard";

  return data.commits.slice(0, maxItems).map((c) => ({
    sha: c.sha,
    message: c.message,
    date: c.time,
    url: `${base}/commit/${c.sha}`,
  }));
}
