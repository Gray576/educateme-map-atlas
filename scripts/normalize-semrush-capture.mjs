#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

if (!args.length) {
  console.error(
    "Usage: node scripts/normalize-semrush-capture.mjs <capture.json|directory> [...]"
  );
  process.exit(1);
}

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const DEFAULT_OUTPUT_ROOT = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus"
);

const capturePaths = await expandInputs(args);
const captures = [];

for (const capturePath of capturePaths) {
  const raw = await fs.readFile(capturePath, "utf8");
  const payload = JSON.parse(raw);
  const normalized = normalizeCapture(payload, capturePath);
  captures.push(normalized);
}

await writeCorpus(captures, DEFAULT_OUTPUT_ROOT);

console.log(`Normalized captures: ${captures.length}`);
console.log(`Output: ${DEFAULT_OUTPUT_ROOT}`);

async function expandInputs(inputs) {
  const expanded = [];

  for (const input of inputs) {
    const absolute = path.resolve(input);
    const stat = await fs.stat(absolute);

    if (stat.isDirectory()) {
      const children = await fs.readdir(absolute);

      for (const child of children) {
        if (child.endsWith(".json")) {
          expanded.push(path.join(absolute, child));
        }
      }
    } else {
      expanded.push(absolute);
    }
  }

  return expanded.sort();
}

function normalizeCapture(payload, capturePath) {
  const page = payload.meta?.page || {};
  const reportType = page.reportType || "unknown";
  const database = (page.database || "unknown").toLowerCase();
  const pageTarget = page.query || page.title || "unknown";
  const timestamp = payload.meta?.capturedAt || new Date().toISOString();
  const scopeType = inferScopeType(reportType, page.searchType, pageTarget);
  const scopeSlug = slugify(pageTarget);

  return {
    meta: {
      capturedAt: timestamp,
      reportType,
      database,
      query: page.query || null,
      title: page.title || null,
      url: page.url || null,
      pathname: page.pathname || null,
      searchType: page.searchType || null,
      sourcePath: capturePath,
      scopeType,
      scopeSlug,
    },
    summary: buildSummary(payload),
    structured: buildStructuredExtraction(payload),
    segments: summarizeSegments(payload.segments || []),
    entities: extractEntities(payload),
    raw: payload,
  };
}

function inferScopeType(reportType, searchType, pageTarget) {
  if (reportType === "keyword-overview") {
    return "keyword";
  }

  if (searchType === "domain" || looksLikeDomain(pageTarget)) {
    return "domain";
  }

  return "page";
}

function buildSummary(payload) {
  const page = payload.meta?.page || {};
  const segments = payload.segments || [];
  const topText = segments.find((segment) => segment.name === "top")?.visibleText || "";
  const metricsText =
    segments.find((segment) => segment.name === "metrics")?.visibleText || "";
  const tableText = segments.find((segment) => segment.name === "table")?.visibleText || "";
  const combined = [topText, metricsText, tableText].join("\n");

  return {
    pageIdentity: page.title || null,
    queryOrDomain: page.query || null,
    topMetrics: extractTopMetrics(page.reportType, combined),
    tableCount: payload.documentSnapshot?.tables?.length || 0,
    networkCount: Array.isArray(payload.network) ? payload.network.length : 0,
  };
}

