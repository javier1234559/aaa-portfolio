import { loadPortfolioProjects } from "@/feature/portfolio/data/projects";
import {
  mapPortfolioProjectsToUi,
  uniqueClientCount,
} from "@/feature/portfolio/lib/map-portfolio-display";
import { PortfolioDashboardView } from "@/feature/portfolio/views/PortfolioDashboardView";

export const dynamic = "force-dynamic";

export default function AppHomePage() {
  const rows = loadPortfolioProjects();
  const projects = mapPortfolioProjectsToUi(rows);
  const stats = {
    total: rows.length,
    clientCount: uniqueClientCount(rows),
    inBuild: rows.filter((p) => p.currentPhase === "build").length,
    maintenance: rows.filter((p) => p.currentPhase === "maintenance").length,
  };
  return <PortfolioDashboardView projects={projects} stats={stats} />;
}
