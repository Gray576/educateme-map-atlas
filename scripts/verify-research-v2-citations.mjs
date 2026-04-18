#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);

const FINAL_FILES = [
  "claim-ledger.json",
  "field-decisions.json",
  "high-confidence-card.json",
  "dashboard-ingestion.json",
];

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function unique(values) {
  return [...new Set(values)];
}

async function readJsonMaybe(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function readJsonlMaybe(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return null;
  }
}

async function loadLedger(productDir, baseName, arrayKey) {
  const json = await readJsonMaybe(path.join(productDir, `${baseName}.json`));
  if (json && Array.isArray(json[arrayKey])) {
    return { kind: "json", data: json[arrayKey], raw: json };
  }

  const jsonl = await readJsonlMaybe(path.join(productDir, `${baseName}.jsonl`));
  if (jsonl) {
    return { kind: "jsonl", data: jsonl, raw: jsonl };
  }

  return { kind: "missing", data: [], raw: null };
}

async function loadClaims(productDir) {
  const final = await readJsonMaybe(path.join(productDir, "claim-ledger.json"));
  if (final?.claims) return { kind: "final", claims: final.claims, raw: final };

  const seed = await readJsonMaybe(path.join(productDir, "claim-ledger.seed.json"));
  if (seed?.claims) return { kind: "seed", claims: seed.claims, raw: seed };

  return { kind: "missing", claims: [], raw: null };
}

async function loadSources(productDir) {
  const final = await loadLedger(productDir, "source-ledger", "sources");
  if (final.kind !== "missing") return { stage: "final", ...final };

  const seed = await readJsonMaybe(path.join(productDir, "source-ledger.seed.json"));
  if (seed?.sources) {
    return { stage: "seed", kind: "json", data: seed.sources, raw: seed };
  }

  return { stage: "missing", kind: "missing", data: [], raw: null };
}

async function loadQuotes(productDir) {
  return loadLedger(productDir, "quote-ledger", "quotes");
}

function quoteHasPayload(quote) {
  return (
    isNonEmptyString(quote?.quote_text) ||
    isNonEmptyString(quote?.text) ||
    (quote?.structured_data !== undefined && quote?.structured_data !== null) ||
    (quote?.value !== undefined && quote?.value !== null)
  );
}

function quoteHasLocation(quote) {
  return (
    quote?.page !== undefined ||
    quote?.section !== undefined ||
    quote?.anchor !== undefined ||
    quote?.location !== undefined
  );
}

function normalizeQuoteSourceId(quote) {
  return quote?.source_id || quote?.sourceId || null;
}

function collectQuoteIds(quoteList) {
  return new Set(quoteList.map((quote) => quote?.quote_id).filter(Boolean));
}

function collectSourceIds(sourceList) {
  return new Set(sourceList.map((source) => source?.source_id).filter(Boolean));
}

function mapQuotesById(quoteList) {
  return new Map(quoteList.map((quote) => [quote.quote_id, quote]));
}

function validateQuotes(quotes, sourceIds, errors, warnings) {
  const ids = quotes.map((quote) => quote?.quote_id).filter(Boolean);
  if (unique(ids).length !== ids.length) {
    errors.push("Quote ledger contains duplicate quote_id values");
  }

  for (const quote of quotes) {
    if (!isRecord(quote)) {
      errors.push("Quote ledger contains a non-object entry");
      continue;
    }

    if (!isNonEmptyString(quote.quote_id)) {
      errors.push("Quote missing quote_id");
    }

    const sourceId = normalizeQuoteSourceId(quote);
    if (!isNonEmptyString(sourceId)) {
      errors.push(`Quote ${quote.quote_id || "<unknown>"} missing source_id`);
    } else if (!sourceIds.has(sourceId)) {
      errors.push(`Quote ${quote.quote_id || "<unknown>"} references missing source id: ${sourceId}`);
    }

    if (!quoteHasPayload(quote)) {
      errors.push(`Quote ${quote.quote_id || "<unknown>"} has no exact text or structured data payload`);
    }

    if (!quoteHasLocation(quote)) {
      warnings.push(`Quote ${quote.quote_id || "<unknown>"} has no page/section/anchor metadata`);
    }
  }
}

