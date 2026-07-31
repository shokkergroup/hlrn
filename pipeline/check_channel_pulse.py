#!/usr/bin/env python3
"""Discover HLRN channel uploads that are not present in the public archive.

Discovery never assigns canon, season, race, result, transcript, or review
state. New IDs enter an explicit quarantine report for human classification.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PIPELINE = ROOT / "pipeline"
CHANNEL_ID = "UCaxHNmaiYiKsZYLtqhhgfHg"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
VIDEO_ID = re.compile(r'"(?:id|sourceId)":"([A-Za-z0-9_-]{11})"')


def indexed_ids() -> set[str]:
    found: set[str] = set()
    for name in ("data.js", "data-sources.js", "data-moments.js"):
        text = (ROOT / "assets" / name).read_text(encoding="utf-8")
        found.update(VIDEO_ID.findall(text))
    return found


def excluded_ids() -> set[str]:
    path = PIPELINE / "pulse_exclusions.json"
    if not path.exists():
        return set()
    payload = json.loads(path.read_text(encoding="utf-8"))
    return {str(item.get("id", "")) for item in payload.get("items", []) if item.get("id")}


def fetch_feed() -> list[dict[str, str]]:
    request = urllib.request.Request(
        FEED_URL,
        headers={"User-Agent": "HLRN-Living-Wiki-Archive-Pulse/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        root = ET.fromstring(response.read())
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
    }
    entries: list[dict[str, str]] = []
    for entry in root.findall("atom:entry", ns):
        video_id = (entry.findtext("yt:videoId", default="", namespaces=ns) or "").strip()
        if not video_id:
            continue
        entries.append(
            {
                "id": video_id,
                "title": (entry.findtext("atom:title", default="", namespaces=ns) or "").strip(),
                "published": (entry.findtext("atom:published", default="", namespaces=ns) or "").strip(),
                "updated": (entry.findtext("atom:updated", default="", namespaces=ns) or "").strip(),
                "url": f"https://www.youtube.com/watch?v={video_id}",
            }
        )
    return entries


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--github-output", default=os.environ.get("GITHUB_OUTPUT"))
    args = parser.parse_args()

    known = indexed_ids()
    excluded = excluded_ids()
    feed = fetch_feed()
    new_items = [entry for entry in feed if entry["id"] not in known and entry["id"] not in excluded]
    generated = dt.datetime.now(dt.timezone.utc).isoformat()
    report = {
        "schema": "hlrn-channel-pulse/v1",
        "generatedAt": generated,
        "channelId": CHANNEL_ID,
        "feedUrl": FEED_URL,
        "indexedIdCount": len(known),
        "excludedIdCount": len(excluded),
        "feedEntryCount": len(feed),
        "newCount": len(new_items),
        "newItems": new_items,
        "state": "quarantined-for-human-classification" if new_items else "no-new-feed-ids",
        "boundary": "Discovery does not assign canon, lane, season, race, result, transcript, or approval state.",
    }
    (PIPELINE / "channel_pulse_report.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )

    issue_lines = [
        "## HLRN archive pulse",
        "",
        f"The channel feed contains **{len(new_items)} unindexed upload(s)**.",
        "",
    ]
    for item in new_items:
        issue_lines.extend(
            [
                f"- [{item['title'] or item['id']}]({item['url']})",
                f"  - video ID: `{item['id']}`",
                f"  - published: `{item['published'] or 'unknown'}`",
            ]
        )
    issue_lines.extend(
        [
            "",
            "### Required human review",
            "",
            "- classify official HLRN / Highline Live / auxiliary / fragment / exclude;",
            "- verify completeness, title, date, venue, season, and race number;",
            "- acquire captions and quarantine machine candidates;",
            "- review exact cuts and any result evidence;",
            "- preview and approve before publication.",
            "",
            "> Discovery never publishes or classifies a source automatically.",
        ]
    )
    (PIPELINE / "channel_pulse_issue.md").write_text("\n".join(issue_lines) + "\n", encoding="utf-8")

    if args.github_output:
        output_path = Path(args.github_output)
        with output_path.open("a", encoding="utf-8") as handle:
            handle.write(f"new_count={len(new_items)}\n")
            handle.write("new_ids=" + ",".join(item["id"] for item in new_items) + "\n")

    print(json.dumps({"newCount": len(new_items), "newIds": [item["id"] for item in new_items]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
