#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);
const SCORECARD_PATH = path.join(
  RUN_DIR,
  "semrush-corpus/product-scorecard/product-market-scorecard.v1.json"
);
const PRODUCT_MAPPING_PATH = path.join(
  RUN_DIR,
  "semrush-corpus/config/product-market-mapping.json"
);
const REFERENCE_ANALOG_DOMAIN_MAP_PATH = path.join(
  RUN_DIR,
  "semrush-corpus/config/reference-analog-domain-map.json"
);
const LU_OPPORTUNITIES_PATH = path.join(
  RUN_DIR,
  "semrush-corpus/country-keywords/lu/keyword-opportunities.json"
);
const MULTIGEO_PACK_PATH = path.join(
  RUN_DIR,
  "semrush-corpus/config/multigeo-keyword-pack.json"
);
const KEYWORD_REPORT_ROOT = path.join(RUN_DIR, "semrush-corpus/by-keyword");
const DOMAIN_REPORT_ROOT = path.join(RUN_DIR, "semrush-corpus/by-domain");

const DERIVATION_BASIS =
  "Synced from the latest SEMrush-derived product market scorecard, which combines normalized keyword captures, product-market mapping, and scoped local/cross-border/reference evidence rules.";
const ANALYST_ONLY_REASON =
  "Derived SEMrush market-evidence layer for prioritization and further research. Keep it out of customer-facing copy until translated into route-safe product language.";

async function main() {
  const scorecard = JSON.parse(await fs.readFile(SCORECARD_PATH, "utf8"));
  const records = Array.isArray(scorecard.records) ? scorecard.records : [];
  const mapping = new Map(
    JSON.parse(await fs.readFile(PRODUCT_MAPPING_PATH, "utf8")).map((row) => [row.product_code, row])
  );
  const referenceAnalogDomainMap = new Map(
    JSON.parse(await fs.readFile(REFERENCE_ANALOG_DOMAIN_MAP_PATH, "utf8")).map((row) => [
      row.product_code,
      row.domains,
    ])
  );
  const luOpportunities = JSON.parse(await fs.readFile(LU_OPPORTUNITIES_PATH, "utf8"));
  const multigeoPack = JSON.parse(await fs.readFile(MULTIGEO_PACK_PATH, "utf8"));
  const keywordReportIndex = await loadKeywordReportIndex(KEYWORD_REPORT_ROOT);
  const domainReportIndex = await loadDomainReportIndex(DOMAIN_REPORT_ROOT);
  const syncedAt = new Date().toISOString();

  let updatedCommercial = 0;
  let updatedDashboard = 0;

  for (const record of records) {
    if (!record.artifact_path) continue;
    const productMapping = mapping.get(record.product_code) || null;
    const condensed = buildCondensedResearchSummary(
      record,
      productMapping,
      luOpportunities,
      multigeoPack,
      keywordReportIndex,
      referenceAnalogDomainMap,
      domainReportIndex
    );

    const commercialPath = path.resolve(record.artifact_path);
    const productDir = path.dirname(commercialPath);
    const dashboardPath = path.join(productDir, "dashboard-ingestion.json");

    const commercial = JSON.parse(await fs.readFile(commercialPath, "utf8"));
    const dashboard = JSON.parse(await fs.readFile(dashboardPath, "utf8"));

    syncCommercialValidation(commercial, record, condensed);
    syncDashboardIngestion(dashboard, record, condensed);

    await fs.writeFile(commercialPath, `${JSON.stringify(commercial, null, 2)}\n`);
    await fs.writeFile(dashboardPath, `${JSON.stringify(dashboard, null, 2)}\n`);

    updatedCommercial += 1;
    updatedDashboard += 1;
  }

  console.log(`Updated commercial-validation files: ${updatedCommercial}`);
  console.log(`Updated dashboard-ingestion files: ${updatedDashboard}`);
  console.log(`Synced from: ${SCORECARD_PATH}`);
  console.log(`Synced at: ${syncedAt}`);
}

