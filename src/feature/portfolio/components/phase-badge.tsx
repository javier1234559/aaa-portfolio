import type { UiPhase } from "@/feature/portfolio/types-display";

export function PhaseBadge({ phase }: { phase: UiPhase }) {
  const styles: Record<UiPhase, string> = {
    Sales: "bg-indigo-50 text-indigo-700",
    Discovery: "bg-sky-50 text-sky-700",
    Build: "bg-violet-50 text-violet-700",
    QA: "bg-fuchsia-50 text-fuchsia-700",
    UAT: "bg-emerald-50 text-emerald-700",
    Maintenance: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded px-2 py-1 text-[11px] font-medium ${styles[phase] ?? ""}`}
    >
      {phase}
    </span>
  );
}
