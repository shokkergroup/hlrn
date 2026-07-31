# VRL-to-HLRN corrective feature audit

## Why the first HLRN build failed

The first build copied VRL's route names and evidence vocabulary, but it did not
copy VRL's editorial depth. Its public moment layer promoted raw transcript
proximity into fan-facing cards. One generic title function produced:

- 161 cards titled `Incident signal on the scanner`;
- 25 cards titled `Trevor Haley in the incident call`;
- 21 cards titled `Closing signal: Trevor Haley at the white flag`.

That mistake propagated into Highlights, race pages, Rankings, and driver
dossiers. Trevor Haley's page therefore became a transcript mention feed rather
than the champion dossier the evidence supported. Highline Central also shipped
as a broadcast desk index instead of the race-week publication represented by
VRL's Vigilante Scene.

The corrective build treats those as data-contract failures. Machine candidates
remain research input and cannot populate a public headline, driver signature
reel, or Central story.

## What the VRL reference actually does

The public VRL product was re-audited route by route and against its source
payloads.

| VRL layer | Observed reference depth | HLRN corrective contract |
| --- | --- | --- |
| Vigilante Scene | 219 authored issues, roughly 210,000 editorial words, 3,262 source routes | 20 authored Highline Central editions, one per official race |
| Scene issue | Cover line, headline, deck, long lead, exact play cuts, result card, three-act story, notebook, voices, limitations | Cover line, headline, deck, three-paragraph lead, reviewed beats, result ledger, three acts, notebook, After Hours, limitations |
| Driver hall | 133 dossiers, filters, winner/champion/current states, car-on-tape imagery | 225 identity dossiers, a source-frame front row, recovered winner/podium/Central states, full recovered grid register |
| Driver dossier | Career story, car art, result form, signature reel, press clippings, rankings, tracks, appearances, deep source routes | Career story, HLRN source frame, result form, reviewed signature tape, Central clippings, rankings, track fingerprint, full tape index |
| Race deep dive | Embedded source, fact/evidence tower, publication link, recap, ordered story, exact moments, results, limits | Embedded primary tape, 15-18 direct race chapters, five-cell evidence tower, reviewed race envelope, Central article, separate three-act editorial receipts, result bay, transcript search |
| Highlights | Authored edit maps with direct source playback | 83 reviewed editorial receipts kept separate from 351 primary race chapters; no raw machine cards |
| Rankings | Explainable boards with visible input definitions | Outcome, Central, file-presence, and broadcast-gravity boards kept separate |

## Corrected HLRN public data contract

### Public editorial

- 20 official race editions.
- 28,996 authored editorial words in the structured publication payload,
  including 16,874 words across 20 main race stories. Every main story is
  803–980 words and 11–12 paragraphs.
- 60 lead-story paragraphs.
- 60 notebook items.
- 351 exact-source primary-broadcast chapters.
- 118 individually tape-reviewed navigation chapters.
- 208 additional bounded navigation chapters aligned to local primary-caption
  windows, including alias-registry resolution whenever a card tags a driver.
- 20/20 reviewed opening greens and 20/20 reviewed live-race closes.
- 34 later replay/recap cues explicitly labeled post-race.
- 15-18 primary chapters on every official race.
- 83 exact-source race beats.
- 83 unique public beat titles.
- Zero `machine-surfaced` public moments.
- Zero generic `Closing signal` or `incident call` titles.

Each beat records its official race, playback source, exact start and end,
phase, category, unique title, contextual summary, named drivers, and review
state. A beat can play the primary race or the matched HLRN companion; its card
always returns to the official race deep dive.

### Primary-broadcast chapter contract

Every official race has a separate `chapters[]` collection built only from its
own full-broadcast transcript. The chapter board is chronological and spans the
race through green flags, restarts, stages, incidents, battles, strategy,
closing laps, results, and postrace calls where the tape supports them.

Clicking a chapter seeks the embedded primary player to the exact start and
retains that time in the route. The source pack exports both `chapters[]` and
the separate reviewed editorial `moments[]`. This prevents a short companion
program from masquerading as full-race coverage.

