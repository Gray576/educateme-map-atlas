#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const options = parseArgs(args);

if (!options.db || !options.name) {
  console.error(
    "Usage: node scripts/build-semrush-niche-rollup.mjs --db <db> --name <slug> [--domain <slug>]... [--keyword <slug>]..."
  );
  process.exit(1);
}

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const CORPUS_ROOT = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus"
);

const inputReports = [];

for (const domain of options.domains) {
  inputReports.push(
    ...(await collectReports(path.join(CORPUS_ROOT, "by-domain", options.db, domain, "reports")))
  );
}

for (const keyword of options.keywords) {
  inputReports.push(
    ...(await collectReports(path.join(CORPUS_ROOT, "by-keyword", options.db, keyword, "reports")))
  );
}

const reports = [];

for (const reportPath of inputReports) {
  const raw = await fs.readFile(reportPath, "utf8");
  reports.push(JSON.parse(raw));
}

const rollup = buildRollup(options, reports);
const outputDir = path.join(CORPUS_ROOT, "niches", options.db);
await fs.mkdir(outputDir, { recursive: true });

const outputPath = path.join(outputDir, `${options.name}.json`);
await fs.writeFile(outputPath, JSON.stringify(rollup, null, 2));

console.log(`Reports used: ${reports.length}`);
console.log(`Output: ${outputPath}`);