function syncCommercialValidation(commercial, record, condensed) {
  commercial.market_evidence_scope_class = record.evidence_scope_class ?? "missing";
  commercial.market_evidence = {
    confidence_band: normalizeConfidence(record.confidence_band),
    derivation_basis: DERIVATION_BASIS,
    evidence_refs: {
      source_ids: [],
      claim_ids: [],
    },
    market_track: record.market_track ?? "none",
    scope_class: record.evidence_scope_class ?? "missing",
    scope_fit: record.scope_fit ?? "missing",
    evidence_database: record.evidence_database ?? null,
    lane_group: record.lane_group ?? null,
    semrush_priority: record.semrush_priority ?? null,
    provisional_market_score_v1: toNumber(record.provisional_market_score_v1),
    anchor_focus: asArray(record.anchor_focus),
    anchor_focus_count: toNumber(record.anchor_focus_count),
    anchor_capture_count: toNumber(record.anchor_capture_count),
    anchor_capture_coverage: toNumber(record.anchor_capture_coverage),
    anchor_query_volume_sum: toNumber(record.anchor_query_volume_sum),
    anchor_max_volume: toNumber(record.anchor_max_volume),
    anchor_global_volume_sum: toNumber(record.anchor_global_volume_sum),
    local_lane_keyword_count: toNumber(record.local_lane_keyword_count),
    local_lane_p1_count: toNumber(record.local_lane_p1_count),
    local_lane_watch_domains: asArray(record.local_lane_watch_domains),
    top_follow_up_keywords: condensed.topFollowUpKeywords,
    top_questions: condensed.topQuestions,
    cross_border_luxembourg_intent_keywords: condensed.crossBorderKeywords,
    reference_analog_domains: condensed.referenceAnalogDomains,
    next_research_step: record.next_research_step ?? "",
    synced_from_scorecard_at: new Date().toISOString(),
    notes: buildCommercialMarketEvidenceNotes(record, condensed),
  };

  commercial.collapsed_scores = commercial.collapsed_scores || {};
  commercial.collapsed_scores.validation_velocity_composite = toNullableNumber(
    record.validation_velocity_composite
  );
  commercial.collapsed_scores.demand_pull_composite = toNullableNumber(record.demand_pull_composite);
  commercial.collapsed_scores.overall_confidence_band = normalizeConfidence(record.confidence_band);
  commercial.collapsed_scores.confidence_reason = buildConfidenceReason(record);

  commercial.semrush_snapshot = commercial.semrush_snapshot || {
    market: "",
    database: "",
    language: "",
    keyword_buckets: {
      head_terms: [],
      commercial_modifiers: [],
      problem_intent: [],
      competitor_route: [],
    },
    metrics: {
      keyword_count_total: null,
      keyword_count_commercial: null,
      volume_sum: null,
      volume_sum_commercial: null,
      avg_cpc: null,
      max_cpc: null,
      avg_competitive_density: null,
      high_intent_keyword_count: null,
      paid_competitor_count: null,
    },
    top_paid_competitors: [],
    observed_price_points: [],
    serp_feature_notes: "",
    traffic_analytics_notes: "",
  };
  if (!commercial.semrush_snapshot.database && record.evidence_database) {
    commercial.semrush_snapshot.database = record.evidence_database;
  }
  commercial.semrush_snapshot.metrics = commercial.semrush_snapshot.metrics || {};
  commercial.semrush_snapshot.metrics.keyword_count_total = toNullableNumber(
    record.local_lane_keyword_count
  );
  commercial.semrush_snapshot.metrics.high_intent_keyword_count = toNullableNumber(
    record.local_lane_p1_count
  );
  commercial.semrush_snapshot.metrics.volume_sum = toNullableNumber(record.anchor_query_volume_sum);
  commercial.semrush_snapshot.metrics.max_cpc =
    commercial.semrush_snapshot.metrics.max_cpc ?? null;

  commercial.demand_pull = commercial.demand_pull || {
    demand_evidence_score_1_5: null,
    wtp_score_1_5: null,
    cac_reality_score_1_5: null,
    retention_structure_score_1_5: null,
    macro_trajectory_score_1_5: null,
    channel_fit_score_1_5: null,
    confidence_band: "unknown",
    derivation_basis: "",
    evidence_refs: { source_ids: [], claim_ids: [] },
    notes: "",
  };
  commercial.demand_pull.confidence_band = normalizeConfidence(record.confidence_band);
  commercial.demand_pull.derivation_basis = buildDemandDerivationBasis(commercial.demand_pull.derivation_basis);
  commercial.demand_pull.notes = mergeNotes(
    commercial.demand_pull.notes,
    buildDemandNotes(record, condensed)
  );
}

