#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);
const REQUIRED_PRODUCT_FILES = [
  "research-brief.md",
  "claim-ledger.seed.json",
  "source-ledger.seed.json",
  "field-decisions.seed.json",
  "manual-review.md",
  "post-step-audit.seed.md",
];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function unique(values) {
  return [...new Set(values)];
}

function validateManifest(manifest) {
  const errors = [];

  if (!isRecord(manifest)) errors.push("Manifest is not an object");
  if (!isNonEmptyString(manifest?.schema_version)) errors.push("Manifest missing schema_version");
  if (!isNonEmptyString(manifest?.run_id)) errors.push("Manifest missing run_id");
  if (!isNonEmptyString(manifest?.generated_at)) errors.push("Manifest missing generated_at");
  if (!Array.isArray(manifest?.products)) errors.push("Manifest missing products array");

  return errors;
}

function validateClaimLedger(data) {
  const errors = [];
  const warnings = [];

  if (!isRecord(data)) {
    errors.push("Claim ledger is not an object");
    return { errors, warnings, stats: {} };
  }

  if (!Array.isArray(data.claims)) {
    errors.push("Claim ledger missing claims array");
    return { errors, warnings, stats: {} };
  }

  const claimIds = data.claims.map((claim) => claim.claim_id);
  if (unique(claimIds).length !== claimIds.length) {
    errors.push("Claim ledger has duplicate claim_id values");
  }

  let zeroSourceExternalClaims = 0;
  let contradictedClaims = 0;
  let internalClaims = 0;

  for (const claim of data.claims) {
    if (!isNonEmptyString(claim.claim_id)) errors.push("Claim missing claim_id");
    if (!isNonEmptyString(claim.claim_text)) errors.push(`Claim ${claim.claim_id || "<unknown>"} missing claim_text`);
    if (!isNonEmptyString(claim.category)) errors.push(`Claim ${claim.claim_id || "<unknown>"} missing category`);
    if (!Array.isArray(claim.supporting_source_ids)) {
      errors.push(`Claim ${claim.claim_id || "<unknown>"} missing supporting_source_ids array`);
    }
    if (!isNonEmptyString(claim.next_action)) {
      errors.push(`Claim ${claim.claim_id || "<unknown>"} missing next_action`);
    }

    if (claim.origin === "legacy_internal_claim") internalClaims += 1;
    if (claim.legacy_status === "contradicted") contradictedClaims += 1;
    if (claim.origin === "legacy_external_claim" && Array.isArray(claim.supporting_source_ids) && claim.supporting_source_ids.length === 0) {
      zeroSourceExternalClaims += 1;
    }
  }

  if (zeroSourceExternalClaims > 0) {
    warnings.push(`${zeroSourceExternalClaims} legacy external claims have zero supporting source ids`);
  }

  return {
    errors,
    warnings,
    stats: {
      claimCount: data.claims.length,
      contradictedClaims,
      internalClaims,
      zeroSourceExternalClaims,
    },
  };
}

function validateSourceLedger(data) {
  const errors = [];

  if (!isRecord(data)) {
    errors.push("Source ledger is not an object");
    return { errors, sourceIds: [] };
  }
  if (!Array.isArray(data.sources)) {
    errors.push("Source ledger missing sources array");
    return { errors, sourceIds: [] };
  }

  const sourceIds = data.sources.map((source) => source.source_id);
  if (unique(sourceIds).length !== sourceIds.length) {
    errors.push("Source ledger has duplicate source_id values");
  }

  for (const source of data.sources) {
    if (!isNonEmptyString(source.source_id)) errors.push("Source missing source_id");
    if (!isNonEmptyString(source.title)) errors.push(`Source ${source.source_id || "<unknown>"} missing title`);
    if (!isNonEmptyString(source.publisher)) errors.push(`Source ${source.source_id || "<unknown>"} missing publisher`);
    if (!isNonEmptyString(source.url)) errors.push(`Source ${source.source_id || "<unknown>"} missing url`);
    if (!isNonEmptyString(source.authority_tier_seed)) {
      errors.push(`Source ${source.source_id || "<unknown>"} missing authority_tier_seed`);
    }
  }

  return { errors, sourceIds };
}

