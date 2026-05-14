import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { parse as parseYaml } from "yaml";

import type {
  PortfolioComment,
  PortfolioPhase,
  PortfolioProject,
} from "@/feature/portfolio/types";

import {
  dashboardGithubToActivity,
  sprintProgressToJiraGroups,
} from "@/server/portfolio/sprint-github";
import type {
  DashboardGithubActivityFile,
  SprintProgressFile,
} from "@/server/portfolio/sprint-github";

const PHASES: PortfolioPhase[] = [
  "sales",
  "discovery",
  "build",
  "qa",
  "uat",
  "maintenance",
];

interface ManifestFile {
  version?: number;
  projects?: { slug: string }[];
}

interface DataJiraFile {
  jiraGroups?: PortfolioProject["build"]["jiraGroups"];
}

interface DataCommentsFile {
  comments?: PortfolioComment[];
}

function isPortfolioPhase(v: unknown): v is PortfolioPhase {
  return typeof v === "string" && (PHASES as string[]).includes(v);
}

/**
 * Default: `./config` when the app runs with cwd at this repository root (dev, CI).
 * Override with PORTFOLIO_CONFIG_ROOT for custom deploy layouts.
 */
export function resolvePortfolioConfigRoot(): string {
  if (process.env.PORTFOLIO_CONFIG_ROOT?.trim()) {
    return resolve(process.env.PORTFOLIO_CONFIG_ROOT.trim());
  }
  const cwd = process.cwd();
  const primary = join(cwd, "config");
  if (existsSync(join(primary, "projects.manifest.yaml"))) return primary;
  const fallback = join(cwd, "..", "idea", "config");
  if (existsSync(join(fallback, "projects.manifest.yaml"))) return fallback;
  return primary;
}

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function normalizeProject(
  slug: string,
  yamlRaw: unknown,
  jiraFile: DataJiraFile | null,
  commentsFile: DataCommentsFile | null,
  syncJiraGroups: PortfolioProject["build"]["jiraGroups"],
  syncGithubActivity: PortfolioProject["build"]["githubActivity"],
): PortfolioProject {
  const y = (yamlRaw && typeof yamlRaw === "object"
    ? yamlRaw
    : {}) as Record<string, unknown>;

  const currentPhase: PortfolioPhase = isPortfolioPhase(y.currentPhase)
    ? y.currentPhase
    : "discovery";

  const sales = (y.sales && typeof y.sales === "object"
    ? y.sales
    : {}) as PortfolioProject["sales"];
  const discovery = (y.discovery && typeof y.discovery === "object"
    ? y.discovery
    : {}) as PortfolioProject["discovery"];
  const buildYaml = (y.build && typeof y.build === "object"
    ? y.build
    : {}) as Partial<PortfolioProject["build"]>;
  const qa = (y.qa && typeof y.qa === "object" ? y.qa : {}) as PortfolioProject["qa"];
  const uat = (y.uat && typeof y.uat === "object"
    ? y.uat
    : {}) as PortfolioProject["uat"];
  const maintenance = (y.maintenance && typeof y.maintenance === "object"
    ? y.maintenance
    : {}) as PortfolioProject["maintenance"];

  const explicitJira = jiraFile?.jiraGroups;
  const jiraGroups =
    explicitJira && explicitJira.length > 0
      ? explicitJira
      : syncJiraGroups.length > 0
        ? syncJiraGroups
        : buildYaml.jiraGroups ??
          ([] as PortfolioProject["build"]["jiraGroups"]);

  const yamlGithub = buildYaml.githubActivity;
  const githubActivity =
    Array.isArray(yamlGithub) && yamlGithub.length > 0
      ? yamlGithub
      : syncGithubActivity.length > 0
        ? syncGithubActivity
        : ([] as PortfolioProject["build"]["githubActivity"]);

  const comments = Array.isArray(commentsFile?.comments)
    ? commentsFile!.comments!
    : [];

  return {
    slug: typeof y.slug === "string" ? y.slug : slug,
    projectName: String(y.projectName ?? slug),
    clientName: String(y.clientName ?? "—"),
    clientContact:
      typeof y.clientContact === "string" ? y.clientContact : undefined,
    engagementType: String(y.engagementType ?? "—"),
    currentPhase,
    slackContactChannel: String(y.slackContactChannel ?? "—"),
    apiBaseUrl: String(y.apiBaseUrl ?? ""),
    prototypeUrl:
      typeof y.prototypeUrl === "string" ? y.prototypeUrl : undefined,
    description: String(y.description ?? ""),
    jiraProjectKey:
      typeof y.jiraProjectKey === "string" ? y.jiraProjectKey : undefined,
    githubRepo: typeof y.githubRepo === "string" ? y.githubRepo : undefined,
    clientDashboardPath: String(y.clientDashboardPath ?? "#"),
    sales: {
      meetings: Array.isArray(sales.meetings) ? sales.meetings : [],
    },
    discovery: {
      docs: Array.isArray(discovery.docs) ? discovery.docs : [],
    },
    build: {
      jiraGroups,
      githubActivity,
    },
    qa: {
      notionSummaryUrl:
        typeof qa.notionSummaryUrl === "string"
          ? qa.notionSummaryUrl
          : undefined,
      loomEmbedUrl:
        typeof qa.loomEmbedUrl === "string" ? qa.loomEmbedUrl : undefined,
      notes: String(qa.notes ?? ""),
    },
    uat: {
      handoffSummary: String(uat.handoffSummary ?? ""),
      testEnvUrl:
        typeof uat.testEnvUrl === "string" ? uat.testEnvUrl : undefined,
      credentialHints: Array.isArray(uat.credentialHints)
        ? (uat.credentialHints as string[])
        : [],
    },
    maintenance: {
      owner: String(maintenance.owner ?? "—"),
      channel: String(maintenance.channel ?? "—"),
      notes: String(maintenance.notes ?? ""),
    },
    comments,
  };
}

