import { loadPortfolioProjects } from "@/feature/portfolio/data/projects";
import { mapPortfolioProjectsToUi } from "@/feature/portfolio/lib/map-portfolio-display";
import { PublishPortfolioView } from "@/feature/portfolio/views/PublishPortfolioView";

export const dynamic = "force-dynamic";

export default function PublishPage() {
  const projects = mapPortfolioProjectsToUi(loadPortfolioProjects());
  return <PublishPortfolioView projects={projects} />;
}
