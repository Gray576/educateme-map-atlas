#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const CORPUS_ROOT = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus"
);

const options = parseArgs(process.argv.slice(2));
const db = (options.db || "lu").toLowerCase();

const inputDir = path.join(CORPUS_ROOT, "by-domain", db);
const domainDirs = await listSubdirs(inputDir);
const rows = new Map();

for (const domain of domainDirs) {
  const reportsDir = path.join(inputDir, domain, "reports");
  const reports = await listJson(reportsDir);

  for (const reportPath of reports) {
    const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
    const reportType = report.meta?.reportType || "";
    const structured = report.structured || {};

    if (reportType === "organic-positions") {
      for (const row of structured.topRankingRows || []) {
        addKeywordObservation(rows, {
          keyword: row.keyword,
          domain,
          sourceType: "organic-position",
          bestPosition: toNumber(row.position),
          volume: numericLike(row.volume),
          kd: numericLike(row.kd),
          intent: Array.isArray(row.intents) ? row.intents.join(",") : null,
          traffic: numericLike(row.traffic),
          url: row.url || null,
          reportPath,
        });
      }
    }

    if (reportType === "domain-overview") {
      for (const row of structured.topOrganicKeywords || []) {
        addKeywordObservation(rows, {
          keyword: row.keyword,
          domain,
          sourceType: "top-organic-keyword",
          bestPosition: toNumber(row.position),
          volume: numericLike(row.volume),
          kd: numericLike(row.kd),
          intent: row.intent || null,
          traffic: numericLike(row.traffic) || null,
          url: row.url || null,
          reportPath,
        });
      }
    }
  }
}

const keywordRows = [...rows.values()]
  .map((row) => ({
    keyword: row.keyword,
    domainsCount: row.domains.size,
    domains: [...row.domains].sort(),
    bestPosition: row.bestPosition,
    maxVolume: row.maxVolume,
    minKd: row.minKd,
    intents: [...row.intents].sort(),
    sourceTypes: [...row.sourceTypes].sort(),
    topUrls: [...row.urls].slice(0, 5),
    observations: row.observations.sort(compareObservations),
  }))
  .sort(compareKeywordRows);

const outputDir = path.join(CORPUS_ROOT, "country-keywords", db);
await fs.mkdir(outputDir, { recursive: true });

const jsonPath = path.join(outputDir, "all-domain-keywords.json");
const csvPath = path.join(outputDir, "all-domain-keywords.csv");
const criteriaPath = path.join(outputDir, "selection-criteria.md");

await fs.writeFile(jsonPath, JSON.stringify(keywordRows, null, 2));
await fs.writeFile(csvPath, buildCsv(keywordRows));
await fs.writeFile(criteriaPath, buildCriteriaMemo(db));

console.log(`Keywords: ${keywordRows.length}`);
console.log(`JSON: ${jsonPath}`);
console.log(`CSV: ${csvPath}`);
console.log(`Memo: ${criteriaPath}`);

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--db") {
      parsed.db = args[++index];
    }
  }

  return parsed;
}

async function listSubdirs(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch {
    return [];
  }
}

async function listJson(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((entry) => entry.endsWith(".json"))
      .map((entry) => path.join(dir, entry))
      .sort();
  } catch {
    return [];
  }
}

