#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }
    if (char === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

async function readCsv(filePath) {
  const raw = await readFile(filePath, "utf8");
  const lines = raw.split("\n").map((line) => line.trimEnd()).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

async function main() {
  const citationReport = await readJson(path.join(RUN_DIR, "citation-verification-report.json"));
  const quoteReport = await readJson(path.join(RUN_DIR, "quote-candidate-fetch-report.json"));
  const commercialRows = await readCsv(path.join(RUN_DIR, "commercial-validation-overview.csv"));

  const readyRows = commercialRows.filter((row) => row.citation_status === "ready");
  const blockedRows = readyRows.filter((row) => row.dashboard_release_status === "blocked");
  const reviewRows = readyRows.filter((row) => row.dashboard_release_status === "review");
  const invalidRows = commercialRows.filter((row) => row.citation_status === "invalid");
  const nextQueue = commercialRows
    .filter((row) => row.citation_status !== "ready")
    .sort((left, right) => Number(right.validation_severity_seed || 0) - Number(left.validation_severity_seed || 0))
    .slice(0, 8);

  const summaryLines = [
    `# Research v2 Progress Summary - ${path.basename(RUN_DIR)}`,
    "",
    "## Batch state",
    "",
    `- Products in run: ${citationReport.aggregate.products}`,
    `- Citation-ready products: ${citationReport.aggregate.ready}`,
    `- Seed-only products: ${citationReport.aggregate.seed_only}`,
    `- Invalid products: ${citationReport.aggregate.invalid}`,
    `- Products with final claim ledgers: ${citationReport.aggregate.products_with_final_claim_ledger}`,
    `- Products with dashboard payloads: ${citationReport.aggregate.products_with_dashboards}`,
    `- Safe fields total: ${citationReport.aggregate.safe_fields_total}`,
    "",
    "## Ready products",
    "",
    ...(readyRows.length > 0
      ? readyRows.map(
          (row) =>
            `- ${row.product_code} ${row.product_title}: release=${row.dashboard_release_status || "n/a"}, safe_fields=${row.safe_field_count || 0}`
        )
      : ["- none"]),
    "",
    "## Release split among ready products",
    "",
    `- review: ${reviewRows.length}`,
    `- blocked: ${blockedRows.length}`,
    "",
    "## Invalid products",
    "",
    ...(invalidRows.length > 0
      ? invalidRows.map(
          (row) =>
            `- ${row.product_code} ${row.product_title}: severity=${row.validation_severity_seed || "n/a"}, citation_status=${row.citation_status}`
        )
      : ["- none"]),
    "",
    "## Quote candidate coverage",
    "",
    `- Total source URLs attempted: ${quoteReport.aggregate.total_sources}`,
    `- Total candidate snippets: ${quoteReport.aggregate.total_candidates}`,
    `- Products with any candidates: ${quoteReport.aggregate.products_with_any_candidates}`,
    `- Total fetch failures: ${quoteReport.aggregate.total_fetch_failures}`,
    "",
    "## Next rerun queue",
    "",
    ...nextQueue.map(
      (row, index) =>
        `${index + 1}. ${row.product_code} ${row.product_title} - severity=${row.validation_severity_seed || 0}, citation_status=${row.citation_status}`
    ),
    "",
    "## Current structural blocker",
    "",
    ...citationReport.product_reports
      .filter((item) => item.errors?.length > 0)
      .flatMap((item) => item.errors.map((error) => `- ${item.productFolder}: ${error}`)),
  ];

  const outputPath = path.join(RUN_DIR, "progress-summary.md");
  await writeFile(outputPath, `${summaryLines.join("\n")}\n`);
  console.log(`Progress summary written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