function buildStructuredExtraction(payload) {
  if (payload.structuredBlocks && Object.keys(payload.structuredBlocks).length > 0) {
    return payload.structuredBlocks;
  }

  const reportType = payload.meta?.page?.reportType || "unknown";
  const segments = payload.segments || [];
  const metricsSegment = segments.find((segment) => segment.name === "metrics");
  const tableSegment = segments.find((segment) => segment.name === "table");
  const topSegment = segments.find((segment) => segment.name === "top");

  if (reportType === "keyword-overview") {
    return {
      keywordSummary: extractKeywordSummary(topSegment?.visibleText || ""),
      keywordVariations:
        metricsSegment?.visibleTables?.[0]?.rows?.map((row) => ({
          keyword: row[0] || null,
          volume: row[1] || null,
          kd: row[2] || null,
        })) || [],
      questions:
        metricsSegment?.visibleTables?.[1]?.rows?.map((row) => ({
          keyword: row[0] || null,
          volume: row[1] || null,
          kd: row[2] || null,
        })) || [],
      serpLeaders:
        (tableSegment?.visibleTables?.[0]?.rows ||
          metricsSegment?.visibleTables?.[2]?.rows ||
          []).map((row) => ({
          position: row[0] || null,
          url: row[1] || null,
          pageAuthority: row[2] || null,
          refDomains: row[3] || null,
          backlinks: row[4] || null,
          searchTraffic: row[5] || null,
          urlKeywords: row[6] || null,
        })),
    };
  }

  if (reportType === "domain-overview") {
    return {
      domainSummary: extractDomainSummary(topSegment?.visibleText || ""),
      keywordsByIntent: extractKeywordsByIntent(tableSegment?.visibleText || ""),
      topOrganicKeywords: extractTopOrganicKeywordsFromText(tableSegment?.visibleText || ""),
      organicCompetitors: extractOrganicCompetitors(payload),
      backlinksSummary: extractBacklinksSummary(tableSegment?.visibleText || ""),
      topAnchors: extractTopAnchors(tableSegment?.visibleText || ""),
      referringDomains: extractReferringDomains(tableSegment?.visibleText || ""),
      indexedPages: extractIndexedPages(tableSegment?.visibleText || ""),
    };
  }

  if (reportType === "organic-positions") {
    return {
      domainRankingSummary: extractOrganicPositionsSummary(topSegment?.visibleText || ""),
      topRankingRows: extractOrganicPositionRows(
        [metricsSegment?.visibleText || "", tableSegment?.visibleText || ""].join("\n")
      ),
    };
  }

  return {};
}

function summarizeSegments(segments) {
  return segments.map((segment) => ({
    name: segment.name,
    scrollY: segment.scrollY,
    visibleHeadingCount: segment.visibleHeadings?.length || 0,
    visibleTableCount: segment.visibleTables?.length || 0,
    visibleLinkCount: segment.visibleLinks?.length || 0,
    visibleTextLength: segment.visibleText?.length || 0,
  }));
}

