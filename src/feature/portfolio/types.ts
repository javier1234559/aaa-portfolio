/** Lifecycle phases (Brad overview + internal detail tabs). */
export type PortfolioPhase =
  | "sales"
  | "discovery"
  | "build"
  | "qa"
  | "uat"
  | "maintenance";

export interface MeetingRow {
  id: string;
  title: string;
  date: string;
  transcriptUrl?: string;
  tool?: "Fireflies" | "Granola" | "Zoom";
}

export interface DiscoveryDocRow {
  id: string;
  name: string;
  path: string;
  kind: "brief" | "prd" | "tech-spec" | "other";
}

export interface JiraLogGroup {
  status: string;
  tickets: { key: string; summary: string; closedAt?: string }[];
}

export interface GitHubLogEntry {
  sha: string;
  message: string;
  date: string;
  url: string;
}

/** Internal thread / notes stored in config per project (data_comments.json). */
export interface PortfolioComment {
  id: string;
  /** Optional phase label for filtering in UI later. */
  phase?: PortfolioPhase;
  author: string;
  body: string;
  /** ISO 8601 timestamp. */
  at: string;
}

/** Optional delivery milestones (`milestones.yaml` per project). */
export interface PortfolioMilestone {
  title: string;
  /** Start date for this gate (YYYY-MM-DD). */
  startedAt: string;
  /** When true, used by future automation; optional for UI. */
  completed: boolean;
  /** If set, `startedAt` shows on the phase dot strip for this lifecycle phase. */
  phase?: PortfolioPhase;
}

export interface PortfolioProject {
  slug: string;
  projectName: string;
  clientName: string;
  clientContact?: string;
  engagementType: string;
  /** Single “current” phase for table + stepper. */
  currentPhase: PortfolioPhase;
  slackContactChannel: string;
  apiBaseUrl: string;
  prototypeUrl?: string;
  description: string;
  jiraProjectKey?: string;
  githubRepo?: string;
  clientDashboardPath: string;
  sales: {
    meetings: MeetingRow[];
  };
  discovery: {
    docs: DiscoveryDocRow[];
  };
  build: {
    jiraGroups: JiraLogGroup[];
    githubActivity: GitHubLogEntry[];
  };
  qa: {
    notionSummaryUrl?: string;
    loomEmbedUrl?: string;
    notes: string;
  };
  uat: {
    handoffSummary: string;
    testEnvUrl?: string;
    credentialHints: string[];
  };
  maintenance: {
    owner: string;
    channel: string;
    notes: string;
  };
  /** Loaded from data_comments.json when present. */
  comments: PortfolioComment[];
  /** Loaded from milestones.yaml when present; otherwise empty. */
  milestones: PortfolioMilestone[];
}
