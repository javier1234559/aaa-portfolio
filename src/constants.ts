export const RouteNames = {
  Home: "/",
  Login: "/login",
  SignIn: "/login",
  SignUp: "/sign-up",
  App: "/app",
  AppPublish: "/app/publish",
  projectDetail: (slug: string) => `/app/projects/${slug}`,
  clientPortal: (slug: string) => `/app/publish/${slug}`,
};

/** Horizontal inset: client portal main + footer (aligned edges). */
export const clientPortalGutterX = "px-4 sm:px-8 lg:px-14";
