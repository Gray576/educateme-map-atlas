#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const DEFAULT_DB = "lu";
const DEFAULT_CORPUS_ROOT = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus"
);
const DEFAULT_SHORTLIST_PATH = path.join(
  DEFAULT_CORPUS_ROOT,
  "country-keywords/lu/lu-shortlist.json"
);

const options = parseArgs(process.argv.slice(2));
const db = (options.db || DEFAULT_DB).toLowerCase();
const corpusRoot = path.resolve(options.corpusRoot || DEFAULT_CORPUS_ROOT);
const shortlistPath = path.resolve(options.shortlist || DEFAULT_SHORTLIST_PATH);
const outputDir = path.join(corpusRoot, "country-keywords", db);

const shortlist = JSON.parse(await fs.readFile(shortlistPath, "utf8"));
const shortlistMap = new Map(shortlist.map((item) => [item.keyword, item]));
const reports = await loadLatestKeywordReports(corpusRoot, db);

const sourceKeywords = [];
const variationMap = new Map();
const questionMap = new Map();
const serpDomainMap = new Map();

for (const report of reports) {
  const keyword = report.meta?.query || report.summary?.queryOrDomain;

  if (!keyword) {
    continue;
  }

  const shortlistMeta = shortlistMap.get(keyword) || null;
  const structured = report.structured || {};
  const keywordSummary = structured.keywordSummary || {};
  const sourceMeta = {
    keyword,
    lane: shortlistMeta?.lane || null,
    priority: shortlistMeta?.priority || null,
    score: shortlistMeta?.score || null,
    domainsCount: shortlistMeta?.domainsCount || null,
    maxVolume: shortlistMeta?.maxVolume || parseMetricNumber(keywordSummary.volume),
    queryVolume: parseMetricNumber(keywordSummary.volume),
    globalVolume: parseMetricNumber(keywordSummary.globalVolume),
    cpc: parseMetricNumber(keywordSummary.cpc),
    keywordDifficulty: parseMetricNumber(keywordSummary.keywordDifficulty),
    competitiveDensity: parseMetricNumber(keywordSummary.competitiveDensity),
    results: parseMetricNumber(keywordSummary.results),
    variationCount: Array.isArray(structured.keywordVariations)
      ? structured.keywordVariations.length
      : 0,
    questionCount: Array.isArray(structured.questions) ? structured.questions.length : 0,
    serpLeaderCount: Array.isArray(structured.serpLeaders)
      ? structured.serpLeaders.length
      : 0,
  };

  sourceKeywords.push(sourceMeta);

  for (const row of structured.keywordVariations || []) {
    upsertOpportunity(variationMap, row.keyword, {
      sourceKeyword: keyword,
      sourceLane: shortlistMeta?.lane || null,
      sourcePriority: shortlistMeta?.priority || null,
      sourceScore: shortlistMeta?.score || null,
      volume: parseMetricNumber(row.volume),
      kd: parseMetricNumber(row.kd),
      rowText: row.rowText || null,
      category: "variation",
    });
  }

  for (const row of structured.questions || []) {
    upsertOpportunity(questionMap, row.keyword, {
      sourceKeyword: keyword,
      sourceLane: shortlistMeta?.lane || null,
      sourcePriority: shortlistMeta?.priority || null,
      sourceScore: shortlistMeta?.score || null,
      volume: parseMetricNumber(row.volume),
      kd: parseMetricNumber(row.kd),
      rowText: row.rowText || null,
      category: "question",
    });
  }

  for (const row of structured.serpLeaders || []) {
    const domain = normalizeDomain(row.domain || row.url);

    if (!domain) {
      continue;
    }

    const existing = serpDomainMap.get(domain) || {
      domain,
      sourceKeywords: new Set(),
      lanes: new Set(),
      positions: [],
      searchTraffic: [],
      urlKeywords: [],
      sampleUrls: [],
    };

    existing.sourceKeywords.add(keyword);

    if (shortlistMeta?.lane) {
      existing.lanes.add(shortlistMeta.lane);
    }

    if (row.position != null) {
      existing.positions.push(parseMetricNumber(row.position));
    }

    if (row.searchTraffic != null) {
      existing.searchTraffic.push(parseMetricNumber(row.searchTraffic));
    }

    if (row.urlKeywords != null) {
      existing.urlKeywords.push(parseMetricNumber(row.urlKeywords));
    }

    if (row.url && existing.sampleUrls.length < 5 && !existing.sampleUrls.includes(row.url)) {
      existing.sampleUrls.push(row.url);
    }

    serpDomainMap.set(domain, existing);
  }
}

