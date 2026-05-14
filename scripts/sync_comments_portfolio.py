#!/usr/bin/env python3
"""Portfolio internal comments — intentionally NOT a Jira/GitHub cron sync.

Why there is no \"sync from Jira\" for comments
----------------------------------------------
- Jira/GitHub sync scripts pull **vendor APIs** into read-mostly JSON for the Build tab.
- **Internal portfolio comments** are authored in **your UI**, stored via **your** persistence
  (database or GitHub Contents API), and optionally notify Slack from a **Route Handler**.
  There is no equivalent third-party \"comments feed\" to poll on a schedule like sprint boards.

What to use instead
-------------------
- POST `/api/portfolio/comments` (see `src/app/api/portfolio/comments/route.ts`) once persistence exists.
- Optional: extend this script later to **export** comments from DB → `data_comments.json` for git,
  or **import** a backup — but that would be explicit ops, not a substitute for Jira sync.

This CLI exists so `scripts/` stays symmetric (`sync_*_portfolio.py`) and CI/docs can reference it.
"""
from __future__ import annotations

import argparse
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Explain portfolio comments pipeline (no Jira-style sync).",
    )
    parser.add_argument(
        "--why",
        action="store_true",
        help="Print this module's docstring and exit 0.",
    )
    args = parser.parse_args()

    if args.why:
        print(__doc__ or "", end="")
        return

    print(
        "sync_comments_portfolio: no scheduled remote source to sync.\n"
        "  See docstring: python scripts/sync_comments_portfolio.py --why\n"
        "  API stub: POST /api/portfolio/comments\n"
        "  Spec: docs/PLANS.md §7.6",
        file=sys.stderr,
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
