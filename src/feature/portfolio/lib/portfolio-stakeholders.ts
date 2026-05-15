import type { PortfolioProject } from "@/feature/portfolio/types";

const DEFAULT_SALES = "Brad Wilcox";
const DEFAULT_QA = "Javier";

export type StakeholderRow = { id: string; name: string; role: string };

/** People panel rows: sales, client(s), optional PM, QA, engineers. */
export function portfolioStakeholders(project: PortfolioProject): StakeholderRow[] {
  const rows: StakeholderRow[] = [];
  const t = project.team;

  const salesName = t.sales?.trim() || DEFAULT_SALES;
  rows.push({ id: `${project.slug}-sales`, name: salesName, role: "Sales" });

  const clients =
    t.clients && t.clients.length > 0
      ? t.clients
      : project.clientName && project.clientName !== "—"
        ? [project.clientName]
        : [];
  for (const name of clients) {
    const n = name.trim();
    if (!n) continue;
    rows.push({
      id: `${project.slug}-client-${n.replace(/\s+/g, "-").toLowerCase()}`,
      name: n,
      role: clients.length > 1 ? "Client" : "Client contact",
    });
  }

  if (project.clientContact?.trim() && !clients.includes(project.clientContact.trim())) {
    rows.push({
      id: `${project.slug}-client-extra`,
      name: project.clientContact.trim(),
      role: "Client contact",
    });
  }

  const pmName = t.pm?.trim();
  if (pmName) {
    rows.push({ id: `${project.slug}-pm`, name: pmName, role: "PM" });
  }

  const qaName = t.qa?.trim() || DEFAULT_QA;
  rows.push({ id: `${project.slug}-qa`, name: qaName, role: "QA" });

  for (const eng of t.engineers ?? []) {
    const n = eng.trim();
    if (!n) continue;
    rows.push({
      id: `${project.slug}-eng-${n.replace(/\s+/g, "-").toLowerCase()}`,
      name: n,
      role: "Engineer",
    });
  }

  return rows;
}

export function parseTeamYaml(
  raw: unknown,
  clientName: string,
): PortfolioProject["team"] {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const strList = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean);
  };

  const clients = strList(d.clients);
  if (!clients.length && clientName && clientName !== "—") {
    clients.push(clientName);
  }

  const pm = str(d.pm);

  return {
    sales: str(d.sales) || DEFAULT_SALES,
    pm: pm || undefined,
    qa: str(d.qa) || DEFAULT_QA,
    clients,
    engineers: strList(d.engineers),
  };
}
