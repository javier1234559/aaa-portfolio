/** Mock session cookie — middleware + API routes must stay in sync. */
export const SESSION_COOKIE = "portfolio_session";
export const SESSION_VALUE = "ok";

export function isSessionCookieValid(value: string | undefined): boolean {
  return value === SESSION_VALUE;
}
