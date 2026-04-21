#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);
const CONFIG_PATH = path.join(
  RUN_DIR,
  "semrush-corpus/config/independent-operator-summaries.json"
);
const ANALYST_ONLY_REASON =
  "Derived independent-operator signal for prioritization and further market research. Keep it out of customer-facing copy until translated into product-safe language.";

async function main() {
  const summaries = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
  const productDirs = await loadProductDirs(RUN_DIR);
  const syncedAt = new Date().toISOString();
  let updated = 0;

  for (const summary of summaries) {
    const productCode = String(summary.product_code || "").trim();
    const productDir = productDirs.get(productCode);
    if (!productCode || !productDir) continue;

    const commercialPath = path.join(productDir, "commercial-validation.json");
    const dashboardPath = path.join(productDir, "dashboard-ingestion.json");

    const commercial = JSON.parse(await fs.readFile(commercialPath, "utf8"));
    const dashboard = JSON.parse(await fs.readFile(dashboardPath, "utf8"));

    const normalized = normalizeSummary(
      {
        ...summary,
        quadrant_segment: commercial.quadrant_segment || summary.quadrant_segment || "unknown",
      },
      syncedAt
    );
    syncCommercialValidation(commercial, normalized);
    syncDashboardIngestion(dashboard, normalized);

    await fs.writeFile(commercialPath, `${JSON.stringify(commercial, null, 2)}\n`);
    await fs.writeFile(dashboardPath, `${JSON.stringify(dashboard, null, 2)}\n`);
    updated += 1;
  }

  console.log(`Updated independent-operator summaries for ${updated} products.`);
  console.log(`Config: ${CONFIG_PATH}`);
}

async function loadProductDirs(runDir) {
  const entries = await fs.readdir(runDir, { withFileTypes: true });
  const map = new Map();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(/^([A-Z]\d+)_/);
    if (!match) continue;
    map.set(match[1], path.join(runDir, entry.name));
  }
  return map;
}

function normalizeSummary(summary, syncedAt) {
  const quadrantSegment = normalizeSegment(summary.quadrant_segment);
  const normalizedSignal = normalizeSignal(summary.signal);
  const examples = Array.isArray(summary.independent_operator_examples)
    ? summary.independent_operator_examples.map((item) => ({
        name: String(item.name || "").trim(),
        classification: normalizeClassification(item.classification),
        evidence: String(item.evidence || "").trim(),
      }))
    : [];
  const operatorTypesSeen = asArray(summary.operator_types_seen).map(String);
  const socialFunnelSignal = String(summary.social_funnel_signal || "").trim();
  const segmentWeighting = buildSegmentWeighting({
    quadrantSegment,
    signal: normalizedSignal,
    examples,
    operatorTypesSeen,
    socialFunnelSignal,
  });

  return {
    signal: normalizedSignal,
    independent_operator_examples: examples,
    operator_types_seen: operatorTypesSeen,
    supporting_queries: asArray(summary.supporting_queries).map(String),
    pricing_or_offer_proof: asArray(summary.pricing_or_offer_proof).map(String),
    social_funnel_signal: socialFunnelSignal,
    segment_weighting: segmentWeighting,
    takeaway: String(summary.takeaway || "").trim(),
    why_not_stronger: String(summary.why_not_stronger || "").trim(),
    synced_at: syncedAt,
  };
}

function syncCommercialValidation(commercial, summary) {
  commercial.market_evidence = commercial.market_evidence || {};
  commercial.market_evidence.independent_operator_summary = summary;

  if (typeof commercial.market_evidence.notes === "string") {
    commercial.market_evidence.notes = mergeNotes(
      commercial.market_evidence.notes,
      buildOperatorNotes(summary)
    );
  }
}

function syncDashboardIngestion(dashboard, summary) {
  dashboard.analyst_only_fields = dashboard.analyst_only_fields || {};
  dashboard.analyst_only_fields.independent_operator_summary = {
    value: summary,
    confidence_band: operatorSignalToSuppressedConfidence(summary.signal),
    omission_reason: ANALYST_ONLY_REASON,
  };
}