The primary theater also supports previous/next navigation, exact YouTube
recovery, a shareable **Copy Wiki Cut** route, and per-race signal filters.
HLRN additionally exports the complete race index—every cut, in/out window,
review boundary, and exact wiki route—in one owner-ready copy.
Every still-bounded cue has local primary captions in its playback window; a
tagged identity must re-resolve through the alias registry before the cue
passes the chapter audit.

### Research quarantine

The 424 automated transcript candidates remain in `pipeline/mined_archive.json`
for research prioritization. They are counted as quarantined and are not
serialized into the public moment library. Highline Live keeps playback,
metadata, transcript search, Tape Heat, driver discovery, and stable routes,
but it receives no fake highlights before a human pass.

### Driver images

The image pass uses frames exported from HLRN's own primary and companion
programs:

- 20 Central cover frames;
- 203 currently published driver-frame mappings across 225 dossiers;
- source ID, timestamp, caption, and confidence label retained for each map;
- 149 name/scoring-graphic matches, 3 live-call matches, and 51 explicitly
  limited source-context frames;
- 203/203 unique frame hashes at 1280×720 or better;
- 22 monogram fallbacks when a safe mapping has not been made.

Every one of the 225 dossiers also publishes one or two exact name-call
windows. The 441 receipts are re-opened against the timestamped transcript by
the release audit; alias matching can aid discovery but cannot create a start,
result, or identity claim.

The frame is visual dossier art, not independent proof of identity, result,
paint history, or ownership. Trevor Haley's mapped frame visibly includes the
No. 12 card, his name lower third, current position, and HLRN broadcast context.

## HLRN Central is a publication, not a control panel

Central intentionally diverges from the rest of HLRN's navy broadcast world. It
uses a cream newsprint surface, serif headlines, red editorial marks, edition
numbers, front-page hierarchy, photo captions, columns, notebook boxes, and an
After Hours section.

Every edition includes:

1. a race-specific cover line, headline, and deck;
2. three authored lead paragraphs;
3. a source-attributed hero frame;
4. opening, pressure, and closing story acts;
5. four or more reviewed playable receipts;
6. a recovered result ledger;
7. three notebook columns;
8. a clearly separated `The Show` entertainment column;
9. source facts and explicit claim limitations;
10. previous/next edition navigation.

Every long-form report section additionally carries both an exact primary-race
window and a separate reviewed-story receipt, so the newspaper never asks a
reader to trust prose without a route back to tape.

The 83 story receipts all retain local caption windows. Eighty-one resolve at
least one tagged identity through the alias registry; the two remaining
receipts are preserved as explicitly visual-review windows rather than forced
through weak transcript aliases.

The race tape is primary evidence. `The Show` supplies HLRN-authored context and
entertainment continuity. Comedy, fictional press conferences, sponsor gags,
and character material are never silently rewritten as race-control fact.

## Driver dossier translation

VRL's driver pages do not lead with search mentions; they lead with a person's
career record. HLRN now follows that principle:

- result and champion badges appear before transcript counts;
- source-frame car/race art leads mapped dossiers;
- a written career read replaces the generated signal summary;
- exact earliest/latest name-call windows make identity discovery playable;
- result-backed top-three form gets its own visual rail;
- signature tape uses only reviewed race beats;
- Highline Central editions become press clippings;
- rankings, track fingerprint, evidence ledger, and full source appearances
  remain available without being confused with official starts.

Trevor Haley receives a specific three-paragraph career account covering the
Season 1 championship receipt, stage-heavy season, Watkins Glen podium,
iRacing Superspeedway closing fight, finale disqualification, David Applegate's
elevated win, and Season 2 Iowa runner-up.

## HLRN-specific additions beyond VRL parity

- **Evidence Tower:** five visible cells on every race file—primary tape,
  companion, editorial review, result receipt, and the reviewed live-race
  envelope.
- **High Line Radar:** reviewed story-phase navigation rather than faux
  telemetry.
- **After Hours:** preserves `The Show` as an entertainment world in a dedicated
  newspaper column.
- **Public firewall:** the site reports how many machine candidates are
  quarantined instead of presenting them as fan-ready content.
- **Source-frame ledger:** driver and edition imagery carries its own playback
  source and timestamp.
- **Highline Live source-first mode:** bonus races remain useful without leaking
  into the official seasons or receiving fabricated editorial certainty.
