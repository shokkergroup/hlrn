# HLRN owner handoff

The HLRN Living Wiki is a static, source-linked archive designed to be portable. The public build does not require a proprietary database or a Shokker-controlled runtime.

## What the league can own

- The repository and complete deployable site.
- A league-controlled custom domain when the owner supplies one.
- All owner-supplied schedules, rosters, teams, results, standings, sponsor records, corrections, and brand assets.
- Exportable CSV/JSON records and release snapshots.
- The documented build and verification pipeline.

## What remains source-bounded

Race video remains on the original High Line Racing Network YouTube channel. The site embeds or links to exact timestamps and does not copy race video. Machine-surfaced captions and editorial navigation cues are not promoted into official results. Owner-certified data is stored separately from inferred archive evidence.

## Owner intake files

Download and complete the templates under `assets/templates/`:

- `hlrn-roster-template.csv`
- `hlrn-schedule-template.csv`
- `hlrn-results-template.csv`
- `hlrn-teams-template.csv`
- `hlrn-sponsors-template.csv`

Every accepted row should name its authority and verification date. Unknown fields may remain blank.

## Release workflow

1. Preserve the current public snapshot.
2. Import owner files into the official-data layer.
3. Review conflicts against existing source receipts.
4. Rebuild the site.
5. Run all release gates.
6. Preview the candidate release.
7. Publish only after approval.
8. Retain the prior release for rollback.

## Custom-domain transfer

No domain is assumed or registered by this repository. When the owner supplies a domain, add the verified hostname to a `CNAME` file, configure the DNS records documented by GitHub Pages, enable HTTPS, and update canonical/social URLs before publishing.

## No-lock-in promise

The archive is plain HTML, CSS, JavaScript, images, CSV/JSON-compatible data, and build scripts. A release can be downloaded as a ZIP and hosted anywhere that serves static files.
