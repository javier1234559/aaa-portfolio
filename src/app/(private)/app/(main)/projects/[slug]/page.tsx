import { notFound } from "next/navigation";

import { ProjectDetailView } from "@/feature/portfolio/views/ProjectDetailView";
import { getPortfolioProject } from "@/feature/portfolio/data/projects";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);
  if (!project) notFound();
  return <ProjectDetailView project={project} />;
}
