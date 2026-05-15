import type { UiPhase } from "@/feature/portfolio/types-display";

/** Client-facing copy for the publish portal (no internal config paths). */
export function clientPhaseTabIntro(phase: UiPhase): { title: string; body: string } {
  switch (phase) {
    case "Sales":
      return {
        title: "Sales & alignment",
        body:
          "Summary of discovery calls and proposals for this engagement. Your AAA team keeps this section updated as the partnership progresses.",
      };
    case "Discovery":
      return {
        title: "Discovery",
        body:
          "Scope, requirements, and planning artifacts for your project. This is the reference your delivery team uses before and during build.",
      };
    case "Build":
      return {
        title: "Build & delivery",
        body:
          "Live view of recent engineering commits and sprint status for your product. Data is refreshed automatically so you can follow progress without waiting for a weekly email.",
      };
    case "QA":
      return {
        title: "Quality assurance",
        body:
          "Test plans, checklists, and release notes while we verify the build before handoff to you for UAT.",
      };
    case "UAT":
      return {
        title: "User acceptance testing",
        body:
          "Staging access, sign-off criteria, and handoff materials while you validate the product in your environment.",
      };
    case "Maintenance":
      return {
        title: "Maintenance",
        body:
          "Ongoing support context, runbooks, and operational notes after go-live.",
      };
    default:
      return { title: "Project status", body: "" };
  }
}
