export const globalConfig = {
  API_URL: process.env.NEXT_PUBLIC_APP_API,
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  MOCK_EMAIL: process.env.NEXT_PUBLIC_MOCK_EMAIL ?? "user@gmail.com",
  MOCK_PASSWORD: process.env.NEXT_PUBLIC_MOCK_PASSWORD ?? "123456",
};

export const brandConfig = {
  NAME: "AAA Portfolio",
  DESCRIPTION:
    "Internal portfolio MVP — multi-project overview, phase tabs, and links aligned with client dashboards.",
  VERSION: "0.1.0",
  AUTHOR: "Automation Architecture",
  AUTHOR_EMAIL: "",
  AUTHOR_URL: "https://www.automationarchitecture.ai/",
};

/** Public client-portal footer only (dark, static). */
export const footerConfig = {
  authorName: "Brad Wilcox",
  authorTitle: "Author & architect",
  email: "brad@automationarchitecture.ai",
  social: {
    github: "https://github.com/Automation-Architecture",
    linkedin: "https://www.linkedin.com/company/automation-architecture-ai",
    twitter: "https://twitter.com/automation_aai",
    website: "https://www.automationarchitecture.ai/",
  },
  legalName: "Automation Architecture AI",
  legalUrl: "https://www.automationarchitecture.ai/",
} as const;