function syncDashboardIngestion(dashboard, record, condensed) {
  dashboard.analyst_only_fields = dashboard.analyst_only_fields || {};

  dashboard.analyst_only_fields.market_evidence_summary = {
    value: {
      scope_class: record.evidence_scope_class ?? "missing",
      scope_fit: record.scope_fit ?? "missing",
      evidence_database: record.evidence_database ?? null,
      lane_group: record.lane_group ?? null,
      market_track: record.market_track ?? null,
      semrush_priority: record.semrush_priority ?? null,
      provisional_market_score_v1: toNumber(record.provisional_market_score_v1),
      validation_velocity_composite: toNumber(record.validation_velocity_composite),
      demand_pull_composite: toNumber(record.demand_pull_composite),
      confidence_band: record.confidence_band ?? "low",
    },
    confidence_band: normalizeSuppressedConfidence(record.confidence_band),
    omission_reason: ANALYST_ONLY_REASON,
  };

  dashboard.analyst_only_fields.semrush_anchor_evidence = {
    value: {
      anchor_focus: asArray(record.anchor_focus),
      anchor_capture_count: toNumber(record.anchor_capture_count),
      anchor_capture_coverage: toNumber(record.anchor_capture_coverage),
      anchor_query_volume_sum: toNumber(record.anchor_query_volume_sum),
      anchor_max_volume: toNumber(record.anchor_max_volume),
      anchor_global_volume_sum: toNumber(record.anchor_global_volume_sum),
      local_lane_keyword_count: toNumber(record.local_lane_keyword_count),
      local_lane_p1_count: toNumber(record.local_lane_p1_count),
      watch_domains: asArray(record.local_lane_watch_domains),
    },
    confidence_band: normalizeSuppressedConfidence(record.confidence_band),
    omission_reason: ANALYST_ONLY_REASON,
  };

  dashboard.analyst_only_fields.market_research_next_step = {
    value: record.next_research_step ?? "",
    confidence_band: normalizeSuppressedConfidence(record.confidence_band),
    omission_reason: ANALYST_ONLY_REASON,
  };

  dashboard.analyst_only_fields.top_follow_up_keywords = {
    value: condensed.topFollowUpKeywords,
    confidence_band: normalizeSuppressedConfidence(record.confidence_band),
    omission_reason: ANALYST_ONLY_REASON,
  };

  dashboard.analyst_only_fields.top_market_questions = {
    value: condensed.topQuestions,
    confidence_band: normalizeSuppressedConfidence(record.confidence_band),
    omission_reason: ANALYST_ONLY_REASON,
  };

  dashboard.analyst_only_fields.cross_border_luxembourg_intent_summary = {
    value: condensed.crossBorderSummary,
    confidence_band: normalizeSuppressedConfidence(record.confidence_band),
    omission_reason: ANALYST_ONLY_REASON,
  };

  dashboard.analyst_only_fields.reference_analog_domains = {
    value: condensed.referenceAnalogDomains,
    confidence_band: normalizeSuppressedConfidence(record.confidence_band),
    omission_reason: ANALYST_ONLY_REASON,
  };
}

function buildCommercialMarketEvidenceNotes(record, condensed) {
  const parts = [
    record.scope_fit === "fit"
      ? `Current SEMrush evidence matches the expected scope for this product (${record.evidence_scope_class}).`
      : `Current SEMrush evidence does not fully match the expected scope for this product (${record.evidence_scope_class}).`,
    record.evidence_database ? `Evidence database: ${record.evidence_database}.` : null,
    toNumber(record.anchor_capture_count) > 0
      ? `Captured ${record.anchor_capture_count}/${record.anchor_focus_count} anchor families with total local query volume ${record.anchor_query_volume_sum} and max anchor volume ${record.anchor_max_volume}.`
      : "No anchor captures were available in the latest scorecard.",
    toNumber(record.local_lane_keyword_count) > 0
      ? `Lane rollup contains ${record.local_lane_keyword_count} deduplicated keywords, including ${record.local_lane_p1_count} P1 terms.`
      : null,
    asArray(record.local_lane_watch_domains).length > 0
      ? `Current watchlist domains: ${asArray(record.local_lane_watch_domains).join(", ")}.`
      : null,
    condensed.topFollowUpKeywords.length > 0
      ? `Top follow-up keywords: ${condensed.topFollowUpKeywords
          .map((item) => `${item.keyword} (${item.follow_up_tier}, vol ${item.max_volume_lu})`)
          .join(", ")}.`
      : null,
    condensed.crossBorderSummary.total_keywords > 0
      ? `Cross-border Luxembourg-intent layer: ${condensed.crossBorderSummary.total_keywords} relevant keywords; top terms ${condensed.crossBorderSummary.sample_keywords.join(", ")}.`
      : null,
    condensed.referenceAnalogDomains.length > 0
      ? `Reference analog domains: ${condensed.referenceAnalogDomains
          .map((item) => `${item.domain} (${item.db}${item.top_relevant_keywords.length ? `: ${item.top_relevant_keywords.map((row) => row.keyword).join(", ")}` : ""})`)
          .join("; ")}.`
      : null,
    record.next_research_step ? `Next step: ${record.next_research_step}.` : null,
  ];

  return parts.filter(Boolean).join(" ");
}

