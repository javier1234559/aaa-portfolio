/**
 * Server-side Slack notification for new portfolio internal comments.
 * Webhook URL must never be exposed to the client — call only from Route Handlers.
 *
 * No credentials in repo yet: implementation is intentionally commented out.
 * When ready, set e.g. SLACK_WEBHOOK_URL_PORTFOLIO_COMMENTS in deployment env and uncomment.
 */

export type PortfolioCommentSlackPayload = {
  slug: string;
  author: string;
  body: string;
  phase?: string;
};

export async function notifyPortfolioCommentSlack(
  payload: PortfolioCommentSlackPayload,
): Promise<void> {
  void payload;
  // const url = process.env.SLACK_WEBHOOK_URL_PORTFOLIO_COMMENTS;
  // if (!url?.trim()) return;
  //
  // const text = [
  //   `*Portfolio comment* — \`${_payload.slug}\``,
  //   _payload.phase ? `Phase: ${_payload.phase}` : null,
  //   `*${_payload.author}*`,
  //   _payload.body,
  // ]
  //   .filter(Boolean)
  //   .join("\n");
  //
  // const res = await fetch(url, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ text }),
  // });
  // if (!res.ok) {
  //   throw new Error(`Slack webhook failed: ${res.status} ${await res.text()}`);
  // }
}
