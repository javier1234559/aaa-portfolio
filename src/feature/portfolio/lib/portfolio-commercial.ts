import type { PortfolioCommercial, PortfolioProject } from "@/feature/portfolio/types";

export type CommercialStatus =
  | "pipeline"
  | "proposed"
  | "signed"
  | "invoicing"
  | "closed";

const PIPELINE_STATUSES: CommercialStatus[] = ["pipeline", "proposed"];
const SIGNED_STATUSES: CommercialStatus[] = ["signed", "invoicing", "closed"];

export function parseCommercialYaml(raw: unknown): PortfolioCommercial | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const y = raw as Record<string, unknown>;

  const statusRaw = typeof y.status === "string" ? y.status.trim().toLowerCase() : "";
  const status = (
    ["pipeline", "proposed", "signed", "invoicing", "closed"] as const
  ).includes(statusRaw as CommercialStatus)
    ? (statusRaw as CommercialStatus)
    : "pipeline";

  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const winRaw = y.winProbability;
  let winProbability = 0.5;
  if (winRaw !== undefined && winRaw !== null && winRaw !== "") {
    const w = typeof winRaw === "number" ? winRaw : Number(winRaw);
    if (Number.isFinite(w)) winProbability = w > 1 ? w / 100 : Math.min(1, Math.max(0, w));
  }

  const proposalAmount = num(y.proposalAmount);
  const contractedAmount = num(y.contractedAmount);
  const collectedAmount = num(y.collectedAmount) ?? 0;

  if (
    proposalAmount === null &&
    contractedAmount === null &&
    collectedAmount === 0 &&
    !y.notes
  ) {
    return undefined;
  }

  return {
    currency: typeof y.currency === "string" && y.currency.trim() ? y.currency.trim() : "USD",
    status,
    proposalAmount,
    contractedAmount,
    collectedAmount,
    winProbability,
    expectedCloseDate:
      typeof y.expectedCloseDate === "string" ? y.expectedCloseDate.trim() : undefined,
    notes: typeof y.notes === "string" ? y.notes.trim() : undefined,
  };
}

export function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function commercialStatusLabel(status: CommercialStatus): string {
  const labels: Record<CommercialStatus, string> = {
    pipeline: "Pipeline",
    proposed: "Proposed",
    signed: "Signed",
    invoicing: "Invoicing",
    closed: "Closed",
  };
  return labels[status];
}

/** Primary $ figure for list/detail display. */
export function commercialDisplayPrimary(c: PortfolioCommercial): string {
  const { currency, status, proposalAmount, contractedAmount, collectedAmount } = c;
  if (SIGNED_STATUSES.includes(status) && contractedAmount != null) {
    const remaining = Math.max(0, contractedAmount - collectedAmount);
    if (remaining > 0 && collectedAmount > 0) {
      return `${formatMoney(remaining, currency)} remaining`;
    }
    return `${formatMoney(contractedAmount, currency)} contracted`;
  }
  if (proposalAmount != null) {
    return `${formatMoney(proposalAmount, currency)} proposal`;
  }
  return "—";
}

/** Weighted forecast for portfolio rollups. */
export function commercialForecastValue(c: PortfolioCommercial): number {
  const { status, proposalAmount, contractedAmount, collectedAmount, winProbability } = c;
  if (SIGNED_STATUSES.includes(status)) {
    const base = contractedAmount ?? proposalAmount ?? 0;
    return Math.max(0, base - collectedAmount);
  }
  if (proposalAmount != null && PIPELINE_STATUSES.includes(status)) {
    return proposalAmount * winProbability;
  }
  return proposalAmount ?? contractedAmount ?? 0;
}

export interface PortfolioCommercialRollup {
  currency: string;
  totalContracted: number;
  totalPipelineWeighted: number;
  totalForecast: number;
  totalCollected: number;
  projectsWithCommercial: number;
}

export function rollupPortfolioCommercial(
  projects: PortfolioProject[],
): PortfolioCommercialRollup {
  let totalContracted = 0;
  let totalPipelineWeighted = 0;
  let totalForecast = 0;
  let totalCollected = 0;
  let projectsWithCommercial = 0;
  let currency = "USD";

  for (const p of projects) {
    const c = p.commercial;
    if (!c) continue;
    projectsWithCommercial += 1;
    currency = c.currency;
    totalCollected += c.collectedAmount;

    if (SIGNED_STATUSES.includes(c.status) && c.contractedAmount != null) {
      totalContracted += c.contractedAmount;
      totalForecast += Math.max(0, c.contractedAmount - c.collectedAmount);
    } else if (c.proposalAmount != null) {
      const weighted = c.proposalAmount * c.winProbability;
      totalPipelineWeighted += weighted;
      totalForecast += weighted;
    }
  }

  return {
    currency,
    totalContracted,
    totalPipelineWeighted,
    totalForecast,
    totalCollected,
    projectsWithCommercial,
  };
}
