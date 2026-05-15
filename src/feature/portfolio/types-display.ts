/** Row shape for AAA Portfolio dashboard / publish UI (mirrors idea/design/aaa-portfolio types). */

export type UiPhase =
  | "Sales"
  | "Discovery"
  | "Build"
  | "QA"
  | "UAT"
  | "Maintenance";

export type UiHealth =
  | "Healthy"
  | "At Risk"
  | "Critical"
  | "Maintenance";

export interface UiProject {
  slug: string;
  id: string;
  client: string;
  name: string;
  description: string;
  currentPhase: UiPhase;
  health: UiHealth;
  owner: { id: string; name: string; role: string };
  progress: number;
  nextMilestone: {
    id: string;
    title: string;
    date: string;
    status: "Completed" | "In Progress" | "Pending";
  };
  isPublished: boolean;
  clientDashboardPath: string;
  /** Formatted primary revenue line; empty when no `commercial` in YAML. */
  revenueLabel: string;
  revenueForecast: number;
  commercialStatus?: string;
}

export const UI_PHASES: UiPhase[] = [
  "Sales",
  "Discovery",
  "Build",
  "QA",
  "UAT",
  "Maintenance",
];