async function collectReports(dir) {
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

function buildRollup(options, reports) {
  const keywords = new Map();
  const competitors = new Map();
  const topPages = new Map();
  const marketSignals = [];

  for (const report of reports) {
    const reportType = report.meta?.reportType;
    const scopeQuery = report.meta?.query || null;
    const reportPath = relativeToCorpus(report.meta?.sourcePath || "");

    if (reportType === "keyword-overview") {
      const summary = report.structured?.keywordSummary || {};

      marketSignals.push({
        type: "keyword-summary",
        keyword: scopeQuery,
        source: reportPath,
        volume: summary.volume || null,
        keywordDifficulty: summary.keywordDifficulty || null,
        cpc: summary.cpc || null,
        competitiveDensity: summary.competitiveDensity || null,
        intent: summary.intent || null,
      });

      for (const row of report.structured?.keywordVariations || []) {
        addKeywordRow(keywords, {
          keyword: row.keyword,
          volume: row.volume,
          kd: row.kd,
          sourceType: "keyword-variation",
          sourceScope: scopeQuery,
          source: reportPath,
        });
      }

      for (const row of report.structured?.serpLeaders || []) {
        const domain = extractDomainFromUrlish(row.url);

        if (!domain) {
          continue;
        }

        addCompetitor(competitors, {
          domain,
          sourceType: "serp-leader",
          sourceScope: scopeQuery,
          source: reportPath,
          position: row.position || null,
          searchTraffic: row.searchTraffic || null,
          backlinks: row.backlinks || null,
        });
      }
    }

    if (reportType === "organic-positions") {
      for (const row of report.structured?.topRankingRows || []) {
        if (!looksLikeUsefulKeyword(row.keyword) || !isUsefulIntent(row.intent)) {
          continue;
        }

        addKeywordRow(keywords, {
          keyword: row.keyword,
          volume: row.volume,
          kd: row.kd,
          intent: row.intent,
          position: row.position,
          traffic: row.traffic,
          trafficShare: row.trafficShare,
          sourceType: "organic-position",
          sourceScope: scopeQuery,
          source: reportPath,
        });

        if (row.url) {
          addTopPage(topPages, {
            url: normalizeUrlish(row.url),
            keyword: row.keyword,
            intent: row.intent,
            position: row.position,
            traffic: row.traffic,
            sourceScope: scopeQuery,
            source: reportPath,
          });
        }
      }
    }

    if (reportType === "domain-overview") {
      const summary = report.structured?.domainSummary || {};

      marketSignals.push({
        type: "domain-summary",
        domain: scopeQuery,
        source: reportPath,
        authorityScore: summary.authorityScore || null,
        organicTraffic: summary.organicTraffic || null,
        organicKeywords: summary.organicKeywords || null,
        referringDomains: summary.referringDomains || null,
        backlinks: summary.backlinks || null,
      });

      for (const row of report.structured?.topOrganicKeywords || []) {
        addKeywordRow(keywords, {
          keyword: row.keyword,
          volume: row.volume,
          intent: row.intent,
          position: row.position,
          cpc: row.cpc,
          trafficShare: row.trafficShare,
          sourceType: "top-organic-keyword",
          sourceScope: scopeQuery,
          source: reportPath,
        });
      }

      for (const row of report.structured?.organicCompetitors || []) {
        addCompetitor(competitors, {
          domain: row.domain,
          commonKeywords: row.commonKeywords,
          seoKeywords: row.seoKeywords,
          sourceType: "organic-competitor",
          sourceScope: scopeQuery,
          source: reportPath,
        });
      }

      for (const row of report.structured?.referringDomains || []) {
        addCompetitor(competitors, {
          domain: row,
          sourceType: "referring-domain",
          sourceScope: scopeQuery,
          source: reportPath,
        });
      }
    }
  }

  return {
    meta: {
      name: options.name,
      database: options.db,
      createdAt: new Date().toISOString(),
      seedDomains: options.domains,
      seedKeywords: options.keywords,
      reportCount: reports.length,
    },
    marketSignals,
    aggregatedKeywords: [...keywords.values()].sort(compareKeywordRows),
    competitorWatchlist: [...competitors.values()].sort(compareCompetitors),
    topPages: [...topPages.values()].sort(compareTopPages),
  };
}

function addKeywordRow(store, row) {
  if (!row.keyword || !looksLikeUsefulKeyword(row.keyword)) {
    return;
  }

  const key = row.keyword.toLowerCase();
  const current = store.get(key) || {
    keyword: row.keyword,
    volume: null,
    kd: null,
    cpc: null,
    intents: [],
    bestPosition: null,
    trafficSignals: [],
    sources: [],
  };

  current.volume = pickHigherNumericLike(current.volume, row.volume);
  current.kd = pickLowerNumericLike(current.kd, row.kd);
  current.cpc = pickHigherCurrencyLike(current.cpc, row.cpc);

  if (row.intent && !current.intents.includes(row.intent)) {
    current.intents.push(row.intent);
  }

  if (row.position && isFiniteNumber(row.position)) {
    const numeric = Number(row.position);
    current.bestPosition =
      current.bestPosition == null ? numeric : Math.min(current.bestPosition, numeric);
  }

  if (row.traffic || row.trafficShare) {
    current.trafficSignals.push({
      traffic: row.traffic || null,
      trafficShare: row.trafficShare || null,
      sourceScope: row.sourceScope || null,
    });
  }

  current.sources.push({
    sourceType: row.sourceType,
    sourceScope: row.sourceScope,
    source: row.source,
  });

  store.set(key, current);
}

function addCompetitor(store, row) {
  if (!row.domain) {
    return;
  }

  const domain = row.domain.toLowerCase();
  const current = store.get(domain) || {
    domain,
    commonKeywords: null,
    seoKeywords: null,
    bestObservedPosition: null,
    searchTrafficSignals: [],
    backlinksSignals: [],
    sources: [],
  };

  current.commonKeywords = pickHigherNumericLike(current.commonKeywords, row.commonKeywords);
  current.seoKeywords = pickHigherNumericLike(current.seoKeywords, row.seoKeywords);

  if (row.position && isFiniteNumber(row.position)) {
    const numeric = Number(row.position);
    current.bestObservedPosition =
      current.bestObservedPosition == null
        ? numeric
        : Math.min(current.bestObservedPosition, numeric);
  }

  if (row.searchTraffic) {
    current.searchTrafficSignals.push(row.searchTraffic);
  }

  if (row.backlinks) {
    current.backlinksSignals.push(row.backlinks);
  }

  current.sources.push({
    sourceType: row.sourceType,
    sourceScope: row.sourceScope,
    source: row.source,
  });

  store.set(domain, current);
}

function addTopPage(store, row) {
  if (!row.url) {
    return;
  }

  const key = row.url;
  const current = store.get(key) || {
    url: row.url,
    keywordFamilies: [],
    bestPosition: null,
    intentMix: [],
    trafficSignals: [],
    sources: [],
  };

  if (row.keyword && !current.keywordFamilies.includes(row.keyword)) {
    current.keywordFamilies.push(row.keyword);
  }

  if (row.intent && !current.intentMix.includes(row.intent)) {
    current.intentMix.push(row.intent);
  }

  if (row.position && isFiniteNumber(row.position)) {
    const numeric = Number(row.position);
    current.bestPosition =
      current.bestPosition == null ? numeric : Math.min(current.bestPosition, numeric);
  }

  if (row.traffic) {
    current.trafficSignals.push(row.traffic);
  }

  current.sources.push({
    sourceScope: row.sourceScope,
    source: row.source,
  });

  store.set(key, current);
}

function compareKeywordRows(a, b) {
  const volumeDelta = numericLike(b.volume) - numericLike(a.volume);
  if (volumeDelta !== 0) return volumeDelta;

  if (a.bestPosition != null && b.bestPosition != null) {
    return a.bestPosition - b.bestPosition;
  }

  return a.keyword.localeCompare(b.keyword);
}

function compareCompetitors(a, b) {
  const commonDelta = numericLike(b.commonKeywords) - numericLike(a.commonKeywords);
  if (commonDelta !== 0) return commonDelta;

  const seoDelta = numericLike(b.seoKeywords) - numericLike(a.seoKeywords);
  if (seoDelta !== 0) return seoDelta;

  if (a.bestObservedPosition != null && b.bestObservedPosition != null) {
    return a.bestObservedPosition - b.bestObservedPosition;
  }

  return a.domain.localeCompare(b.domain);
}

function compareTopPages(a, b) {
  if (a.bestPosition != null && b.bestPosition != null) {
    return a.bestPosition - b.bestPosition;
  }

  return b.keywordFamilies.length - a.keywordFamilies.length;
}

function looksLikeUsefulKeyword(value) {
  if (!value) return false;
  const normalized = String(value || "").trim();
  if (normalized.length < 3) return false;
  if (/^\d{1,2}\/\d{1,2}$/.test(value)) return false;
  if (/^[A-Z][a-z]{2}\s\d{1,2}$/.test(value)) return false;
  if (/^Mar\s\d{1,2}$/i.test(value)) return false;
  if (/^\d+$/.test(value)) return false;
  if (/^[ICNT]$/i.test(normalized)) return false;
  if (/^(View details|Keyword|Intent|Position|URL|Updated)$/i.test(normalized)) return false;
  return /[a-z]/i.test(value);
}

function isUsefulIntent(value) {
  return ["I", "C", "N", "T"].includes(String(value || "").trim());
}

function normalizeUrlish(value) {
  if (!value) {
    return null;
  }

  const fixed = value.replace(/([a-z0-9.-]+\.(?:lu|com|org|net|eu))$/i, "");
  return fixed;
}

function extractDomainFromUrlish(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(normalizeUrlish(value));
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    const match = value.match(/([a-z0-9.-]+\.(?:lu|com|org|net|eu))/i);
    return match ? match[1].replace(/^www\./, "").toLowerCase() : null;
  }
}