function validateFieldDecisionSeed(data) {
  const errors = [];
  if (!isRecord(data)) {
    errors.push("Field decision seed is not an object");
    return errors;
  }
  if (!Array.isArray(data.field_decisions) || data.field_decisions.length === 0) {
    errors.push("Field decision seed missing field_decisions");
  }
  return errors;
}

async function validateProductFolder(productDir) {
  const files = await readdir(productDir);
  const missingFiles = REQUIRED_PRODUCT_FILES.filter((file) => !files.includes(file));
  const errors = [];
  const warnings = [];

  if (missingFiles.length > 0) {
    errors.push(`Missing required files: ${missingFiles.join(", ")}`);
  }

  const briefPath = path.join(productDir, "research-brief.md");
  const manualReviewPath = path.join(productDir, "manual-review.md");
  const postAuditPath = path.join(productDir, "post-step-audit.seed.md");
  const claimPath = path.join(productDir, "claim-ledger.seed.json");
  const sourcePath = path.join(productDir, "source-ledger.seed.json");
  const fieldPath = path.join(productDir, "field-decisions.seed.json");

  let claimData = null;
  let sourceData = null;

  const [briefRaw, manualReviewRaw, postAuditRaw] = await Promise.all([
    readFile(briefPath, "utf8"),
    readFile(manualReviewPath, "utf8"),
    readFile(postAuditPath, "utf8"),
  ]);

  if (!isNonEmptyString(briefRaw)) errors.push("research-brief.md is empty");
  if (!isNonEmptyString(manualReviewRaw)) errors.push("manual-review.md is empty");
  if (!isNonEmptyString(postAuditRaw)) errors.push("post-step-audit.seed.md is empty");

  try {
    claimData = await readJson(claimPath);
  } catch (error) {
    errors.push(`Could not parse claim-ledger.seed.json: ${error.message}`);
  }

  try {
    sourceData = await readJson(sourcePath);
  } catch (error) {
    errors.push(`Could not parse source-ledger.seed.json: ${error.message}`);
  }

  try {
    const fieldData = await readJson(fieldPath);
    errors.push(...validateFieldDecisionSeed(fieldData));
  } catch (error) {
    errors.push(`Could not parse field-decisions.seed.json: ${error.message}`);
  }

  let stats = {
    claimCount: 0,
    contradictedClaims: 0,
    internalClaims: 0,
    zeroSourceExternalClaims: 0,
    sourceCount: 0,
  };

  let unresolvedSourceRefs = [];

  if (claimData && sourceData) {
    const claimResult = validateClaimLedger(claimData);
    const sourceResult = validateSourceLedger(sourceData);
    errors.push(...claimResult.errors, ...sourceResult.errors);
    warnings.push(...claimResult.warnings);

    const sourceIdSet = new Set(sourceResult.sourceIds);
    unresolvedSourceRefs = unique(
      (claimData.claims || [])
        .flatMap((claim) => claim.supporting_source_ids || [])
        .filter((sourceId) => !sourceIdSet.has(sourceId))
    );

    if (unresolvedSourceRefs.length > 0) {
      errors.push(`Claim ledger references missing source ids: ${unresolvedSourceRefs.join(", ")}`);
    }

    stats = {
      ...stats,
      ...claimResult.stats,
      sourceCount: sourceResult.sourceIds.length,
    };
  }

  return {
    productFolder: path.basename(productDir),
    errors,
    warnings,
    unresolvedSourceRefs,
    stats,
  };
}

