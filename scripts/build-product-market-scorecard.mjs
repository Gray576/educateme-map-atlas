#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const RUN_ROOT = path.join(WORKSPACE_ROOT, "research-runs/2026-04-18-all-24");
const OVERVIEW_CSV = path.join(RUN_ROOT, "commercial-validation-overview.csv");
const MAPPING_PATH = path.join(
  RUN_ROOT,
  "semrush-corpus/config/product-market-mapping.json"
);
const OUTPUT_DIR = path.join(RUN_ROOT, "semrush-corpus/product-scorecard");

const overviewRows = await readCsv(OVERVIEW_CSV);
const mapping = new Map(
  JSON.parse(await fs.readFile(MAPPING_PATH, "utf8")).map((row) => [row.product_code, row])
);

const localOpportunities = JSON.parse(
  await fs.readFile(
    path.join(RUN_ROOT, "semrush-corpus/country-keywords/lu/keyword-opportunities.json"),
    "utf8"
  )
);

const localShortlist = JSON.parse(
  await fs.readFile(
    path.join(RUN_ROOT, "semrush-corpus/country-keywords/lu/lu-shortlist.json"),
    "utf8"
  )
);
const keywordReportIndex = await loadKeywordReportIndex(
  path.join(RUN_ROOT, "semrush-corpus/by-keyword")
);

const byProductCode = new Map();
for (const row of overviewRows) {
  const productDir = await findProductDir(row.product_code);
  const commercialValidation = JSON.parse(
    await fs.readFile(path.join(productDir, "commercial-validation.json"), "utf8")
  );

  const productMapping = mapping.get(row.product_code) || {
    product_code: row.product_code,
    market_track: "none",
    lane_group: "unmapped",
    lane_keys: [],
    semrush_priority: "low",
    anchor_focus: [],
  };

  const expectedDbs = expectedDbsForTrack(productMapping.market_track);
  const anchorEvidence = collectAnchorEvidence(
    productMapping.anchor_focus || [],
    expectedDbs,
    productMapping.market_track,
    keywordReportIndex
  );
  const evidenceDb = normalizeDb(
    commercialValidation?.semrush_snapshot?.database ||
      row.semrush_database ||
      anchorEvidence.bestDb ||
      ""
  );
  const existingScopeClass = normalizeScopeClass(
    commercialValidation?.market_evidence_scope_class
  );
  const evidenceScopeClass =
    (existingScopeClass && existingScopeClass !== "missing" ? existingScopeClass : null) ||
    anchorEvidence.evidenceScopeClass ||
    deriveEvidenceScopeClass(productMapping.market_track, evidenceDb);
  const scopeFit = computeScopeFit(productMapping.market_track, evidenceScopeClass, evidenceDb);
  const laneSignals = collectLaneSignals(productMapping.lane_keys || [], localShortlist, localOpportunities);

  const velocity = numeric(
    commercialValidation?.collapsed_scores?.validation_velocity_composite ||
      deriveVelocityFromOverview(row)
  );
  const pull = numeric(
    commercialValidation?.collapsed_scores?.demand_pull_composite ||
      row.demand_pull_composite ||
      derivePullFromAnchorEvidence(anchorEvidence)
  );
  const operatorSegmentScore = deriveOperatorSegmentScore(
    commercialValidation?.market_evidence?.independent_operator_summary,
    row.quadrant_segment
  );
  const operatorScoreAdjustment = operatorSegmentScore == null ? 0 : round2((operatorSegmentScore - 3) * 0.18);
  const adjustedPull =
    pull == null ? null : round2(clamp(1, pull + operatorScoreAdjustment, 5));
  const confidenceBand =
    commercialValidation?.collapsed_scores?.overall_confidence_band ||
    commercialValidation?.demand_pull?.confidence_band ||
    deriveConfidenceBand(anchorEvidence) ||
    row.demand_confidence_band ||
    "low";
  const releaseStatus = row.dashboard_release_status || "review";

  const evidenceMultiplier = evidenceMultiplierFor(scopeFit, confidenceBand, releaseStatus);
  const provisionalScore =
    velocity == null || adjustedPull == null
      ? null
      : round2((velocity * 0.45 + adjustedPull * 0.55) * evidenceMultiplier);

  const record = {
    product_code: row.product_code,
    product_title: row.product_title,
    quadrant_segment: row.quadrant_segment,
    release_status: releaseStatus,
    market_track: productMapping.market_track,
    evidence_database: evidenceDb || null,
    evidence_scope_class: evidenceScopeClass,
    scope_fit: scopeFit,
    lane_group: productMapping.lane_group,
    semrush_priority: productMapping.semrush_priority,
    validation_velocity_composite: velocity,
    demand_pull_composite: pull,
    demand_pull_composite_adjusted: adjustedPull,
    confidence_band: confidenceBand,
    evidence_multiplier: evidenceMultiplier,
    provisional_market_score_v1: provisionalScore,
    operator_segment_weighted_score_1_5: operatorSegmentScore,
    operator_segment_score_adjustment: operatorScoreAdjustment,
    anchor_focus_count: productMapping.anchor_focus?.length || 0,
    anchor_capture_count: anchorEvidence.capturedCount,
    anchor_capture_coverage: anchorEvidence.coverage,
    anchor_query_volume_sum: anchorEvidence.queryVolumeSum,
    anchor_max_volume: anchorEvidence.maxVolume,
    anchor_global_volume_sum: anchorEvidence.globalVolumeSum,
    local_lane_keyword_count: laneSignals.keywordCount || anchorEvidence.followUpKeywordCount || 0,
    local_lane_p1_count: laneSignals.p1Count || anchorEvidence.p1KeywordCount || 0,
    local_lane_watch_domains:
      laneSignals.topDomains.length > 0 ? laneSignals.topDomains : anchorEvidence.topDomains,
    anchor_focus: productMapping.anchor_focus,
    demand_evidence_score_1_5: numeric(
      commercialValidation?.demand_pull?.demand_evidence_score_1_5 || row.demand_evidence_score_1_5
    ),
    cac_reality_score_1_5: numeric(
      commercialValidation?.demand_pull?.cac_reality_score_1_5 || row.cac_reality_score_1_5
    ),
    channel_fit_score_1_5: numeric(
      commercialValidation?.demand_pull?.channel_fit_score_1_5 || row.channel_fit_score_1_5
    ),
    testability_score_1_5: numeric(row.testability_score_1_5),
    time_to_first_euro_score_1_5: numeric(row.time_to_first_euro_score_1_5),
    safe_field_count: numeric(row.safe_field_count),
    next_research_step: deriveNextStep(productMapping, scopeFit, laneSignals, evidenceDb),
    artifact_path: row.artifact_path,
  };

  byProductCode.set(record.product_code, record);
}

