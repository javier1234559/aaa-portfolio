import { NextResponse } from "next/server";

import { notifyPortfolioCommentSlack } from "@/lib/portfolio/slack-comment-notify";

/**
 * POST internal portfolio comment (planned persistence + Slack).
 * MVP: validates input, Slack helper is no-op (commented until webhook env exists).
 * Persistence: see docs/PLANS.md §7.6 — do not write to git-tracked files from Vercel without GitHub API or external DB.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!json || typeof json !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const body = json as Record<string, unknown>;
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const phase =
    typeof body.phase === "string" && body.phase.trim()
      ? body.phase.trim()
      : undefined;

  if (!slug || !author || !text) {
    return NextResponse.json(
      { error: "Required fields: slug, author, body (non-empty strings)" },
      { status: 400 },
    );
  }

  await notifyPortfolioCommentSlack({ slug, author, body: text, phase });

  return NextResponse.json(
    {
      ok: true,
      received: { slug, author, phase, bodyLength: text.length },
      notice:
        "Persistence not implemented yet; Slack notification is disabled until SLACK_WEBHOOK_URL_PORTFOLIO_COMMENTS is set and code is uncommented in slack-comment-notify.ts.",
    },
    { status: 202 },
  );
}
