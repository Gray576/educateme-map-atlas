#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const productsPath = path.join(ROOT, "src/data/products.ts");
const outputPath =
  process.argv[2] ||
  path.join(ROOT, "research-runs", "2026-04-18-all-24", "quadrant-scorecard.seed.csv");

function parseProductsTs(source) {
  const blocks = source.match(/\{\s*code:[\s\S]*?\n\s*\},/g) || [];

  return blocks
    .map((block) => {
      const code = block.match(/code:\s*"([^"]+)"/)?.[1] || "";
      const title = block.match(/title:\s*"([^"]+)"/)?.[1] || "";
      const market = block.match(/market:\s*"([^"]+)"/)?.[1] || "";
      const model = block.match(/model:\s*"([^"]+)"/)?.[1] || "";
      const price = block.match(/price:\s*"([^"]+)"/)?.[1] || "";
      const revenue = block.match(/revenue:\s*"([^"]+)"/)?.[1] || "";
      return { code, title, market, model, price, revenue };
    })
    .filter((item) => item.code && item.title);
}

function csvEscape(value) {
  const stringValue = value == null ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function quadrantSegment(model) {
  return model.includes("B2B") ? "B2B" : model.includes("B2C") ? "B2C" : "";
}

async function main() {
  const source = await readFile(productsPath, "utf8");
  const products = parseProductsTs(source);

  const headers = [
    "product_code",
    "title",
    "market",
    "model",
    "quadrant_segment",
    "seed_price",
    "seed_revenue",
    "validation_model",
    "binary_pass_signal",
    "binary_kill_signal",
    "estimated_cost_to_signal_eur",
    "estimated_days_to_signal",
    "estimated_days_to_first_euro",
    "founder_independence_score_1_5",
    "regulatory_friction_inverse_score_1_5",
    "retention_structure_score_1_5",
    "demand_evidence_score_1_5",
    "wtp_score_1_5",
    "cac_reality_score_1_5",
    "testability_score_1_5",
    "time_to_first_euro_score_1_5",
    "macro_trajectory_score_1_5",
    "channel_fit_score_1_5",
    "velocity_composite",
    "pull_composite",
    "score_confidence_band",
    "score_confidence_reason",
    "channel_primary",
    "channel_secondary",
    "portfolio_niche",
    "portfolio_persona",
    "portfolio_price_point",
    "portfolio_delivery_mode",
    "semrush_market",
    "semrush_database",
    "semrush_language",
    "semrush_keyword_bucket_a",
    "semrush_keyword_bucket_b",
    "semrush_keyword_bucket_c",
    "semrush_keyword_bucket_d",
    "semrush_keyword_count_total",
    "semrush_keyword_count_commercial",
    "semrush_volume_sum",
    "semrush_volume_sum_commercial",
    "semrush_avg_cpc",
    "semrush_max_cpc",
    "semrush_avg_competitive_density",
    "semrush_high_intent_keyword_count",
    "semrush_paid_competitor_count",
    "semrush_top_paid_competitors",
    "semrush_observed_price_points",
    "semrush_serp_feature_notes",
    "semrush_traffic_analytics_notes",
    "notes",
  ];

  const rows = [
    headers,
    ...products.map((product) => [
      product.code.split("·")[0].trim(),
      product.title,
      product.market,
      product.model,
      quadrantSegment(product.model),
      product.price,
      product.revenue,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      product.market,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]),
  ];

  const csv = `${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`;
  await writeFile(outputPath, csv);
  console.log(`Quadrant scorecard written to ${outputPath}`);
  console.log(`Products: ${products.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
