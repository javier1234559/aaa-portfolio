import { ProjectData, ProjectPhase } from './types';

export const PROJECT_DATA: ProjectData = {
  name: "KidneyHood",
  status: "In production",
  description: "A patient-facing eGFR projection tool with predictive modelling, reportable PDFs, and a tokenized clinician share-flow. Built by AAA over 6 sprints. This page updates each Monday with the week's ship list, tickets, deploys, and the live prototype.",
  client: "Lee",
  slug: "kidneyhood",
  engagement: "Project · Web Application",
  currentPhase: ProjectPhase.BUILD,
  health: 'At Risk',
  progress: 0,
  deliveryTeam: [
    { name: "AE", role: "AAA Engineering", company: "AAA" },
    { name: "Delivery Lead", role: "Project Management" }
  ],
  operationalLinks: [
    { label: "GitHub repository", url: "#", icon: "Github" },
    { label: "Jira · LKID", url: "#", icon: "Layout" },
    { label: "Slack · #client-comms", url: "#", icon: "Slack" },
    { label: "Client dashboard", url: "#", icon: "ExternalLink" }
  ],
  phaseContent: {
    [ProjectPhase.SALES]: {
      meetings: [
        { id: "M1", title: "Initial Discovery", date: "2024-01-10", participants: ["Lee", "Sales Team"] },
        { id: "M2", title: "Proposal Review", date: "2024-01-15", participants: ["Lee", "AAA Sales"] }
      ],
      notes: "Sales cycle completed in 3 weeks."
    },
    [ProjectPhase.DISCOVERY]: {
      meetings: [
        { id: "M3", title: "Technical Scoping", date: "2024-02-01", participants: ["Eng Team", "Lee"] },
        { id: "M4", title: "UI/UX Workshop", date: "2024-02-05", participants: ["Design Team", "Lee"] }
      ],
      notes: "Feature roadmap finalized during this phase."
    },
    [ProjectPhase.BUILD]: {
      commits: [
        { id: "c8f2a1b", author: "dev_aaa", message: "Initial project scaffolding", date: "2024-03-01" },
        { id: "a1b2c3d", author: "dev_aaa", message: "Add eGFR calculation logic", date: "2024-03-05" },
        { id: "e5f6g7h", author: "dev_aaa", message: "implement PDF generation pipeline", date: "2024-03-10" }
      ],
      jiraTasks: [
        { id: "LKID-30", title: "Design Sprint", status: "Done", stream: "Design" },
        { id: "LKID-39", title: "Client dashboard mockup", status: "Open", stream: "Design" },
        { id: "LKID-40", title: "Dashboard page scaffolding", status: "Open", stream: "Engineering" },
        { id: "LKID-41", title: "Core dashboard components", status: "Open", stream: "Engineering" },
        { id: "LKID-42", title: "WeeklyUpdate component", status: "Open", stream: "Engineering" }
      ],
      notes: "Currently in Sprint 4. Focusing on dashboard visualization."
    },
    [ProjectPhase.QA]: {
      notes: "QA scheduled to start after Sprint 6."
    },
    [ProjectPhase.UAT]: {
      notes: "UAT window reserved for late May."
    },
    [ProjectPhase.MAINTENANCE]: {
      notes: "Post-launch support plan pending."
    }
  }
};