function buildConfidenceReason(record) {
  const parts = [
    `Market evidence scope is ${record.evidence_scope_class ?? "missing"} with scope fit ${record.scope_fit ?? "missing"}.`,
    toNumber(record.anchor_capture_count) > 0
      ? `${record.anchor_capture_count} anchor captures contribute to this scorecard sync.`
      : "No anchor captures contribute yet.",
    record.evidence_database ? `Primary evidence database: ${record.evidence_database}.` : null,
  ];
  return parts.filter(Boolean).join(" ");
}

function buildDemandDerivationBasis(existing) {
  if (existing && existing.includes("latest SEMrush scorecard sync")) {
    return existing;
  }
  if (!existing) {
    return "Updated from the latest SEMrush scorecard sync and prior product-level evidence review.";
  }
  return `${existing} Added latest SEMrush scorecard sync.`;
}

function buildDemandNotes(record, condensed) {
  const parts = [
    `Latest SEMrush scorecard sync: scope ${record.evidence_scope_class ?? "missing"} (${record.scope_fit ?? "missing"}).`,
    toNumber(record.anchor_query_volume_sum) > 0
      ? `Anchor query volume sum ${record.anchor_query_volume_sum}, max anchor volume ${record.anchor_max_volume}, capture count ${record.anchor_capture_count}.`
      : "No anchor query volume is captured yet.",
    toNumber(record.local_lane_keyword_count) > 0
      ? `Lane keyword count ${record.local_lane_keyword_count} with ${record.local_lane_p1_count} P1 terms.`
      : null,
    condensed.topFollowUpKeywords.length > 0
      ? `Top follow-up terms: ${condensed.topFollowUpKeywords.map((item) => item.keyword).join(", ")}.`
      : null,
    condensed.crossBorderSummary.total_keywords > 0
      ? `Cross-border Luxembourg-intent coverage: ${condensed.crossBorderSummary.total_keywords} matching terms in FR/DE seed pack.`
      : null,
    condensed.referenceAnalogDomains.length > 0
      ? `Reference analog domains reviewed: ${condensed.referenceAnalogDomains
          .map((item) => item.domain)
          .join(", ")}.`
      : null,
  ];
  return parts.filter(Boolean).join(" ");
}

function buildCondensedResearchSummary(
  record,
  productMapping,
  luOpportunities,
  multigeoPack,
  keywordReportIndex,
  referenceAnalogDomainMap,
  domainReportIndex
) {
  if (record.market_track === "germany_local") {
    return buildKeywordReportCondensedSummary(record, keywordReportIndex, ["DE"]);
  }

  if (record.market_track === "reference") {
    const summary = buildKeywordReportCondensedSummary(record, keywordReportIndex, ["US", "UK"]);
    return {
      ...summary,
      referenceAnalogDomains: buildReferenceAnalogDomains(
        record.product_code,
        asArray(record.anchor_focus),
        referenceAnalogDomainMap,
        domainReportIndex
      ),
    };
  }

  const laneKeys = asArray(productMapping?.lane_keys);
  const followUpRows = filterByLane(luOpportunities?.followUpKeywords, laneKeys)
    .filter((row) => row.followUpTier === "P1" || row.followUpTier === "P2")
    .sort(compareOpportunityRows)
    .slice(0, 5)
    .map(condenseOpportunityRow);

  const questionRows = filterByLane(luOpportunities?.questionCandidates, laneKeys)
    .filter((row) => (row.followUpTier === "P1" || row.followUpTier === "P2") && toNumber(row.maxVolume) > 0)
    .sort(compareOpportunityRows)
    .slice(0, 3)
    .map(condenseOpportunityRow);

  const crossBorderRows =
    (Array.isArray(multigeoPack?.crossBorderKeywords) ? multigeoPack.crossBorderKeywords : [])
      .filter((row) => intersects(asArray(row.lanes), laneKeys))
      .sort(compareOpportunityRows)
      .slice(0, 5)
      .map((row) => ({
        keyword: row.keyword,
        follow_up_tier: row.followUpTier ?? "WATCH",
        max_volume_lu: toNumber(row.maxVolumeLu),
        use_for: asArray(row.useFor),
      }));

  return {
    topFollowUpKeywords: followUpRows,
    topQuestions: questionRows,
    crossBorderKeywords: crossBorderRows,
    referenceAnalogDomains: [],
    crossBorderSummary: {
      total_keywords: crossBorderRows.length,
      sample_keywords: crossBorderRows.slice(0, 3).map((row) => row.keyword),
      top_volume_keyword: crossBorderRows[0]?.keyword ?? null,
    },
  };
}