function validateSources(sources, errors) {
  const ids = sources.map((source) => source?.source_id).filter(Boolean);
  if (unique(ids).length !== ids.length) {
    errors.push("Source ledger contains duplicate source_id values");
  }

  for (const source of sources) {
    if (!isRecord(source)) {
      errors.push("Source ledger contains a non-object entry");
      continue;
    }
    if (!isNonEmptyString(source.source_id)) errors.push("Source missing source_id");
    if (!isNonEmptyString(source.title)) errors.push(`Source ${source.source_id || "<unknown>"} missing title`);
    if (!isNonEmptyString(source.publisher)) errors.push(`Source ${source.source_id || "<unknown>"} missing publisher`);
    if (!isNonEmptyString(source.url)) errors.push(`Source ${source.source_id || "<unknown>"} missing url`);
  }
}

function validateClaimReferences({
  claims,
  claimKind,
  sourceIds,
  quoteIds,
  quotesById,
  errors,
  warnings,
}) {
  let checkedClaims = 0;
  let claimsNeedingQuotes = 0;
  let claimsWithMissingSources = 0;
  let claimsWithMissingQuotes = 0;

  const finalStatuses = new Set(["verified", "partially_verified", "contradicted"]);

  for (const claim of claims) {
    if (!isRecord(claim)) continue;
    checkedClaims += 1;

    const supportingSourceIds = Array.isArray(claim.supporting_source_ids) ? claim.supporting_source_ids : [];
    const contradictingSourceIds = Array.isArray(claim.contradicting_source_ids) ? claim.contradicting_source_ids : [];
    const supportingQuoteIds = Array.isArray(claim.supporting_quote_ids) ? claim.supporting_quote_ids : [];
    const contradictingQuoteIds = Array.isArray(claim.contradicting_quote_ids) ? claim.contradicting_quote_ids : [];
    const status = claim.status || claim.legacy_status || "unknown";

    const missingSources = [...supportingSourceIds, ...contradictingSourceIds].filter(
      (sourceId) => sourceId && !sourceIds.has(sourceId)
    );

    if (missingSources.length > 0) {
      claimsWithMissingSources += 1;
      errors.push(
        `Claim ${claim.claim_id || "<unknown>"} references missing source ids: ${unique(missingSources).join(", ")}`
      );
    }

    const needsQuotes = claimKind === "final" ? finalStatuses.has(status) : ["verified", "partially_verified", "contradicted"].includes(status);
    if (!needsQuotes) continue;

    claimsNeedingQuotes += 1;
    const allQuoteIds = [...supportingQuoteIds, ...contradictingQuoteIds].filter(Boolean);
    if (allQuoteIds.length === 0) {
      claimsWithMissingQuotes += 1;
      const message = `Claim ${claim.claim_id || "<unknown>"} requires quote refs but none were provided`;
      if (claimKind === "final") {
        errors.push(message);
      } else {
        warnings.push(message);
      }
      continue;
    }

    const missingQuotes = allQuoteIds.filter((quoteId) => !quoteIds.has(quoteId));
    if (missingQuotes.length > 0) {
      claimsWithMissingQuotes += 1;
      const message = `Claim ${claim.claim_id || "<unknown>"} references missing quote ids: ${unique(missingQuotes).join(", ")}`;
      if (claimKind === "final") {
        errors.push(message);
      } else {
        warnings.push(message);
      }
      continue;
    }

    const allClaimSourceIds = new Set([...supportingSourceIds, ...contradictingSourceIds]);
    for (const quoteId of allQuoteIds) {
      const quote = quotesById.get(quoteId);
      const quoteSourceId = normalizeQuoteSourceId(quote);
      if (quoteSourceId && allClaimSourceIds.size > 0 && !allClaimSourceIds.has(quoteSourceId)) {
        errors.push(
          `Claim ${claim.claim_id || "<unknown>"} cites quote ${quoteId} from source ${quoteSourceId}, but that source is not listed on the claim`
        );
      }
    }

    if (status === "contradicted" && contradictingQuoteIds.length === 0) {
      warnings.push(`Contradicted claim ${claim.claim_id || "<unknown>"} has no contradicting_quote_ids`);
    }
  }

  return {
    checkedClaims,
    claimsNeedingQuotes,
    claimsWithMissingSources,
    claimsWithMissingQuotes,
  };
}