async function main() {
  const manifestPath = path.join(RUN_DIR, "dataset-manifest.json");
  const summaryPath = path.join(RUN_DIR, "run-summary.md");

  const manifest = await readJson(manifestPath);
  const manifestErrors = validateManifest(manifest);
  const summaryText = await readFile(summaryPath, "utf8");
  const entries = await readdir(RUN_DIR, { withFileTypes: true });
  const productDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(RUN_DIR, entry.name))
    .sort();

  const productReports = [];
  for (const productDir of productDirs) {
    productReports.push(await validateProductFolder(productDir));
  }

  const productsWithErrors = productReports.filter((report) => report.errors.length > 0);
  const productsWithWarnings = productReports.filter((report) => report.warnings.length > 0);

  const rerunQueue = productReports
    .map((report) => ({
      productFolder: report.productFolder,
      severityScore:
        report.errors.length * 5 +
        report.stats.contradictedClaims * 4 +
        report.stats.zeroSourceExternalClaims * 3 +
        report.warnings.length,
      errors: report.errors.length,
      warnings: report.warnings.length,
      contradictedClaims: report.stats.contradictedClaims,
      zeroSourceExternalClaims: report.stats.zeroSourceExternalClaims,
      sourceCount: report.stats.sourceCount,
      claimCount: report.stats.claimCount,
    }))
    .sort((left, right) => right.severityScore - left.severityScore || left.productFolder.localeCompare(right.productFolder));

  const report = {
    schema_version: "research_v2_seed_validation_report_v1",
    run_dir: RUN_DIR,
    generated_at: new Date().toISOString(),
    manifest_errors: manifestErrors,
    summary_present: isNonEmptyString(summaryText),
    product_count: productReports.length,
    products_with_errors: productsWithErrors.length,
    products_with_warnings: productsWithWarnings.length,
    aggregate: {
      total_errors: productReports.reduce((sum, report) => sum + report.errors.length, 0),
      total_warnings: productReports.reduce((sum, report) => sum + report.warnings.length, 0),
      total_claims: productReports.reduce((sum, report) => sum + report.stats.claimCount, 0),
      total_sources: productReports.reduce((sum, report) => sum + report.stats.sourceCount, 0),
      total_contradicted_claims: productReports.reduce(
        (sum, report) => sum + report.stats.contradictedClaims,
        0
      ),
      total_zero_source_external_claims: productReports.reduce(
        (sum, report) => sum + report.stats.zeroSourceExternalClaims,
        0
      ),
    },
    rerun_queue: rerunQueue,
    product_reports: productReports,
  };

  const reportPath = path.join(RUN_DIR, "validation-report.json");
  const summaryPathOut = path.join(RUN_DIR, "validation-summary.md");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const summaryLines = [
    `# Validation Summary - ${manifest.run_id}`,
    "",
    `Generated at: ${report.generated_at}`,
    `Run dir: ${RUN_DIR}`,
    "",
    "## Aggregate",
    "",
    `- Products: ${report.product_count}`,
    `- Products with errors: ${report.products_with_errors}`,
    `- Products with warnings: ${report.products_with_warnings}`,
    `- Total errors: ${report.aggregate.total_errors}`,
    `- Total warnings: ${report.aggregate.total_warnings}`,
    `- Total claims: ${report.aggregate.total_claims}`,
    `- Total sources: ${report.aggregate.total_sources}`,
    `- Total contradicted legacy claims: ${report.aggregate.total_contradicted_claims}`,
    `- Total zero-source external claims: ${report.aggregate.total_zero_source_external_claims}`,
    "",
    "## Blocking errors",
    "",
    ...(productsWithErrors.length > 0
      ? productsWithErrors.flatMap((item, index) => [
          `${index + 1}. ${item.productFolder}`,
          ...item.errors.map((error) => `   - ${error}`),
        ])
      : ["No blocking errors detected."]),
    "",
    "## Warnings",
    "",
    ...(productsWithWarnings.length > 0
      ? productsWithWarnings.flatMap((item, index) => [
          `${index + 1}. ${item.productFolder}`,
          ...item.warnings.map((warning) => `   - ${warning}`),
        ])
      : ["No warnings detected."]),
    "",
    "## Rerun queue",
    "",
    ...rerunQueue.slice(0, 12).map(
      (item, index) =>
        `${index + 1}. ${item.productFolder} - severity ${item.severityScore} - ` +
        `errors ${item.errors}, warnings ${item.warnings}, contradicted ${item.contradictedClaims}, zero-source ${item.zeroSourceExternalClaims}`
    ),
  ];

  await writeFile(summaryPathOut, `${summaryLines.join("\n")}\n`);

  console.log(`Validation report written to ${reportPath}`);
  console.log(`Validation summary written to ${summaryPathOut}`);
  console.log(
    JSON.stringify(
      {
        products: report.product_count,
        products_with_errors: report.products_with_errors,
        products_with_warnings: report.products_with_warnings,
        total_errors: report.aggregate.total_errors,
        total_warnings: report.aggregate.total_warnings,
        total_zero_source_external_claims: report.aggregate.total_zero_source_external_claims,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