const records = Array.from(byProductCode.values()).sort(compareRecords);

await fs.mkdir(OUTPUT_DIR, { recursive: true });

const jsonPath = path.join(OUTPUT_DIR, "product-market-scorecard.v1.json");
const csvPath = path.join(OUTPUT_DIR, "product-market-scorecard.v1.csv");
const mdPath = path.join(OUTPUT_DIR, "product-market-scorecard.v1.md");

await fs.writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2));
await fs.writeFile(csvPath, buildCsv(records));
await fs.writeFile(mdPath, buildMemo(records));

console.log(`Products scored: ${records.length}`);
console.log(`JSON: ${jsonPath}`);
console.log(`CSV: ${csvPath}`);
console.log(`Memo: ${mdPath}`);

async function findProductDir(productCode) {
  const entries = await fs.readdir(RUN_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(`${productCode}_`)) {
      return path.join(RUN_ROOT, entry.name);
    }
  }
  throw new Error(`Product dir not found for ${productCode}`);
}

async function readCsv(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  const lines = text.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function collectLaneSignals(laneKeys, shortlist, opportunities) {
  if (!Array.isArray(laneKeys) || laneKeys.length === 0) {
    return { keywordCount: 0, p1Count: 0, topDomains: [] };
  }

  const shortlistRows = shortlist.filter((row) => laneKeys.includes(row.lane));
  const keywordCount = shortlistRows.length;
  const p1Count = shortlistRows.filter((row) => row.priority === "P1").length;
  const domains = opportunities.serpDomainWatchlist
    .filter((row) => row.lanes.some((lane) => laneKeys.includes(lane)))
    .slice(0, 5)
    .map((row) => row.domain);

  return { keywordCount, p1Count, topDomains: domains };
}

async function loadKeywordReportIndex(rootDir) {
  const index = new Map();
  let dbEntries = [];
  try {
    dbEntries = await fs.readdir(rootDir, { withFileTypes: true });
  } catch {
    return index;
  }

  for (const dbEntry of dbEntries) {
    if (!dbEntry.isDirectory()) continue;
    const db = dbEntry.name.toUpperCase();
    const dbDir = path.join(rootDir, dbEntry.name);
    const keywordEntries = await fs.readdir(dbDir, { withFileTypes: true });
    for (const keywordEntry of keywordEntries) {
      if (!keywordEntry.isDirectory()) continue;
      const reportsDir = path.join(dbDir, keywordEntry.name, "reports");
      let reportFiles = [];
      try {
        reportFiles = (await fs.readdir(reportsDir))
          .filter((file) => file.startsWith("keyword-overview__") && file.endsWith(".json"))
          .sort();
      } catch {
        continue;
      }
      if (!reportFiles.length) continue;
      const latestPath = path.join(reportsDir, reportFiles[reportFiles.length - 1]);
      const report = JSON.parse(await fs.readFile(latestPath, "utf8"));
      const query = String(report.meta?.query || "").trim().toLowerCase();
      if (!query) continue;
      index.set(`${db}::${query}`, report);
    }
  }

  return index;
}

function expectedDbsForTrack(track) {
  if (track === "local") return ["LU", "DE", "FR"];
  if (track === "germany_local") return ["DE"];
  if (track === "adjacent") return ["DE", "FR"];
  if (track === "reference") return ["US", "UK"];
  return [];
}

function collectAnchorEvidence(anchorFocus, expectedDbs, marketTrack, keywordIndex) {
  const reports = [];

  for (const db of expectedDbs) {
    for (const keyword of anchorFocus) {
      const report = keywordIndex.get(`${db}::${String(keyword).trim().toLowerCase()}`);
      if (report) {
        reports.push({ db, keyword, report });
      }
    }
  }

  const summaryRows = reports.map(({ db, keyword, report }) => {
    const ks = report.structured?.keywordSummary || {};
    return {
      db,
      keyword,
      queryVolume: parseMetricNumber(ks.volume),
      globalVolume: parseMetricNumber(ks.globalVolume),
      cpc: parseMetricNumber(ks.cpc),
      competitiveDensity: parseMetricNumber(ks.competitiveDensity),
      serpLeaderCount: Array.isArray(report.structured?.serpLeaders)
        ? report.structured.serpLeaders.length
        : 0,
      variationCount: Array.isArray(report.structured?.keywordVariations)
        ? report.structured.keywordVariations.length
        : 0,
      questionCount: Array.isArray(report.structured?.questions)
        ? report.structured.questions.length
        : 0,
      topSerpDomains: Array.isArray(report.structured?.serpLeaders)
        ? report.structured.serpLeaders
            .map((row) => String(row.domain || "").trim().toLowerCase())
            .filter(Boolean)
        : [],
      p1FollowUpCount:
        (Array.isArray(report.structured?.keywordVariations)
          ? report.structured.keywordVariations.filter(
              (row) => parseMetricNumber(row.volume) >= 100
            ).length
          : 0) +
        (Array.isArray(report.structured?.questions)
          ? report.structured.questions.filter((row) => parseMetricNumber(row.volume) >= 100).length
          : 0),
      evidenceScopeClass: classifyEvidenceScopeForKeyword(marketTrack, db, keyword),
    };
  });

  const bestDb =
    reports.reduce(
      (best, item) => {
        if (!best || (best.count ?? 0) < item.report?.structured?.serpLeaders?.length) {
          return { db: item.db, count: item.report?.structured?.serpLeaders?.length || 0 };
        }
        return best;
      },
      null
    )?.db || null;

  const scopeOrder = ["local", "cross_border_luxembourg_intent", "adjacent_generic", "reference"];
  const bestScopeClass =
    summaryRows
      .slice()
      .sort(
        (left, right) =>
          scopeOrder.indexOf(left.evidenceScopeClass) - scopeOrder.indexOf(right.evidenceScopeClass)
      )[0]?.evidenceScopeClass || deriveEvidenceScopeClass(marketTrack, bestDb);

  const topDomains = Array.from(
    summaryRows
      .flatMap((row) => row.topSerpDomains)
      .reduce((map, domain) => {
        map.set(domain, (map.get(domain) || 0) + 1);
        return map;
      }, new Map())
      .entries()
  )
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([domain]) => domain);

  const followUpKeywordCount = summaryRows.reduce(
    (sum, row) => sum + (row.variationCount || 0) + (row.questionCount || 0),
    0
  );
  const p1KeywordCount = summaryRows.reduce((sum, row) => sum + (row.p1FollowUpCount || 0), 0);

  return {
    bestDb,
    evidenceScopeClass: bestScopeClass,
    reports: summaryRows,
    capturedCount: summaryRows.length,
    coverage:
      anchorFocus.length > 0 ? round2(summaryRows.length / anchorFocus.length) : 0,
    queryVolumeSum: summaryRows.reduce((sum, row) => sum + (row.queryVolume || 0), 0),
    globalVolumeSum: summaryRows.reduce((sum, row) => sum + (row.globalVolume || 0), 0),
    maxVolume: summaryRows.reduce((max, row) => Math.max(max, row.queryVolume || 0), 0),
    topDomains,
    followUpKeywordCount,
    p1KeywordCount,
    avgSerpLeaders:
      summaryRows.length > 0
        ? round2(
            summaryRows.reduce((sum, row) => sum + (row.serpLeaderCount || 0), 0) /
              summaryRows.length
          )
        : 0,
  };
}