function validateHighConfidenceCard(card, sourceIds, quoteIds, errors) {
  if (!isRecord(card)) {
    errors.push("high-confidence-card.json is not a valid object");
    return;
  }

  if (card.schema_version !== "research_card_v2") {
    errors.push("high-confidence-card.json has unexpected schema_version");
  }

  if (!Array.isArray(card.sources)) errors.push("high-confidence-card.json missing sources array");
  if (!Array.isArray(card.claims)) errors.push("high-confidence-card.json missing claims array");

  for (const source of card.sources || []) {
    if (source?.source_id && !sourceIds.has(source.source_id)) {
      errors.push(`high-confidence-card.json includes source ${source.source_id} not present in source ledger`);
    }
  }

  for (const claim of card.claims || []) {
    const sourceRefs = [...(claim.supporting_source_ids || []), ...(claim.contradicting_source_ids || [])];
    const quoteRefs = [...(claim.supporting_quote_ids || []), ...(claim.contradicting_quote_ids || [])];

    for (const sourceId of sourceRefs) {
      if (sourceId && !sourceIds.has(sourceId)) {
        errors.push(`high-confidence-card claim ${claim.claim_id || "<unknown>"} references missing source ${sourceId}`);
      }
    }
    for (const quoteId of quoteRefs) {
      if (quoteId && !quoteIds.has(quoteId)) {
        errors.push(`high-confidence-card claim ${claim.claim_id || "<unknown>"} references missing quote ${quoteId}`);
      }
    }
  }

  for (const requirement of card.requirements || []) {
    for (const sourceId of requirement.source_ids || []) {
      if (sourceId && !sourceIds.has(sourceId)) {
        errors.push(`Requirement ${requirement.requirement_id || "<unknown>"} references missing source ${sourceId}`);
      }
    }
    for (const quoteId of requirement.quote_ids || []) {
      if (quoteId && !quoteIds.has(quoteId)) {
        errors.push(`Requirement ${requirement.requirement_id || "<unknown>"} references missing quote ${quoteId}`);
      }
    }
  }
}

function validateFieldDecisions(fieldDecisionDoc, claimIds, openQuestionIds, sourceIds, quoteIds, errors) {
  if (!isRecord(fieldDecisionDoc)) {
    errors.push("field-decisions.json is not a valid object");
    return;
  }

  if (!Array.isArray(fieldDecisionDoc.field_decisions)) {
    errors.push("field-decisions.json missing field_decisions array");
    return;
  }

  for (const field of fieldDecisionDoc.field_decisions) {
    const fieldId = field?.field_id || field?.field_name || "<unknown>";
    for (const claimId of field?.claim_refs || []) {
      if (!claimIds.has(claimId) && !openQuestionIds.has(claimId)) {
        errors.push(`Field decision ${fieldId} references missing claim ${claimId}`);
      }
    }
    for (const sourceId of field?.source_refs || []) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`Field decision ${fieldId} references missing source ${sourceId}`);
      }
    }
    for (const quoteId of field?.quote_refs || []) {
      if (!quoteIds.has(quoteId)) {
        errors.push(`Field decision ${fieldId} references missing quote ${quoteId}`);
      }
    }
  }
}

function validateDashboard(dashboard, claimIds, sourceIds, errors, warnings) {
  if (!isRecord(dashboard)) {
    errors.push("dashboard-ingestion.json is not a valid object");
    return { safeFieldCount: 0 };
  }

  if (dashboard.schema_version !== "dashboard_ingestion_v2") {
    errors.push("dashboard-ingestion.json has unexpected schema_version");
  }

  if (!isRecord(dashboard.safe_fields)) {
    errors.push("dashboard-ingestion.json missing safe_fields object");
    return { safeFieldCount: 0 };
  }

  const safeEntries = Object.entries(dashboard.safe_fields);
  for (const [fieldName, field] of safeEntries) {
    if (!isRecord(field)) {
      errors.push(`Dashboard field ${fieldName} is not an object`);
      continue;
    }

    if (!Array.isArray(field.claim_refs)) {
      errors.push(`Dashboard field ${fieldName} missing claim_refs array`);
    } else if (field.claim_refs.length === 0) {
      errors.push(`Dashboard field ${fieldName} has empty claim_refs`);
    } else {
      for (const claimId of field.claim_refs) {
        if (!claimIds.has(claimId)) {
          errors.push(`Dashboard field ${fieldName} references missing claim ${claimId}`);
        }
      }
    }

    if (!Array.isArray(field.source_refs)) {
      errors.push(`Dashboard field ${fieldName} missing source_refs array`);
    } else if (field.source_refs.length === 0) {
      errors.push(`Dashboard field ${fieldName} has empty source_refs`);
    } else {
      for (const sourceId of field.source_refs) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`Dashboard field ${fieldName} references missing source ${sourceId}`);
        }
      }
    }

    if (!isNonEmptyString(field.confidence_band)) {
      errors.push(`Dashboard field ${fieldName} missing confidence_band`);
    }
    if (!isNonEmptyString(field.last_verified_at)) {
      errors.push(`Dashboard field ${fieldName} missing last_verified_at`);
    }
  }

  if (safeEntries.length === 0) {
    warnings.push("dashboard-ingestion.json contains no safe fields");
  }

  return { safeFieldCount: safeEntries.length };
}

