"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign } from "lucide-react";

import { formatMoney } from "@/feature/portfolio/lib/portfolio-commercial";
import type { RevenueGranularity } from "@/feature/portfolio/lib/portfolio-revenue-timeline";
import {
  buildPortfolioRevenueTimeline,
  portfolioRevenueCurrency,
} from "@/feature/portfolio/lib/portfolio-revenue-timeline";
import type { PortfolioProject } from "@/feature/portfolio/types";
import { cn } from "@/lib/utils";

const GRANULARITY_OPTIONS: { id: RevenueGranularity; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "biweek", label: "Bi-week" },
  { id: "month", label: "Month" },
];

export function PortfolioRevenueChart({ projects }: { projects: PortfolioProject[] }) {
  const [granularity, setGranularity] = React.useState<RevenueGranularity>("month");
  const currency = portfolioRevenueCurrency(projects);

  const data = React.useMemo(
    () => buildPortfolioRevenueTimeline(projects, granularity),
    [projects, granularity],
  );

  const totals = React.useMemo(() => {
    let collected = 0;
    let forecast = 0;
    for (const row of data) {
      collected += row.collected;
      forecast += row.forecast;
    }
    return { collected, forecast, total: collected + forecast };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border bg-muted/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-card p-2 text-emerald-600">
            <DollarSign size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-dark">Revenue timeline</h2>
            <p className="mt-0.5 text-[10px] uppercase leading-none tracking-widest text-brand-gray">
              Collected + forecast across portfolio
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-border bg-card p-0.5">
            {GRANULARITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGranularity(opt.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  granularity === opt.id
                    ? "bg-primary text-primary-foreground"
                    : "text-brand-gray hover:text-brand-dark",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-brand-gray">
            <span className="font-semibold text-brand-dark">
              {formatMoney(totals.total, currency)}
            </span>{" "}
            in view
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full px-4 py-6 sm:px-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--brand-neutral)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--brand-neutral)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `$${Math.round(Number(v) / 1000)}k` : `$${v}`
              }
              width={48}
            />
            <Tooltip
              cursor={{ fill: "color-mix(in srgb, var(--brand-teal) 6%, transparent)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload as (typeof data)[number] | undefined;
                if (!row) return null;
                return (
                  <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 font-semibold text-brand-dark">{label}</p>
                    <p className="text-emerald-700">
                      Collected: {formatMoney(row.collected, currency)}
                    </p>
                    <p className="text-brand-teal">
                      Forecast: {formatMoney(row.forecast, currency)}
                    </p>
                    <p className="mt-1 border-t border-border pt-1 font-semibold text-brand-dark">
                      Total: {formatMoney(row.total, currency)}
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value) => (
                <span className="text-brand-gray capitalize">{value}</span>
              )}
            />
            <Bar
              dataKey="collected"
              name="Collected"
              stackId="revenue"
              fill="var(--chart-1)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="forecast"
              name="Forecast"
              stackId="revenue"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