function normalizeDb(value) {
  const text = String(value || "").trim().toUpperCase();
  if (!text) return "";
  if (text.includes("LU")) return "LU";
  if (text.includes("DE")) return "DE";
  if (text.includes("FR")) return "FR";
  if (text.includes("US")) return "US";
  return text;
}

function normalizeScopeClass(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  return text;
}

function computeScopeFit(track, evidenceScopeClass, db) {
  if (track === "none") return "not_required";
  if (!db && evidenceScopeClass === "missing") return "missing";
  if (track === "local") {
    return ["local", "cross_border_luxembourg_intent"].includes(evidenceScopeClass)
      ? "fit"
      : evidenceScopeClass === "missing"
        ? "missing"
        : "mismatch";
  }
  if (track === "germany_local") {
    return evidenceScopeClass === "local"
      ? "fit"
      : evidenceScopeClass === "missing"
        ? "missing"
        : "mismatch";
  }
  if (track === "adjacent") {
    return evidenceScopeClass === "adjacent_generic"
      ? "fit"
      : evidenceScopeClass === "missing"
        ? "missing"
        : "mismatch";
  }
  if (track === "reference") {
    return evidenceScopeClass === "reference"
      ? "fit"
      : evidenceScopeClass === "missing"
        ? "missing"
        : "mismatch";
  }
  return "missing";
}

