"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, Circle } from "lucide-react";

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

function PhaseMarker({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <span
        className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-card"
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (active) {
    return (
      <span
        className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-primary/25"
        aria-hidden
      >
        <Circle className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
      </span>
    );
  }
  return (
    <span
      className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/55 bg-card"
      aria-hidden
    />
  );
}

/** Lifecycle strip: label above marker, date below only for reached phases. */
export function PhaseDotStrip({
  recordedPhase,
  phaseDates,
}: {
  recordedPhase: UiPhase;
  phaseDates: Partial<Record<PortfolioPhase, string>>;
}) {
  const recordedIdx = UI_PHASES.indexOf(recordedPhase);
  /** Fill to center of active column so the bar meets the active marker. */
  const progressRatio = Math.min(1, (recordedIdx + 0.5) / UI_PHASES.length);

  return (
    <div className="min-w-0">
      <p className="mb-4 text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Phases
      </p>
      <div className="relative min-w-0 px-1 sm:px-2">
        <div
          className="pointer-events-none absolute left-3 right-3 z-0 h-[3px] -translate-y-1/2 rounded-full bg-muted sm:left-4 sm:right-4"
          style={{ top: "calc(1.25rem + 0.875rem)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-3 z-[1] h-[3px] -translate-y-1/2 overflow-hidden rounded-full sm:left-4"
          style={{
            top: "calc(1.25rem + 0.875rem)",
            width: "calc(100% - 1.5rem)",
          }}
        >
          <motion.div
            className="h-full origin-left rounded-full bg-primary"
            initial={false}
            animate={{ scaleX: progressRatio }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            style={{ width: "100%" }}
          />
        </div>

        <div className="relative z-10 flex w-full min-w-0 justify-between gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {UI_PHASES.map((phase, i) => {
            const key = UI_TO_PORTFOLIO[phase];
            const rawDate = phaseDates[key];
            const reached = i <= recordedIdx;
            const done = i < recordedIdx;
            const active = i === recordedIdx;
            const showDate = reached && Boolean(rawDate);

            return (
              <div
                key={phase}
                className="flex min-w-[4.5rem] max-w-[6.5rem] flex-1 flex-col items-center px-0.5 text-center sm:min-w-0 sm:max-w-none"
              >
                <span
                  className={cn(
                    "mb-2 w-full truncate font-mono text-[11px] font-semibold uppercase leading-tight tracking-wide sm:text-xs",
                    active && "text-foreground",
                    !active && reached && "text-foreground/85",
                    !reached && "text-muted-foreground",
                  )}
                >
                  {phase}
                </span>
                <div className="flex h-7 items-center justify-center">
                  <PhaseMarker done={done} active={active} />
                </div>
                {showDate ? (
                  <span className="mt-2 w-full truncate font-mono text-[10px] tabular-nums text-muted-foreground sm:text-[11px]">
                    {rawDate}
                  </span>
                ) : (
                  <span className="mt-2 block h-[14px] sm:h-[15px]" aria-hidden />
                )}
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
