#!/usr/bin/env node

/**
 * Validate the generated HLRN SEO/deep-link layer without a browser or third-
 * party parser. This audit is intentionally strict: every expected data entity
 * must have one page, one canonical URL, unique metadata, valid JSON-LD, an
 * interactive SPA launch link, and an exact sitemap entry.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const MANIFEST_PATH = path.join(SCRIPT_DIR, "static_pages_manifest.json");
const REPORT_PATH = path.join(SCRIPT_DIR, "static_pages_audit_report.json");
const FAMILIES = ["race", "central", "driver"];

function loadData() {
  const context = { window: {} };
  vm.createContext(context);
  for (const file of ["data.js", "data-sources.js", "data-drivers.js", "data-moments.js"]) {
    const filePath = path.join(ROOT, "assets", file);
    vm.runInContext(fs.readFileSync(filePath, "utf8"), context, { filename: filePath });
  }
  return context.window.HLRN_DATA;
}

function decodeHtml(value) {
  return String(value || "")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function capture(document, regex) {
  const match = document.match(regex);
  return match ? decodeHtml(match[1].trim()) : "";
}

function meta(document, attribute, value) {
  const safe = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = document.match(new RegExp(`<meta\\s+[^>]*${attribute}=["']${safe}["'][^>]*>`, "i"));
  return tag ? capture(tag[0], /content=["']([^"']*)["']/i) : "";
}

function schemaTypes(schema) {
  const types = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (typeof value["@type"] === "string") types.push(value["@type"]);
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(schema);
  return types;
}

function listGeneratedHtml() {
  const files = [];
  for (const family of FAMILIES) {
    const root = path.join(ROOT, family);
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(root, entry.name, "index.html");
      if (fs.existsSync(file)) files.push(path.relative(ROOT, file).replaceAll(path.sep, "/"));
    }
  }
  return files.sort();
}

function uniqueFailures(records, field) {
  const groups = new Map();
  for (const record of records) {
    const value = record[field];
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(record.file);
  }
  return Array.from(groups.entries()).filter(([, files]) => files.length > 1).map(([value, files]) => ({ field, value, files }));
}

function interactiveUrl(baseUrl, spaRoute) {
  const url = new URL(baseUrl);
  url.hash = String(spaRoute || "").replace(/^#/, "");
  return url.href;
}

function localPathForPublicUrl(baseUrl, publicUrl) {
  const base = new URL(baseUrl);
  const candidate = new URL(publicUrl);
  if (candidate.origin !== base.origin || !candidate.pathname.startsWith(base.pathname)) return null;
  const relative = decodeURIComponent(candidate.pathname.slice(base.pathname.length));
  const resolved = path.resolve(ROOT, relative);
  return resolved.startsWith(`${ROOT}${path.sep}`) ? resolved : null;
}

function main() {
  const errors = [];
  const warnings = [];
  const checkedFiles = [];
  let manifest = null;

  if (!fs.existsSync(MANIFEST_PATH)) {
    errors.push("Missing pipeline/static_pages_manifest.json; run the generator first");
  } else {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  }

  const data = loadData();
  const expected = {
    race: data.sources.filter((source) => source.lane === "official").map((source) => source.id).sort(),
    central: data.publications.map((issue) => issue.id).sort(),
    driver: data.drivers.map((driver) => driver.id).sort(),
  };
  const expectedFiles = FAMILIES.flatMap((family) => expected[family].map((id) => `${family}/${id}/index.html`)).sort();
  const actualFiles = listGeneratedHtml();

  for (const file of expectedFiles.filter((item) => !actualFiles.includes(item))) errors.push(`Missing generated page: ${file}`);
  for (const file of actualFiles.filter((item) => !expectedFiles.includes(item))) errors.push(`Unexpected generated page: ${file}`);

  if (manifest) {
    const manifestFiles = manifest.files.map((record) => record.file).sort();
    for (const file of expectedFiles.filter((item) => !manifestFiles.includes(item))) errors.push(`Manifest missing page: ${file}`);
    for (const file of manifestFiles.filter((item) => !expectedFiles.includes(item))) errors.push(`Manifest contains unexpected page: ${file}`);
    if (manifest.counts.pages !== expectedFiles.length) errors.push(`Manifest page count ${manifest.counts.pages} does not equal expected ${expectedFiles.length}`);
  }

  const audited = [];
  for (const relativeFile of actualFiles) {
    const fullPath = path.join(ROOT, relativeFile);
    const document = fs.readFileSync(fullPath, "utf8");
    const [family, id] = relativeFile.split("/");
    const record = manifest?.files.find((item) => item.file === relativeFile);
    const title = capture(document, /<title>([\s\S]*?)<\/title>/i);
    const description = meta(document, "name", "description");
    const canonical = capture(document, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
      || capture(document, /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
    const ogUrl = meta(document, "property", "og:url");
    const ogTitle = meta(document, "property", "og:title");
    const ogDescription = meta(document, "property", "og:description");
    const ogImage = meta(document, "property", "og:image");
    const twitterCard = meta(document, "name", "twitter:card");
    const twitterTitle = meta(document, "name", "twitter:title");
    const twitterDescription = meta(document, "name", "twitter:description");
    const twitterImage = meta(document, "name", "twitter:image");
    const schemaText = capture(document, /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
    const h1 = capture(document, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
    let schema = null;

    if (!title) errors.push(`${relativeFile}: missing title`);
    if (title.length > 70) warnings.push(`${relativeFile}: title exceeds 70 characters (${title.length})`);
    if (!description) errors.push(`${relativeFile}: missing meta description`);
    if (description.length < 80 || description.length > 180) errors.push(`${relativeFile}: description length ${description.length} is outside 80–180`);
    if (!canonical || !canonical.startsWith("https://") || canonical.includes("#")) errors.push(`${relativeFile}: invalid canonical URL`);
    if (record && canonical !== record.canonical) errors.push(`${relativeFile}: canonical does not match manifest`);
    if (record && title !== record.title) errors.push(`${relativeFile}: title does not match manifest`);
    if (record && description !== record.description) errors.push(`${relativeFile}: description does not match manifest`);
    if (ogUrl !== canonical) errors.push(`${relativeFile}: og:url does not match canonical`);
    if (ogTitle !== title || twitterTitle !== title) errors.push(`${relativeFile}: social title does not match document title`);
    if (ogDescription !== description || twitterDescription !== description) errors.push(`${relativeFile}: social description does not match meta description`);
    if (!ogImage.startsWith("https://") || twitterImage !== ogImage) errors.push(`${relativeFile}: social image is missing or inconsistent`);
    if (twitterCard !== "summary_large_image") errors.push(`${relativeFile}: twitter card is not summary_large_image`);
    if (!h1) errors.push(`${relativeFile}: missing visible h1`);
    if (!document.includes('meta name="robots" content="index,follow')) errors.push(`${relativeFile}: missing index/follow robots directive`);
    if (record && !document.includes(`href="${interactiveUrl(manifest.baseUrl, record.spaRoute)}"`)) errors.push(`${relativeFile}: missing exact SPA launch link ${record.spaRoute}`);
    if (record && ogImage !== record.image) errors.push(`${relativeFile}: social image does not match manifest`);
    if (/\b(?:undefined|NaN|null)\b/.test(`${title} ${description} ${h1}`)) errors.push(`${relativeFile}: placeholder value leaked into primary metadata/content`);

    const localSocialImage = manifest ? localPathForPublicUrl(manifest.baseUrl, ogImage) : null;
    if (localSocialImage && !fs.existsSync(localSocialImage)) errors.push(`${relativeFile}: local social image does not exist (${path.relative(ROOT, localSocialImage)})`);
    const relativeAssets = Array.from(document.matchAll(/(?:src|href)=["'](\.\.\/\.\.\/[^"'#?]+)["']/g), (match) => match[1]);
    for (const relativeAsset of relativeAssets) {
      const assetPath = path.resolve(path.dirname(fullPath), relativeAsset);
      if (!assetPath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(assetPath)) errors.push(`${relativeFile}: missing relative asset ${relativeAsset}`);
    }

    try {
      schema = JSON.parse(schemaText);
    } catch (error) {
      errors.push(`${relativeFile}: invalid or missing JSON-LD (${error.message})`);
    }
    if (schema) {
      const types = schemaTypes(schema);
      const expectedType = family === "race" ? "SportsEvent" : family === "central" ? "Article" : "ProfilePage";
      if (!types.includes(expectedType)) errors.push(`${relativeFile}: JSON-LD lacks ${expectedType}`);
      if (!types.includes("BreadcrumbList")) errors.push(`${relativeFile}: JSON-LD lacks BreadcrumbList`);
    }

    audited.push({ file: relativeFile, type: family, id, title, description, canonical, image: ogImage, spaRoute: record?.spaRoute || "", schemaTypes: schema ? Array.from(new Set(schemaTypes(schema))).sort() : [] });
    checkedFiles.push(relativeFile);
  }

  for (const duplicate of [...uniqueFailures(audited, "title"), ...uniqueFailures(audited, "description"), ...uniqueFailures(audited, "canonical")]) {
    errors.push(`Duplicate ${duplicate.field}: ${duplicate.value} (${duplicate.files.join(", ")})`);
  }

  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    errors.push("Missing sitemap.xml");
  } else if (manifest) {
    const sitemap = fs.readFileSync(sitemapPath, "utf8");
    const locs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => decodeHtml(match[1]));
    const expectedLocs = [manifest.baseUrl, ...audited.map((item) => item.canonical)].sort();
    if (locs.some((loc) => loc.includes("#"))) errors.push("sitemap.xml contains a fragment URL");
    for (const loc of expectedLocs.filter((item) => !locs.includes(item))) errors.push(`Sitemap missing URL: ${loc}`);
    for (const loc of locs.filter((item) => !expectedLocs.includes(item))) errors.push(`Sitemap has unexpected URL: ${loc}`);
    if (new Set(locs).size !== locs.length) errors.push("sitemap.xml contains duplicate URLs");
    if (locs.length !== expectedLocs.length) errors.push(`Sitemap has ${locs.length} URLs; expected ${expectedLocs.length}`);
  }

  const robotsPath = path.join(ROOT, "robots.txt");
  if (!fs.existsSync(robotsPath)) errors.push("Missing robots.txt");
  else if (manifest) {
    const robots = fs.readFileSync(robotsPath, "utf8");
    const sitemapUrl = new URL("sitemap.xml", manifest.baseUrl).href;
    if (!robots.includes(`Sitemap: ${sitemapUrl}`)) errors.push("robots.txt does not point to the generated sitemap");
    if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) errors.push("robots.txt does not allow the public site");
  }

  const cssPath = path.join(ROOT, "assets", "seo-landing.css");
  if (!fs.existsSync(cssPath) || fs.statSync(cssPath).size < 1000) errors.push("assets/seo-landing.css is missing or unexpectedly small");

  const counts = {
    expectedPages: expectedFiles.length,
    actualPages: actualFiles.length,
    race: audited.filter((item) => item.type === "race").length,
    central: audited.filter((item) => item.type === "central").length,
    driver: audited.filter((item) => item.type === "driver").length,
    sitemapUrls: manifest ? 1 + audited.length : 0,
  };
  const report = {
    auditedAt: new Date().toISOString(),
    passed: errors.length === 0,
    counts,
    errors,
    warnings,
    files: audited,
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Static-page audit: ${report.passed ? "PASS" : "FAIL"}`);
  console.log(`${counts.actualPages}/${counts.expectedPages} pages checked (${counts.race} races, ${counts.central} Central stories, ${counts.driver} drivers).`);
  console.log(`${errors.length} errors, ${warnings.length} warnings.`);
  console.log("Report: pipeline/static_pages_audit_report.json");
  if (errors.length) {
    errors.slice(0, 30).forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  }
}

main();
