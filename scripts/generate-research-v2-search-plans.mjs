#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);

function unique(values) {
  return [...new Set(values)];
}

function titleTokens(title) {
  return title
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function buildCategoryQueries(title, categories) {
  const safeTitle = `"${title}"`;
  const queries = [];

  if (categories.has("mandate") || categories.has("compliance")) {
    queries.push(`${safeTitle} regulation requirement official`);
    queries.push(`${safeTitle} regulator guidance site:gov`);
  }
  if (categories.has("licensing") || categories.has("accreditation") || categories.has("recognition")) {
    queries.push(`${safeTitle} accredited approved provider official`);
    queries.push(`${safeTitle} certification route regulator list`);
  }
  if (categories.has("subsidy") || categories.has("reimbursement") || categories.has("funding")) {
    queries.push(`${safeTitle} subsidy eligibility official`);
    queries.push(`${safeTitle} reimbursement co-funding official`);
  }
  if (categories.has("exam")) {
    queries.push(`${safeTitle} exam body official requirements`);
    queries.push(`${safeTitle} accepted exam provider official`);
  }
  if (categories.has("numeric_claim")) {
    queries.push(`${safeTitle} statistics official dataset`);
    queries.push(`${safeTitle} market size official source`);
  }
  if (categories.has("competitor_gap")) {
    queries.push(`${safeTitle} competitor providers Luxembourg`);
    queries.push(`${safeTitle} alternative course provider`);
  }
  if (categories.has("deadline")) {
    queries.push(`${safeTitle} official deadline`);
    queries.push(`${safeTitle} effective date official`);
  }

  return unique(queries);
}

function buildContradictionQueries(title, categories) {
  const safeTitle = `"${title}"`;
  const queries = [
    `${safeTitle} not eligible`,
    `${safeTitle} exception`,
    `${safeTitle} excluded`,
    `${safeTitle} expired`,
    `${safeTitle} withdrawn`,
  ];

  if (categories.has("competitor_gap")) {
    queries.push(`${safeTitle} alternative provider`);
    queries.push(`${safeTitle} competitor Luxembourg`);
  }
  if (categories.has("subsidy") || categories.has("reimbursement") || categories.has("funding")) {
    queries.push(`${safeTitle} subsidy not applicable`);
    queries.push(`${safeTitle} co-funding exclusion`);
  }
  if (categories.has("mandate") || categories.has("deadline")) {
    queries.push(`${safeTitle} enforcement start date`);
    queries.push(`${safeTitle} not mandatory`);
  }
  if (categories.has("licensing") || categories.has("accreditation")) {
    queries.push(`${safeTitle} not accredited`);
    queries.push(`${safeTitle} approved provider list`);
  }

  return unique(queries);
}

function buildTrackHints(categories) {
  const tracks = [
    "official/regulator",
    "provider/incumbent",
  ];

  if (
    categories.has("mandate") ||
    categories.has("licensing") ||
    categories.has("accreditation") ||
    categories.has("recognition") ||
    categories.has("exam")
  ) {
    tracks.push("licensing/exam/approval body");
  }
  if (categories.has("numeric_claim")) {
    tracks.push("statistics/dataset");
  }
  if (categories.has("subsidy") || categories.has("reimbursement") || categories.has("funding")) {
    tracks.push("funding/subsidy public guidance");
  }
  if (categories.has("competitor_gap")) {
    tracks.push("market scan / competitor search");
  }

  return unique(tracks);
}

async function main() {
  const entries = await readdir(RUN_DIR, { withFileTypes: true });
  const productDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(RUN_DIR, entry.name));

  for (const productDir of productDirs) {
    const claimLedger = JSON.parse(await readFile(path.join(productDir, "claim-ledger.seed.json"), "utf8"));
    const brief = await readFile(path.join(productDir, "research-brief.md"), "utf8");
    const categories = new Set(claimLedger.claims.map((claim) => claim.category));
    const title = claimLedger.product_title;

    const officialQueries = [
      `"${title}" official`,
      `"${title}" regulator`,
      `"${title}" site:gov`,
      ...titleTokens(title).slice(0, 4).map((token) => `"${token}" official`),
    ];

    const categoryQueries = buildCategoryQueries(title, categories);
    const contradictionQueries = buildContradictionQueries(title, categories);
    const trackHints = buildTrackHints(categories);

    const lines = [
      `# Search Plan - ${claimLedger.product_code} - ${title}`,
      "",
      "This is a seed search plan generated from the v2 claim ledger.",
      "It is not the final verification output.",
      "",
      "## Research tracks",
      "",
      ...trackHints.map((track, index) => `${index + 1}. ${track}`),
      "",
      "## Official / regulator queries",
      "",
      ...unique(officialQueries).map((query, index) => `${index + 1}. ${query}`),
      "",
      "## Claim-family queries",
      "",
      ...categoryQueries.map((query, index) => `${index + 1}. ${query}`),
      "",
      "## Contradiction queries",
      "",
      ...contradictionQueries.map((query, index) => `${index + 1}. ${query}`),
      "",
      "## Notes",
      "",
      "- Rebuild exact search wording after reading the brief and the current contradiction log.",
      "- Prefer direct site navigation and official provider lists over general web snippets.",
      "- Do not mark any field verified from this plan alone.",
      "",
      "## Seed context excerpt",
      "",
      ...brief.split("\n").slice(0, 18),
    ];

    await writeFile(path.join(productDir, "search-plan.md"), `${lines.join("\n")}\n`);
  }

  console.log(`Search plans created for ${productDirs.length} products in ${RUN_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