const variationCandidates = Array.from(variationMap.values())
  .map(finalizeOpportunity)
  .sort(compareOpportunityRows);
const questionCandidates = Array.from(questionMap.values())
  .map(finalizeOpportunity)
  .sort(compareOpportunityRows);
const serpDomainWatchlist = Array.from(serpDomainMap.values())
  .map(finalizeSerpDomain)
  .sort((left, right) => {
    const scoreDiff = right.keywordCount - left.keywordCount;
    if (scoreDiff !== 0) return scoreDiff;
    return right.totalSearchTraffic - left.totalSearchTraffic;
  });

const followUpKeywords = buildFollowUpKeywords(variationCandidates, questionCandidates);

const payload = {
  meta: {
    database: db,
    generatedAt: new Date().toISOString(),
    sourceKeywordCount: sourceKeywords.length,
    variationCandidateCount: variationCandidates.length,
    questionCandidateCount: questionCandidates.length,
    serpDomainCount: serpDomainWatchlist.length,
    followUpKeywordCount: followUpKeywords.length,
  },
  sourceKeywords,
  variationCandidates,
  questionCandidates,
  serpDomainWatchlist,
  followUpKeywords,
};

await fs.mkdir(outputDir, { recursive: true });

const jsonPath = path.join(outputDir, "keyword-opportunities.json");
const csvPath = path.join(outputDir, "keyword-opportunities.csv");
const mdPath = path.join(outputDir, "keyword-opportunities.md");

await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2));
await fs.writeFile(csvPath, buildOpportunityCsv(followUpKeywords));
await fs.writeFile(mdPath, buildOpportunityMemo(payload));

console.log(`Source keywords: ${sourceKeywords.length}`);
console.log(`Follow-up keywords: ${followUpKeywords.length}`);
console.log(`Output JSON: ${jsonPath}`);
console.log(`Output CSV: ${csvPath}`);
console.log(`Output memo: ${mdPath}`);

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--db") {
      parsed.db = args[++index];
    } else if (arg === "--corpus-root") {
      parsed.corpusRoot = args[++index];
    } else if (arg === "--shortlist") {
      parsed.shortlist = args[++index];
    }
  }

  return parsed;
}

async function loadLatestKeywordReports(root, database) {
  const byKeywordDir = path.join(root, "by-keyword", database);
  const entries = await fs.readdir(byKeywordDir, { withFileTypes: true });
  const reports = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const reportsDir = path.join(byKeywordDir, entry.name, "reports");
    let reportFiles = [];

    try {
      reportFiles = (await fs.readdir(reportsDir))
        .filter((file) => file.startsWith("keyword-overview__") && file.endsWith(".json"))
        .sort();
    } catch {
      continue;
    }

    if (!reportFiles.length) {
      continue;
    }

    const latestPath = path.join(reportsDir, reportFiles[reportFiles.length - 1]);
    const report = JSON.parse(await fs.readFile(latestPath, "utf8"));
    reports.push(report);
  }

  return reports.sort((left, right) =>
    String(left.meta?.query || "").localeCompare(String(right.meta?.query || ""))
  );
}

