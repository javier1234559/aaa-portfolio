"use client";

import type { PortfolioProject } from "@/feature/portfolio/types";
import type { UiPhase } from "@/feature/portfolio/types-display";
import { BuildCommitsPanel, BuildJiraPanel } from "@/feature/portfolio/components/build-phase-panels";
import { PhaseMarkdownWorkspace } from "@/feature/portfolio/components/phase-markdown-workspace";
import { SalesMeetingsPanel } from "@/feature/portfolio/components/sales-meetings-panel";

/** Right-column body for the active lifecycle phase (internal + client publish). */
export function ActivePhaseContent({
  project,
  phase,
  repoUrl,
  clientMode,
}: {
  project: PortfolioProject;
  phase: UiPhase;
  repoUrl: string | null;
  /** Hides internal-only build detail when true. */
  clientMode?: boolean;
}) {
  switch (phase) {
    case "Sales":
      return <SalesMeetingsPanel meetings={project.sales.meetings} />;
    case "Discovery":
      return (
        <PhaseMarkdownWorkspace
          documents={project.discovery.documents}
          heading="Discovery workspace"
          emptyLabel={
            clientMode
              ? "Discovery notes will appear here once your team publishes them."
              : "Add markdown files under config/projects/<slug>/discovery/."
          }
        />
      );
    case "Build":
      return (
        <div className="space-y-10">
          <BuildCommitsPanel commits={project.build.githubActivity} repoUrl={repoUrl} />
          <BuildJiraPanel project={project} />
        </div>
      );
    case "QA":
      return (
        <PhaseMarkdownWorkspace
          documents={project.qa.documents}
          heading="QA notes"
          emptyLabel={
            clientMode
              ? "QA documentation will appear here when available."
              : "Add markdown files under config/projects/<slug>/qa/."
          }
        />
      );
    case "UAT":
      return (
        <PhaseMarkdownWorkspace
          documents={project.uat.documents}
          heading="UAT pack"
          emptyLabel={
            clientMode
              ? "UAT materials will appear here when your team shares them."
              : "Add markdown files under config/projects/<slug>/uat/."
          }
        />
      );
    case "Maintenance":
      return (
        <PhaseMarkdownWorkspace
          documents={project.maintenance.documents}
          heading="Maintenance runbooks"
          emptyLabel={
            clientMode
              ? "Maintenance notes will appear here after go-live."
              : "Add markdown files under config/projects/<slug>/maintenance/."
          }
        />
      );
    default:
      return null;
  }
}