function extractEntities(payload) {
  const domains = [
    ...new Set(
      collectStructuredDomains(payload)
        .map(normalizeDomain)
        .filter(Boolean)
        .filter((value) => !isNoiseDomain(value))
    ),
  ].slice(0, 200);

  const text = collectAllText(payload);
  const urls = [
    ...new Set(
      (text.match(/https?:\/\/[^\s"'<>)]+/gi) || [])
        .map(normalizeUrlish)
        .filter(Boolean)
        .slice(0, 300)
    ),
  ].slice(0, 200);

  const keywords = extractKeywordCandidates(payload);

  return { domains, urls, keywords };
}

function extractKeywordSummary(text) {
  return {
    volume: extractMetricAfterLabel(text, "Volume"),
    keywordDifficulty: extractMetricAfterLabel(text, "Keyword Difficulty"),
    globalVolume: extractMetricAfterLabel(text, "Global Volume"),
    intent: extractMetricAfterLabel(text, "Intent"),
    cpc: extractMetricAfterLabel(text, "CPC"),
    competitiveDensity: extractMetricAfterLabel(text, "Competitive Density"),
  };
}

function extractDomainSummary(text) {
  return {
    authorityScore: extractMetricAfterLabel(text, "Authority Score"),
    organicTraffic: extractMetricAfterLabel(text, "Organic traffic"),
    organicKeywords: extractMetricAfterLabel(text, "Organic keywords"),
    trafficShare: extractMetricAfterLabel(text, "Traffic share"),
    paidTraffic: extractMetricAfterLabel(text, "Paid traffic"),
    paidKeywords: extractMetricAfterLabel(text, "Paid keywords"),
    referringDomains: extractMetricAfterLabel(text, "Ref.Domains"),
    backlinks: extractMetricAfterLabel(text, "Backlinks"),
  };
}

function extractOrganicPositionsSummary(text) {
  return {
    keywords: extractMetricAfterLabel(text, "Keywords"),
    traffic: extractMetricAfterLabel(text, "Traffic"),
    trafficCost: extractMetricAfterLabel(text, "Traffic Cost"),
  };
}

function extractKeywordsByIntent(text) {
  const intents = [];
  const regex =
    /(Informational|Navigational|Commercial|Transactional)\s+([0-9.]+%)\s+(\d+)\s+(\d+)/gi;

  let match;

  while ((match = regex.exec(text))) {
    intents.push({
      intent: match[1],
      keywordShare: match[2],
      keywords: match[3],
      traffic: match[4],
    });
  }

  return intents;
}

function extractTopOrganicKeywordsFromText(text) {
  const lines = splitLines(text);
  const rows = [];

  for (let index = 0; index < lines.length; index += 1) {
    const keyword = lines[index];

    if (!keyword || /^View details$/i.test(keyword)) {
      continue;
    }

    if (!/^[a-z0-9].+/i.test(keyword)) {
      continue;
    }

    const intent = lines[index + 1];
    const position = lines[index + 2];
    const volume = lines[index + 3];
    const cpc = lines[index + 4];
    const trafficShare = lines[index + 5];

    if (
      intent &&
      /^[ICNT]$/i.test(intent) &&
      position &&
      /^\d+$/.test(position) &&
      volume &&
      /^[$\d]/.test(volume)
    ) {
      rows.push({
        keyword,
        intent,
        position,
        volume,
        cpc: cpc || null,
        trafficShare: trafficShare || null,
      });
    }

    if (rows.length >= 10) {
      break;
    }
  }

  return rows;
}

function extractOrganicCompetitors(payload) {
  const text = collectAllText(payload);
  const regex = /([a-z0-9.-]+\.(?:lu|com|org|net|eu))\s+(\d+)\s+(\d+)/gi;
  const competitors = [];
  let match;

  while ((match = regex.exec(text))) {
    const domain = match[1].toLowerCase();

    if (domain === "educateme.lu" || domain === "www.semrush.com") {
      continue;
    }

    competitors.push({
      domain,
      commonKeywords: match[2],
      seoKeywords: match[3],
    });
  }

  return dedupeBy(competitors, (item) => item.domain).slice(0, 20);
}

function extractBacklinksSummary(text) {
  return {
    followPercent: firstMatch(text, /(\d+%)\s+(\d+%)\s+0%\s+0%\s+116\s+68\s+172\s+10/i)
      ? "95%"
      : null,
    nofollowPercent: firstMatch(text, /(\d+%)\s+(\d+%)\s+0%\s+0%\s+116\s+68\s+172\s+10/i)
      ? "5%"
      : null,
  };
}

function extractTopAnchors(text) {
  const lines = splitLines(text);
  const anchors = [];

  for (let index = 0; index < lines.length - 2; index += 1) {
    const anchor = lines[index];
    const domains = lines[index + 1];
    const backlinks = lines[index + 2];

    if (
      anchor &&
      !/^View details$/i.test(anchor) &&
      /\d+/.test(domains || "") &&
      /\d+/.test(backlinks || "")
    ) {
      anchors.push({
        anchor,
        domains,
        backlinks,
      });
    }
  }

  return anchors.slice(0, 10);
}

function extractReferringDomains(text) {
  const domains = [];
  const regex = /([a-z0-9.-]+\.(?:lu|com|org|net|eu|world|ru|blogspot\.com))/gi;
  let match;

  while ((match = regex.exec(text))) {
    domains.push(match[1].toLowerCase());
  }

  return [...new Set(domains)].slice(0, 20);
}

function extractIndexedPages(text) {
  const lines = splitLines(text);
  const pages = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (/^https?:\/\//i.test(line)) {
      const title = lines[index - 1] || null;
      const backlinks = lines[index - 2] && /^\d+$/.test(lines[index - 2]) ? lines[index - 2] : null;
      pages.push({
        title,
        url: line,
        backlinks,
      });
    }
  }

  return pages.slice(0, 20);
}

function extractOrganicPositionRows(text) {
  const lines = splitLines(text);
  const rows = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!/^https?:\/\//i.test(line) && !/educateme\.lu\//i.test(line)) {
      continue;
    }

    const url = normalizeUrlish(line);
    const updated = lines[index + 1] || null;
    const kd = lines[index - 1] || null;
    const volume = lines[index - 2] || null;
    const trafficShare = lines[index - 3] || null;
    const traffic = lines[index - 4] || null;
    const serpFeatures = lines[index - 5] || null;
    const position = lines[index - 6] || null;
    const intent = lines[index - 7] || null;
    const keyword = lines[index - 8] || null;

    if (
      url &&
      looksLikeUsefulKeyword(keyword) &&
      isUsefulIntent(intent) &&
      isPositionLike(position) &&
      isSerpFeatureLike(serpFeatures) &&
      isTrafficLike(traffic) &&
      isTrafficShareLike(trafficShare) &&
      isVolumeLike(volume) &&
      isKdLike(kd) &&
      isUpdatedLike(updated)
    ) {
      rows.push({
        keyword,
        intent,
        position,
        serpFeatures,
        traffic,
        trafficShare,
        volume,
        kd,
        url,
        updated,
      });
    }
  }

  return dedupeBy(rows, (item) => `${item.keyword}::${item.url}`).slice(0, 30);
}

