"use client";

import * as React from "react";
import { motion } from "motion/react";

import type { PortfolioMilestone, PortfolioPhase } from "@/feature/portfolio/types";
import type { UiPhase } from "@/feature/portfolio/types-display";
import { UI_PHASES } from "@/feature/portfolio/types-display";
import { cn } from "@/lib/utils";

const UI_TO_PORTFOLIO: Record<UiPhase, PortfolioPhase> = {
  Sales: "sales",
  Discovery: "discovery",
  Build: "build",
  QA: "qa",
  UAT: "uat",
  Maintenance: "maintenance",
};

/** Earliest `startedAt` (YYYY-MM-DD) per phase from milestones that declare `phase`. */
export function phaseDatesFromMilestones(
  milestones: PortfolioMilestone[],
): Partial<Record<PortfolioPhase, string>> {
  const out: Partial<Record<PortfolioPhase, string>> = {};
  for (const m of milestones) {
    if (!m.phase) continue;
    const d = m.startedAt.slice(0, 10);
    const prev = out[m.phase];
    if (!prev || d < prev) out[m.phase] = d;
  }
  return out;
}

/** Compact phase strip: one dot per lifecycle phase, recorded phase emphasized, start date under each. */
export function PhaseDotStrip({
  recordedPhase,
  phaseDates,
}: {
  recordedPhase: UiPhase;
  phaseDates: Partial<Record<PortfolioPhase, string>>;
}) {
  const recordedIdx = UI_PHASES.indexOf(recordedPhase);
  const denom = Math.max(1, UI_PHASES.length - 1);
  const progressRatio = Math.min(1, Math.max(0, recordedIdx / denom));

  return (
    <div className="min-w-0">
      <p className="mb-3 text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Phases
      </p>
      <div className="relative min-w-0 px-1 sm:px-2">
        {/* Baseline + filled progression to current phase */}
        <div
          className="pointer-events-none absolute left-3 right-3 top-[5px] z-0 h-[3px] rounded-full bg-muted/90 sm:left-4 sm:right-4"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-3 top-[5px] z-[1] h-[3px] w-[calc(100%-1.5rem)] overflow-hidden rounded-full sm:left-4 sm:w-[calc(100%-2rem)]">
          <motion.div
            className="h-full origin-left rounded-full bg-linear-to-r from-primary/80 via-primary to-primary/90"
            initial={false}
            animate={{ scaleX: progressRatio }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            style={{ width: "100%" }}
          />
        </div>
        <div className="relative z-10 flex w-full min-w-0 justify-between gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {UI_PHASES.map((phase, i) => {
            const key = UI_TO_PORTFOLIO[phase];
            const date = phaseDates[key] ?? "—";
            const done = i < recordedIdx;
            const active = i === recordedIdx;
            return (
              <div
                key={phase}
                className="flex min-w-[3.25rem] max-w-[5.5rem] flex-1 flex-col items-center gap-1 px-0.5 text-center sm:min-w-0 sm:max-w-none"
              >
                <span
                  className={cn(
                    "relative z-10 h-2.5 w-2.5 shrink-0 rounded-full border-2 bg-card transition-transform duration-200",
                    active && "scale-125 border-primary bg-primary shadow-sm shadow-primary/30",
                    !active && done && "border-primary/70 bg-primary/40",
                    !active && !done && "border-muted-foreground/40 bg-card",
                  )}
                  title={phase}
                />
                <span
                  className={cn(
                    "w-full truncate text-[8px] font-mono uppercase leading-tight tracking-tight sm:text-[9px]",
                    active ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {phase}
                </span>
                <span className="w-full truncate font-mono text-[8px] text-muted-foreground sm:text-[9px]">
                  {date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Shown inside the Progress tile when no `phase` entries exist on milestones. */
export function PortfolioDeliveryProgressFallback({
  pct,
  compact,
}: {
  pct: number;
  /** Omit heading when nested in the Progress KPI tile. */
  compact?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={cn("mt-3 space-y-1.5", !compact && "pt-1")}>
      {!compact ? (
        <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Delivery progress
        </p>
      ) : null}
      <div className="relative h-2 overflow-hidden rounded-full bg-muted/80 p-px">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="h-full rounded-full bg-gradient-to-r from-primary/35 via-primary to-primary/90"
        />
      </div>
      <p className={cn("text-center font-mono text-[9px] text-muted-foreground", compact && "text-left")}>
        Jira snapshot · {clamped}%
      </p>
    </div>
  );
}
