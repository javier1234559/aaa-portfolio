"use client";

import * as React from "react";
import { Calendar } from "lucide-react";

import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import type { SalesMeeting } from "@/feature/portfolio/types";
import { cn } from "@/lib/utils";

const LIST_PAGE = 8;

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}

function MeetingDetail({ meeting }: { meeting: SalesMeeting }) {
  const attendees =
    meeting.attendees.length > 0 ? meeting.attendees.join(", ") : "—";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <MetaField label="Source" value={meeting.source} />
          <MetaField label="Meeting" value={meeting.meeting} />
          <MetaField label="Date" value={meeting.date} />
          <MetaField label="Attendees" value={attendees} />
        </div>
      </div>

      <div className="flex min-h-[min(900px,70vh)] flex-col overflow-hidden rounded-xl border border-border bg-muted/15 lg:min-h-[900px] lg:max-h-[900px]">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
            Transcript preview
          </p>
        </div>
        <div className="thin-scrollbar flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {meeting.transcript.trim() ? (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
              {meeting.transcript}
            </pre>
          ) : meeting.transcriptUrl ? (
            <a
              href={meeting.transcriptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Open external transcript →
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No transcript in config.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SalesMeetingsPanel({ meetings }: { meetings: SalesMeeting[] }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const { page, setPage, pageItems, total } = usePagedItems(meetings, LIST_PAGE, [meetings]);

  const activeId =
    meetings.length === 0
      ? null
      : selectedId && meetings.some((m) => m.id === selectedId)
        ? selectedId
        : meetings[0].id;
  const selected = meetings.find((m) => m.id === activeId) ?? null;

  if (!meetings.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No meetings in <span className="font-mono">data_sales_meetings.json</span>.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <h5 className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
          Phase meetings
        </h5>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="divide-y divide-border">
            {pageItems.map((m) => {
              const active = m.id === activeId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={cn(
                    "group relative w-full border-l-4 border-transparent py-4 pl-3 text-left transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary",
                    active && "border-primary-foreground bg-primary text-primary-foreground",
                  )}
                >
                  <p
                    className={cn(
                      "font-mono text-[10px] transition-colors",
                      active ? "text-primary-foreground/85" : "text-muted-foreground group-hover:text-white/85",
                    )}
                  >
                    {m.date}
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-display text-base font-semibold uppercase tracking-tight transition-colors",
                      active ? "text-primary-foreground" : "text-foreground group-hover:text-white",
                    )}
                  >
                    {m.meeting}
                  </p>
                  {m.source ? (
                    <p
                      className={cn(
                        "mt-1 text-[10px] font-mono uppercase tracking-widest transition-colors",
                        active ? "text-primary-foreground/75" : "text-muted-foreground group-hover:text-white/75",
                      )}
                    >
                      {m.source}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
          {total > LIST_PAGE ? (
            <TablePaginationBar
              page={page}
              pageSize={LIST_PAGE}
              total={total}
              onPageChange={setPage}
              className="mt-2"
            />
          ) : null}
        </div>

        <div className="lg:col-span-3">{selected ? <MeetingDetail meeting={selected} /> : null}</div>
      </div>
    </div>
  );
}