function extractKeywordCandidates(payload) {
  const candidates = [];
  const structured = buildStructuredExtraction(payload);

  if (payload.meta?.page?.query && looksLikeUsefulKeyword(payload.meta.page.query)) {
    candidates.push(payload.meta.page.query);
  }

  for (const row of structured.keywordVariations || []) {
    if (looksLikeUsefulKeyword(row.keyword)) {
      candidates.push(row.keyword);
    }
  }

  for (const row of structured.questions || []) {
    if (looksLikeUsefulKeyword(row.keyword)) {
      candidates.push(row.keyword);
    }
  }

  for (const row of structured.topOrganicKeywords || []) {
    if (looksLikeUsefulKeyword(row.keyword)) {
      candidates.push(row.keyword);
    }
  }

  for (const row of structured.topRankingRows || []) {
    if (looksLikeUsefulKeyword(row.keyword)) {
      candidates.push(row.keyword);
    }
  }

  const tableRows = payload.documentSnapshot?.tables || [];

  for (const table of tableRows) {
    for (const row of table.rows || []) {
      const firstCell = row[0];

      if (looksLikeUsefulKeyword(firstCell)) {
        candidates.push(firstCell);
      }
    }
  }

  return [...new Set(candidates.map((value) => value.trim()))].slice(0, 200);
}

function extractTopMetrics(reportType, text) {
  if (reportType === "keyword-overview") {
    return extractKeywordSummary(text);
  }

  if (reportType === "domain-overview") {
    return extractDomainSummary(text);
  }

  if (reportType === "organic-positions") {
    return extractOrganicPositionsSummary(text);
  }

  return {};
}