function buildKeywordReportCondensedSummary(record, keywordReportIndex, dbs) {
  const anchors = asArray(record.anchor_focus);
  const relevanceTokens = buildRelevanceTokenSet(anchors);
  const reports = dbs
    .flatMap((db) =>
      anchors.map((keyword) => keywordReportIndex.get(`${db}::${String(keyword).trim().toLowerCase()}`))
    )
    .filter(Boolean);

  const variationRows = [];
  const questionRows = [];
  const anchorSet = new Set(anchors.map((item) => String(item).trim().toLowerCase()));

  for (const report of reports) {
    for (const row of asArray(report.structured?.keywordVariations)) {
      const keyword = String(row.keyword || "").trim();
      if (!keyword || anchorSet.has(keyword.toLowerCase())) continue;
      if (!isRelevantFollowUpKeyword(keyword, relevanceTokens)) continue;
      variationRows.push({
        keyword,
        follow_up_tier: parseMetricNumber(row.volume) >= 100 ? "P1" : "P2",
        category: "variation",
        max_volume_lu: parseMetricNumber(row.volume),
        source_count: 1,
      });
    }

    for (const row of asArray(report.structured?.questions)) {
      const keyword = String(row.keyword || "").trim();
      const volume = parseMetricNumber(row.volume);
      if (!keyword || volume <= 0) continue;
      if (!isRelevantFollowUpKeyword(keyword, relevanceTokens)) continue;
      questionRows.push({
        keyword,
        follow_up_tier: volume >= 100 ? "P1" : "P2",
        category: "question",
        max_volume_lu: volume,
        source_count: 1,
      });
    }
  }

  return {
    topFollowUpKeywords: dedupeCondensedRows(variationRows).slice(0, 5),
    topQuestions: dedupeCondensedRows(questionRows).slice(0, 3),
    crossBorderKeywords: [],
    referenceAnalogDomains: [],
    crossBorderSummary: {
      total_keywords: 0,
      sample_keywords: [],
      top_volume_keyword: null,
    },
  };
}

function buildReferenceAnalogDomains(productCode, anchors, referenceAnalogDomainMap, domainReportIndex) {
  const domains = asArray(referenceAnalogDomainMap.get(productCode));
  if (!domains.length) return [];

  const relevanceTokens = buildRelevanceTokenSet(anchors);

  return domains
    .map((item) => {
      const db = String(item.db || "").toUpperCase();
      const domain = String(item.domain || "").toLowerCase();
      const reports = domainReportIndex.get(`${db}::${domain}`);
      if (!reports) return null;

      const summary = reports.overview?.structured?.domainSummary || {};
      const topRelevantKeywords = asArray(reports.positions?.structured?.topRankingRows)
        .filter((row) => isRelevantFollowUpKeyword(row.keyword, relevanceTokens))
        .slice(0, 4)
        .map((row) => ({
          keyword: row.keyword,
          position: row.position,
          volume: row.volume,
          traffic: row.traffic,
          url: row.url,
        }));

      return {
        db,
        domain,
        authority_score: summary.authorityScore || null,
        organic_traffic: summary.organicTraffic || null,
        organic_keywords: summary.organicKeywords || null,
        referring_domains: summary.referringDomains || null,
        top_relevant_keywords: topRelevantKeywords,
      };
    })
    .filter(Boolean);
}

function buildRelevanceTokenSet(anchors) {
  const stopwords = new Set([
    "a",
    "an",
    "and",
    "for",
    "from",
    "in",
    "of",
    "on",
    "the",
    "to",
    "with",
    "course",
    "courses",
    "language",
    "languages",
    "license",
    "licenses",
    "licensing",
    "pre",
    "training",
    "content",
    "international",
    "agency",
    "agencies",
    "staff",
    "onboarding",
    "compliance",
    "recruitment",
    "recruit",
  ]);

  const tokens = new Set();
  for (const anchor of anchors) {
    for (const token of String(anchor)
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter(Boolean)) {
      if (token.length < 4 || stopwords.has(token)) continue;
      tokens.add(token);
    }
  }
  return tokens;
}

