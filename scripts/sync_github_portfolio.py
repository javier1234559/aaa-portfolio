#!/usr/bin/env python3
"""Sync GitHub commits + merged PRs to AAA Portfolio config JSON (dashboard shape).

Writes: config/projects/<slug>/data_github_activity.json

Usage:
    python idea/scripts/sync_github_portfolio.py --slug kidneyhood --repo Automation-Architecture/LKID

Requires env: GITHUB_TOKEN (use fine-grained PAT with repo read for private org repos).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

IDEA_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = IDEA_ROOT / "config" / "projects"


def github_get(url: str) -> list | dict:
    req = Request(
        url,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
        },
    )
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def fetch_commits(repo: str) -> list[dict]:
    data = github_get(f"https://api.github.com/repos/{repo}/commits?per_page=20")
    entries = []
    for item in data:
        entries.append(
            {
                "sha": item["sha"][:7],
                "tag": "merged",
                "message": item["commit"]["message"].split("\n")[0],
                "author": item["commit"]["author"]["name"],
                "time": item["commit"]["author"]["date"][:10],
            }
        )
    return entries


def fetch_merged_prs(repo: str) -> list[dict]:
    data = github_get(
        f"https://api.github.com/repos/{repo}/pulls?state=closed&per_page=15"
    )
    entries = []
    for item in data:
        if not item.get("merged_at"):
            continue
        merge_sha = item.get("merge_commit_sha")
        if not merge_sha:
            continue
        entries.append(
            {
                "sha": merge_sha[:7],
                "tag": "pr",
                "message": item["title"],
                "author": item["user"]["login"],
                "time": item["merged_at"][:10],
            }
        )
    return entries


def sync_github_activity(slug: str, repo: str) -> None:
    prs = fetch_merged_prs(repo)
    commits = fetch_commits(repo)

    seen: dict[str, dict] = {}
    for entry in prs:
        seen[entry["sha"]] = entry
    for entry in commits:
        if entry["sha"] not in seen:
            seen[entry["sha"]] = entry

    combined = sorted(seen.values(), key=lambda e: e["time"], reverse=True)[:20]

    pr_count = sum(1 for e in combined if e["tag"] == "pr")
    commit_count = sum(1 for e in combined if e["tag"] == "merged")
    summary = f"{commit_count} commits and {pr_count} PRs merged."

    output_path = DATA_DIR / slug / "data_github_activity.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    existing: dict = {}
    if output_path.exists():
        try:
            existing = json.loads(output_path.read_text())
        except json.JSONDecodeError:
            existing = {}

    result = {
        **{k: v for k, v in existing.items() if k not in ("commits", "summary")},
        "commits": combined,
        "summary": summary,
    }

    output_path.write_text(json.dumps(result, indent=2) + "\n")
    print(f"Updated {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sync GitHub activity to portfolio data_github_activity.json",
    )
    parser.add_argument("--slug", required=True, help="Project slug (e.g. kidneyhood)")
    parser.add_argument(
        "--repo", required=True, help="GitHub repo (e.g. Automation-Architecture/LKID)"
    )
    args = parser.parse_args()

    if not GITHUB_TOKEN:
        print("Error: GITHUB_TOKEN must be set", file=sys.stderr)
        sys.exit(1)

    try:
        sync_github_activity(args.slug, args.repo)
    except HTTPError as e:
        print(f"GitHub API error: {e.code} {e.reason}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
