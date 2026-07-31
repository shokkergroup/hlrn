(function () {
  "use strict";

  var DATA = window.HLRN_DATA || { meta: {}, sources: [], seasons: [], drivers: [], moments: [], records: {} };
  var OFFICIAL = window.HLRN_OFFICIAL || {};
  var app = document.getElementById("app");
  var sourceMap = Object.fromEntries((DATA.sources || []).map(function (item) { return [item.id, item]; }));
  var driverMap = Object.fromEntries((DATA.drivers || []).map(function (item) { return [item.id, item]; }));
  var studioQuery = "";
  var studioCategory = "all";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slug(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function fmtTime(seconds) {
    var value = Math.max(0, Math.floor(Number(seconds) || 0));
    var hours = Math.floor(value / 3600);
    var mins = Math.floor((value % 3600) / 60);
    var secs = value % 60;
    return (hours ? hours + ":" + String(mins).padStart(2, "0") : mins) + ":" + String(secs).padStart(2, "0");
  }

  function fmtDate(value) {
    if (!value) return "NOT YET SUPPLIED";
    var date = new Date(value + (String(value).length === 10 ? "T12:00:00" : ""));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function listFrom(value, keys) {
    if (Array.isArray(value)) return value;
    for (var i = 0; i < keys.length; i += 1) {
      if (value && Array.isArray(value[keys[i]])) return value[keys[i]];
    }
    return [];
  }

  function teams() { return listFrom(OFFICIAL.teams, ["entities", "items", "teams"]); }
  function sponsors() { return listFrom(OFFICIAL.sponsors, ["entities", "items", "sponsors"]); }
  function competition() { return OFFICIAL.competition || {}; }
  function roster() { return competition().roster || {}; }
  function assignments() { return listFrom(roster().teamAssignments, ["items", "assignments"]); }
  function schedule() { return listFrom(competition().schedule, ["events", "items", "races"]); }
  function standings() { return listFrom(competition().standings, ["entries", "items", "drivers", "driverTables"]); }

  function head(kicker, title, intro, stats) {
    return '<section class="owner-page-head"><div class="wrap"><span>' + esc(kicker) + '</span><h1>' + title + '</h1><p>' + esc(intro) + '</p>' +
      (stats && stats.length ? '<div class="owner-head-stats">' + stats.map(function (item) {
        return '<div><b>' + esc(item[0]) + '</b><small>' + esc(item[1]) + '</small></div>';
      }).join("") + '</div>' : '') + '</div></section>';
  }

  function boundary(title, copy) {
    return '<aside class="owner-boundary"><b>' + esc(title) + '</b><p>' + esc(copy) + '</p></aside>';
  }

  function certificationState() {
    var value = (OFFICIAL.certification || {}).state || (OFFICIAL.certification || {}).status || "awaiting-owner-certification";
    return String(value).replace(/-/g, " ").toUpperCase();
  }

  function ownerEndpoint() {
    return (OFFICIAL.owner || {}).issueEndpoint || "https://github.com/shokkergroup/hlrn/issues/new";
  }

  function download(name, value, type) {
    var blob = new Blob([value], { type: type || "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 0);
  }

  function issueUrl(kind, payload) {
    var title = "HLRN " + kind.replace(/-/g, " ");
    var body = [
      "## HLRN owner review packet",
      "",
      "Type: " + kind,
      "Submitted from: " + location.href,
      "",
      "```json",
      JSON.stringify(payload, null, 2),
      "```",
      "",
      "This request does not alter public canon until authority and evidence are reviewed."
    ].join("\n");
    return ownerEndpoint() + "?title=" + encodeURIComponent(title) + "&labels=" + encodeURIComponent("owner-intake") + "&body=" + encodeURIComponent(body);
  }

  function openIssue(kind, payload) {
    var url = issueUrl(kind, payload);
    if (window.HLRN_ANALYTICS) window.HLRN_ANALYTICS.track("owner_intake_open", { kind: kind });
    window.open(url, "_blank", "noopener");
  }

  function leagueHQ() {
    var comp = competition();
    var current = comp.currentSeason || {};
    var next = comp.nextRace || (comp.schedule || {}).nextRace || schedule().find(function (item) { return item.status === "scheduled" || item.status === "upcoming"; });
    var rows = schedule();
    var table = standings();
    var teamRows = teams();
    var rosterRows = assignments();
    var latest = sourceMap[DATA.meta.latestOfficialId] || (DATA.sources || []).filter(function (item) { return item.lane === "official"; }).slice(-1)[0];
    app.innerHTML = '<div class="league-hq">' + head("HLRN LEAGUE HQ / CURRENT OPERATIONS", "RACE WEEKEND.<br><em>ONE CONTROL ROOM.</em>", "The official front door for what is known now, what happens next, and which records still need league authority.", [
      ["S" + esc(current.number || 2), "CURRENT SEASON"],
      [(DATA.records || {}).officialCount || 20, "ARCHIVED RACES"],
      [certificationState(), "DATA STATE"]
    ]) + '<div class="wrap hq-grid">' +
      '<section class="hq-next ' + (next ? "is-ready" : "is-open") + '"><span>NEXT RACE</span>' +
      (next ? '<h2>' + esc(next.eventName || next.name || "HLRN event") + '</h2><p>' + esc(next.track || "Track pending") + ' / ' + esc(fmtDate(next.date)) + '</p><div class="hq-next-actions">' + (next.broadcastUrl ? '<a class="owner-button hot" href="' + esc(next.broadcastUrl) + '" target="_blank" rel="noopener">WATCH LIVE</a>' : '') + (next.registrationUrl ? '<a class="owner-button" href="' + esc(next.registrationUrl) + '" target="_blank" rel="noopener">REGISTER</a>' : '') + '</div>' : '<h2>WAITING ON THE OWNER SCHEDULE.</h2><p>No future event is promoted from inference. Import the official schedule and this panel becomes the live race-weekend clock.</p><a class="owner-button hot" href="#/owner">SUPPLY OFFICIAL SCHEDULE</a>') + '</section>' +
      '<section class="hq-watch"><span>LATEST ARCHIVED SIGNAL</span>' + (latest ? '<img src="' + esc(latest.thumb) + '" alt="Latest archived HLRN race"><h2>S' + esc(latest.season) + ' R' + esc(latest.race) + ' / ' + esc(latest.track) + '</h2><p>' + esc(fmtDate(latest.date)) + ' / ' + esc((latest.chapters || []).length) + ' direct race cuts</p><div><button onclick="__play(\'' + esc(latest.id) + '\',0,\'Latest HLRN race\')">PLAY BROADCAST</button><a href="#/race/' + esc(latest.id) + '">OPEN RACE FILE</a></div>' : '<p>No archived official race is available.</p>') + '</section>' +
      '</div><div class="wrap hq-panels">' +
      '<section><header><span>OFFICIAL SCHEDULE</span><a href="assets/templates/hlrn-schedule-template.csv" download>DOWNLOAD TEMPLATE</a></header>' + (rows.length ? '<div class="hq-table">' + rows.map(function (item) { return '<article><b>' + esc(item.eventName || item.name || "HLRN event") + '</b><span>' + esc(item.track || "Track pending") + '</span><time>' + esc(fmtDate(item.date)) + '</time><em>' + esc(item.status || "scheduled") + '</em></article>'; }).join("") + '</div>' : '<div class="open-data-cell"><b>SCHEDULE NOT YET OWNER-SUPPLIED</b><p>The archive preserves completed race dates but does not guess future events.</p></div>') + '</section>' +
      '<section><header><span>CURRENT STANDINGS</span><a href="assets/templates/hlrn-results-template.csv" download>DOWNLOAD TEMPLATE</a></header>' + (table.length ? '<ol class="hq-standings">' + table.slice(0, 15).map(function (item, index) { return '<li><b>' + (item.position || index + 1) + '</b><span>' + esc(item.driverName || item.name || item.driverId) + '</span><em>' + esc(item.points == null ? "—" : item.points) + '</em></li>'; }).join("") + '</ol>' : '<div class="open-data-cell"><b>POINTS TABLE UNAVAILABLE</b><p>Podiums and winners are source-backed. Full points remain open until the owner supplies the scoring ledger.</p></div>') + '</section>' +
      '<section><header><span>CURRENT ROSTER</span><a href="assets/templates/hlrn-roster-template.csv" download>DOWNLOAD TEMPLATE</a></header><div class="hq-roster-count"><b>' + rosterRows.length + '</b><p>existing structured driver-to-team mappings—not a claimed complete current roster.</p></div><a class="owner-text-link" href="#/teams">OPEN TEAM PADDOCK →</a></section>' +
      '<section><header><span>LEAGUE CONTROL</span><a href="#/owner">OWNER ACCESS</a></header><div class="hq-control-links"><a href="#/owner-preview"><b>90-SECOND OWNER TOUR</b><span>See the race-to-media system.</span></a><a href="#/sponsors"><b>SPONSOR FLIGHT RECORDER</b><span>Open source-linked mention evidence.</span></a><a href="#/studio"><b>OWNER STUDIO</b><span>Review and package exact race cuts.</span></a><a href="#/impact"><b>IMPACT BOARD</b><span>Inspect measurable interaction signals.</span></a></div></section>' +
      '</div><div class="wrap">' + boundary("PUBLIC-SOURCE PREVIEW / AWAITING OWNER CERTIFICATION", "This HQ distinguishes archived broadcast evidence from owner-certified schedules, standings, rosters, rules, and partner records. Unknown remains visible until authority is supplied.") + '</div></div>';
  }

  function teamName(team) { return team.name || team.teamName || team.label || team.id || team.teamId || "Unnamed team"; }
  function teamId(team) { return team.id || team.teamId || slug(teamName(team)); }

  function teamsPage(id) {
    var rows = teams();
    if (id) {
      var team = rows.find(function (item) { return teamId(item) === id; });
      if (!team) return notReady("TEAM FILE NOT FOUND", "The requested team is not present in the structured owner layer.");
      var connected = assignments().filter(function (item) { return (item.teamId || item.team_id || slug(item.teamName)) === id; });
      app.innerHTML = '<div class="team-detail">' + head("TEAM PADDOCK / STRUCTURED EVIDENCE", esc(teamName(team)), "A team page built only from structured mappings already present in the archive. Owner records can complete numbers, roles, logos, sponsors, and current status.", [[connected.length, "MAPPED DRIVERS"], [esc(team.status || "EVIDENCE-BOUNDED"), "STATUS"]]) + '<div class="wrap"><section class="team-driver-grid">' + (connected.length ? connected.map(function (assignment) {
        var did = assignment.driverId || assignment.driver_id;
        var driver = driverMap[did] || {};
        return '<a href="#/driver/' + esc(did) + '"><b>' + esc(driver.name || assignment.driverName || did) + '</b><span>' + esc(assignment.carNumber || assignment.number || "NUMBER OPEN") + '</span><em>' + esc(assignment.evidenceState || assignment.status || "STRUCTURED MAPPING") + '</em></a>';
      }).join("") : '<div class="open-data-cell"><b>NO DRIVER MAPPINGS</b><p>This team entity exists without a safe current-roster assignment.</p></div>') + '</section><a class="owner-button hot" href="#/owner">CERTIFY THIS TEAM FILE</a>' + boundary("TEAM MEMBERSHIP IS NOT INFERRED FROM PROXIMITY", "A broadcast mention near a driver name does not establish current membership. Only structured mappings or owner records enter this page.") + '</div></div>';
      return;
    }
    app.innerHTML = '<div class="teams-page">' + head("TEAM PADDOCK / CURRENT ROSTER INTAKE", "TEAMS NEED<br><em>THEIR OWN GARAGE.</em>", "Existing team entities are separated from a complete current roster. Every open field is an invitation for owner certification, not a place for invention.", [[rows.length, "TEAM ENTITIES"], [assignments().length, "DRIVER MAPPINGS"], [Math.max(0, (DATA.drivers || []).length - assignments().length), "UNMAPPED IDENTITIES"]]) + '<div class="wrap"><div class="team-card-grid">' + rows.map(function (team) {
      var idValue = teamId(team);
      var count = assignments().filter(function (item) { return (item.teamId || item.team_id || slug(item.teamName)) === idValue; }).length;
      return '<a href="#/team/' + esc(idValue) + '"><span>TEAM FILE</span><h2>' + esc(teamName(team)) + '</h2><p>' + count + ' structured driver mapping' + (count === 1 ? '' : 's') + '</p><em>OPEN PADDOCK →</em></a>';
    }).join("") + '</div><section class="owner-import-call"><div><span>OWNER ROSTER IMPORT</span><h2>TURN THE TAPE INDEX INTO THE CURRENT GRID.</h2><p>Supply active status, team, number, preferred name, car art, social links, and sponsors without changing any stable driver route.</p></div><div><a class="owner-button hot" href="assets/templates/hlrn-roster-template.csv" download>ROSTER CSV</a><a class="owner-button" href="assets/templates/hlrn-teams-template.csv" download>TEAMS CSV</a><a class="owner-button" href="#/owner">OPEN OWNER ACCESS</a></div></section></div></div>';
  }

  function sponsorName(item) { return item.name || item.sponsorName || item.label || item.id || "Sponsor"; }
  function sponsorId(item) { return item.id || item.sponsorId || slug(sponsorName(item)); }
  function sponsorHits(item) { return Number(item.captionHits || item.hitCount || item.mentions || (item.captionEvidence || {}).matchCount || 0); }
  function sponsorSources(item) { return Number(item.sourceFileCount || item.sourceCount || (item.sourceIds || []).length || (item.captionEvidence || {}).sourceFileCount || 0); }

  function sponsorsPage(id) {
    var rows = sponsors().slice().sort(function (a, b) { return sponsorHits(b) - sponsorHits(a); });
    if (id) {
      var item = rows.find(function (entry) { return sponsorId(entry) === id; });
      if (!item) return notReady("SPONSOR FILE NOT FOUND", "No sponsor entity with that identifier exists in the evidence layer.");
      var sourceIds = item.sourceIds || item.sources || [];
      var sample = item.sampleReceipt || (item.captionEvidence || {}).sampleReceipt;
      if (!sourceIds.length && sample && sample.sourceId) sourceIds = [sample.sourceId];
      app.innerHTML = '<div class="sponsor-detail">' + head("SPONSOR FLIGHT RECORDER / CAPTION EVIDENCE", esc(sponsorName(item)), "A source-bounded record of indexed on-air language. Caption hits are discovery evidence—not impressions, audience reach, or a verified commercial relationship.", [[sponsorHits(item), "CAPTION HITS"], [sponsorSources(item), "SOURCE FILES"], [esc(item.relationshipStatus || item.status || "UNVERIFIED"), "RELATIONSHIP STATE"]]) + '<div class="wrap"><section class="sponsor-proof-sheet"><header><span>EVIDENCE SUMMARY</span><button onclick="__hlrnExportSponsor(\'' + esc(id) + '\')">EXPORT PROOF JSON</button></header><p>' + esc(item.caveat || "Counts identify indexed caption matches and require human context review before external use.") + '</p><div class="sponsor-source-list">' + (sourceIds.length ? sourceIds.map(function (sourceId) {
        var source = sourceMap[typeof sourceId === "string" ? sourceId : sourceId.id] || {};
        var sid = typeof sourceId === "string" ? sourceId : sourceId.id;
        return '<a href="#/race/' + esc(sid) + '/t/' + Number(sample && sample.sourceId === sid ? sample.t || 0 : 0) + '"><b>' + esc(source.name || source.title || sid) + '</b><span>' + esc(sample && sample.sourceId === sid ? '▶ ' + fmtTime(sample.t) + ' / ' + sample.matchText : source.track || "Source file") + '</span></a>';
      }).join("") : '<div class="open-data-cell"><b>SOURCE-BY-SOURCE RECEIPTS REQUIRE REVIEW</b><p>The aggregate caption count is preserved, but no timestamp is promoted without contextual review.</p></div>') + '</div></section><section class="sponsor-upgrade"><span>OWNER-CERTIFIED SPONSOR REPORTING UNLOCKS</span><div><b>Exact on-air timestamp receipts</b><b>Placement frames</b><b>Driver and team connections</b><b>Outbound sponsor links</b><b>Exportable season reports</b><b>Approved public partner copy</b></div><a class="owner-button hot" href="#/owner">CERTIFY PARTNER RECORDS</a></section>' + boundary("NO IMPRESSION CLAIM", "Caption matches do not measure unique viewers, exposure duration, brand lift, value, or contractual fulfillment. Final sponsor reporting requires owner review and approved relationship data.") + '</div></div>';
      return;
    }
    app.innerHTML = '<div class="sponsors-page">' + head("SPONSOR FLIGHT RECORDER / SOURCE-LINKED PROOF", "MAKE EVERY MENTION<br><em>ACCOUNTABLE.</em>", "HLRN already has raw sponsor language across its archive. This desk turns that material into a reviewable evidence queue without pretending a caption hit is an impression.", [[rows.reduce(function (sum, item) { return sum + sponsorHits(item); }, 0), "CAPTION HITS"], [rows.length, "TRACKED ENTITIES"], ["0", "CLAIMED IMPRESSIONS"]]) + '<div class="wrap"><div class="sponsor-radar">' + rows.map(function (item, index) {
      return '<a href="#/sponsor/' + esc(sponsorId(item)) + '" style="--rank:' + index + '"><span>' + String(index + 1).padStart(2, "0") + '</span><h2>' + esc(sponsorName(item)) + '</h2><div><b>' + sponsorHits(item) + '</b><small>CAPTION HITS</small></div><div><b>' + sponsorSources(item) + '</b><small>SOURCE FILES</small></div><em>OPEN PROOF FILE →</em></a>';
    }).join("") + '</div><section class="owner-import-call"><div><span>TURN EVIDENCE INTO AN OWNER REPORT</span><h2>VERIFY THE PARTNER. REVIEW THE CONTEXT. EXPORT THE PROOF.</h2><p>Add owner-approved logos, links, relationships, deliverables, and placement records while keeping raw caption evidence separate.</p></div><div><a class="owner-button hot" href="assets/templates/hlrn-sponsors-template.csv" download>SPONSOR CSV</a><a class="owner-button" href="#/owner">OWNER ACCESS</a></div></section>' + boundary("DISCOVERY COUNTS, NOT AD METRICS", "The public preview reports caption matches found in indexed HLRN material. It does not claim impressions, reach, sponsorship status, or commercial value.") + '</div></div>';
  }

  window.__hlrnExportSponsor = function (id) {
    var item = sponsors().find(function (entry) { return sponsorId(entry) === id; });
    if (!item) return;
    download("hlrn-sponsor-proof-" + id + ".json", JSON.stringify({ schema: "hlrn-sponsor-proof/v1", generatedAt: new Date().toISOString(), sponsor: item, boundary: "Caption hits require contextual and owner review. They are not impressions." }, null, 2));
  };

  function ownerPreview() {
    var latest = sourceMap[DATA.meta.latestOfficialId];
    app.innerHTML = '<div class="owner-preview">' + head("OWNER TOUR / FROM THREE-HOUR RACE TO PERMANENT MEDIA", "ONE BROADCAST.<br><em>SIX COMPOUNDING ASSETS.</em>", "Follow the actual HLRN workflow. Every step returns to the original race or to an explicitly bounded official-data state.", [[(latest && latest.chapters || []).length || 18, "DIRECT CUTS / LATEST RACE"], [(DATA.records || {}).centralIssueCount || 20, "RACE STORIES"], [(DATA.records || {}).driverCount || (DATA.drivers || []).length, "DRIVER FILES"]]) + '<div class="wrap tour-track">' + [
      ["01", "THE RACE", "Open the complete broadcast and jump to a reviewed green, battle, incident, strategy call, finish, or result receipt.", latest ? "#/race/" + latest.id : "#/watch", "OPEN LATEST RACE"],
      ["02", "THE STORY", "Read a substantial Central race report with source-linked supporting moments and visible evidence boundaries.", latest ? "#/central/" + latest.id : "#/central", "READ CENTRAL"],
      ["03", "THE PEOPLE", "Turn recurring race-tape identities into durable driver dossiers and owner-claimable profiles.", "#/drivers", "OPEN DRIVERS"],
      ["04", "THE PARTNERS", "Recover sponsor language, review context, and package approved proof without inventing impressions.", "#/sponsors", "OPEN SPONSOR PROOF"],
      ["05", "THE CONTENT QUEUE", "Move exact source windows through candidate, reviewed, approved, and published states.", "#/studio", "OPEN OWNER STUDIO"],
      ["06", "THE OFFICIAL HOME", "Add the real schedule, roster, teams, results, standings, rules, and owner authority on a league-controlled site.", "#/hq", "OPEN LEAGUE HQ"]
    ].map(function (step) {
      return '<article><b>' + step[0] + '</b><div><span>' + step[1] + '</span><h2>' + step[2] + '</h2><a href="' + step[3] + '">' + step[4] + ' →</a></div></article>';
    }).join("") + '</div><section class="owner-outcome"><div class="wrap"><span>THE OWNER OUTCOME</span><h2>NOT AN AI WIKI. A PERMANENT RACE MEMORY AND WEEKLY MEDIA SYSTEM.</h2><p>The paid official edition adds league authority, current operations, owner-controlled hosting, sponsor reporting, measurable workflows, and a repeatable post-race publishing cycle.</p><div><a class="owner-button hot" href="#/owner">CLAIM THE OFFICIAL EDITION</a><a class="owner-button" href="#/hq">INSPECT LEAGUE HQ</a></div></div></section></div>';
  }

  function ownerPage() {
    var cert = OFFICIAL.certification || {};
    app.innerHTML = '<div class="owner-page">' + head("OWNER ACCESS / CERTIFY, CORRECT, AND TAKE CONTROL", "MAKE IT<br><em>OFFICIALLY HLRN.</em>", "The public-source archive is ready. Owner authority unlocks current league operations without erasing the recovered evidence underneath.", [[certificationState(), "CERTIFICATION"], ["5", "OWNER DATA TEMPLATES"], ["APPEND-ONLY", "CORRECTIONS"]]) + '<div class="wrap owner-access-grid"><section class="owner-certify"><header><span>OWNER CERTIFICATION REQUEST</span><b>OPENS A TRACKED REVIEW</b></header><form onsubmit="event.preventDefault();__hlrnSubmitOwner()"><label>YOUR NAME<input id="ownerName" required placeholder="Name"></label><label>ROLE / AUTHORITY<input id="ownerRole" required placeholder="League owner, administrator, scoring official..."></label><label>CONTACT HANDLE<input id="ownerContact" placeholder="Email, Discord, or preferred contact"></label><label class="wide">WHAT SHOULD BECOME OFFICIAL?<textarea id="ownerScope" required placeholder="Schedule, roster, standings, rules, sponsor records, corrections, custom domain..."></textarea></label><label class="wide owner-consent"><input id="ownerAuthority" type="checkbox" required><span>I am authorized to request review for HLRN or I am identifying the person who is.</span></label><button class="owner-button hot" type="submit">OPEN OWNER REVIEW REQUEST</button></form><p class="form-boundary">Submission opens a GitHub review packet. It does not automatically change the public archive.</p></section><section class="owner-unlocks"><span>OFFICIAL EDITION</span><h2>WHAT OWNER AUTHORITY UNLOCKS</h2><ul><li>League-controlled custom domain and repository handoff</li><li>Current schedule, race-night clock, rules, and join links</li><li>Complete roster, car numbers, teams, and driver claims</li><li>Official results, standings, points, penalties, and rulings</li><li>Owner-certified sponsor and partner records</li><li>Authenticated correction and approval workflow</li><li>Recurring race-to-recap-to-content publishing cycle</li><li>Portable backups, exports, releases, and rollback</li></ul><button onclick="__hlrnDownloadOwnerSnapshot()">DOWNLOAD CURRENT OWNER SNAPSHOT</button></section></div><div class="wrap"><section class="template-locker"><header><span>OWNER DATA LOCKER</span><h2>FIVE CLEAN IMPORTS. NO HAND-EDITED PAGE DRIFT.</h2></header><div><a href="assets/templates/hlrn-schedule-template.csv" download><b>SCHEDULE</b><span>Events, tracks, dates, live and registration links</span></a><a href="assets/templates/hlrn-roster-template.csv" download><b>ROSTER</b><span>Names, numbers, teams, status, bios, socials</span></a><a href="assets/templates/hlrn-results-template.csv" download><b>RESULTS</b><span>Full classifications, points, authority, rulings</span></a><a href="assets/templates/hlrn-teams-template.csv" download><b>TEAMS</b><span>Names, management, logos, partners, status</span></a><a href="assets/templates/hlrn-sponsors-template.csv" download><b>SPONSORS</b><span>Approved names, links, relationships, public copy</span></a></div></section><section class="owner-paths"><a href="#/corrections"><b>CORRECT A SOURCE CLAIM</b><span>Locate → propose → review → append</span></a><a href="#/result-intake"><b>SUBMIT A RESULT PATCH</b><span>Update every downstream consumer safely</span></a><a href="#/claim"><b>CLAIM A DRIVER PROFILE</b><span>Add official image, number, team, bio, and socials</span></a><a href="#/legal"><b>READ THE TRUST & OWNERSHIP TERMS</b><span>Evidence, privacy, rights, and portability</span></a></section>' + boundary("AUTHORITY CHANGES THE STATE, NOT THE PAST", "Owner-certified records sit above public-source reconstruction while preserving prior receipts, conflicts, and correction history. No public field changes automatically from a form submission.") + '</div></div>';
  }

  window.__hlrnSubmitOwner = function () {
    var payload = {
      schema: "hlrn-owner-certification/v1",
      name: (document.getElementById("ownerName") || {}).value || "",
      role: (document.getElementById("ownerRole") || {}).value || "",
      contact: (document.getElementById("ownerContact") || {}).value || "",
      requestedScope: (document.getElementById("ownerScope") || {}).value || "",
      authorityConfirmed: !!((document.getElementById("ownerAuthority") || {}).checked),
      currentCertification: certificationState(),
      state: "pending-authenticated-review"
    };
    openIssue("owner-certification", payload);
  };

  window.__hlrnDownloadOwnerSnapshot = function () {
    download("hlrn-owner-snapshot-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify({ official: OFFICIAL, archiveMeta: DATA.meta, records: DATA.records }, null, 2));
  };

  function claimPage(id) {
    var selected = id && driverMap[id];
    var options = (DATA.drivers || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (driver) { return '<option value="' + esc(driver.id) + '" ' + (selected && selected.id === driver.id ? "selected" : "") + '>' + esc(driver.name) + '</option>'; }).join("");
    app.innerHTML = '<div class="claim-page">' + head("DRIVER CLAIM / OWNER-REVIEWED PROFILE INTAKE", "PUT THE RIGHT CAR<br><em>WITH THE RIGHT PERSON.</em>", "Drivers and team managers can propose an official image, number, team, biography, social link, and sponsor list. Every claim remains pending until reviewed.", [[(DATA.records || {}).driverImageCount || 203, "SOURCE FRAMES"], [Math.max(0, (DATA.drivers || []).length - ((DATA.records || {}).driverImageCount || 0)), "IMAGE GAPS"], ["REVIEWED", "CLAIM STATE"]]) + '<div class="wrap"><section class="claim-desk"><form onsubmit="event.preventDefault();__hlrnSubmitClaim()"><label>DRIVER<select id="claimDriver">' + options + '</select></label><label>CAR NUMBER<input id="claimNumber" placeholder="Exact current number"></label><label>TEAM<input id="claimTeam" placeholder="Exact current team"></label><label>CONTACT HANDLE<input id="claimContact" required placeholder="Email, Discord, or social handle"></label><label class="wide">OFFICIAL IMAGE LINKS<textarea id="claimImages" placeholder="Profile photo, car image, team logo. Use links you are authorized to provide."></textarea></label><label class="wide">BIOGRAPHY<textarea id="claimBio" placeholder="Preferred public biography"></textarea></label><label>SOCIAL LINK<input id="claimSocial" placeholder="https://..."></label><label>SPONSORS<input id="claimSponsors" placeholder="Comma-separated approved names"></label><label class="wide owner-consent"><input id="claimRights" type="checkbox" required><span>I have authority to submit these details and images for review.</span></label><button class="owner-button hot" type="submit">OPEN DRIVER CLAIM REVIEW</button></form><aside><span>SAFE IMAGE POLICY</span><h2>NO SCRAPED HEADSHOTS. NO GUESSED CARS.</h2><p>Owner- or driver-supplied images can replace contextual race frames after rights and identity review. Existing source receipts remain preserved.</p></aside></section></div></div>';
  }

  window.__hlrnSubmitClaim = function () {
    var driverId = (document.getElementById("claimDriver") || {}).value || "";
    openIssue("driver-claim-" + driverId, {
      schema: "hlrn-driver-claim/v1",
      driverId: driverId,
      displayName: (driverMap[driverId] || {}).name || "",
      carNumber: (document.getElementById("claimNumber") || {}).value || "",
      team: (document.getElementById("claimTeam") || {}).value || "",
      contact: (document.getElementById("claimContact") || {}).value || "",
      imageLinks: (document.getElementById("claimImages") || {}).value || "",
      biography: (document.getElementById("claimBio") || {}).value || "",
      socialUrl: (document.getElementById("claimSocial") || {}).value || "",
      sponsors: (document.getElementById("claimSponsors") || {}).value || "",
      rightsConfirmed: !!((document.getElementById("claimRights") || {}).checked),
      state: "pending-owner-review"
    });
  };

  function impactPage() {
    var analytics = window.HLRN_ANALYTICS;
    var snapshot = analytics ? analytics.snapshot() : { sessions: 0, totals: {}, routes: {}, actions: {}, scope: "not-loaded" };
    var routes = Object.entries(snapshot.routes || {}).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12);
    var actions = Object.entries(snapshot.actions || {}).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12);
    var connected = !!((OFFICIAL.owner || {}).analyticsEndpoint);
    app.innerHTML = '<div class="impact-page">' + head("IMPACT BOARD / PRIVACY-RESPECTING MEASUREMENT", "KNOW WHAT<br><em>PEOPLE USE.</em>", "This preview records anonymous aggregate interactions only in this browser. An owner-controlled endpoint can be connected later for site-wide reporting—without inventing historical traffic.", [[snapshot.sessions || 0, "LOCAL SESSIONS"], [(snapshot.totals || {}).pageViews || 0, "LOCAL PAGE VIEWS"], [connected ? "CONNECTED" : "NOT CONNECTED", "GLOBAL ANALYTICS"]]) + '<div class="wrap impact-grid"><section><header><span>TOP ROUTES / THIS BROWSER</span><b>' + routes.length + ' MEASURED</b></header>' + (routes.length ? '<ol>' + routes.map(function (item) { return '<li><b>' + esc(item[1]) + '</b><span>' + esc(item[0]) + '</span></li>'; }).join("") + '</ol>' : '<div class="open-data-cell"><b>NO LOCAL ROUTE DATA YET</b><p>Browse the site to populate this privacy-local demonstration.</p></div>') + '</section><section><header><span>TOP ACTIONS / THIS BROWSER</span><b>' + actions.length + ' MEASURED</b></header>' + (actions.length ? '<ol>' + actions.map(function (item) { return '<li><b>' + esc(item[1]) + '</b><span>' + esc(item[0].replace(/_/g, " ")) + '</span></li>'; }).join("") + '</ol>' : '<div class="open-data-cell"><b>NO LOCAL ACTION DATA YET</b><p>Race plays, driver opens, source exits, and owner actions will appear here.</p></div>') + '</section></div><div class="wrap"><section class="impact-actions"><div><span>OWNER REPORTING TARGET</span><h2>RACE OPENS. CUT PLAYS. DRIVER INTEREST. SPONSOR EXITS. RETURN VISITS.</h2><p>The event contract is ready. Site-wide measurement remains visibly disconnected until the owner selects and controls an analytics endpoint.</p></div><div><button onclick="HLRN_ANALYTICS.export()">EXPORT LOCAL LEDGER</button><button onclick="__hlrnClearImpact()">CLEAR THIS DEVICE</button><a href="#/owner">CONNECT OWNER ANALYTICS</a></div></section>' + boundary("NO TRAFFIC OR REVENUE CLAIMS", "The current numbers belong only to this browser. The archive does not claim unique visitors, conversions, sponsor value, retention, SEO rank, or revenue without an owner-controlled measurement source.") + '</div></div>';
  }

  window.__hlrnClearImpact = function () {
    if (!window.confirm("Clear the anonymous HLRN interaction ledger stored in this browser?")) return;
    if (window.HLRN_ANALYTICS) window.HLRN_ANALYTICS.clear();
    impactPage();
  };

  function readStudio() {
    try {
      var parsed = JSON.parse(localStorage.getItem("hlrn.studio.v2") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) { return []; }
  }

  function writeStudio(queue) { localStorage.setItem("hlrn.studio.v2", JSON.stringify(queue)); }
  function studioItem(moment) {
    return { id: moment.id, sourceId: moment.sourceId, start: moment.t, end: moment.end, title: moment.title, category: moment.category, status: "candidate", hook: "", caption: "", contextRisk: "review required", publishedUrl: "", performance: "", notes: "", addedAt: new Date().toISOString() };
  }

  function studioPage() {
    var queue = readStudio();
    var queuedIds = new Set(queue.map(function (item) { return item.id; }));
    var categories = Array.from(new Set((DATA.moments || []).map(function (item) { return item.category; }))).sort();
    var query = studioQuery.toLowerCase();
    var candidates = (DATA.moments || []).filter(function (moment) {
      if (studioCategory !== "all" && moment.category !== studioCategory) return false;
      if (!query) return true;
      return [moment.title, moment.summary, moment.track, moment.category].join(" ").toLowerCase().includes(query);
    }).sort(function (a, b) { return Number(b.score || b.heat || 0) - Number(a.score || a.heat || 0); });
    var selected = queue[0];
    var selectedSource = selected && sourceMap[selected.sourceId] || {};
    app.innerHTML = '<div class="owner-studio">' + head("OWNER STUDIO / RESEARCH → REVIEW → PUBLISH", "TURN THE RACE<br><em>INTO A CONTENT SYSTEM.</em>", "Build a portable production queue from exact HLRN source windows. Hooks, captions, approval, publication, and performance notes remain separate from archival evidence.", [[(DATA.moments || []).length, "REVIEWED CUTS"], [queue.length, "IN PROJECT"], [queue.filter(function (item) { return item.status === "published"; }).length, "PUBLISHED"]]) + '<div class="wrap studio-command"><section class="studio-candidates"><header><div><span>REVIEWED ARCHIVE CUTS</span><h2>CANDIDATE BOARD</h2></div><button onclick="__hlrnStudioReplay()">IMPORT SAVED REPLAY</button></header><div class="studio-filters"><input id="studioQuery" aria-label="Search reviewed archive cuts" value="' + esc(studioQuery) + '" placeholder="Search driver, track, moment..." oninput="__hlrnStudioQuery(this.value)"><select id="studioCategory" aria-label="Filter reviewed archive cuts by category" onchange="__hlrnStudioCategory(this.value)"><option value="all">ALL CATEGORIES</option>' + categories.map(function (category) { return '<option value="' + esc(category) + '" ' + (category === studioCategory ? "selected" : "") + '>' + esc(category.toUpperCase()) + '</option>'; }).join("") + '</select></div><div class="studio-candidate-list">' + candidates.slice(0, 40).map(function (moment) {
      return '<article><button class="studio-play" onclick="__play(\'' + esc(moment.sourceId) + '\',' + Number(moment.t || 0) + ',\'' + esc(String(moment.title || "").replace(/'/g, "\\'")) + '\')">▶ ' + fmtTime(moment.t) + '</button><div><span>' + esc(moment.category) + ' / ' + esc(moment.track) + '</span><h3>' + esc(moment.title) + '</h3><p>' + esc(moment.summary || "") + '</p></div><button class="studio-add ' + (queuedIds.has(moment.id) ? "added" : "") + '" onclick="__hlrnStudioAdd(\'' + esc(moment.id) + '\')">' + (queuedIds.has(moment.id) ? "IN PROJECT" : "+ PROJECT") + '</button></article>';
    }).join("") + '</div></section><aside class="vertical-preview"><header><span>9:16 CONCEPT PREVIEW</span><b>NOT A RENDERED CLIP</b></header>' + (selected ? '<div class="phone-frame" style="background-image:linear-gradient(to bottom,rgba(0,0,0,.05),rgba(0,0,0,.92)),url(\'' + esc(selectedSource.thumb || "") + '\')"><span>HLRN / ' + esc(selected.category) + '</span><h2>' + esc(selected.hook || selected.title) + '</h2><small>' + fmtTime(selected.start) + '–' + fmtTime(selected.end) + '</small></div><p>Visual crop, rights, in/out points, audio, and final copy still require human review.</p>' : '<div class="phone-frame empty"><span>ADD A CUT</span><h2>YOUR FIRST PROJECT ITEM APPEARS HERE.</h2></div>') + '</aside></div><div class="wrap studio-project"><header><div><span>PORTABLE PRODUCTION PROJECT</span><h2>' + queue.length + ' CUTS / FOUR APPROVAL STATES</h2></div><div><button onclick="__hlrnStudioExport()">EXPORT JSON</button><button onclick="__hlrnStudioCSV()">EXPORT CSV</button><button onclick="__hlrnStudioSubmit()">SUBMIT PROJECT REVIEW</button><label>IMPORT JSON<input type="file" accept="application/json" onchange="__hlrnStudioImport(this.files[0])"></label></div></header>' + (queue.length ? '<div class="studio-project-list">' + queue.map(function (item, index) {
      var source = sourceMap[item.sourceId] || {};
      return '<article><div class="project-order"><b>' + String(index + 1).padStart(2, "0") + '</b><button onclick="__hlrnStudioRemove(\'' + esc(item.id) + '\')">REMOVE</button></div><div class="project-core"><span>' + esc(source.name || source.title || item.sourceId) + ' / ' + fmtTime(item.start) + '–' + fmtTime(item.end) + '</span><h3>' + esc(item.title) + '</h3><button onclick="__play(\'' + esc(item.sourceId) + '\',' + Number(item.start || 0) + ',\'Studio review\')">PLAY EXACT WINDOW</button></div><div class="project-fields"><label>STATE<select onchange="__hlrnStudioUpdate(\'' + esc(item.id) + '\',\'status\',this.value)">' + ["candidate", "reviewed", "approved", "published"].map(function (status) { return '<option ' + (item.status === status ? "selected" : "") + '>' + status + '</option>'; }).join("") + '</select></label><label>PROPOSED HOOK<input value="' + esc(item.hook || "") + '" oninput="__hlrnStudioUpdate(\'' + esc(item.id) + '\',\'hook\',this.value)"></label><label class="wide">PROPOSED CAPTION<textarea oninput="__hlrnStudioUpdate(\'' + esc(item.id) + '\',\'caption\',this.value)">' + esc(item.caption || "") + '</textarea></label><label>CONTEXT / RIGHTS RISK<input value="' + esc(item.contextRisk || "") + '" oninput="__hlrnStudioUpdate(\'' + esc(item.id) + '\',\'contextRisk\',this.value)"></label><label>PUBLISHED URL<input value="' + esc(item.publishedUrl || "") + '" oninput="__hlrnStudioUpdate(\'' + esc(item.id) + '\',\'publishedUrl\',this.value)"></label><label>PERFORMANCE NOTE<input value="' + esc(item.performance || "") + '" oninput="__hlrnStudioUpdate(\'' + esc(item.id) + '\',\'performance\',this.value)"></label></div></article>';
    }).join("") + '</div>' : '<div class="studio-empty"><h2>NO CUTS IN THE PROJECT.</h2><p>Add reviewed moments from the candidate board or import the replay you built elsewhere in the wiki.</p></div>') + '</div><div class="wrap">' + boundary("EDITORIAL WORKSPACE / NOT ARCHIVAL CANON", "Hooks, captions, crops, scores, approval states, publication URLs, and performance notes are production metadata. They never rewrite the source transcript, result ledger, or public evidence state.") + '</div></div>';
  }

  window.__hlrnStudioQuery = function (value) { studioQuery = value; studioPage(); };
  window.__hlrnStudioCategory = function (value) { studioCategory = value; studioPage(); };
  window.__hlrnStudioAdd = function (id) { var queue = readStudio(); if (!queue.some(function (item) { return item.id === id; })) { var moment = (DATA.moments || []).find(function (item) { return item.id === id; }); if (moment) queue.push(studioItem(moment)); writeStudio(queue); } studioPage(); };
  window.__hlrnStudioRemove = function (id) { writeStudio(readStudio().filter(function (item) { return item.id !== id; })); studioPage(); };
  window.__hlrnStudioUpdate = function (id, field, value) { var queue = readStudio(); var item = queue.find(function (entry) { return entry.id === id; }); if (item) { item[field] = value; item.updatedAt = new Date().toISOString(); writeStudio(queue); } };
  window.__hlrnStudioReplay = function () { var ids = []; try { ids = JSON.parse(localStorage.getItem("hlrn.replay") || "[]"); } catch (error) {} var queue = readStudio(); ids.forEach(function (id) { if (!queue.some(function (item) { return item.id === id; })) { var moment = (DATA.moments || []).find(function (item) { return item.id === id; }); if (moment) queue.push(studioItem(moment)); } }); writeStudio(queue); studioPage(); };
  window.__hlrnStudioExport = function () { download("hlrn-studio-project.json", JSON.stringify({ schema: "hlrn-studio-project/v2", exportedAt: new Date().toISOString(), items: readStudio(), boundary: "Human review required for context, speakers, rights, in/out points, platform policy, and final copy." }, null, 2)); };
  window.__hlrnStudioCSV = function () { var fields = ["id", "sourceId", "start", "end", "title", "category", "status", "hook", "caption", "contextRisk", "publishedUrl", "performance", "notes"]; var q = function (value) { return '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"'; }; var csv = [fields.join(",")].concat(readStudio().map(function (item) { return fields.map(function (field) { return q(item[field]); }).join(","); })).join("\r\n"); download("hlrn-studio-project.csv", csv, "text/csv"); };
  window.__hlrnStudioSubmit = function () { openIssue("studio-project-review", { schema: "hlrn-studio-project/v2", submittedAt: new Date().toISOString(), items: readStudio(), boundary: "Human approval is required before publication." }); };
  window.__hlrnStudioImport = function (file) { if (!file) return; var reader = new FileReader(); reader.onload = function () { try { var parsed = JSON.parse(reader.result); var items = Array.isArray(parsed) ? parsed : parsed.items; if (!Array.isArray(items)) throw new Error("No items array"); writeStudio(items); studioPage(); } catch (error) { window.alert("That file is not a valid HLRN Studio project."); } }; reader.readAsText(file); };

  function legalPage() {
    app.innerHTML = '<div class="legal-page">' + head("TRUST, RIGHTS, PRIVACY & OWNERSHIP", "THE RULES<br><em>STAY VISIBLE.</em>", "The HLRN Living Wiki is a public-source preview built to become owner-certified without hiding uncertainty, copying race video, or trapping league data.", [["SOURCE-LINKED", "PUBLIC CLAIMS"], ["LOCAL-FIRST", "PREVIEW ANALYTICS"], ["PORTABLE", "OWNER HANDOFF"]]) + '<div class="wrap legal-grid"><article><span>AUTHORIZATION</span><h2>PUBLIC-SOURCE PREVIEW</h2><p>Unless an authenticated league owner states otherwise, “official race” describes the archive’s canon lane—not an assertion that the league has endorsed this website. Owner certification is displayed separately.</p></article><article><span>VIDEO & COPYRIGHT</span><h2>THE VIDEO STAYS WITH HLRN</h2><p>The site embeds or links to original YouTube uploads and exact timestamps. It does not republish full race video. Rights holders may request review through the corrections or owner-access workflow.</p></article><article><span>EVIDENCE</span><h2>UNKNOWN IS A VALID STATE</h2><p>Machine-surfaced cues, editor-reviewed navigation, result receipts, and owner-certified records remain distinct. Corrections are append-only and contradictions are preserved.</p></article><article><span>PRIVACY</span><h2>NO USER ID IN THE PREVIEW</h2><p>Interaction measurement is anonymous and stored locally in the current browser unless an owner-controlled analytics endpoint is explicitly configured. Forms open a tracked GitHub review and do not silently submit elsewhere.</p></article><article><span>SPONSORS</span><h2>CAPTION HITS ARE NOT IMPRESSIONS</h2><p>Indexed sponsor language is discovery evidence. It does not prove a commercial relationship, unique reach, exposure value, contractual fulfillment, or owner approval.</p></article><article><span>OWNERSHIP</span><h2>NO-LOCK-IN STATIC HANDOFF</h2><p>The deployable site uses ordinary HTML, CSS, JavaScript, images, and exportable data. A league-owned repository and custom domain can be configured after the owner supplies them.</p></article></div><div class="wrap legal-actions"><a class="owner-button hot" href="#/corrections">OPEN CORRECTIONS DESK</a><a class="owner-button" href="#/owner">OPEN OWNER ACCESS</a><a class="owner-button" href="https://github.com/shokkergroup/hlrn" target="_blank" rel="noopener">VIEW PUBLIC REPOSITORY</a></div></div>';
  }

  function notReady(title, copy) {
    app.innerHTML = '<div class="owner-not-ready"><div><span>OPEN RECORD</span><h1>' + esc(title) + '</h1><p>' + esc(copy) + '</p><a class="owner-button hot" href="#/hq">RETURN TO LEAGUE HQ</a></div></div>';
  }

  function handles(hash) {
    return ["#/hq", "#/owner-preview", "#/owner", "#/teams", "#/sponsors", "#/impact", "#/claim", "#/legal", "#/studio"].indexOf(hash) >= 0 || /^#\/(?:team|sponsor|claim)\/[\w-]+$/.test(hash);
  }

  function render(hash) {
    var match;
    if (hash === "#/hq") leagueHQ();
    else if (hash === "#/owner-preview") ownerPreview();
    else if (hash === "#/owner") ownerPage();
    else if (hash === "#/teams") teamsPage();
    else if ((match = hash.match(/^#\/team\/([\w-]+)$/))) teamsPage(match[1]);
    else if (hash === "#/sponsors") sponsorsPage();
    else if ((match = hash.match(/^#\/sponsor\/([\w-]+)$/))) sponsorsPage(match[1]);
    else if (hash === "#/impact") impactPage();
    else if (hash === "#/claim") claimPage();
    else if ((match = hash.match(/^#\/claim\/([\w-]+)$/))) claimPage(match[1]);
    else if (hash === "#/studio") studioPage();
    else if (hash === "#/legal") legalPage();
    else return false;
    return true;
  }

  window.HLRN_OWNER_UI = {
    handles: handles,
    render: render,
    openIssue: openIssue,
    issueUrl: issueUrl,
    certificationState: certificationState,
    refreshImpact: impactPage
  };
})();
