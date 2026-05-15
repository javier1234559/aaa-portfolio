import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";

import type { PhaseMarkdownDoc, SalesMeeting } from "@/feature/portfolio/types";

const MD_EXT = /\.md$/i;

function parseMarkdownFile(
  filename: string,
  raw: string,
): PhaseMarkdownDoc | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let frontmatter: Record<string, unknown> = {};
  let body = trimmed;

  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(trimmed);
  if (fmMatch) {
    try {
      const parsed = parseYaml(fmMatch[1]);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        frontmatter = parsed as Record<string, unknown>;
      }
    } catch {
      /* keep empty frontmatter */
    }
    body = fmMatch[2] ?? "";
  }

  const id = filename.replace(MD_EXT, "");
  const title =
    (typeof frontmatter.title === "string" && frontmatter.title.trim()) ||
    id.replace(/[-_]/g, " ");

  return {
    id,
    title,
    filename,
    frontmatter,
    content: body.trim(),
  };
}

/** Read all `*.md` files in a phase folder (non-recursive). */
export function loadPhaseMarkdownDir(dir: string): PhaseMarkdownDoc[] {
  if (!existsSync(dir)) return [];

  const files = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && MD_EXT.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const docs: PhaseMarkdownDoc[] = [];
  for (const name of files) {
    const raw = readFileSync(join(dir, name), "utf8");
    const doc = parseMarkdownFile(name, raw);
    if (doc) docs.push(doc);
  }
  return docs;
}

interface SalesMeetingsFile {
  meetings?: unknown;
}

function normalizeAttendees(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof v === "string" && v.trim()) {
    return v.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseSalesMeeting(row: unknown, index: number): SalesMeeting | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;

  const id =
    (typeof r.id === "string" && r.id.trim()) ||
    `meeting-${index + 1}`;
  const meeting =
    (typeof r.meeting === "string" && r.meeting.trim()) ||
    (typeof r.title === "string" && r.title.trim()) ||
    "";
  const date = typeof r.date === "string" ? r.date.trim() : "";
  const source =
    (typeof r.source === "string" && r.source.trim()) ||
    (typeof r.tool === "string" && r.tool.trim()) ||
    "";
  const transcript =
    typeof r.transcript === "string"
      ? r.transcript
      : typeof r.transcriptText === "string"
        ? r.transcriptText
        : "";

  if (!meeting && !date) return null;

  return {
    id,
    source,
    meeting,
    date,
    attendees: normalizeAttendees(r.attendees),
    transcript,
    transcriptUrl:
      typeof r.transcriptUrl === "string" ? r.transcriptUrl : undefined,
  };
}

export function loadSalesMeetingsJson(path: string): SalesMeeting[] {
  if (!existsSync(path)) return [];
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as SalesMeetingsFile;
    const list = Array.isArray(raw.meetings) ? raw.meetings : [];
    const out: SalesMeeting[] = [];
    list.forEach((row, i) => {
      const m = parseSalesMeeting(row, i);
      if (m) out.push(m);
    });
    return out;
  } catch {
    return [];
  }
}

/** Map legacy YAML `sales.meetings` rows into `SalesMeeting`. */
export function legacyYamlMeetingsToSales(
  meetings: {
    id: string;
    title: string;
    date: string;
    tool?: string;
    transcriptUrl?: string;
  }[],
): SalesMeeting[] {
  return meetings.map((m) => ({
    id: m.id,
    source: m.tool ?? "",
    meeting: m.title,
    date: m.date,
    attendees: [],
    transcript: "",
    transcriptUrl: m.transcriptUrl,
  }));
}