function addKeywordObservation(store, observation) {
  const keyword = String(observation.keyword || "").trim();

  if (!keyword) {
    return;
  }

  const key = keyword.toLowerCase();
  const current = store.get(key) || {
    keyword,
    domains: new Set(),
    intents: new Set(),
    sourceTypes: new Set(),
    urls: new Set(),
    bestPosition: null,
    maxVolume: null,
    minKd: null,
    observations: [],
  };

  current.domains.add(observation.domain);

  if (observation.intent) {
    current.intents.add(observation.intent);
  }

  current.sourceTypes.add(observation.sourceType);

  if (observation.url) {
    current.urls.add(observation.url);
  }

  if (isFiniteNumber(observation.bestPosition)) {
    current.bestPosition =
      current.bestPosition == null
        ? observation.bestPosition
        : Math.min(current.bestPosition, observation.bestPosition);
  }

  if (isFiniteNumber(observation.volume)) {
    current.maxVolume =
      current.maxVolume == null
        ? observation.volume
        : Math.max(current.maxVolume, observation.volume);
  }

  if (isFiniteNumber(observation.kd)) {
    current.minKd =
      current.minKd == null ? observation.kd : Math.min(current.minKd, observation.kd);
  }

  current.observations.push({
    domain: observation.domain,
    sourceType: observation.sourceType,
    bestPosition: observation.bestPosition,
    volume: observation.volume,
    kd: observation.kd,
    intent: observation.intent,
    traffic: observation.traffic,
    url: observation.url,
    reportPath: relativePath(observation.reportPath),
  });

  store.set(key, current);
}

function compareKeywordRows(left, right) {
  const leftScore = (left.domainsCount || 0) * 100000 + (left.maxVolume || 0);
  const rightScore = (right.domainsCount || 0) * 100000 + (right.maxVolume || 0);
  return rightScore - leftScore || left.keyword.localeCompare(right.keyword);
}

function compareObservations(left, right) {
  return (left.bestPosition ?? 9999) - (right.bestPosition ?? 9999);
}

function buildCsv(rows) {
  const header = [
    "keyword",
    "domains_count",
    "domains",
    "best_position",
    "max_volume",
    "min_kd",
    "intents",
    "source_types",
    "top_urls",
  ];

  const lines = [header.join(",")];

  for (const row of rows) {
    lines.push(
      [
        csvValue(row.keyword),
        csvValue(row.domainsCount),
        csvValue(row.domains.join(" | ")),
        csvValue(row.bestPosition),
        csvValue(row.maxVolume),
        csvValue(row.minKd),
        csvValue(row.intents.join(" | ")),
        csvValue(row.sourceTypes.join(" | ")),
        csvValue(row.topUrls.join(" | ")),
      ].join(",")
    );
  }

  return `${lines.join("\n")}\n`;
}

function buildCriteriaMemo(database) {
  return `# Keyword Selection Criteria\n\nDatabase: \`${database.toUpperCase()}\`\n\n## What to keep for separate follow-up\n- Keep keywords that are local to the current database and align with a real product or route.\n- Prioritize keywords that appear across multiple domains: they indicate category-level demand, not one-off brand noise.\n- Prioritize keywords with at least one of these properties:\n  - clear route intent\n  - clear commercial intent\n  - visible ranking by our domain or close competitors\n  - manageable difficulty\n  - enough search volume to justify a page or cluster\n- Keep branded competitor keywords only when they help understand market structure, switching intent, or page patterns.\n\n## What not to prioritize\n- Single-domain noise with no product relevance.\n- Purely branded keywords that do not map to our offer or route.\n- Zero-volume or n/a variants unless they are critical route terms.\n- Adjacent-market phrases that do not belong to the selected database.\n\n## Why we need this\n- To identify keywords worth dedicated pages or content clusters.\n- To separate market evidence from random keyword expansion.\n- To build go-to-market around actual discoverability, not guesses.\n- To decide which product cards deserve deeper keyword and SERP work.\n\n## Default ranking heuristic\n1. More domains observed.\n2. Higher max volume.\n3. Better best observed position.\n4. Lower difficulty.\n5. Stronger route/commercial intent.\n`;
}

function numericLike(value) {
  if (value == null) {
    return null;
  }

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^([0-9]+(?:\.[0-9]+)?)([KM])?$/);

  if (!match) {
    return toNumber(value);
  }

  const number = Number(match[1]);
  if (match[2] === "K") {
    return number * 1000;
  }
  if (match[2] === "M") {
    return number * 1000000;
  }
  return number;
}

function toNumber(value) {
  const number = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function relativePath(filePath) {
  return String(filePath || "").replace(`${WORKSPACE_ROOT}/`, "");
}

function csvValue(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
