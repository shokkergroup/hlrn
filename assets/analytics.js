(function () {
  "use strict";

  var STORAGE_KEY = "hlrn.impact.v1";
  var MAX_KEYS = 250;

  function read() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (parsed && parsed.version === 1) return parsed;
    } catch (error) {
    }
    return {
      version: 1,
      scope: "this-browser-only",
      firstSeen: new Date().toISOString(),
      lastSeen: null,
      sessions: 0,
      totals: {},
      routes: {},
      actions: {},
    };
  }

  var ledger = read();
  var sessionCounted = false;

  function trimMap(map) {
    var entries = Object.entries(map || {});
    if (entries.length <= MAX_KEYS) return map;
    entries.sort(function (left, right) { return Number(right[1] || 0) - Number(left[1] || 0); });
    return Object.fromEntries(entries.slice(0, MAX_KEYS));
  }

  function persist() {
    ledger.routes = trimMap(ledger.routes);
    ledger.actions = trimMap(ledger.actions);
    ledger.lastSeen = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger)); } catch (error) {
    }
  }

  function safeKey(value) {
    return String(value || "unknown").replace(/[?#].*$/, "").slice(0, 160);
  }

  function optionalEndpoint() {
    var official = window.HLRN_OFFICIAL || {};
    return official.owner && official.owner.analyticsEndpoint || null;
  }

  function send(name, detail) {
    var endpoint = optionalEndpoint();
    if (!endpoint || !navigator.sendBeacon) return;
    var payload = JSON.stringify({
      event: name,
      detail: detail || {},
      path: location.pathname,
      route: location.hash || "#/",
      at: new Date().toISOString(),
      privacy: "no-user-id",
    });
    navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
  }

  function track(name, detail) {
    var eventName = safeKey(name);
    if (!sessionCounted) {
      ledger.sessions += 1;
      sessionCounted = true;
    }
    ledger.totals.events = Number(ledger.totals.events || 0) + 1;
    ledger.actions[eventName] = Number(ledger.actions[eventName] || 0) + 1;
    if (eventName === "page_view") {
      var route = safeKey(detail && detail.route || location.hash || "#/");
      ledger.routes[route] = Number(ledger.routes[route] || 0) + 1;
      ledger.totals.pageViews = Number(ledger.totals.pageViews || 0) + 1;
    }
    persist();
    send(eventName, detail);
    window.dispatchEvent(new CustomEvent("hlrn:impact", { detail: { event: eventName } }));
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(ledger));
  }

  function exportLedger() {
    var blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "hlrn-local-impact-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 0);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    ledger = read();
    sessionCounted = false;
    window.dispatchEvent(new CustomEvent("hlrn:impact", { detail: { event: "cleared" } }));
  }

  window.HLRN_ANALYTICS = { track: track, snapshot: snapshot, export: exportLedger, clear: clear };

  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest && event.target.closest("[data-analytics], a[href], button");
    if (!target) return;
    var explicit = target.getAttribute("data-analytics");
    var href = target.getAttribute("href") || "";
    var label = explicit || target.getAttribute("aria-label") || target.textContent || target.tagName;
    var action = explicit || (href.indexOf("youtube.com") >= 0 ? "source_outbound" : href.indexOf("#/race/") === 0 ? "race_open" : href.indexOf("#/driver/") === 0 ? "driver_open" : "interface_action");
    track(action, { label: safeKey(label.trim()), href: safeKey(href) });
  }, { passive: true });

  function pageView() { track("page_view", { route: location.hash || "#/" }); }
  window.addEventListener("hashchange", pageView);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pageView, { once: true });
  else pageView();

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {});
    }, { once: true });
  }
})();
