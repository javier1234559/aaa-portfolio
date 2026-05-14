"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PortfolioPhase, PortfolioProject } from "@/feature/portfolio/types";
import { RouteNames } from "@/constants";

const phaseLabel: Record<PortfolioPhase, string> = {
  sales: "Sales",
  discovery: "Discovery",
  build: "Build",
  qa: "QA",
  uat: "UAT",
  maintenance: "Maintenance",
};

export function ProjectsListView({
  projects,
}: {
  projects: PortfolioProject[];
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
        <p className="mt-2 text-sm leading-snug text-muted-foreground">
          Rows load from{" "}
          <code className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-xs">
            config/projects.manifest.yaml
          </code>{" "}
          and{" "}
          <code className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-xs">
            config/projects/
          </code>{" "}
          (YAML + JSON; sprint/GitHub from CI or copy). Gantt chart comes later.
        </p>
      </header>

      <div className="rounded-lg border border-border/80 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.slug} className="text-sm">
                <TableCell className="font-medium">{p.projectName}</TableCell>
                <TableCell>{p.clientName}</TableCell>
                <TableCell className="hidden max-w-[200px] truncate text-muted-foreground sm:table-cell">
                  {p.engagementType}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="border border-border/60 bg-primary/10 font-medium text-primary"
                  >
                    {phaseLabel[p.currentPhase]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={RouteNames.projectDetail(p.slug)}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Open
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