function parseArgs(input) {
  const result = {
    db: null,
    name: null,
    domains: [],
    keywords: [],
  };

  for (let index = 0; index < input.length; index += 1) {
    const token = input[index];
    const next = input[index + 1];

    if (token === "--db") {
      result.db = next;
      index += 1;
      continue;
    }

    if (token === "--name") {
      result.name = next;
      index += 1;
      continue;
    }

    if (token === "--domain") {
      result.domains.push(next);
      index += 1;
      continue;
    }

    if (token === "--keyword") {
      result.keywords.push(next);
      index += 1;
    }
  }

  return result;
}

function relativeToCorpus(value) {
  return value.replace(`${WORKSPACE_ROOT}/`, "");
}

function numericLike(value) {
  if (value == null) return -Infinity;
  const clean = String(value).replace(/[,$%<>]/g, "").trim().toLowerCase();
  if (!clean) return -Infinity;
  if (clean.endsWith("k")) return Number(clean.slice(0, -1)) * 1000;
  if (clean.endsWith("m")) return Number(clean.slice(0, -1)) * 1000000;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : -Infinity;
}

function pickHigherNumericLike(current, candidate) {
  return numericLike(candidate) > numericLike(current) ? candidate : current;
}

function pickLowerNumericLike(current, candidate) {
  if (candidate == null) return current;
  if (current == null) return candidate;
  return numericLike(candidate) < numericLike(current) ? candidate : current;
}

function pickHigherCurrencyLike(current, candidate) {
  return pickHigherNumericLike(current, candidate);
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}
