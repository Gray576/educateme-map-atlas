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

    const normalized = normalizeSummary(summary, syncedAt);
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
  return {
    signal: normalizeSignal(summary.signal),
    independent_operator_examples: Array.isArray(summary.independent_operator_examples)
      ? summary.independent_operator_examples.map((item) => ({
          name: String(item.name || "").trim(),
          classification: normalizeClassification(item.classification),
          evidence: String(item.evidence || "").trim(),
        }))
      : [],
    operator_types_seen: asArray(summary.operator_types_seen).map(String),
    supporting_queries: asArray(summary.supporting_queries).map(String),
    pricing_or_offer_proof: asArray(summary.pricing_or_offer_proof).map(String),
    social_funnel_signal: String(summary.social_funnel_signal || "").trim(),
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

await main();