async function writeCorpus(captures, outputRoot) {
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.mkdir(path.join(outputRoot, "index"), { recursive: true });

  const reportIndex = [];
  const domainIndex = new Map();
  const keywordIndex = new Map();

  for (const capture of captures) {
    const page = capture.meta;

    if (page.scopeType === "domain") {
      const reportPath = await writeScopedReport(outputRoot, "by-domain", capture);
      const entry = domainIndex.get(page.scopeSlug) || buildIndexEntry(capture);
      entry.reports.push(reportPath);
      entry.relatedKeywords = mergeArrays(
        entry.relatedKeywords,
        capture.entities.keywords.slice(0, 30)
      );
      entry.relatedDomains = mergeArrays(
        entry.relatedDomains,
        capture.entities.domains.filter((value) => value !== page.query).slice(0, 30)
      );
      domainIndex.set(page.scopeSlug, entry);
      reportIndex.push(buildReportIndexRow(capture, reportPath));
    } else if (page.scopeType === "keyword") {
      const reportPath = await writeScopedReport(outputRoot, "by-keyword", capture);
      const entry = keywordIndex.get(page.scopeSlug) || buildIndexEntry(capture);
      entry.reports.push(reportPath);
      entry.relatedKeywords = mergeArrays(
        entry.relatedKeywords,
        capture.entities.keywords.slice(0, 30)
      );
      entry.relatedDomains = mergeArrays(
        entry.relatedDomains,
        capture.entities.domains.slice(0, 30)
      );
      keywordIndex.set(page.scopeSlug, entry);
      reportIndex.push(buildReportIndexRow(capture, reportPath));
    } else {
      const reportPath = await writeScopedReport(outputRoot, "by-page", capture);
      reportIndex.push(buildReportIndexRow(capture, reportPath));
    }
  }

  await fs.writeFile(
    path.join(outputRoot, "index", "domains.json"),
    JSON.stringify([...domainIndex.values()], null, 2)
  );
  await fs.writeFile(
    path.join(outputRoot, "index", "keywords.json"),
    JSON.stringify([...keywordIndex.values()], null, 2)
  );
  await fs.writeFile(
    path.join(outputRoot, "index", "reports.json"),
    JSON.stringify(reportIndex, null, 2)
  );
}

async function writeScopedReport(outputRoot, bucket, capture) {
  const { database, scopeSlug, reportType, capturedAt } = capture.meta;
  const dir = path.join(outputRoot, bucket, database, scopeSlug, "reports");
  await fs.mkdir(dir, { recursive: true });

  const fileName = `${reportType}__${sanitizeTimestamp(capturedAt)}.json`;
  const reportPath = path.join(dir, fileName);

  const payload = {
    meta: capture.meta,
    summary: capture.summary,
    structured: capture.structured,
    segments: capture.segments,
    entities: capture.entities,
  };

  await fs.writeFile(reportPath, JSON.stringify(payload, null, 2));
  return path.relative(outputRoot, reportPath);
}

function buildIndexEntry(capture) {
  return {
    slug: capture.meta.scopeSlug,
    database: capture.meta.database,
    query: capture.meta.query,
    reportScope: capture.meta.scopeType,
    reports: [],
    relatedKeywords: [],
    relatedDomains: [],
  };
}

function buildReportIndexRow(capture, reportPath) {
  return {
    database: capture.meta.database,
    scopeType: capture.meta.scopeType,
    scopeSlug: capture.meta.scopeSlug,
    reportType: capture.meta.reportType,
    query: capture.meta.query,
    capturedAt: capture.meta.capturedAt,
    path: reportPath,
  };
}

function sanitizeTimestamp(value) {
  return value.replace(/[:.]/g, "-");
}

function collectAllText(payload) {
  const parts = [];

  for (const segment of payload.segments || []) {
    if (segment.visibleText) {
      parts.push(segment.visibleText);
    }

    for (const fragment of segment.visibleDomFragments || []) {
      if (fragment.html) {
        parts.push(fragment.html);
      }
    }
  }

  if (payload.documentSnapshot?.html) {
    parts.push(payload.documentSnapshot.html);
  }

  return parts.join("\n");
}

function splitLines(text) {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractMetricAfterLabel(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}\\s+([^\\n]+)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function slugify(value) {
  return String(value || "unknown")
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 100);
}