function upsertOpportunity(map, keyword, row) {
  if (!keyword) {
    return;
  }

  const normalizedKey = keyword.trim().toLowerCase();
  const existing = map.get(normalizedKey) || {
    keyword: keyword.trim(),
    sourceKeywords: new Set(),
    lanes: new Set(),
    priorities: new Set(),
    sourceScores: [],
    volumes: [],
    kds: [],
    rowTexts: [],
    category: row.category,
  };

  existing.sourceKeywords.add(row.sourceKeyword);

  if (row.sourceLane) {
    existing.lanes.add(row.sourceLane);
  }

  if (row.sourcePriority) {
    existing.priorities.add(row.sourcePriority);
  }

  if (Number.isFinite(row.sourceScore)) {
    existing.sourceScores.push(row.sourceScore);
  }

  if (Number.isFinite(row.volume)) {
    existing.volumes.push(row.volume);
  }

  if (Number.isFinite(row.kd)) {
    existing.kds.push(row.kd);
  }

  if (row.rowText && existing.rowTexts.length < 5 && !existing.rowTexts.includes(row.rowText)) {
    existing.rowTexts.push(row.rowText);
  }

  map.set(normalizedKey, existing);
}

function finalizeOpportunity(item) {
  const sourceKeywords = Array.from(item.sourceKeywords).sort();
  const lanes = Array.from(item.lanes).sort();
  const priorities = Array.from(item.priorities).sort(comparePriority);
  const maxVolume = item.volumes.length ? Math.max(...item.volumes) : null;
  const minKd = item.kds.length ? Math.min(...item.kds) : null;
  const bestSourceScore = item.sourceScores.length ? Math.max(...item.sourceScores) : null;
  const followUpTier = classifyFollowUpTier({
    keyword: item.keyword,
    sourceCount: sourceKeywords.length,
    maxVolume,
    category: item.category,
  });

  return {
    keyword: item.keyword,
    category: item.category,
    sourceKeywords,
    sourceCount: sourceKeywords.length,
    lanes,
    priorities,
    bestSourceScore,
    maxVolume,
    minKd,
    rowTexts: item.rowTexts,
    followUpTier,
  };
}

function finalizeSerpDomain(item) {
  const positions = item.positions.filter(Number.isFinite);
  const searchTraffic = item.searchTraffic.filter(Number.isFinite);
  const urlKeywords = item.urlKeywords.filter(Number.isFinite);

  return {
    domain: item.domain,
    sourceKeywords: Array.from(item.sourceKeywords).sort(),
    keywordCount: item.sourceKeywords.size,
    lanes: Array.from(item.lanes).sort(),
    bestPosition: positions.length ? Math.min(...positions) : null,
    totalSearchTraffic: searchTraffic.reduce((sum, value) => sum + value, 0),
    maxUrlKeywords: urlKeywords.length ? Math.max(...urlKeywords) : null,
    sampleUrls: item.sampleUrls,
  };
}

function buildFollowUpKeywords(variationCandidates, questionCandidates) {
  const combined = [...variationCandidates, ...questionCandidates]
    .filter((item) => item.followUpTier !== "DROP")
    .sort(compareOpportunityRows);

  return combined.slice(0, 80);
}

function classifyFollowUpTier(item) {
  const keyword = String(item.keyword || "").toLowerCase();
  const isRouteLike =
    /(sproochentest|cours|course|formation|school|class|exam|test|online|du soir|continue)/i.test(
      keyword
    );

  if ((item.maxVolume || 0) >= 100 && item.sourceCount >= 2) {
    return "P1";
  }

  if ((item.maxVolume || 0) >= 50 && (item.sourceCount >= 1 || isRouteLike)) {
    return "P2";
  }

  if ((item.maxVolume || 0) >= 10 && isRouteLike) {
    return "WATCH";
  }

  return "DROP";
}