async function analyzeProduct(productDir) {
  const files = await readdir(productDir);
  const sourceState = await loadSources(productDir);
  const claimState = await loadClaims(productDir);
  const quoteState = await loadQuotes(productDir);

  const highConfidenceCard = await readJsonMaybe(path.join(productDir, "high-confidence-card.json"));
  const fieldDecisions = await readJsonMaybe(path.join(productDir, "field-decisions.json"));
  const dashboard = await readJsonMaybe(path.join(productDir, "dashboard-ingestion.json"));

  const errors = [];
  const warnings = [];

  validateSources(sourceState.data, errors);

  const sourceIds = collectSourceIds(sourceState.data);
  validateQuotes(quoteState.data, sourceIds, errors, warnings);

  const quoteIds = collectQuoteIds(quoteState.data);
  const quotesById = mapQuotesById(quoteState.data);
  const claimStats = validateClaimReferences({
    claims: claimState.claims,
    claimKind: claimState.kind,
    sourceIds,
    quoteIds,
    quotesById,
    errors,
    warnings,
  });

  const claimIds = new Set(
    claimState.kind === "final"
      ? claimState.claims.map((claim) => claim?.claim_id).filter(Boolean)
      : []
  );
  const openQuestionIds = new Set(
    Array.isArray(highConfidenceCard?.open_questions)
      ? highConfidenceCard.open_questions.map((question) => question?.question_id).filter(Boolean)
      : []
  );

  if (highConfidenceCard) {
    validateHighConfidenceCard(highConfidenceCard, sourceIds, quoteIds, errors);
  }

  if (fieldDecisions) {
    validateFieldDecisions(fieldDecisions, claimIds, openQuestionIds, sourceIds, quoteIds, errors);
  }

  let safeFieldCount = 0;
  if (dashboard) {
    safeFieldCount = validateDashboard(dashboard, claimIds, sourceIds, errors, warnings).safeFieldCount;
  }

  const missingFinalFiles = FINAL_FILES.filter((fileName) => !files.includes(fileName));
  const missingQuotes = quoteState.data.length === 0;
  const seedOnly =
    claimState.kind !== "final" ||
    missingQuotes ||
    missingFinalFiles.length > 0;

  if (claimState.kind !== "final") {
    warnings.push("Final claim-ledger.json is missing; only seed or no claim ledger is available");
  }
  if (missingQuotes) {
    warnings.push("No quote ledger found; product is not quote-grounded yet");
  }
  if (missingFinalFiles.length > 0) {
    warnings.push(`Missing final artifacts: ${missingFinalFiles.join(", ")}`);
  }

  const status = errors.length > 0 ? "invalid" : seedOnly ? "seed_only" : "ready";

  return {
    productFolder: path.basename(productDir),
    status,
    errors: unique(errors),
    warnings: unique(warnings),
    stats: {
      sourceCount: sourceState.data.length,
      quoteCount: quoteState.data.length,
      checkedClaims: claimStats.checkedClaims,
      claimsNeedingQuotes: claimStats.claimsNeedingQuotes,
      claimsWithMissingSources: claimStats.claimsWithMissingSources,
      claimsWithMissingQuotes: claimStats.claimsWithMissingQuotes,
      finalClaimLedger: claimState.kind === "final",
      finalSourceLedger: sourceState.stage === "final",
      hasHighConfidenceCard: Boolean(highConfidenceCard),
      hasFieldDecisions: Boolean(fieldDecisions),
      hasDashboard: Boolean(dashboard),
      safeFieldCount,
    },
  };
}

