"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";

import { TablePaginationBar, usePagedItems } from "@/components/ui/table-pagination";
import type { PhaseMarkdownDoc } from "@/feature/portfolio/types";
import { cn } from "@/lib/utils";

const LIST_PAGE = 10;

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 font-display text-2xl font-bold tracking-tight text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-3 mt-8 border-b border-border pb-2 font-display text-lg font-semibold text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-foreground">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="font-medium text-primary underline-offset-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const inline = !className;
    if (inline) {
      return (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>
      );
    }
    return <code className="font-mono text-xs leading-relaxed text-foreground">{children}</code>;
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="thin-scrollbar mb-4 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs">{children}</pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="mb-4 border-l-4 border-primary/40 pl-4 text-sm italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="thin-scrollbar mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-border bg-muted/60 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-border px-3 py-2 text-sm text-muted-foreground">{children}</td>
  ),
};

function MarkdownBody({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
}

export function PhaseMarkdownWorkspace({
  documents,
  heading,
  emptyLabel,
}: {
  documents: PhaseMarkdownDoc[];
  heading: string;
  emptyLabel: string;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const { page, setPage, pageItems, total } = usePagedItems(documents, LIST_PAGE, [documents]);

  const activeId =
    documents.length === 0
      ? null
      : selectedId && documents.some((d) => d.id === selectedId)
        ? selectedId
        : documents[0].id;
  const selected = documents.find((d) => d.id === activeId) ?? null;

  if (!documents.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
        <FileText className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <h5 className="text-[10px] font-mono font-medium uppercase tracking-widest text-muted-foreground">
          {heading}
        </h5>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="divide-y divide-border">
            {pageItems.map((doc) => {
              const active = doc.id === activeId;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedId(doc.id)}
                  className={cn(
                    "group relative w-full border-l-4 border-transparent py-3 pl-3 text-left transition-colors duration-200 ease-out hover:border-primary-foreground hover:bg-primary",
                    active && "border-primary-foreground bg-primary text-primary-foreground",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      active ? "text-primary-foreground" : "text-foreground group-hover:text-white",
                    )}
                  >
                    {doc.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-[10px] transition-colors",
                      active ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-white/75",
                    )}
                  >
                    {doc.filename}
                  </p>
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

        <div className="thin-scrollbar min-h-[min(900px,70vh)] overflow-y-auto rounded-xl border border-border bg-muted/15 p-5 sm:p-6 lg:col-span-3 lg:min-h-[900px] lg:max-h-[900px]">
          {selected ? <MarkdownBody content={selected.content} /> : null}
        </div>
      </div>
    </div>
  );
}