function compareOpportunityRows(left, right) {
  const tierDiff = comparePriority(left.followUpTier, right.followUpTier);
  if (tierDiff !== 0) return tierDiff;

  const sourceDiff = (right.sourceCount || 0) - (left.sourceCount || 0);
  if (sourceDiff !== 0) return sourceDiff;

  const volumeDiff = (right.maxVolume || 0) - (left.maxVolume || 0);
  if (volumeDiff !== 0) return volumeDiff;

  return String(left.keyword).localeCompare(String(right.keyword));
}

function comparePriority(left, right) {
  const order = ["P1", "P2", "WATCH", "P3", null];
  return order.indexOf(left ?? null) - order.indexOf(right ?? null);
}

function buildOpportunityCsv(rows) {
  const headers = [
    "follow_up_tier",
    "category",
    "keyword",
    "source_count",
    "source_keywords",
    "lanes",
    "priorities",
    "max_volume",
    "min_kd",
    "best_source_score",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.followUpTier,
        row.category,
        row.keyword,
        row.sourceCount,
        row.sourceKeywords.join(" | "),
        row.lanes.join(" | "),
        row.priorities.join(" | "),
        row.maxVolume ?? "",
        row.minKd ?? "",
        row.bestSourceScore ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return `${lines.join("\n")}\n`;
}

function buildOpportunityMemo(payload) {
  const p1 = payload.followUpKeywords.filter((item) => item.followUpTier === "P1").slice(0, 15);
  const p2 = payload.followUpKeywords.filter((item) => item.followUpTier === "P2").slice(0, 20);
  const watchDomains = payload.serpDomainWatchlist.slice(0, 15);

  return [
    "# LU Keyword Opportunities",
    "",
    `Generated: ${payload.meta.generatedAt}`,
    "",
    "## Coverage",
    "",
    `- Source keywords captured: ${payload.meta.sourceKeywordCount}`,
    `- Variation candidates: ${payload.meta.variationCandidateCount}`,
    `- Question candidates: ${payload.meta.questionCandidateCount}`,
    `- SERP domains: ${payload.meta.serpDomainCount}`,
    `- Follow-up keywords: ${payload.meta.followUpKeywordCount}`,
    "",
    "## P1 Follow-up Keywords",
    "",
    ...p1.map(
      (item) =>
        `- ${item.keyword} — ${item.category}, ${item.sourceCount} source keywords, max volume ${item.maxVolume ?? "n/a"}, lanes: ${item.lanes.join(", ") || "n/a"}`
    ),
    "",
    "## P2 Follow-up Keywords",
    "",
    ...p2.map(
      (item) =>
        `- ${item.keyword} — ${item.category}, ${item.sourceCount} source keywords, max volume ${item.maxVolume ?? "n/a"}`
    ),
    "",
    "## SERP Domain Watchlist",
    "",
    ...watchDomains.map(
      (item) =>
        `- ${item.domain} — ${item.keywordCount} source keywords, best position ${item.bestPosition ?? "n/a"}, lanes: ${item.lanes.join(", ") || "n/a"}`
    ),
    "",
    "## Selection Logic",
    "",
    "- `P1`: max volume >= 100 and appears under at least 2 source keywords.",
    "- `P2`: max volume >= 50 with route/commercial phrasing or at least one strong source keyword.",
    "- `WATCH`: smaller local volume but clear route language worth checking later.",
    "- `DROP`: weak or noisy rows that do not justify separate keyword-overview follow-up.",
    "",
  ].join("\n");
}

function parseMetricNumber(value) {
  if (value == null) {
    return null;
  }

  const text = String(value).trim().toLowerCase();

  if (!text || text === "n/a") {
    return null;
  }

  const normalized = text.replace(/[$,%]/g, "").replace(/,/g, "");
  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)([km])?$/i);

  if (match) {
    const number = Number(match[1]);
    const suffix = match[2]?.toLowerCase();

    if (suffix === "k") return Math.round(number * 1000);
    if (suffix === "m") return Math.round(number * 1000000);
    return number;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDomain(value) {
  if (!value) return null;

  const text = String(value)
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .trim()
    .toLowerCase();

  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(text) ? text : null;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
