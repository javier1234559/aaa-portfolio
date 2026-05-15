/** Lifecycle phases (Brad overview + internal detail tabs). */
export type PortfolioPhase =
  | "sales"
  | "discovery"
  | "build"
  | "qa"
  | "uat"
  | "maintenance";

/** @deprecated Prefer `data_sales_meetings.json`; kept for YAML fallback. */
export interface MeetingRow {
  id: string;
  title: string;
  date: string;
  transcriptUrl?: string;
  tool?: "Fireflies" | "Granola" | "Zoom" | string;
}

/** Sales tab — loaded from `data_sales_meetings.json`. */
export interface SalesMeeting {
  id: string;
  source: string;
  meeting: string;
  date: string;
  attendees: string[];
  transcript: string;
  transcriptUrl?: string;
}

/** Phase markdown doc — loaded from `discovery/`, `qa/`, `uat/`, or `maintenance/` `*.md`. */
export interface PhaseMarkdownDoc {
  id: string;
  title: string;
  filename: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

/** @deprecated Prefer `discovery/*.md`; kept for YAML fallback. */
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

/** Cash event for revenue timeline (`commercial.entries` in YAML). */
export interface PortfolioCommercialEntry {
  /** YYYY-MM-DD */
  date: string;
  amount: number;
  /** `collected` = realized; `forecast` = expected (default forecast). */
  kind: "collected" | "forecast";
}

/** Internal-only commercial fields (`commercial:` in project YAML). */
export interface PortfolioCommercial {
  currency: string;
  status: "pipeline" | "proposed" | "signed" | "invoicing" | "closed";
  proposalAmount: number | null;
  contractedAmount: number | null;
  collectedAmount: number;
  /** 0–1; used for pipeline weighted forecast (default 0.5). */
  winProbability: number;
  expectedCloseDate?: string;
  notes?: string;
  /** Optional dated cash events; inferred from totals when omitted. */
  entries?: PortfolioCommercialEntry[];
}

/** Strategic stakeholders for the project detail “People” panel. */
export interface PortfolioTeamConfig {
  /** Default AAA sales contact when omitted: Brad Wilcox. */
  sales?: string;
  /** Optional project manager (omit when unknown). */
  pm?: string;
  /** Default QA when omitted: Javier. */
  qa?: string;
  /** Client contacts (falls back to `clientName` when empty). */
  clients?: string[];
  engineers?: string[];
}

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
  team: PortfolioTeamConfig;
  sales: {
    meetings: SalesMeeting[];
  };
  discovery: {
    documents: PhaseMarkdownDoc[];
    /** Legacy YAML index; empty when using `discovery/*.md`. */
    docs: DiscoveryDocRow[];
  };
  build: {
    jiraGroups: JiraLogGroup[];
    githubActivity: GitHubLogEntry[];
  };
  qa: {
    documents: PhaseMarkdownDoc[];
    notionSummaryUrl?: string;
    loomEmbedUrl?: string;
    notes: string;
  };
  uat: {
    documents: PhaseMarkdownDoc[];
    handoffSummary: string;
    testEnvUrl?: string;
    credentialHints: string[];
  };
  maintenance: {
    documents: PhaseMarkdownDoc[];
    owner: string;
    channel: string;
    notes: string;
  };
  /** Loaded from data_comments.json when present. */
  comments: PortfolioComment[];
  /** Loaded from milestones.yaml when present; otherwise empty. */
  milestones: PortfolioMilestone[];
  /** From YAML `commercial:` when present. */
  commercial?: PortfolioCommercial;
}
