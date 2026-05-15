import type { UiPhase } from "@/feature/portfolio/types-display";

export function phaseTabIntro(
  phase: UiPhase,
  slug: string,
): { title: string; body: string } {
  switch (phase) {
    case "Sales":
      return {
        title: "Sales meetings",
        body:
          `Review call transcripts and meeting metadata for this deal. Rows come from config/projects/${slug}/data_sales_meetings.json today; automated sync via GitHub Actions is planned and will land in a later iteration.`,
      };
    case "Discovery":
      return {
        title: "Discovery workspace",
        body: `Discovery briefs and notes live in config/projects/${slug}/discovery/ as markdown files (YAML frontmatter + body). Add or edit those files directly, or use the portfolio config skill to refresh what appears here.`,
      };
    case "Build":
      return {
        title: "Build stream",
        body:
          "Track delivery activity on this project—recent GitHub commits and Jira tickets from the portfolio snapshot. data_sprint_progress.json and data_github_activity.json are refreshed automatically by GitHub Actions in this repository.",
      };
    case "QA":
      return {
        title: "QA surface",
        body: `QA checklists and test notes live in config/projects/${slug}/qa/ as markdown. Optional Notion or Loom links in the project YAML still appear above the doc list when set.`,
      };
    case "UAT":
      return {
        title: "UAT pack",
        body: `UAT scripts, sign-off notes, and staging context live in config/projects/${slug}/uat/ as markdown. Staging URLs from YAML appear as quick links when configured.`,
      };
    case "Maintenance":
      return {
        title: "Maintenance",
        body: `Runbooks and operational notes live in config/projects/${slug}/maintenance/ as markdown. Owner and Slack channel in YAML remain the source for People & links above.`,
      };
    default:
      return { title: "Phase overview", body: "" };
  }
}
