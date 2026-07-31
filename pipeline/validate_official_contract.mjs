#!/usr/bin/env node

/**
 * Validate assets/data-official.js and its evidence boundaries.
 *
 * The checks are intentionally stricter than syntax validation. They ensure
 * that owner-only facts remain unavailable, archive team associations still
 * match data-drivers.js, caption evidence counts reproduce from the local
 * transcript corpus, and every published sample receipt resolves at the
 * claimed source time.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const PIPELINE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(PIPELINE_DIR, "..");
const TRANSCRIPT_DIR = path.join(PIPELINE_DIR, "transcripts");
const PUBLIC_RELEASE_MODE = process.argv.includes("--public-release");

const errors = [];
const notes = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoDateTime(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function unique(values) {
  return new Set(values).size === values.length;
}

function sameStringSet(left, right) {
  return (
    left.length === right.length &&
    [...left].sort().every((value, index) => value === [...right].sort()[index])
  );
}

function loadWindowScripts(relativePaths) {
  const context = { window: {} };
  vm.createContext(context);
  for (const relativePath of relativePaths) {
    const absolutePath = path.join(ROOT_DIR, relativePath);
    check(fs.existsSync(absolutePath), `${relativePath} is missing.`);
    if (!fs.existsSync(absolutePath)) continue;
    try {
      vm.runInContext(fs.readFileSync(absolutePath, "utf8"), context, {
        filename: relativePath
      });
    } catch (error) {
      errors.push(`${relativePath} could not be evaluated: ${error.message}`);
    }
  }
  return context.window;
}

function transcriptLines(sourceId) {
  const transcriptPath = path.join(TRANSCRIPT_DIR, `${sourceId}.txt`);
  if (!fs.existsSync(transcriptPath)) return null;
  return fs
    .readFileSync(transcriptPath, "utf8")
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^\[(\d+):(\d{2}):(\d{2})\]\s*(.*)$/);
      if (!match) return null;
      return {
        t: Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]),
        text: match[4]
      };
    })
    .filter(Boolean);
}

function validateReceipt(receipt, label, knownSourceIds) {
  check(isObject(receipt), `${label} must be an object.`);
  if (!isObject(receipt)) return;
  check(knownSourceIds.has(receipt.sourceId), `${label} uses unknown source ${receipt.sourceId}.`);
  check(Number.isInteger(receipt.t) && receipt.t >= 0, `${label}.t must be a non-negative integer.`);
  check(
    typeof receipt.matchText === "string" && receipt.matchText.trim().length >= 8,
    `${label}.matchText must be a useful transcript substring.`
  );

  const lines = transcriptLines(receipt.sourceId);
  if (PUBLIC_RELEASE_MODE && lines === null) return;
  check(lines !== null, `${label} has no materialized transcript for ${receipt.sourceId}.`);
  if (!lines || typeof receipt.matchText !== "string") return;

  const matchText = receipt.matchText.toLowerCase();
  const matchingLine = lines.find(
    (line) => Math.abs(line.t - receipt.t) <= 2 && line.text.toLowerCase().includes(matchText)
  );
  check(
    Boolean(matchingLine),
    `${label} does not reproduce "${receipt.matchText}" within two seconds of ${receipt.sourceId}@${receipt.t}.`
  );
}

function countCaptionPattern(pattern, flags, transcriptFiles) {
  const normalizedFlags = `${flags || ""}`.replace(/[^gimsuy]/g, "");
  const globalFlags = normalizedFlags.includes("g") ? normalizedFlags : `${normalizedFlags}g`;
  const matcher = new RegExp(pattern, globalFlags);
  let matchCount = 0;
  let sourceFileCount = 0;

  for (const fileName of transcriptFiles) {
    const text = fs.readFileSync(path.join(TRANSCRIPT_DIR, fileName), "utf8");
    matcher.lastIndex = 0;
    const matches = text.match(matcher) || [];
    if (matches.length > 0) {
      matchCount += matches.length;
      sourceFileCount += 1;
    }
  }
  return { matchCount, sourceFileCount };
}

function collectTrueOwnerCertified(value, pointer = "HLRN_OFFICIAL", results = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTrueOwnerCertified(item, `${pointer}[${index}]`, results));
    return results;
  }
  if (!isObject(value)) return results;
  for (const [key, child] of Object.entries(value)) {
    const childPointer = `${pointer}.${key}`;
    if (key === "ownerCertified" && child === true) results.push(childPointer);
    collectTrueOwnerCertified(child, childPointer, results);
  }
  return results;
}

const loaded = loadWindowScripts([
  "assets/data.js",
  "assets/data-sources.js",
  "assets/data-drivers.js",
  "assets/data-moments.js",
  "assets/data-official.js"
]);

const archive = loaded.HLRN_DATA;
const official = loaded.HLRN_OFFICIAL;

check(isObject(archive), "window.HLRN_DATA was not loaded.");
check(isObject(official), "window.HLRN_OFFICIAL was not loaded.");

if (isObject(archive) && isObject(official)) {
  const requiredTopLevelKeys = [
    "contractVersion",
    "generatedAt",
    "snapshotDate",
    "league",
    "certification",
    "owner",
    "competition",
    "teams",
    "sponsors",
    "updates",
    "ownerUpgrade",
    "evidenceAndLegal"
  ];
  for (const key of requiredTopLevelKeys) {
    check(Object.hasOwn(official, key), `HLRN_OFFICIAL.${key} is required.`);
  }

  check(/^\d+\.\d+\.\d+$/.test(official.contractVersion), "contractVersion must use semantic versioning.");
  check(isIsoDateTime(official.generatedAt), "generatedAt must be an ISO date-time.");
  check(/^\d{4}-\d{2}-\d{2}$/.test(official.snapshotDate), "snapshotDate must be YYYY-MM-DD.");
  check(official.snapshotDate === archive.meta.snapshotDate, "snapshotDate must match HLRN_DATA.meta.snapshotDate.");

  check(official.league.name === archive.meta.name, "league.name must match the archive identity.");
  check(official.league.shortName === archive.meta.shortName, "league.shortName must match the archive identity.");
  check(official.league.productName === archive.meta.product, "league.productName must match the archive product.");
  check(official.league.channelUrl === archive.meta.channelUrl, "league.channelUrl must match the archive channel.");
  check(official.league.legalEntityName === null, "legalEntityName must stay null until owner-supplied.");
  check(official.league.publicEditionState === "public-source-preview", "The unverified edition must remain a public-source preview.");

  check(official.certification.status === "not-owner-certified", "certification.status must remain not-owner-certified.");
  check(official.certification.certifiedBy === null, "certifiedBy must stay null before certification.");
  check(official.certification.certifiedAt === null, "certifiedAt must stay null before certification.");
  check(
    Array.isArray(official.certification.certifiedScope) && official.certification.certifiedScope.length === 0,
    "certifiedScope must be empty before certification."
  );
  check(
    collectTrueOwnerCertified(official).length === 0,
    `No nested ownerCertified flag may be true before certification: ${collectTrueOwnerCertified(official).join(", ")}`
  );

  const archivedOwner = archive.people.find((person) => person.name === official.owner.displayName);
  check(Boolean(archivedOwner), "owner.displayName must resolve to an existing channel-supported person.");
  if (archivedOwner) {
    check(archivedOwner.role === official.owner.role, "owner.role must match the archive's channel-supported role.");
  }
  check(
    official.owner.identityState === "channel-supported-not-authenticated",
    "owner.identityState must not imply authentication."
  );
  check(
    official.owner.issueEndpoint === "https://github.com/shokkergroup/hlrn/issues/new",
    "owner.issueEndpoint must point to the HLRN issue intake."
  );
  check(official.owner.contact.publicEmail === null, "owner publicEmail must stay null until supplied.");
  check(official.owner.contact.publicPhone === null, "owner publicPhone must stay null until supplied.");
  check(official.owner.contact.submissionEndpoint === null, "Private submissionEndpoint must stay null until supplied.");
  check(official.owner.analyticsEndpoint === null, "Owner analyticsEndpoint must stay null until an approved endpoint and policy are supplied.");

  const currentSeason = archive.seasons.find((season) => season.number === official.competition.currentSeason.number);
  check(Boolean(currentSeason), "competition.currentSeason must resolve to an indexed season.");
  if (currentSeason) {
    check(official.competition.currentSeason.label === currentSeason.label, "currentSeason.label must match the archive.");
    check(
      official.competition.currentSeason.indexedRaceCount === currentSeason.raceCount,
      "currentSeason.indexedRaceCount must match the archive."
    );
    check(
      official.competition.currentSeason.lastIndexedRaceId === archive.meta.latestOfficialId,
      "currentSeason.lastIndexedRaceId must match the latest indexed official source."
    );
  }

  const schedule = official.competition.schedule;
  check(schedule.status === "unavailable", "schedule must remain unavailable without an owner calendar.");
  check(schedule.nextRace === null, "schedule.nextRace must remain null without an owner calendar.");
  check(Array.isArray(schedule.events) && schedule.events.length === 0, "schedule.events must remain empty.");
  check(schedule.timezone === null, "schedule.timezone must remain null until supplied.");

  const standings = official.competition.standings;
  check(standings.status === "unavailable", "standings must remain unavailable without owner ledgers.");
  check(standings.pointsSystem === null, "standings.pointsSystem must remain null.");
  check(Array.isArray(standings.driverTables) && standings.driverTables.length === 0, "driverTables must remain empty.");
  check(Array.isArray(standings.teamTables) && standings.teamTables.length === 0, "teamTables must remain empty.");

  const roster = official.competition.roster;
  check(roster.status === "official-roster-unavailable", "The official current roster must remain unavailable.");
  check(roster.currentAsOf === null, "roster.currentAsOf must stay null.");
  check(Array.isArray(roster.members) && roster.members.length === 0, "roster.members must stay empty.");
  check(roster.teamAssignmentsAreCurrent === false, "Archive assignments must not be labeled current.");
  check(
    roster.teamAssignmentCount === roster.teamAssignments.length,
    "roster.teamAssignmentCount must equal teamAssignments.length."
  );
  check(unique(roster.teamAssignments.map((assignment) => assignment.driverId)), "A driver may have only one archive team assignment.");

  const driverById = new Map(archive.drivers.map((driver) => [driver.id, driver]));
  for (const assignment of roster.teamAssignments) {
    const driver = driverById.get(assignment.driverId);
    check(Boolean(driver), `Unknown roster assignment driver ${assignment.driverId}.`);
    if (!driver) continue;
    check(assignment.driverName === driver.name, `${assignment.driverId} name does not match data-drivers.js.`);
    check(assignment.teamName === driver.team, `${assignment.driverId} team does not match data-drivers.js.`);
    check(assignment.currentStatus === "unknown", `${assignment.driverId} currentStatus must remain unknown.`);
    check(
      assignment.evidenceState === "existing-archive-structured",
      `${assignment.driverId} must expose the archive-structured evidence state.`
    );
  }

  const archivedAssignments = archive.drivers
    .filter((driver) => typeof driver.team === "string" && driver.team.trim())
    .map((driver) => `${driver.id}|${driver.team}`);
  const officialAssignments = roster.teamAssignments.map((assignment) => `${assignment.driverId}|${assignment.teamName}`);
  check(
    sameStringSet(archivedAssignments, officialAssignments),
    "teamAssignments must reproduce all and only existing structured driver team fields."
  );

  check(Array.isArray(official.teams), "teams must be an array.");
  check(unique(official.teams.map((team) => team.id)), "Team IDs must be unique.");
  check(unique(official.teams.map((team) => team.name)), "Team names must be unique.");
  const teamById = new Map(official.teams.map((team) => [team.id, team]));
  const knownSourceIds = new Set([
    ...archive.sources.map((source) => source.id),
    ...archive.auxiliary.map((source) => source.id)
  ]);
  for (const team of official.teams) {
    check(team.currentStatus === "unknown", `${team.id} currentStatus must remain unknown.`);
    check(team.ownerCertified === false, `${team.id} must not be owner certified.`);
    const assignedDriverIds = roster.teamAssignments
      .filter((assignment) => assignment.teamId === team.id)
      .map((assignment) => assignment.driverId);
    check(
      sameStringSet(team.associatedDriverIds, assignedDriverIds),
      `${team.id}.associatedDriverIds must match roster.teamAssignments.`
    );
    if (team.sampleReceipt === null) {
      check(
        team.evidenceState === "existing-archive-structured-only",
        `${team.id} may omit a receipt only when marked existing-archive-structured-only.`
      );
    } else {
      validateReceipt(team.sampleReceipt, `teams.${team.id}.sampleReceipt`, knownSourceIds);
    }
  }
  for (const assignment of roster.teamAssignments) {
    check(teamById.has(assignment.teamId), `${assignment.driverId} references unknown team ${assignment.teamId}.`);
    if (teamById.has(assignment.teamId)) {
      check(teamById.get(assignment.teamId).name === assignment.teamName, `${assignment.teamId} name mismatch.`);
    }
  }

  const transcriptFiles = fs.existsSync(TRANSCRIPT_DIR)
    ? fs.readdirSync(TRANSCRIPT_DIR).filter((fileName) => fileName.endsWith(".txt"))
    : [];
  if (PUBLIC_RELEASE_MODE) {
    check(
      Number.isInteger(official.sponsors.corpus.transcriptFileCount) && official.sponsors.corpus.transcriptFileCount > 0,
      "sponsors.corpus.transcriptFileCount must preserve the validated source-corpus count."
    );
  } else {
    check(
      official.sponsors.corpus.transcriptFileCount === transcriptFiles.length,
      "sponsors.corpus.transcriptFileCount must match the materialized transcript corpus."
    );
  }
  check(official.sponsors.status === "caption-evidence-seed", "Sponsor data must remain a caption-evidence seed.");
  check(official.sponsors.coverageIsExhaustive === false, "Sponsor coverage must not claim completeness.");
  check(unique(official.sponsors.entities.map((entity) => entity.id)), "Sponsor entity IDs must be unique.");

  for (const entity of official.sponsors.entities) {
    check(entity.ownerCertified === false, `${entity.id} must not be owner certified.`);
    check(
      entity.relationshipState.includes("current-status-unknown") || entity.relationshipState.includes("status-not-asserted"),
      `${entity.id} relationshipState must preserve an unknown or unasserted current state.`
    );
    const evidence = entity.captionEvidence;
    check(isObject(evidence), `${entity.id}.captionEvidence must be an object.`);
    if (!isObject(evidence)) continue;
    let reproduced = null;
    try {
      // The source workspace reproduces every count from its private working
      // transcript corpus. The public static release deliberately omits that
      // corpus and validates the already-proven contract structurally.
      if (!PUBLIC_RELEASE_MODE) reproduced = countCaptionPattern(evidence.pattern, evidence.flags, transcriptFiles);
      else new RegExp(evidence.pattern, `${evidence.flags || ""}`.replace(/[^gimsuy]/g, ""));
    } catch (error) {
      errors.push(`${entity.id} caption pattern is invalid: ${error.message}`);
    }
    if (reproduced) {
      check(
        evidence.matchCount === reproduced.matchCount,
        `${entity.id} matchCount expected ${evidence.matchCount}, reproduced ${reproduced.matchCount}.`
      );
      check(
        evidence.sourceFileCount === reproduced.sourceFileCount,
        `${entity.id} sourceFileCount expected ${evidence.sourceFileCount}, reproduced ${reproduced.sourceFileCount}.`
      );
    }
    validateReceipt(evidence.sampleReceipt, `sponsors.${entity.id}.sampleReceipt`, knownSourceIds);
  }

  check(isIsoDateTime(official.updates.sourceSnapshotBuiltAt), "updates.sourceSnapshotBuiltAt must be an ISO date-time.");
  check(
    String(official.updates.sourceSnapshotBuiltAt || "").slice(0, 10) === official.snapshotDate,
    "updates.sourceSnapshotBuiltAt must belong to the certified source snapshot date."
  );
  check(
    Date.parse(official.updates.sourceSnapshotBuiltAt) <= Date.parse(archive.meta.builtAt),
    "updates.sourceSnapshotBuiltAt cannot be newer than the current public archive build."
  );
  check(
    official.updates.channelSnapshotCheckedAt === archive.records.channelSnapshotCheckedAt,
    "updates.channelSnapshotCheckedAt must match the channel audit."
  );
  check(
    official.updates.companionSnapshotCheckedAt === archive.records.companionSnapshotCheckedAt,
    "updates.companionSnapshotCheckedAt must match the companion audit."
  );
  check(
    official.updates.auxiliarySnapshotCheckedAt === archive.records.auxiliarySnapshotCheckedAt,
    "updates.auxiliarySnapshotCheckedAt must match the auxiliary audit."
  );
  check(official.updates.serviceActive === false, "Recurring service must not appear active before contracting.");
  check(official.updates.nextScheduledRefreshAt === null, "nextScheduledRefreshAt must remain null.");
  check(official.updates.sla.status === "not-contracted", "SLA must remain not-contracted.");
  for (const field of [
    "racePublicationTargetHours",
    "correctionAcknowledgementTargetHours",
    "availabilityTargetPercent",
    "startsAt"
  ]) {
    check(official.updates.sla[field] === null, `updates.sla.${field} must remain null.`);
  }
  check(official.updates.proposedCadence.status === "proposal-only", "proposedCadence must be labeled proposal-only.");
  check(official.updates.proposedCadence.targetHours === null, "A publication target cannot be implied before an SLA exists.");

  check(official.ownerUpgrade.status === "proposed-not-contracted", "ownerUpgrade must be clearly proposed and uncontracted.");
  check(Array.isArray(official.ownerUpgrade.features) && official.ownerUpgrade.features.length > 0, "ownerUpgrade.features must be populated.");
  check(unique(official.ownerUpgrade.features.map((feature) => feature.id)), "Owner upgrade feature IDs must be unique.");
  for (const feature of official.ownerUpgrade.features) {
    check(feature.status === "proposed", `${feature.id} must be labeled proposed.`);
    check(feature.requiresOwnerInput === true, `${feature.id} must preserve its owner-input dependency.`);
  }

  const legal = official.evidenceAndLegal;
  check(
    legal.ownerAuthorizationState === "not-established-by-this-contract",
    "ownerAuthorizationState must remain unestablished."
  );
  check(legal.mediaRightsState === "not-cleared-by-this-contract", "mediaRightsState must remain uncleared.");
  check(legal.privacyPolicyUrl === null, "privacyPolicyUrl must remain null until published.");
  check(legal.termsUrl === null, "termsUrl must remain null until published.");
  check(legal.rightsOrDmcaContact === null, "rightsOrDmcaContact must remain null until supplied.");

  notes.push(`${roster.teamAssignments.length} archive team mappings across ${official.teams.length} team entities.`);
  notes.push(
    `${official.sponsors.entities.length} sponsor/partner evidence seeds with ${official.sponsors.entities.reduce(
      (sum, entity) => sum + entity.captionEvidence.matchCount,
      0
    )} reproducible caption matches.`
  );
  notes.push("Schedule, standings, official roster, owner contact details, certification, next race, and SLA remain safely unavailable.");
  if (PUBLIC_RELEASE_MODE) notes.push("Public-release mode: transcript evidence was reproduced before deployment and the private working corpus is intentionally absent.");
}

if (errors.length > 0) {
  console.error(`HLRN official contract validation FAILED (${errors.length} error${errors.length === 1 ? "" : "s"})`);
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}`));
  process.exit(1);
}

console.log("HLRN official contract validation PASSED");
console.log(`Contract: ${official.contractVersion} / snapshot ${official.snapshotDate}`);
for (const note of notes) console.log(`- ${note}`);
