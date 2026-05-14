#!/usr/bin/env python3
"""Sync Jira sprint data to AAA Portfolio config JSON (same shape as dashboard sprint-progress).

Writes: config/projects/<slug>/data_sprint_progress.json

Usage:
    python idea/scripts/sync_jira_portfolio.py --slug kidneyhood --project-key LKID

Requires env: JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN

Logic mirrors aaa-client-dashboard/scripts/sync_jira.py (Scrum board + sprints + backlog).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from base64 import b64encode
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

JIRA_BASE_URL = os.environ.get("JIRA_BASE_URL", "")
JIRA_USER_EMAIL = os.environ.get("JIRA_USER_EMAIL", "")
JIRA_API_TOKEN = os.environ.get("JIRA_API_TOKEN", "")

# idea/ directory (parent of scripts/)
IDEA_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = IDEA_ROOT / "config" / "projects"

_AUTH_HEADER = ""


def _get_auth_header() -> str:
    global _AUTH_HEADER
    if not _AUTH_HEADER:
        _AUTH_HEADER = f"Basic {b64encode(f'{JIRA_USER_EMAIL}:{JIRA_API_TOKEN}'.encode()).decode()}"
    return _AUTH_HEADER


def jira_get(url: str) -> dict:
    req = Request(
        url,
        headers={
            "Authorization": _get_auth_header(),
            "Accept": "application/json",
        },
    )
    with urlopen(req) as resp:
        return json.loads(resp.read())


def fetch_sprints(board_id: int) -> list[dict]:
    data = jira_get(
        f"{JIRA_BASE_URL}/rest/agile/1.0/board/{board_id}/sprint?state=active,closed,future"
    )
    return data.get("values", [])


def fetch_sprint_issues(sprint_id: int) -> list[dict]:
    data = jira_get(
        f"{JIRA_BASE_URL}/rest/agile/1.0/sprint/{sprint_id}/issue?maxResults=200&fields=summary,status,flagged"
    )
    return data.get("issues", [])


def fetch_backlog_issues(board_id: int) -> list[dict]:
    data = jira_get(
        f"{JIRA_BASE_URL}/rest/agile/1.0/board/{board_id}/backlog?maxResults=200&fields=summary,status,flagged"
    )
    return data.get("issues", [])


def fetch_board_id(project_key: str) -> int | None:
    data = jira_get(f"{JIRA_BASE_URL}/rest/agile/1.0/board?projectKeyOrId={project_key}")
    boards = data.get("values", [])
    return boards[0]["id"] if boards else None


BLOCKED_STATUSES = {"blocked", "impediment", "on hold", "waiting"}


def status_to_card_status(jira_status: str) -> str:
    done_statuses = {"done", "closed", "resolved", "complete"}
    lower = jira_status.lower()
    if lower in done_statuses:
        return "done"
    if lower in BLOCKED_STATUSES:
        return "blocked"
    return "upcoming"


def sync_sprint_progress(slug: str, project_key: str) -> None:
    board_id = fetch_board_id(project_key)
    if not board_id:
        print(f"No board found for project {project_key}", file=sys.stderr)
        sys.exit(1)

    sprints = fetch_sprints(board_id)
    sprint_data: list[dict] = []
    blocked_items: list[dict] = []

    def issues_to_cards(issues: list[dict], sprint_name: str) -> list[dict]:
        cards = []
        for issue in issues:
            status_name = issue["fields"]["status"]["name"]
            card_status = status_to_card_status(status_name)
            is_flagged = issue["fields"].get("flagged", False)
            if is_flagged and card_status != "done":
                card_status = "blocked"
            cards.append(
                {
                    "id": issue["key"],
                    "title": issue["fields"]["summary"],
                    "status": card_status,
                }
            )
            if card_status == "blocked":
                blocked_items.append(
                    {
                        "id": issue["key"],
                        "title": issue["fields"]["summary"],
                        "sprint": sprint_name,
                    }
                )
        return cards

    for sprint in sorted(sprints, key=lambda s: s.get("startDate", "")):
        issues = fetch_sprint_issues(sprint["id"])
        sprint_data.append(
            {
                "name": sprint["name"],
                "start": sprint.get("startDate", ""),
                "end": sprint.get("endDate", ""),
                "dates": f"{sprint.get('startDate', '')[:10]} – {sprint.get('endDate', '')[:10]}",
                "cards": issues_to_cards(issues, sprint["name"]),
            }
        )

    backlog_issues = fetch_backlog_issues(board_id)
    if backlog_issues:
        sprint_data.append(
            {
                "name": "Backlog",
                "start": "",
                "end": "",
                "dates": "",
                "cards": issues_to_cards(backlog_issues, "Backlog"),
            }
        )

    output_path = DATA_DIR / slug / "data_sprint_progress.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    existing: dict = {}
    if output_path.exists():
        try:
            existing = json.loads(output_path.read_text())
        except json.JSONDecodeError:
            existing = {}

    started = existing.get("started", "")
    target_launch = existing.get("targetLaunch", "")
    if sprint_data:
        first_start = sprint_data[0].get("start", "")[:10]
        last_end = sprint_data[-1].get("end", "")[:10]
        if first_start and (not started or started > first_start):
            started = first_start
        if last_end and (not target_launch or target_launch < last_end):
            target_launch = last_end

    result = {
        "started": started,
        "targetLaunch": target_launch,
        "sprints": sprint_data,
        "blockedItems": blocked_items,
    }

    output_path.write_text(json.dumps(result, indent=2) + "\n")
    print(f"Updated {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sync Jira data to portfolio data_sprint_progress.json",
    )
    parser.add_argument("--slug", required=True, help="Project slug (e.g. kidneyhood)")
    parser.add_argument(
        "--project-key", required=True, help="Jira project key (e.g. LKID)"
    )
    args = parser.parse_args()

    if not all([JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN]):
        print(
            "Error: JIRA_BASE_URL, JIRA_USER_EMAIL, and JIRA_API_TOKEN must be set",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        sync_sprint_progress(args.slug, args.project_key)
    except HTTPError as e:
        print(f"Jira API error: {e.code} {e.reason}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