function loadOneProject(configRoot: string, slug: string): PortfolioProject {
  const dir = join(configRoot, "projects", slug);
  const ymlPath = join(dir, `${slug}.yml`);

  if (!existsSync(ymlPath)) {
    throw new Error(
      `Portfolio config: missing ${ymlPath}. Expected ${slug}.yml inside projects/${slug}/.`,
    );
  }

  const yamlText = readFileSync(ymlPath, "utf8");
  const yamlRaw = parseYaml(yamlText);

  const y = (yamlRaw && typeof yamlRaw === "object"
    ? yamlRaw
    : {}) as Record<string, unknown>;
  const githubRepo =
    typeof y.githubRepo === "string" ? y.githubRepo : undefined;

  const jiraPath = join(dir, "data_jira.json");
  const commentsPath = join(dir, "data_comments.json");
  const commentsPathAlt = join(dir, "data_comment.json");
  const sprintPath = join(dir, "data_sprint_progress.json");
  const githubPath = join(dir, "data_github_activity.json");

  const jiraFile = readJsonFile<DataJiraFile>(jiraPath);
  const commentsFile =
    readJsonFile<DataCommentsFile>(commentsPath) ??
    readJsonFile<DataCommentsFile>(commentsPathAlt);

  const sprintData = readJsonFile<SprintProgressFile>(sprintPath);
  const githubData = readJsonFile<DashboardGithubActivityFile>(githubPath);

  const syncJiraGroups = sprintProgressToJiraGroups(sprintData);
  const syncGithubActivity = dashboardGithubToActivity(
    githubData,
    githubRepo,
  );

  return normalizeProject(
    slug,
    yamlRaw,
    jiraFile,
    commentsFile,
    syncJiraGroups,
    syncGithubActivity,
  );
}

export function loadPortfolioProjects(): PortfolioProject[] {
  const configRoot = resolvePortfolioConfigRoot();
  const manifestPath = join(configRoot, "projects.manifest.yaml");

  if (!existsSync(manifestPath)) {
    throw new Error(
      `Portfolio config: missing ${manifestPath}. Set PORTFOLIO_CONFIG_ROOT or add config/projects.manifest.yaml.`,
    );
  }

  const manifest = parseYaml(
    readFileSync(manifestPath, "utf8"),
  ) as ManifestFile;
  const rows = Array.isArray(manifest.projects) ? manifest.projects : [];

  return rows.map((row) => {
    const slug = typeof row.slug === "string" ? row.slug : "";
    if (!slug) {
      throw new Error("Portfolio config: manifest entry missing slug.");
    }
    return loadOneProject(configRoot, slug);
  });
}

export function getPortfolioProject(slug: string): PortfolioProject | undefined {
  return loadPortfolioProjects().find((p) => p.slug === slug);
}
