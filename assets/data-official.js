/*
 * HLRN official/commercial contract
 * ---------------------------------
 * This file is deliberately separate from the tape-derived archive in data*.js.
 * It is the safe boundary between:
 *
 *   1. public-source archive evidence;
 *   2. facts that an HLRN owner has formally certified; and
 *   3. proposed services that do not become active until they are contracted.
 *
 * Unknown values stay null or use an explicit unavailable state. A broadcast
 * mention, caption match, or existing archive association must never be
 * presented as a current roster, a current commercial relationship, an ad
 * impression, or owner certification.
 *
 * Run `node pipeline/validate_official_contract.mjs` after changing this file.
 */
window.HLRN_OFFICIAL = {
  contractVersion: "1.0.0",
  generatedAt: "2026-07-31T19:05:19.340Z",
  snapshotDate: "2026-07-31",

  league: {
    id: "hlrn",
    name: "High Line Racing Network",
    shortName: "HLRN",
    productName: "HLRN Living Wiki",
    channelUrl: "https://www.youtube.com/@High_Line_Racing",
    publicSiteUrl: "https://shokkergroup.github.io/hlrn/",
    identityState: "channel-supported",
    publicEditionState: "public-source-preview",
    legalEntityName: null,
    note: "The name and channel identity are supported by the indexed HLRN channel. A legal entity name and formal owner authorization have not been supplied to this contract."
  },

  certification: {
    status: "not-owner-certified",
    publicBadge: "PUBLIC-SOURCE PREVIEW",
    certifiedBy: null,
    certifiedAt: null,
    certifiedScope: [],
    authorityDocument: null,
    note: "No owner-certified badge may be shown until an authorized HLRN representative approves a defined data scope and the certification fields are populated."
  },

  owner: {
    displayName: "Thomas Rogers",
    role: "HLRN owner and network voice",
    identityState: "channel-supported-not-authenticated",
    issueEndpoint: "https://github.com/shokkergroup/hlrn/issues/new",
    analyticsEndpoint: null,
    contact: {
      status: "issue-endpoint-only",
      publicEmail: null,
      publicPhone: null,
      submissionEndpoint: null,
      note: "No owner-approved public email, phone number, or private intake endpoint is available. Corrections and certification requests can use the public issue endpoint until HLRN supplies one."
    },
    certificationRequest: {
      status: "available-via-issue-endpoint",
      requiredAuthorityProof: "Owner, league administrator, or an authorized HLRN representative.",
      requestedInputs: [
        "owner-approved league identity and marks",
        "current schedule and timezone",
        "current roster, numbers, teams, and profile assets",
        "official classifications, points system, and standings",
        "rules, registration, Discord, and live-race links",
        "current sponsor/partner list and approved outbound links",
        "preferred correction and publication workflow"
      ]
    }
  },

  competition: {
    currentSeason: {
      number: 2,
      label: "Season 2",
      state: "in-progress-in-channel-snapshot",
      ownerCertified: false,
      indexedRaceCount: 4,
      lastIndexedRaceId: "mEI0Oo-Sm5s",
      asOf: "2026-07-31",
      note: "Season 2 is marked in progress by the captured HLRN channel snapshot. This does not establish the date or venue of the next race."
    },
    schedule: {
      status: "unavailable",
      ownerCertified: false,
      timezone: null,
      nextRace: null,
      events: [],
      sourceDocument: null,
      reason: "No owner-supplied schedule or authoritative future-race calendar is present. The archive does not predict a next event from upload cadence."
    },
    standings: {
      status: "unavailable",
      ownerCertified: false,
      pointsSystem: null,
      driverTables: [],
      teamTables: [],
      sourceDocument: null,
      reason: "Complete classifications, points rules, penalties, and an owner standings sheet have not been supplied. Broadcast mentions are not converted into a points table."
    },
    roster: {
      status: "official-roster-unavailable",
      ownerCertified: false,
      currentAsOf: null,
      members: [],
      teamAssignmentCount: 14,
      teamAssignmentsAreCurrent: false,
      note: "The assignments below reproduce the 14 structured driver-to-team associations already present in assets/data-drivers.js. They are archive associations, not a complete or current HLRN roster, and every currentStatus remains unknown.",
      teamAssignments: [
        { driverId: "trevor-haley", driverName: "Trevor Haley", teamId: "darkhorse-racing", teamName: "Darkhorse Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "nick-bowman", driverName: "Nick Bowman", teamId: "darkhorse-racing", teamName: "Darkhorse Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "juan-escamilla", driverName: "Juan Escamilla", teamId: "darkhorse-racing", teamName: "Darkhorse Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "ethan-moreno", driverName: "Ethan Moreno", teamId: "darkhorse-racing", teamName: "Darkhorse Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "cory-cook", driverName: "Cory Cook", teamId: "rowdy-racing", teamName: "Rowdy Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "matt-brown", driverName: "Matt Brown", teamId: "smt-racing", teamName: "SMT Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "cody-neagles", driverName: "Cody Neagles", teamId: "vrx", teamName: "VRX", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "jacob-major", driverName: "Jacob Major", teamId: "rebel-racing", teamName: "Rebel Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "chuck-fletcher", driverName: "Chuck Fletcher", teamId: "helix-motorsports", teamName: "Helix Motorsports", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "francisco-bacayo", driverName: "Francisco Bacayo", teamId: "bacayo-buena-racing", teamName: "Bacayo Buena Racing", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "brock-piper", driverName: "Brock Piper", teamId: "lbs", teamName: "LBS", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "tyler-dixon", driverName: "Tyler Dixon", teamId: "supernova", teamName: "Supernova", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "michael-wiley", driverName: "Michael Wiley", teamId: "s-m", teamName: "S&M", currentStatus: "unknown", evidenceState: "existing-archive-structured" },
        { driverId: "james-jepsen", driverName: "James Jepsen", teamId: "s-m", teamName: "S&M", currentStatus: "unknown", evidenceState: "existing-archive-structured" }
      ]
    }
  },

  teams: [
    {
      id: "darkhorse-racing",
      name: "Darkhorse Racing",
      aliases: ["Dark Horse Racing", "DHR"],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["trevor-haley", "nick-bowman", "juan-escamilla", "ethan-moreno"],
      sampleReceipt: { sourceId: "gvDQYZkljhc", t: 251, matchText: "Ethan Moreno picks up the win for Darkhorse Racing" }
    },
    {
      id: "rowdy-racing",
      name: "Rowdy Racing",
      aliases: [],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["cory-cook"],
      sampleReceipt: { sourceId: "7rhtVe7p684", t: 1428, matchText: "Cory Cook filling in tonight for" }
    },
    {
      id: "smt-racing",
      name: "SMT Racing",
      aliases: ["SMT"],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["matt-brown"],
      sampleReceipt: { sourceId: "1hQe3Cg_KB8", t: 1051, matchText: "SMT's Matt Brown" }
    },
    {
      id: "vrx",
      name: "VRX",
      aliases: [],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["cody-neagles"],
      sampleReceipt: { sourceId: "mEI0Oo-Sm5s", t: 2700, matchText: "Cody Neagles, both of VRX" }
    },
    {
      id: "rebel-racing",
      name: "Rebel Racing",
      aliases: ["Rebel Racing Media"],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["jacob-major"],
      sampleReceipt: { sourceId: "7R7osKxmt2Q", t: 1313, matchText: "Rebel Racing at its finest" }
    },
    {
      id: "helix-motorsports",
      name: "Helix Motorsports",
      aliases: ["Helix Motorsport"],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["chuck-fletcher"],
      sampleReceipt: { sourceId: "mEI0Oo-Sm5s", t: 2497, matchText: "Chuck Fletcher there in the Helix Motorsport" }
    },
    {
      id: "bacayo-buena-racing",
      name: "Bacayo Buena Racing",
      aliases: [],
      evidenceState: "existing-archive-structured-only",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["francisco-bacayo"],
      sampleReceipt: null,
      note: "The team label is present in the structured driver archive, but no exact caption receipt for this spelling is promoted here. Owner confirmation remains open."
    },
    {
      id: "lbs",
      name: "LBS",
      aliases: ["LBS Racing"],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["brock-piper"],
      sampleReceipt: { sourceId: "7rhtVe7p684", t: 4153, matchText: "first race in of the season with LBS" }
    },
    {
      id: "supernova",
      name: "Supernova",
      aliases: [],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["tyler-dixon"],
      sampleReceipt: { sourceId: "J3KXHmkmdMw", t: 4536, matchText: "Tyler Dixon of Supernova" }
    },
    {
      id: "s-m",
      name: "S&M",
      aliases: ["S&M iRacing Motorsports", "SNM"],
      evidenceState: "caption-receipted-archive-association",
      currentStatus: "unknown",
      ownerCertified: false,
      associatedDriverIds: ["michael-wiley", "james-jepsen"],
      sampleReceipt: { sourceId: "1hQe3Cg_KB8", t: 1394, matchText: "Michael Wiley is S&M iRacing Motorsports" }
    }
  ],

  sponsors: {
    status: "caption-evidence-seed",
    ownerCertified: false,
    coverageIsExhaustive: false,
    corpus: {
      transcriptFileCount: 77,
      directory: "pipeline/transcripts",
      countMethod: "Case-insensitive regular-expression matches across materialized caption files.",
      caveat: "A caption match is not an impression, unique mention, paid placement, endorsement, click, view, contract, or proof that a relationship is current. Counts can also include repeated reads, ad copy, car identification, conversation, or transcription error."
    },
    entities: [
      {
        id: "pedleys-garage",
        name: "Pedley's Garage",
        category: "channel-described sponsor",
        relationshipState: "caption-supported-current-status-unknown",
        ownerCertified: false,
        captionEvidence: {
          pattern: "\\bpedley's\\s+garage\\b",
          flags: "gi",
          matchCount: 117,
          sourceFileCount: 34,
          sampleReceipt: { sourceId: "1hQe3Cg_KB8", t: 3442, matchText: "Pedley's Garage is sponsor of the Highline Racing Network" }
        }
      },
      {
        id: "team-watson-racing-setups",
        name: "Team Watson Racing Setups",
        category: "channel-described setup provider and partner",
        relationshipState: "caption-supported-current-status-unknown",
        ownerCertified: false,
        captionEvidence: {
          pattern: "\\bteam\\s+watson\\s+racing\\s+setups\\b",
          flags: "gi",
          matchCount: 82,
          sourceFileCount: 30,
          sampleReceipt: { sourceId: "7rhtVe7p684", t: 5043, matchText: "Team Watson Racing setups provides all the setups" }
        }
      },
      {
        id: "blind-squirrel-media",
        name: "Blind Squirrel Media",
        category: "channel-described media partner",
        relationshipState: "caption-supported-current-status-unknown",
        ownerCertified: false,
        captionEvidence: {
          pattern: "\\bblind\\s+squirrel\\b",
          flags: "gi",
          matchCount: 68,
          sourceFileCount: 18,
          sampleReceipt: { sourceId: "44J3FTucoHo", t: 23, matchText: "partnered with CSR Broadcasting and Blind Squirrel Media" }
        }
      },
      {
        id: "reliable-it-solutions",
        name: "Reliable IT Solutions",
        category: "car and driver-affiliated brand presence",
        relationshipState: "caption-supported-sponsor-status-not-asserted",
        ownerCertified: false,
        captionEvidence: {
          pattern: "\\breliable\\s+it\\s+solutions\\b",
          flags: "gi",
          matchCount: 12,
          sourceFileCount: 4,
          sampleReceipt: { sourceId: "kLqZuSjM4t4", t: 2069, matchText: "reliable IT solutions car" }
        }
      },
      {
        id: "drsn",
        name: "DRSN",
        category: "broadcast and media collaborator",
        relationshipState: "caption-supported-sponsor-status-not-asserted",
        ownerCertified: false,
        captionEvidence: {
          pattern: "\\bdrsn\\b",
          flags: "gi",
          matchCount: 16,
          sourceFileCount: 4,
          sampleReceipt: { sourceId: "upQfchHHEJw", t: 349, matchText: "Chris Murphy from DRSN" }
        }
      }
    ]
  },

  updates: {
    mode: "static-public-snapshot",
    sourceSnapshotBuiltAt: "2026-07-31T13:53:13.872345+00:00",
    channelSnapshotCheckedAt: "2026-07-31T13:48:46.436838+00:00",
    companionSnapshotCheckedAt: "2026-07-31T13:49:07.386031+00:00",
    auxiliarySnapshotCheckedAt: "2026-07-31T13:49:46.068170+00:00",
    latestIndexedOfficialRaceId: "mEI0Oo-Sm5s",
    nextScheduledRefreshAt: null,
    serviceActive: false,
    sla: {
      status: "not-contracted",
      racePublicationTargetHours: null,
      correctionAcknowledgementTargetHours: null,
      availabilityTargetPercent: null,
      startsAt: null,
      prerequisites: [
        "owner activation and an agreed publication scope",
        "access to authoritative schedule, roster, result, and standings inputs",
        "a named approver and correction destination",
        "agreed limits for normal-format race and media updates"
      ]
    },
    proposedCadence: {
      status: "proposal-only",
      trigger: "A public race broadcast plus any required owner result sheet becomes available.",
      deliverables: [
        "15-20 exact full-broadcast race cuts",
        "one source-bounded Highline Central race story",
        "accepted result, driver, and team record updates",
        "sponsor caption evidence update",
        "reviewed short-form content candidates"
      ],
      targetHours: null
    }
  },

  ownerUpgrade: {
    status: "proposed-not-contracted",
    productThesis: "Convert the public-source archive into an owner-certified league headquarters, sponsor-proof system, and recurring race-media operation on infrastructure the league can keep.",
    features: [
      {
        id: "owner-certification",
        name: "Owner certification and correction authority",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "A defined data scope can carry an authenticated owner-certified badge and append-only correction history."
      },
      {
        id: "league-hq",
        name: "Race Weekend / League HQ",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "Next-race information, live link, schedule, rules, registration, current standings, and announcements become one operational front door."
      },
      {
        id: "official-ledgers",
        name: "Official results, points, standings, roster, and teams",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "Owner sheets replace unknown states without rewriting the source-linked historical evidence."
      },
      {
        id: "driver-team-claims",
        name: "Driver and team profile claims",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "Authorized participants can supply numbers, teams, bios, imagery, social links, sponsors, and corrections."
      },
      {
        id: "sponsor-flight-recorder",
        name: "Sponsor Flight Recorder",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "Approved sponsor entities can receive source-linked on-air receipts and exportable evidence reports without labeling caption matches as impressions."
      },
      {
        id: "owner-impact-dashboard",
        name: "Owner impact dashboard",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "Privacy-respecting analytics can report page interest, video-cut clicks, sponsor-link activity, and content reuse after an analytics policy is approved."
      },
      {
        id: "collaborative-studio",
        name: "Collaborative content studio",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "A shared candidate-review-approval-published workflow can replace browser-local shortlists and exports."
      },
      {
        id: "ownership-handoff",
        name: "Custom domain, repository, exports, and handoff",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "The league can control its domain, repository, release backups, structured exports, deployment instructions, and maintenance choice."
      },
      {
        id: "recurring-publishing",
        name: "Recurring race publishing",
        status: "proposed",
        requiresOwnerInput: true,
        outcome: "A reviewed intake-build-preview-approve-publish workflow can keep future race pages, stories, ledgers, and sponsor evidence current."
      }
    ]
  },

  evidenceAndLegal: {
    archiveEvidenceState: "public-source-derived",
    ownerAuthorizationState: "not-established-by-this-contract",
    leagueMarksOwnership: "unknown-not-transferred",
    mediaRightsState: "not-cleared-by-this-contract",
    analyticsState: "not-configured-by-this-contract",
    privacyPolicyUrl: null,
    termsUrl: null,
    rightsOrDmcaContact: null,
    correctionsUrl: "https://github.com/shokkergroup/hlrn/issues/new",
    resultBoundary: "Broadcast-supported winner and podium records may be published with position-specific receipts. Complete classifications, starts, points, penalties, and standings remain unavailable until authoritative owner records are supplied.",
    captionBoundary: "Caption text can be incomplete or inaccurate. Caption matches support discovery and review; they do not independently prove identity, fault, intent, contractual status, commercial value, or current affiliation.",
    rosterBoundary: "A driver-team association in the archive is not a current roster claim unless the owner certifies it for a stated season and date.",
    sponsorBoundary: "A sponsor or partner label must remain caption-supported and current-status-unknown until the owner confirms the relationship, approved naming, links, dates, and report scope.",
    certificationRule: "Only authenticated owner approval can change certification.status to owner-certified. Machine output, public comments, upload cadence, and transcript language cannot do so.",
    legalNote: "All league, team, driver, sponsor, platform, and media names and marks remain the property of their respective owners. This data contract records evidence state and does not grant rights or legal endorsement."
  }
};
