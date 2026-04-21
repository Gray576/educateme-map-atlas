#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const WORKSPACE_ROOT = "/Users/sergey/Desktop/educateme-map";
const DEFAULT_OPPORTUNITIES_PATH = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/country-keywords/lu/keyword-opportunities.json"
);
const DEFAULT_OUTPUT_DIR = path.join(
  WORKSPACE_ROOT,
  "research-runs/2026-04-18-all-24/semrush-corpus/config"
);

const options = parseArgs(process.argv.slice(2));
const opportunitiesPath = path.resolve(options.opportunities || DEFAULT_OPPORTUNITIES_PATH);
const outputDir = path.resolve(options.outputDir || DEFAULT_OUTPUT_DIR);

const payload = JSON.parse(await fs.readFile(opportunitiesPath, "utf8"));
const luxembourgIntentKeywords = payload.followUpKeywords
  .filter((item) => item.followUpTier === "P1" || item.followUpTier === "P2")
  .filter((item) => isLuxembourgIntent(item.keyword))
  .slice(0, 15);
const referenceKeywords = payload.followUpKeywords
  .filter((item) => item.followUpTier === "P1" || item.followUpTier === "P2")
  .slice(0, 15);

const pack = {
  meta: {
    generatedAt: new Date().toISOString(),
    source: opportunitiesPath,
    crossBorderDatabases: [
      {
        db: "fr",
        scope: "cross_border_luxembourg_intent",
        rationale: "FR searches that still clearly target Luxembourg routes, Luxembourgish, or Luxembourg-linked courses",
      },
      {
        db: "de",
        scope: "cross_border_luxembourg_intent",
        rationale: "DE searches that still clearly target Luxembourg routes, Luxembourgish, or Luxembourg-linked courses",
      },
    ],
    referenceDatabases: [
      {
        db: "us",
        scope: "reference",
        rationale: "reference-market patterns and wider category depth",
      },
    ],
    crossBorderKeywordCount: luxembourgIntentKeywords.length,
    referenceKeywordCount: referenceKeywords.length,
  },
  crossBorderKeywords: luxembourgIntentKeywords.map((item) => ({
    keyword: item.keyword,
    followUpTier: item.followUpTier,
    category: item.category,
    lanes: item.lanes,
    sourceKeywords: item.sourceKeywords,
    maxVolumeLu: item.maxVolume,
    useFor: classifyUseFor(item, "cross_border_luxembourg_intent"),
  })),
  referenceKeywords: referenceKeywords.map((item) => ({
    keyword: item.keyword,
    followUpTier: item.followUpTier,
    category: item.category,
    lanes: item.lanes,
    sourceKeywords: item.sourceKeywords,
    maxVolumeLu: item.maxVolume,
    useFor: classifyUseFor(item, "reference"),
  })),
};

await fs.mkdir(outputDir, { recursive: true });

const jsonPath = path.join(outputDir, "multigeo-keyword-pack.json");
const mdPath = path.join(outputDir, "multigeo-keyword-pack.md");

await fs.writeFile(jsonPath, JSON.stringify(pack, null, 2));
await fs.writeFile(mdPath, buildMemo(pack));

for (const dbConfig of pack.meta.crossBorderDatabases) {
  const seedsPath = path.join(
    outputDir,
    `keyword-overview-seeds__${dbConfig.db}__luxembourg-intent.json`
  );
  await fs.writeFile(
    seedsPath,
    JSON.stringify(pack.crossBorderKeywords.map((item) => item.keyword), null, 2)
  );
}

for (const dbConfig of pack.meta.referenceDatabases) {
  const seedsPath = path.join(outputDir, `keyword-overview-seeds__${dbConfig.db}.json`);
  await fs.writeFile(
    seedsPath,
    JSON.stringify(pack.referenceKeywords.map((item) => item.keyword), null, 2)
  );
}

console.log(`Cross-border keywords: ${pack.crossBorderKeywords.length}`);
console.log(`Reference keywords: ${pack.referenceKeywords.length}`);
console.log(`Output JSON: ${jsonPath}`);
console.log(`Output memo: ${mdPath}`);

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--opportunities") {
      parsed.opportunities = args[++index];
    } else if (arg === "--output-dir") {
      parsed.outputDir = args[++index];
    }
  }

  return parsed;
}

function classifyUseFor(item, scope) {
  if (item.category === "question") {
    return ["message mining", "FAQ expansion"];
  }

  if (scope === "cross_border_luxembourg_intent" && item.sourceCount >= 2) {
    return ["cross-border Luxembourg demand check", "message mining", "missed opportunities"];
  }

  if (item.sourceCount >= 2) {
    return ["adjacent demand check", "message mining", "missed opportunities"];
  }

  return ["message mining", "reference-market sanity check"];
}

function buildMemo(pack) {
  return [
    "# Multi-Geo Keyword Pack",
    "",
    `Generated: ${pack.meta.generatedAt}`,
    "",
    "This pack is split into two layers:",
    "- `FR/DE cross-border Luxembourg intent` — can support Luxembourg cards only when the query still clearly targets Luxembourg.",
    "- `US reference` — category/reference layer only.",
    "",
    "Do not merge generic FR/DE demand into local Luxembourg demand without a Luxembourg-intent marker.",
    "",
    "## Cross-Border Databases",
    "",
    ...pack.meta.crossBorderDatabases.map(
      (item) => `- ${item.db.toUpperCase()} — ${item.scope} — ${item.rationale}`
    ),
    "",
    "## Cross-Border Luxembourg-Intent Keywords",
    "",
    ...pack.crossBorderKeywords.map(
      (item) =>
        `- ${item.keyword} — ${item.followUpTier}, ${item.category}, LU max volume ${item.maxVolumeLu ?? "n/a"}, use for: ${item.useFor.join(", ")}`
    ),
    "",
    "## Reference Databases",
    "",
    ...pack.meta.referenceDatabases.map(
      (item) => `- ${item.db.toUpperCase()} — ${item.scope} — ${item.rationale}`
    ),
    "",
    "## Reference Keywords",
    "",
    ...pack.referenceKeywords.map(
      (item) =>
        `- ${item.keyword} — ${item.followUpTier}, ${item.category}, LU max volume ${item.maxVolumeLu ?? "n/a"}, use for: ${item.useFor.join(", ")}`
    ),
    "",
  ].join("\n");
}

function isLuxembourgIntent(keyword) {
  const text = String(keyword || "").toLowerCase();
  return /(luxembourg|luxembourgeois|luxembourgish|letzebuergesch|lëtzebuergesch|sproochentest)/i.test(
    text
  );
}