function evidenceMultiplierFor(scopeFit, confidenceBand, releaseStatus) {
  const scopeMap = {
    fit: 1,
    missing: 0.65,
    mismatch: 0.45,
    not_required: 0.55,
  };
  const confidenceMap = {
    high: 1,
    medium: 0.9,
    low: 0.78,
  };
  const releaseMap = {
    review: 1,
    blocked: 0.82,
  };
  return round2(
    (scopeMap[scopeFit] ?? 0.6) *
      (confidenceMap[confidenceBand] ?? 0.78) *
      (releaseMap[releaseStatus] ?? 1)
  );
}

function deriveOperatorSegmentScore(summary, quadrantSegment) {
  const normalizedSegment =
    quadrantSegment === "B2B" ||
    quadrantSegment === "B2C" ||
    quadrantSegment === "B2B2C" ||
    quadrantSegment === "mixed"
      ? quadrantSegment
      : "unknown";

  if (
    summary?.segment_weighting &&
    typeof summary.segment_weighting.weighted_score_1_5 === "number"
  ) {
    return round2(summary.segment_weighting.weighted_score_1_5);
  }

  const signal =
    summary?.signal === "none" ||
    summary?.signal === "weak" ||
    summary?.signal === "medium" ||
    summary?.signal === "strong"
      ? summary.signal
      : null;

  if (!signal) return null;

  const examples = Array.isArray(summary?.independent_operator_examples)
    ? summary.independent_operator_examples
    : [];
  const operatorTypesSeen = Array.isArray(summary?.operator_types_seen)
    ? summary.operator_types_seen
    : [];
  const socialFunnelSignal = String(summary?.social_funnel_signal || "").trim();

  const hasIndependent = examples.some((item) => item?.classification === "independent_operator");
  const hasPrivateSchool = examples.some(
    (item) => item?.classification === "private_school_or_academy"
  );
  const hasOnlyInstitutional =
    examples.length > 0 &&
    examples.every((item) =>
      ["official_or_institutional", "content_only", "unknown"].includes(
        item?.classification || "unknown"
      )
    );
  const hasSocialCommunity = operatorTypesSeen.includes("social_community_only");
  const socialPresent =
    socialFunnelSignal.length > 0 &&
    !/^No Facebook-group-led funnel signal/i.test(socialFunnelSignal) &&
    !/^No useful Facebook funnel signal/i.test(socialFunnelSignal);

  let score = signal === "strong" ? 4.5 : signal === "medium" ? 3.5 : signal === "weak" ? 2 : 1;

  if (normalizedSegment === "B2C") {
    if (hasIndependent) score += 0.4;
    else if (hasPrivateSchool) score += 0.2;
    if (hasSocialCommunity) score += 0.2;
    if (socialPresent) score += 0.5;
    if (hasOnlyInstitutional) score -= 0.4;
  } else if (normalizedSegment === "B2B2C" || normalizedSegment === "mixed") {
    if (hasIndependent) score += 0.35;
    else if (hasPrivateSchool) score += 0.2;
    if (hasSocialCommunity) score += 0.15;
    if (socialPresent) score += 0.25;
    if (hasOnlyInstitutional) score -= 0.3;
  } else {
    if (hasIndependent) score += 0.45;
    else if (hasPrivateSchool) score += 0.25;
    if (socialPresent) score += 0.1;
    if (hasSocialCommunity && !hasIndependent && !hasPrivateSchool) score -= 0.4;
    if (hasOnlyInstitutional) score -= 0.3;
  }

  return round2(clamp(1, score, 5));
}