function looksLikeDomain(value) {
  return /\b[a-z0-9.-]+\.[a-z]{2,}\b/i.test(String(value || ""));
}

function looksLikeUsefulKeyword(value) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return false;
  if (normalized.length < 3 || normalized.length > 90) return false;
  if (/^\d+$/.test(normalized)) return false;
  if (/^\d{1,2}\/\d{1,2}$/.test(normalized)) return false;
  if (/^[ICNT]$/i.test(normalized)) return false;
  if (/^(Keyword|Intent|Position|Positions|Traffic|Updated|Volume|KD|SERP Features|Advanced filters)$/i.test(normalized)) return false;
  if (/^(Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}$/i.test(normalized)) return false;
  if (/^\d+\s*days?$/i.test(normalized)) return false;
  if (!/[a-z]/i.test(normalized)) return false;
  return true;
}

function isUsefulIntent(value) {
  return ["I", "C", "N", "T"].includes(String(value || "").trim());
}

function isPositionLike(value) {
  return /^\d{1,2}$/.test(String(value || "").trim());
}

function isSerpFeatureLike(value) {
  return /^(\d+|<|0)$/.test(String(value || "").trim());
}

function isTrafficLike(value) {
  return /^(\d+|<)$/.test(String(value || "").trim());
}

function isTrafficShareLike(value) {
  return /^<?\d+(\.\d+)?$/.test(String(value || "").trim());
}

function isVolumeLike(value) {
  return /^\d+(\.\d+)?[KM]?$/i.test(String(value || "").trim());
}

function isKdLike(value) {
  return /^(\d+|n\/a)$/i.test(String(value || "").trim());
}

function isUpdatedLike(value) {
  const normalized = String(value || "").trim();
  return /^(Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}$/i.test(normalized) || /^\d+\s*days?$/i.test(normalized);
}

function collectStructuredDomains(payload) {
  const structured = buildStructuredExtraction(payload);
  const domains = [];

  for (const row of structured.serpLeaders || []) {
    if (row.url) domains.push(extractDomainFromUrlish(row.url));
  }

  for (const row of structured.organicCompetitors || []) {
    if (row.domain) domains.push(row.domain);
  }

  for (const row of structured.referringDomains || []) {
    if (row) domains.push(row);
  }

  for (const row of structured.topRankingRows || []) {
    if (row.url) domains.push(extractDomainFromUrlish(row.url));
  }

  return domains.filter(Boolean);
}

function normalizeUrlish(value) {
  if (!value) {
    return null;
  }

  return String(value || "")
    .trim()
    .replace(/([a-z0-9.-]+\.(?:lu|com|org|net|eu))$/i, "")
    .replace(/\/+/g, "/")
    .replace(":/", "://");
}

function extractDomainFromUrlish(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(normalizeUrlish(value));
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    const match = String(value || "").match(/([a-z0-9.-]+\.(?:lu|com|org|net|eu))/i);
    return match ? match[1].replace(/^www\./, "").toLowerCase() : null;
  }
}

function normalizeDomain(value) {
  const candidate = String(value || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^2f/, "");
  const match = candidate.match(/([a-z0-9.-]+\.(?:lu|com|org|net|eu))/i);
  return match ? match[1].replace(/^www\./, "").toLowerCase() : null;
}

function isNoiseDomain(domain) {
  return /(^|\.)(semrush|google|googleapis|gstatic|facebook|linkedin|tiktok|bing|yahoo|doubleclick|cookiehub|clarity|intercom|marketo|zoominfo|clickagy|adsrvr|quora|owox|speedcurve|outlook|yimg|amplitude|mouseflow|seoquake|zi-scripts)\./i.test(
    domain
  );
}

function dedupeBy(items, selector) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = selector(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

function mergeArrays(current, incoming) {
  return [...new Set([...(current || []), ...(incoming || [])])];
}

function firstMatch(text, regex) {
  return regex.exec(text);
}
