import type { PortfolioProject } from "@/feature/portfolio/types";
import type { UiPhase } from "@/feature/portfolio/types-display";

export type DetailArtifact = {
  id: string;
  title: string;
  type: string;
  source: string;
  date: string;
};

export function artifactsForPhase(
  project: PortfolioProject,
  phase: UiPhase,
): DetailArtifact[] {
  switch (phase) {
    case "Sales":
      return project.sales.meetings.map((m) => ({
        id: m.id,
        title: m.meeting,
        type: "Meeting",
        source: m.source || "Calendar",
        date: m.date,
      }));
    case "Discovery":
      return project.discovery.documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: "Doc",
        source: d.filename,
        date: "—",
      }));
    case "Build": {
      const rows: DetailArtifact[] = [];
      for (const g of project.build.jiraGroups) {
        for (const t of g.tickets) {
          rows.push({
            id: t.key,
            title: `${t.key} — ${t.summary}`,
            type: "Jira",
            source: g.status,
            date: t.closedAt ?? "Open",
          });
        }
      }
      for (const c of project.build.githubActivity) {
        rows.push({
          id: c.sha,
          title: c.message.split("\n")[0].slice(0, 96),
          type: "Commit",
          source: "GitHub",
          date: c.date.slice(0, 16),
        });
      }
      return rows;
    }
    case "QA":
      return project.qa.documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: "Doc",
        source: d.filename,
        date: "—",
      }));
    case "UAT":
      return project.uat.documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: "Doc",
        source: d.filename,
        date: project.uat.testEnvUrl ? "Staging linked" : "—",
      }));
    case "Maintenance":
      return project.maintenance.documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: "Doc",
        source: d.filename,
        date: "—",
      }));
    default:
      return [];
  }
}

export function githubWebUrl(repo?: string): string | null {
  if (!repo?.trim()) return null;
  const r = repo.trim();
  if (r.startsWith("http://") || r.startsWith("https://")) return r;
  return `https://github.com/${r.replace(/^\/+/, "")}`;
}

export function firstOpenJiraTicket(project: PortfolioProject): {
  key: string;
  summary: string;
  status: string;
} | null {
  for (const g of project.build.jiraGroups) {
    for (const t of g.tickets) {
      if (!t.closedAt) return { key: t.key, summary: t.summary, status: g.status };
    }
  }
  return null;
}