function derivePullFromAnchorEvidence(anchorEvidence) {
  if (!anchorEvidence || anchorEvidence.capturedCount === 0) {
    return null;
  }

  let score = 1;

  if (anchorEvidence.maxVolume >= 300) score += 0.8;
  else if (anchorEvidence.maxVolume >= 100) score += 0.5;
  else if (anchorEvidence.maxVolume >= 30) score += 0.25;

  if (anchorEvidence.queryVolumeSum >= 500) score += 0.7;
  else if (anchorEvidence.queryVolumeSum >= 200) score += 0.45;
  else if (anchorEvidence.queryVolumeSum >= 80) score += 0.2;

  if (anchorEvidence.coverage >= 0.66) score += 0.6;
  else if (anchorEvidence.coverage >= 0.33) score += 0.35;
  else score += 0.1;

  if (anchorEvidence.avgSerpLeaders >= 5) score += 0.4;
  else if (anchorEvidence.avgSerpLeaders >= 1) score += 0.2;

  return Math.min(4.5, round2(score));
}

function deriveConfidenceBand(anchorEvidence) {
  if (!anchorEvidence || anchorEvidence.capturedCount === 0) return null;
  if (anchorEvidence.coverage >= 0.66) return "medium";
  return "low";
}

function deriveVelocityFromOverview(row) {
  const values = [
    numeric(row.testability_score_1_5),
    numeric(row.time_to_first_euro_score_1_5),
  ].filter((value) => value != null);
  if (!values.length) return null;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function deriveNextStep(mappingRow, scopeFit, laneSignals, db) {
  if (mappingRow.market_track === "local" && scopeFit !== "fit") {
    return "collect LU or FR/DE Luxembourg-intent keyword-overview for local anchors";
  }
  if (mappingRow.market_track === "germany_local" && scopeFit !== "fit") {
    return "collect DE keyword-overview for Germany-local anchors";
  }
  if (mappingRow.market_track === "adjacent" && scopeFit !== "fit") {
    return "collect DE/FR keyword-overview for adjacent anchors";
  }
  if (mappingRow.market_track === "reference" && scopeFit !== "fit") {
    return "collect US keyword-overview for reference anchors";
  }
  if (laneSignals.keywordCount > 0) {
    return "map lane keywords into product-level commercial notes";
  }
  if (!db) {
    return "no market evidence yet; start from anchor keywords";
  }
  return "refine WTP/CAC with keyword overview and price checks";
}

function compareRecords(left, right) {
  const leftScore = left.provisional_market_score_v1 ?? -1;
  const rightScore = right.provisional_market_score_v1 ?? -1;
  if (rightScore !== leftScore) return rightScore - leftScore;
  return left.product_code.localeCompare(right.product_code);
}

function buildCsv(records) {
  const headers = [
    "product_code",
    "product_title",
    "quadrant_segment",
    "release_status",
    "market_track",
    "evidence_database",
    "evidence_scope_class",
    "scope_fit",
    "lane_group",
    "semrush_priority",
    "validation_velocity_composite",
    "demand_pull_composite",
    "demand_pull_composite_adjusted",
    "confidence_band",
    "evidence_multiplier",
    "provisional_market_score_v1",
    "operator_segment_weighted_score_1_5",
    "operator_segment_score_adjustment",
    "anchor_focus_count",
    "anchor_capture_count",
    "anchor_capture_coverage",
    "anchor_query_volume_sum",
    "anchor_max_volume",
    "anchor_global_volume_sum",
    "local_lane_keyword_count",
    "local_lane_p1_count",
    "local_lane_watch_domains",
    "anchor_focus",
    "next_research_step"
  ];
  const lines = [headers.join(",")];
  for (const row of records) {
    lines.push(
      headers
        .map((header) => {
          const value = row[header];
          const text = Array.isArray(value) ? value.join(" | ") : value ?? "";
          return `"${String(text).replaceAll('"', '""')}"`;
        })
        .join(",")
    );
  }
  return `${lines.join("\n")}\n`;
}

function buildMemo(records) {
  const top = records.slice(0, 12);
  const missing = records.filter(
    (row) =>
      row.market_track !== "none" && (row.scope_fit === "missing" || row.scope_fit === "mismatch")
  );
  return [
    "# Product Market Scorecard v1",
    "",
    "This scorecard is a market-evidence layer, not a final launch ranking.",
    "Rule: `db=LU` counts only for Luxembourg cards. `DE/FR` count only for adjacent-market cards. `US/UK` count only for reference-market cards.",
    "Operator evidence is segment-aware: B2C gives more weight to community and fragmented small-provider signals, while B2B discounts social-only residue and favors direct operator/training offers.",
    "",
    "## Top Current Cards",
    "",
    ...top.map(
      (row) =>
        `- ${row.product_code} ${row.product_title} — score ${row.provisional_market_score_v1 ?? "n/a"} | ${row.market_track} | scope ${row.scope_fit} | db ${row.evidence_database || "none"} | operator ${row.operator_segment_weighted_score_1_5 ?? "n/a"}`
    ),
    "",
    "## Cards Missing Proper Scope Evidence",
    "",
    ...missing.map(
      (row) =>
        `- ${row.product_code} ${row.product_title} — expected ${row.market_track}, current db ${row.evidence_database || "none"}, next: ${row.next_research_step}`
    ),
    "",
  ].join("\n");
}

function numeric(value) {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function clamp(min, value, max) {
  return Math.max(min, Math.min(max, value));
}

function parseMetricNumber(value) {
  if (value == null || value === "") return null;
  const text = String(value).trim().toLowerCase();
  if (!text || text === "n/a") return null;
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

function classifyEvidenceScopeForKeyword(track, db, keyword) {
  const normalizedDb = normalizeDb(db);
  if (!normalizedDb) return "missing";
  if (normalizedDb === "LU") return "local";
  if (track === "germany_local" && normalizedDb === "DE") return "local";
  if (track === "local" && ["DE", "FR"].includes(normalizedDb) && isLuxembourgIntent(keyword)) {
    return "cross_border_luxembourg_intent";
  }
  if (["DE", "FR"].includes(normalizedDb)) return "adjacent_generic";
  if (["US", "UK"].includes(normalizedDb)) return "reference";
  return "missing";
}

function deriveEvidenceScopeClass(track, db) {
  const normalizedDb = normalizeDb(db);
  if (!normalizedDb) return "missing";
  if (normalizedDb === "LU") return "local";
  if (track === "germany_local" && normalizedDb === "DE") return "local";
  if (track === "adjacent" && ["DE", "FR"].includes(normalizedDb)) return "adjacent_generic";
  if (track === "reference" && ["US", "UK"].includes(normalizedDb)) return "reference";
  if (track === "local" && ["DE", "FR"].includes(normalizedDb)) return "cross_border_luxembourg_intent";
  return "missing";
}

function isLuxembourgIntent(keyword) {
  const text = String(keyword || "").toLowerCase();
  return /(luxembourg|luxembourgeois|luxembourgish|letzebuergesch|lëtzebuergesch|sproochentest)/i.test(
    text
  );
}
