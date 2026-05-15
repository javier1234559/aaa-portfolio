import type {
  PortfolioCommercial,
  PortfolioCommercialEntry,
  PortfolioProject,
} from "@/feature/portfolio/types";

export type RevenueGranularity = "week" | "biweek" | "month";

export interface RevenuePeriodBucket {
  periodKey: string;
  label: string;
  collected: number;
  forecast: number;
  total: number;
}

const SIGNED_STATUSES = new Set(["signed", "invoicing", "closed"]);
const PIPELINE_STATUSES = new Set(["pipeline", "proposed"]);

function parseYmd(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addMonths(d: Date, months: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + months);
  return out;
}

function startOfWeekMonday(d: Date): Date {
  const out = new Date(d);
  const day = out.getDay();
  const diff = out.getDate() - day + (day === 0 ? -6 : 1);
  out.setDate(diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

function biweekAnchor(): Date {
  return new Date(2024, 0, 1);
}

function periodBounds(
  periodKey: string,
  granularity: RevenueGranularity,
): { start: Date; end: Date } {
  if (granularity === "month") {
    const [y, m] = periodKey.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return { start, end };
  }
  if (granularity === "week") {
    const start = parseYmd(periodKey);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  }
  const index = Number(periodKey.replace("bw-", ""));
  const anchor = biweekAnchor();
  const start = new Date(anchor);
  start.setDate(start.getDate() + index * 14);
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  return { start, end };
}

function formatPeriodLabel(periodKey: string, granularity: RevenueGranularity): string {
  const { start, end } = periodBounds(periodKey, granularity);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });

  if (granularity === "month") {
    return start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  if (granularity === "week") {
    return `Wk ${fmt(start)}`;
  }
  return `${fmt(start)} – ${fmt(end)}`;
}

export function periodKeyForDate(date: Date, granularity: RevenueGranularity): string {
  if (granularity === "month") {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  if (granularity === "week") {
    return formatYmd(startOfWeekMonday(date));
  }
  const anchor = biweekAnchor();
  const dayMs = 86400000;
  const diffDays = Math.floor((date.getTime() - anchor.getTime()) / dayMs);
  const index = Math.floor(diffDays / 14);
  return `bw-${index}`;
}

function splitAmount(total: number, parts: number): number[] {
  if (parts <= 0 || total <= 0) return [];
  const base = Math.floor((total / parts) * 100) / 100;
  const amounts = Array(parts).fill(base);
  const sum = base * parts;
  amounts[parts - 1] += Math.round((total - sum) * 100) / 100;
  return amounts;
}

/** When YAML has no `entries`, derive a plausible cash timeline from totals. */
export function inferCommercialEntries(c: PortfolioCommercial): PortfolioCommercialEntry[] {
  if (c.entries && c.entries.length > 0) return c.entries;

  const anchor = c.expectedCloseDate ? parseYmd(c.expectedCloseDate) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entries: PortfolioCommercialEntry[] = [];

  if (c.collectedAmount > 0) {
    const slices = splitAmount(c.collectedAmount, 3);
    for (let i = 0; i < slices.length; i += 1) {
      entries.push({
        date: formatYmd(addMonths(anchor, -(3 - i))),
        amount: slices[i]!,
        kind: "collected",
      });
    }
  }

  if (SIGNED_STATUSES.has(c.status)) {
    const base = c.contractedAmount ?? c.proposalAmount ?? 0;
    const remaining = Math.max(0, base - c.collectedAmount);
    if (remaining > 0) {
      const start = today > anchor ? today : anchor;
      const slices = splitAmount(remaining, 4);
      for (let i = 0; i < slices.length; i += 1) {
        entries.push({
          date: formatYmd(addMonths(start, i + 1)),
          amount: slices[i]!,
          kind: "forecast",
        });
      }
    }
  } else if (PIPELINE_STATUSES.has(c.status) && c.proposalAmount != null) {
    const weighted = c.proposalAmount * c.winProbability;
    if (weighted > 0) {
      entries.push({
        date: formatYmd(anchor),
        amount: Math.round(weighted * 100) / 100,
        kind: "forecast",
      });
    }
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export function collectPortfolioCommercialEntries(
  projects: PortfolioProject[],
): PortfolioCommercialEntry[] {
  const all: PortfolioCommercialEntry[] = [];
  for (const p of projects) {
    if (!p.commercial) continue;
    for (const e of inferCommercialEntries(p.commercial)) {
      all.push(e);
    }
  }
  return all;
}

export function aggregateRevenueByPeriod(
  entries: PortfolioCommercialEntry[],
  granularity: RevenueGranularity,
): RevenuePeriodBucket[] {
  const map = new Map<string, { collected: number; forecast: number }>();

  for (const e of entries) {
    const key = periodKeyForDate(parseYmd(e.date), granularity);
    const bucket = map.get(key) ?? { collected: 0, forecast: 0 };
    if (e.kind === "collected") bucket.collected += e.amount;
    else bucket.forecast += e.amount;
    map.set(key, bucket);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodKey, { collected, forecast }]) => ({
      periodKey,
      label: formatPeriodLabel(periodKey, granularity),
      collected,
      forecast,
      total: collected + forecast,
    }));
}

export function buildPortfolioRevenueTimeline(
  projects: PortfolioProject[],
  granularity: RevenueGranularity,
): RevenuePeriodBucket[] {
  return aggregateRevenueByPeriod(collectPortfolioCommercialEntries(projects), granularity);
}

export function portfolioRevenueCurrency(projects: PortfolioProject[]): string {
  for (const p of projects) {
    if (p.commercial?.currency) return p.commercial.currency;
  }
  return "USD";
}