- **Highline Live shelves:** seven source-declared filters compartmentalize
  partner nights, network specials, practice, GT3, memorials, and the general
  bonus universe.
- **Public language gate:** 4,378 authored fields / 109,803 words are scanned for
  rejected generic phrases, duplicated blocks, malformed encoding, and leaked
  research state.
- **Channel snapshot gate:** the saved 52-file source universe must match the
  public livestream shelf in count, identity, and order.
- **Companion snapshot gate:** all 20 official-race companion programs must
  remain reachable at their exact source IDs with matching saved durations.

## Acceptance gates for publication

- All 20 official races have a race page, Central edition, matched companion,
  timed transcript, recovered winner, reviewed story beats, and result boundary.
- Every official race exposes 15-20 uniquely titled cuts from its own primary
  broadcast, and clicking a cut seeks that embedded broadcast.
- All 83 public moment titles are unique.
- Machine-surfaced public count is zero.
- Every public moment resolves to an existing primary or companion source.
- Trevor Haley's dossier contains no repeated generic headline.
- Central index and edition pages render as a readable publication at desktop
  and mobile widths.
- Driver cards show source imagery when mapped and an honest fallback when not.
- Highline Live remains complete and excluded from official season totals.
- Full finishing orders, starts, points, and standings remain open pending owner
  records.
- GitHub Pages subpath routing, exact playback, transcript loading, and asset
  paths pass live-origin verification.

## Expansion beyond VRL route depth

The corrective editorial rebuild restored parity. The next expansion added
HLRN-native participation and creator operations instead of copying VRL’s
channel-specific toys.

| Added HLRN surface | Purpose |
| --- | --- |
| Results Room + Winner’s Garage | All 20 official winner receipts in one explainable ledger |
| Visual Garage + Photo Desk | 203 unique driver frames and 20 Central frames with source playback |
| Driver Compare | Six visible archive/result measures with no hidden ability verdict |
| Battle Lines | Driver-pair co-occurrence derived only from shared reviewed beats |
| Track Atlas | Sources, results, moments, and drivers organized by registry track |
| Signal Timeline | Official, bonus, and fragment lanes in one dated record |
| Finish Vault | Unique closing cuts and result reads, never generic white-flag cards |
| Story Paths | Authored playable sequences that retain race and source context |
| The Show | HLRN’s companion universe separated from official race-control fact |
| Race Night Mixer | Fan-selected mood and length routed into a persistent itinerary |
| Replay Builder | Browser-local ordering, playback, copy, JSON, and CSV manifests |
| Highline Lore Studio | Creator search, shortlist, export, and final-review workflow |
| Highline Pulse | A return ritual that remembers the browser’s prior source set |
| Evidence Ledger + Open Records | Public claim states and missing-data backlog |
| Corrections Desk + Result Intake | Append-only correction and authenticated owner-data packets |
| Race source packs | Downloadable per-race evidence and editorial JSON |

The current code audit finds **40 HLRN route families versus 36 in VRL**.
Route count is only one surface measure; the release also has to satisfy full
official-race coverage, reviewed editorial integrity, source-attributed visual
coverage, participation, creator workflow, return ritual, exports, corrections,
and public-origin QA. The executable comparison lives in
`pipeline/feature_parity_audit.mjs`.

## Current proof snapshot

- 20/20 official races have pages, timed transcripts, 15-18 primary-broadcast
  chapters, reviewed editorial moments, matched companions, and Central editions.
- 351 primary-broadcast chapters are published with zero cross-source chapters
  and zero duplicate chapter titles within a race.
- 83 public cuts have 83 unique titles.
- Zero machine-surfaced cuts cross the public contract.
- 424 machine candidates remain quarantined.
- 203 of 225 driver dossiers have mapped HLRN source frames; the other 22 keep
  honest monogram fallbacks.
- 26 deep Explore tools are exposed.
- 66 desktop/mobile route and workflow scenarios pass, plus every one of the
  225 driver, 20 Central, 29 Highline Live, and three archive-fragment detail
  routes.
- Replay persistence, Studio search, Compare, Corrections packet generation,
  owner Result Intake authentication state, and race source-pack export are
  interaction-tested.
- The Shokker Lore build wiki has 18 navigable chapters and a complete HLRN
  case study.