function buildOperatorNotes(summary) {
  const parts = [
    `Independent-operator signal: ${summary.signal}.`,
    summary.independent_operator_examples.length
      ? `Examples: ${summary.independent_operator_examples
          .slice(0, 3)
          .map((item) => `${item.name} (${item.classification})`)
          .join(", ")}.`
      : null,
    summary.takeaway || null,
    summary.why_not_stronger ? `Why not stronger: ${summary.why_not_stronger}` : null,
  ];

  return parts.filter(Boolean).join(" ");
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

function normalizeSignal(value) {
  return value === "none" || value === "weak" || value === "medium" || value === "strong"
    ? value
    : "weak";
}

function normalizeClassification(value) {
  const allowed = new Set([
    "independent_operator",
    "private_school_or_academy",
    "official_or_institutional",
    "marketplace_or_directory",
    "social_community_only",
    "content_only",
    "unknown",
  ]);
  return allowed.has(value) ? value : "unknown";
}

function operatorSignalToSuppressedConfidence(signal) {
  if (signal === "strong" || signal === "medium") return "medium";
  if (signal === "none") return "low";
  return "low";
}

function normalizeSegment(value) {
  return value === "B2B" || value === "B2C" || value === "B2B2C" || value === "mixed"
    ? value
    : "unknown";
}

function buildSegmentWeighting({
  quadrantSegment,
  signal,
  examples,
  operatorTypesSeen,
  socialFunnelSignal,
}) {
  const hasIndependent = examples.some((item) => item.classification === "independent_operator");
  const hasPrivateSchool = examples.some(
    (item) => item.classification === "private_school_or_academy"
  );
  const hasOnlyInstitutional =
    examples.length > 0 &&
    examples.every(
      (item) =>
        item.classification === "official_or_institutional" ||
        item.classification === "content_only" ||
        item.classification === "unknown"
    );
  const hasSocialCommunity = operatorTypesSeen.includes("social_community_only");
  const socialPresent =
    socialFunnelSignal.length > 0 &&
    !/^No Facebook-group-led funnel signal/i.test(socialFunnelSignal) &&
    !/^No useful Facebook funnel signal/i.test(socialFunnelSignal);

  const baseScore =
    signal === "strong" ? 4.5 : signal === "medium" ? 3.5 : signal === "weak" ? 2 : 1;

  let score = baseScore;
  let operatorSignalRelevance = "medium";
  let socialFunnelRelevance = "low";

  if (quadrantSegment === "B2C") {
    operatorSignalRelevance = "high";
    socialFunnelRelevance = "high";
    if (hasIndependent) score += 0.4;
    else if (hasPrivateSchool) score += 0.2;
    if (hasSocialCommunity) score += 0.2;
    if (socialPresent) score += 0.5;
    if (hasOnlyInstitutional) score -= 0.4;
  } else if (quadrantSegment === "B2B2C" || quadrantSegment === "mixed") {
    operatorSignalRelevance = quadrantSegment === "B2B2C" ? "high" : "medium";
    socialFunnelRelevance = "medium";
    if (hasIndependent) score += 0.35;
    else if (hasPrivateSchool) score += 0.2;
    if (hasSocialCommunity) score += 0.15;
    if (socialPresent) score += 0.25;
    if (hasOnlyInstitutional) score -= 0.3;
  } else {
    operatorSignalRelevance = "medium";
    socialFunnelRelevance = "low";
    if (hasIndependent) score += 0.45;
    else if (hasPrivateSchool) score += 0.25;
    if (socialPresent) score += 0.1;
    if (hasSocialCommunity && !hasIndependent && !hasPrivateSchool) score -= 0.4;
    if (hasOnlyInstitutional) score -= 0.3;
  }

  const weightedScore = round1(clamp(1, score, 5));
  const scoreAdjustment = round2((weightedScore - 3) * 0.18);

  return {
    quadrant_segment: quadrantSegment,
    operator_signal_relevance: operatorSignalRelevance,
    social_funnel_relevance: socialFunnelRelevance,
    weighted_score_1_5: weightedScore,
    score_adjustment: scoreAdjustment,
    rationale: buildSegmentWeightingRationale({
      quadrantSegment,
      operatorSignalRelevance,
      socialFunnelRelevance,
      hasIndependent,
      hasPrivateSchool,
      socialPresent,
      hasSocialCommunity,
      hasOnlyInstitutional,
    }),
  };
}

function buildSegmentWeightingRationale({
  quadrantSegment,
  operatorSignalRelevance,
  socialFunnelRelevance,
  hasIndependent,
  hasPrivateSchool,
  socialPresent,
  hasSocialCommunity,
  hasOnlyInstitutional,
}) {
  const parts = [
    `${quadrantSegment} product.`,
    `Operator proof relevance: ${operatorSignalRelevance}.`,
    `Social funnel relevance: ${socialFunnelRelevance}.`,
  ];

  if (hasIndependent) {
    parts.push("Confirmed independent operators increase the weight.");
  } else if (hasPrivateSchool) {
    parts.push("Broad private providers count, but weaker than niche independent operators.");
  }

  if (socialPresent) {
    parts.push(
      socialFunnelRelevance === "high"
        ? "Visible Facebook/community residue materially supports demand."
        : "Visible Facebook/community residue is treated as supporting but low-weight evidence."
    );
  } else if (hasSocialCommunity) {
    parts.push("Community-only residue exists, but without clear funnel proof.");
  }

  if (hasOnlyInstitutional) {
    parts.push("Institution-led supply caps the weight of operator evidence.");
  }

  return parts.join(" ");
}

function clamp(min, value, max) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

await main();
