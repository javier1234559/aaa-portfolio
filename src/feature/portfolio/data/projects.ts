/**
 * Portfolio rows are loaded from the monorepo `config/` tree (manifest + per-slug folder).
 * See `config/projects.manifest.yaml` and `config/projects/<slug>/`.
 */
export {
  loadPortfolioProjects,
  getPortfolioProject,
  resolvePortfolioConfigRoot,
} from "@/server/portfolio/load-config";