async function main() {
  const entries = await readdir(RUN_DIR, { withFileTypes: true });
  const productDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== "benchmark")
    .map((entry) => path.join(RUN_DIR, entry.name))
    .sort();

  const productReports = [];
  for (const productDir of productDirs) {
    productReports.push(await analyzeProduct(productDir));
  }

  const aggregate = {
    products: productReports.length,
    ready: productReports.filter((item) => item.status === "ready").length,
    seed_only: productReports.filter((item) => item.status === "seed_only").length,
    invalid: productReports.filter((item) => item.status === "invalid").length,
    total_errors: productReports.reduce((sum, item) => sum + item.errors.length, 0),
    total_warnings: productReports.reduce((sum, item) => sum + item.warnings.length, 0),
    total_quotes: productReports.reduce((sum, item) => sum + item.stats.quoteCount, 0),
    total_claims_checked: productReports.reduce((sum, item) => sum + item.stats.checkedClaims, 0),
    total_claims_needing_quotes: productReports.reduce((sum, item) => sum + item.stats.claimsNeedingQuotes, 0),
    claims_missing_sources: productReports.reduce((sum, item) => sum + item.stats.claimsWithMissingSources, 0),
    claims_missing_quotes: productReports.reduce((sum, item) => sum + item.stats.claimsWithMissingQuotes, 0),
    products_with_final_claim_ledger: productReports.filter((item) => item.stats.finalClaimLedger).length,
    products_with_dashboards: productReports.filter((item) => item.stats.hasDashboard).length,
    safe_fields_total: productReports.reduce((sum, item) => sum + item.stats.safeFieldCount, 0),
  };

  const invalidProducts = productReports.filter((item) => item.status === "invalid");
  const seedOnlyProducts = productReports.filter((item) => item.status === "seed_only");

  const report = {
    schema_version: "research_v2_citation_verification_report_v2",
    run_dir: RUN_DIR,
    generated_at: new Date().toISOString(),
    aggregate,
    product_reports: productReports,
  };

  const reportPath = path.join(RUN_DIR, "citation-verification-report.json");
  const summaryPath = path.join(RUN_DIR, "citation-verification-summary.md");

  const summaryLines = [
    `# Citation Verification Summary - ${path.basename(RUN_DIR)}`,
    "",
    `Generated at: ${report.generated_at}`,
    `Run dir: ${RUN_DIR}`,
    "",
    "## Aggregate",
    "",
    `- Products: ${aggregate.products}`,
    `- Ready: ${aggregate.ready}`,
    `- Seed only: ${aggregate.seed_only}`,
    `- Invalid: ${aggregate.invalid}`,
    `- Products with final claim ledger: ${aggregate.products_with_final_claim_ledger}`,
    `- Products with dashboard payloads: ${aggregate.products_with_dashboards}`,
    `- Safe fields total: ${aggregate.safe_fields_total}`,
    `- Total quotes found: ${aggregate.total_quotes}`,
    `- Claims checked: ${aggregate.total_claims_checked}`,
    `- Claims needing quotes: ${aggregate.total_claims_needing_quotes}`,
    `- Claims with missing source refs: ${aggregate.claims_missing_sources}`,
    `- Claims with missing quote refs: ${aggregate.claims_missing_quotes}`,
    "",
    "## Key verdict",
    "",
    aggregate.ready === 0
      ? "- No product is citation-ready yet. Current run remains seed-only."
      : `- ${aggregate.ready} products are citation-ready.`,
    aggregate.products_with_final_claim_ledger === 0
      ? "- No final claim ledgers exist yet, so quote-grounded verification has not started in the v2 artifact set."
      : `- ${aggregate.products_with_final_claim_ledger} products have final claim ledgers.`,
    aggregate.invalid > 0
      ? "- Some products are already structurally invalid before full rerun because provenance references do not resolve."
      : "- No structurally invalid products were detected.",
    "",
    "## Invalid products",
    "",
    ...(invalidProducts.length > 0
      ? invalidProducts.flatMap((item, index) => [
          `${index + 1}. ${item.productFolder}`,
          ...item.errors.map((error) => `   - ${error}`),
        ])
      : ["No invalid products detected."]),
    "",
    "## Seed-only products",
    "",
    ...(seedOnlyProducts.length > 0
      ? seedOnlyProducts.slice(0, 24).flatMap((item, index) => [
          `${index + 1}. ${item.productFolder}`,
          ...item.warnings.map((warning) => `   - ${warning}`),
        ])
      : ["No seed-only products detected."]),
  ];

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(summaryPath, `${summaryLines.join("\n")}\n`);

  console.log(`Citation verification report written to ${reportPath}`);
  console.log(`Citation verification summary written to ${summaryPath}`);
  console.log(JSON.stringify(aggregate, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