function isRelevantFollowUpKeyword(keyword, relevanceTokens) {
  if (!relevanceTokens.size) return true;
  const tokens = String(keyword)
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
  return tokens.some((token) => relevanceTokens.has(token));
}

function dedupeCondensedRows(rows) {
  const byKeyword = new Map();
  for (const row of rows) {
    const key = String(row.keyword || "").trim().toLowerCase();
    if (!key) continue;
    const existing = byKeyword.get(key);
    if (!existing) {
      byKeyword.set(key, { ...row });
      continue;
    }
    existing.max_volume_lu = Math.max(toNumber(existing.max_volume_lu), toNumber(row.max_volume_lu));
    existing.source_count = toNumber(existing.source_count) + 1;
    if (existing.follow_up_tier === "P2" && row.follow_up_tier === "P1") {
      existing.follow_up_tier = "P1";
    }
  }

  return Array.from(byKeyword.values()).sort(compareOpportunityRows);
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

async function loadDomainReportIndex(rootDir) {
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
    const domainEntries = await fs.readdir(dbDir, { withFileTypes: true });
    for (const domainEntry of domainEntries) {
      if (!domainEntry.isDirectory()) continue;
      const reportsDir = path.join(dbDir, domainEntry.name, "reports");
      let reportFiles = [];
      try {
        reportFiles = (await fs.readdir(reportsDir))
          .filter((file) => file.endsWith(".json"))
          .sort();
      } catch {
        continue;
      }
      if (!reportFiles.length) continue;

      const item = {};
      for (const file of reportFiles) {
        if (!file.startsWith("domain-overview__") && !file.startsWith("organic-positions__")) continue;
        const report = JSON.parse(await fs.readFile(path.join(reportsDir, file), "utf8"));
        const reportType = String(report.meta?.reportType || "");
        if (reportType === "domain-overview") item.overview = report;
        if (reportType === "organic-positions") item.positions = report;
      }

      if (item.overview || item.positions) {
        index.set(`${db}::${domainEntry.name.toLowerCase()}`, item);
      }
    }
  }

  return index;
}

function filterByLane(rows, laneKeys) {
  const list = Array.isArray(rows) ? rows : [];
  if (!laneKeys.length) return [];
  return list.filter((row) => intersects(asArray(row.lanes), laneKeys));
}

function intersects(left, right) {
  const rightSet = new Set(right);
  return left.some((item) => rightSet.has(item));
}

function compareOpportunityRows(left, right) {
  const tierOrder = { P1: 0, P2: 1, WATCH: 2, DROP: 3 };
  const leftTier = tierOrder[left.followUpTier] ?? 9;
  const rightTier = tierOrder[right.followUpTier] ?? 9;
  if (leftTier !== rightTier) return leftTier - rightTier;
  return toNumber(right.maxVolume ?? right.maxVolumeLu) - toNumber(left.maxVolume ?? left.maxVolumeLu);
}

function condenseOpportunityRow(row) {
  return {
    keyword: row.keyword,
    follow_up_tier: row.followUpTier ?? "WATCH",
    category: row.category ?? "variation",
    max_volume_lu: toNumber(row.maxVolume ?? row.maxVolumeLu),
    source_count: toNumber(row.sourceCount),
  };
}

function mergeNotes(existing, addition) {
  const trimmedExisting = String(existing || "").trim();
  const trimmedAddition = String(addition || "").trim();
  if (!trimmedExisting) return trimmedAddition;
  if (!trimmedAddition) return trimmedExisting;
  if (trimmedExisting.includes(trimmedAddition)) return trimmedExisting;
  return `${trimmedExisting} ${trimmedAddition}`;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNullableNumber(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMetricNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = String(value ?? "")
    .replace(/[,\s]/g, "")
    .trim();
  if (!text) return 0;
  const match = text.match(/^(-?\d+(?:\.\d+)?)([KMB])?$/i);
  if (!match) {
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const number = Number(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  const multipliers = { K: 1_000, M: 1_000_000, B: 1_000_000_000 };
  return number * (multipliers[suffix] || 1);
}

function normalizeConfidence(value) {
  return value === "high" || value === "medium" || value === "low" || value === "blocked"
    ? value
    : "low";
}

function normalizeSuppressedConfidence(value) {
  const normalized = normalizeConfidence(value);
  return normalized === "high" ? "medium" : normalized;
}

await main();
