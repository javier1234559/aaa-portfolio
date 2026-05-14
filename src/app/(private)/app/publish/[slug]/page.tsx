import { notFound } from "next/navigation";

import { getPortfolioProject } from "@/feature/portfolio/data/projects";
import { ClientPortalView } from "@/feature/portfolio/views/ClientPortalView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function isPublishedDashboard(path: string): boolean {
  return /^https?:\/\//i.test(path.trim());
}

export default async function ClientPortalPage({ params }: Props) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) notFound();
  if (!isPublishedDashboard(project.clientDashboardPath)) notFound();
  return <ClientPortalView project={project} />;
}
