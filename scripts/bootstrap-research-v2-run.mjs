#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CARDS_DIR = path.join(ROOT, "src/data/research/cards");
const DEFAULT_RUN_ID = "2026-04-18-all-24";
const runId = process.argv[2] || DEFAULT_RUN_ID;
const OUTPUT_DIR = path.join(ROOT, "research-runs", runId);

function unique(values) {
  return [...new Set(values)];
}

function mapAuthorityTier(source) {
  switch (source.source_type) {
    case "regulator":
    case "government":
    case "exam_body":
    case "official":
      return "T1";
    case "company":
      return "T3";
    default:
      return source.reliability === "high" ? "T2" : source.reliability === "medium" ? "T4" : "T5";
  }
}

function getClaimStatusCounts(card) {
  const counts = {
    verified: 0,
    partially_verified: 0,
    unverified: 0,
    contradicted: 0,
    unclear: 0,
  };

  for (const claim of card.claim_extraction?.externally_checkable_claims || []) {
    const key = counts[claim.status] !== undefined ? claim.status : "unclear";
    counts[key] += 1;
  }

  return counts;
}

function getPriority(card) {
  const statusCounts = getClaimStatusCounts(card);
  const highConflicts = (card.claim_conflicts || []).filter((item) => item.severity === "high").length;
  const zeroSourceClaims = (card.claim_extraction?.externally_checkable_claims || []).filter(
    (item) => !item.source_ids || item.source_ids.length === 0
  ).length;
  const danglingSourceRefs = getDanglingSourceRefs(card).length;

  if (
    statusCounts.contradicted > 0 ||
    highConflicts > 0 ||
    zeroSourceClaims > 0 ||
    danglingSourceRefs > 0 ||
    (card.claim_extraction?.internal_claims_unverified || []).length >= 4
  ) {
    return "P0";
  }

  if (statusCounts.unverified > 0 || (card.claim_conflicts || []).length > 0) {
    return "P1";
  }

  return "P2";
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getDanglingSourceRefs(card) {
  const sourceIds = new Set((card.sources || []).map((source) => source.source_id));
  return unique(
    (card.claim_extraction?.externally_checkable_claims || [])
      .flatMap((claim) => claim.source_ids || [])
      .filter((sourceId) => !sourceIds.has(sourceId))
  );
}

function getZeroSourceExternalClaims(card) {
  return (card.claim_extraction?.externally_checkable_claims || []).filter(
    (claim) => !claim.source_ids || claim.source_ids.length === 0
  );
}

function toClaimSeed(card) {
  const externalClaims = (card.claim_extraction?.externally_checkable_claims || []).map((claim, index) => ({
    claim_id: `ext_${String(index + 1).padStart(3, "0")}`,
    origin: "legacy_external_claim",
    category: claim.claim_area,
    claim_text: claim.claim_text,
    legacy_status: claim.status,
    supporting_source_ids: claim.source_ids || [],
    contradiction_flag: claim.status === "contradicted",
    notes: claim.notes || "",
    next_action:
      claim.status === "verified"
        ? "re-check quotes and freshness"
        : claim.status === "contradicted"
          ? "falsify fully and rewrite or drop"
          : "re-search and verify with stricter source tier rules",
  }));

  const internalClaims = (card.claim_extraction?.internal_claims_unverified || []).map((claim, index) => ({
    claim_id: `int_${String(index + 1).padStart(3, "0")}`,
    origin: "legacy_internal_claim",
    category: claim.claim_area,
    claim_text: claim.claim_text,
    legacy_status: "internal_unverified",
    supporting_source_ids: [],
    contradiction_flag: false,
    notes: claim.reason_unverified || "",
    next_action: "treat as open question, not as fact",
  }));

  return [...externalClaims, ...internalClaims];
}

function toSourceSeed(card) {
  return (card.sources || []).map((source) => ({
    source_id: source.source_id,
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    source_type: source.source_type,
    reliability_legacy: source.reliability,
    authority_tier_seed: mapAuthorityTier(source),
    accessed_at: null,
    published_at: null,
    notes: "Seeded from legacy card. Re-classify during v2 rerun.",
  }));
}

function renderBrief(card) {
  const statusCounts = getClaimStatusCounts(card);
  const conflicts = card.claim_conflicts || [];
  const manualReview = card.recommended_manual_review || [];
  const marketScope = card.product_summary?.market_scope || {
    primary_market: "unknown",
    country_scope: [],
    profession_scope: [],
  };

  const topContradictions = conflicts
    .slice()
    .sort((left, right) => {
      const severityWeight = { high: 2, medium: 1, low: 0 };
      return (severityWeight[right.severity] || 0) - (severityWeight[left.severity] || 0);
    })
    .slice(0, 5);
  const danglingSourceRefs = getDanglingSourceRefs(card);
  const zeroSourceClaims = getZeroSourceExternalClaims(card);

  return `# Research Brief - ${card.product_code} - ${card.product_title}

## Product

- Code: ${card.product_code}
- Title: ${card.product_title}
- Run id: ${runId}
- Seed source: legacy research card
- Rerun priority: ${getPriority(card)}

## Current legacy framing

- One-line summary: ${card.product_summary?.one_sentence_summary || "n/a"}
- Target user: ${card.product_summary?.target_user || "n/a"}
- Core pain: ${card.product_summary?.core_pain || "n/a"}
- Claimed outcome: ${card.product_summary?.claimed_outcome || "n/a"}

## Scope to verify

- Primary market: ${marketScope.primary_market || "unknown"}
- Country scope: ${(marketScope.country_scope || []).join(", ") || "unknown"}
- Profession scope: ${(marketScope.profession_scope || []).join(", ") || "unknown"}

## Current evidence snapshot

- Sources in legacy card: ${(card.sources || []).length}
- Externally checkable claims: ${(card.claim_extraction?.externally_checkable_claims || []).length}
- Verified: ${statusCounts.verified}
- Partially verified: ${statusCounts.partially_verified}
- Unverified: ${statusCounts.unverified}
- Contradicted: ${statusCounts.contradicted}
- Internal unresolved claims: ${(card.claim_extraction?.internal_claims_unverified || []).length}
- Claim conflicts: ${conflicts.length}
- Legacy external claims with zero source ids: ${zeroSourceClaims.length}
- Dangling source refs: ${danglingSourceRefs.length}

## Immediate risk picture

${topContradictions.length > 0
    ? topContradictions
        .map(
          (item, index) =>
            `${index + 1}. [${item.severity}] ${item.claim_text}\n   Reason: ${item.what_is_wrong}\n   Sources: ${(item.source_ids || []).join(", ") || "none"}`
        )
        .join("\n")
    : "No legacy conflicts listed."}

## Manual review carried over from legacy card

${manualReview.length > 0
    ? manualReview.map((item, index) => `${index + 1}. ${item.field} - ${item.reason}`).join("\n")
    : "No legacy manual-review items listed."}

## Provenance defects inherited from legacy card

${zeroSourceClaims.length > 0
    ? zeroSourceClaims
        .map((claim, index) => `${index + 1}. Zero-source external claim - ${claim.claim_text}`)
        .join("\n")
    : "No zero-source external claims detected."}

${danglingSourceRefs.length > 0
    ? `Dangling source ids: ${danglingSourceRefs.join(", ")}`
    : "No dangling source ids detected."}

## Mandatory v2 research objectives

1. Rebuild atomic claims from scratch; do not trust legacy confidence values.
2. Re-verify all regulated, subsidy, deadline, numeric, and competitor claims with quote-level evidence.
3. Run explicit contradiction search before field synthesis.
4. Demote any under-evidenced field to unknown.
5. Produce a safe dashboard payload only from high-confidence fields.

## Required source tracks

1. Official or regulator sources
2. Licensing / approval / exam body sources where applicable
3. Primary statistical sources for numeric claims
4. Competitor or incumbent provider sources
5. Contradiction-specific searches for exclusions, non-eligibility, or narrower scope

## Post-step audit requirement

After each phase, run the standard self-audit prompt from:
[post-step-self-audit-prompt.md](/Users/sergey/Desktop/educateme-map/docs/research-v2/templates/post-step-self-audit-prompt.md)
`;
}

function renderManualReview(card) {
  const manualReview = card.recommended_manual_review || [];
  const conflicts = card.claim_conflicts || [];
  const blockedFields = [];
  const danglingSourceRefs = getDanglingSourceRefs(card);
  const zeroSourceClaims = getZeroSourceExternalClaims(card);

  if ((card.claim_extraction?.externally_checkable_claims || []).some((item) => item.status === "contradicted")) {
    blockedFields.push("Any field synthesized from contradicted claims");
  }
  if ((card.claim_extraction?.externally_checkable_claims || []).some((item) => !item.source_ids || item.source_ids.length === 0)) {
    blockedFields.push("Claims with zero source ids");
  }
  if ((card.claim_extraction?.internal_claims_unverified || []).length > 0) {
    blockedFields.push("Any internal hypothesis currently shown as if it were fact");
  }
  if (zeroSourceClaims.length > 0) {
    blockedFields.push("Any external claim with zero source ids");
  }
  if (danglingSourceRefs.length > 0) {
    blockedFields.push("Any claim whose source ids do not resolve in the local source ledger");
  }

  return `# Manual Review - ${card.product_code} - ${card.product_title}

## Product

- Code: ${card.product_code}
- Title: ${card.product_title}
- Run id: ${runId}
- Seed status: seeded_from_legacy_card

## Blocking questions

${(card.claim_extraction?.internal_claims_unverified || [])
  .map((item, index) => `${index + 1}. ${item.claim_text}\n   Reason: ${item.reason_unverified}`)
  .join("\n\n") || "1. None listed"}

## Unresolved contradictions

${conflicts
  .map(
    (item, index) =>
      `${index + 1}. [${item.severity}] ${item.claim_text}\n   Problem: ${item.what_is_wrong}\n   Sources: ${(item.source_ids || []).join(", ") || "none"}`
  )
  .join("\n\n") || "1. None listed"}

## Legacy manual review carryover

${manualReview.map((item, index) => `${index + 1}. ${item.field} - ${item.reason}`).join("\n") || "1. None listed"}

## Provenance failures

${zeroSourceClaims.map((claim, index) => `${index + 1}. Zero-source external claim - ${claim.claim_text}`).join("\n") || "1. None listed"}

${danglingSourceRefs.length > 0 ? `Dangling source ids: ${danglingSourceRefs.join(", ")}` : "No dangling source ids detected."}

## Fields demoted to unknown by default

${blockedFields.map((item, index) => `${index + 1}. ${item}`).join("\n") || "1. None listed"}
`;
}

function renderPostStepAudit(card) {
  const statusCounts = getClaimStatusCounts(card);
  const danglingSourceRefs = getDanglingSourceRefs(card);
  const zeroSourceClaims = getZeroSourceExternalClaims(card);

  const before = 65;
  const penalties = [];
  penalties.push("legacy card is not quote-grounded in the current run");
  if (statusCounts.contradicted > 0) penalties.push("contradicted claims remain unresolved");
  if (statusCounts.unverified > 0) penalties.push("unverified claims remain in the seed set");
  if (zeroSourceClaims.length > 0) penalties.push("external claims without source ids remain");
  if (danglingSourceRefs.length > 0) penalties.push("dangling source refs remain");
  const after = Math.max(
    10,
    before -
      12 -
      statusCounts.contradicted * 4 -
      statusCounts.unverified * 2 -
      zeroSourceClaims.length * 2 -
      danglingSourceRefs.length * 3
  );

  return `# Post-Step Audit Seed - ${card.product_code}

## Hard critique

- This artifact is only a seed extracted from the legacy card.
- It does not prove that the current product claims survive v2 verification.
- It inherits the legacy card's contradictions, missing provenance, and mixed evidence/judgment structure.
- No quote ledger exists yet.
- No contradiction search was run in this seed stage.
- No field is safe to publish from this artifact alone.

## Confidence calibration

Confidence: ${before}% -> ${after}% - seeded from legacy synthesis only; quote-level verification and fresh contradiction search have not been executed in this run

## Core-check

- Quality bar met: no
- Gap exists: yes
- Blocking gap: this is a bootstrap artifact, not a verified research result

## Core-auto

- Verified legacy claims: ${statusCounts.verified}
- Partially verified legacy claims: ${statusCounts.partially_verified}
- Unverified legacy claims: ${statusCounts.unverified}
- Contradicted legacy claims: ${statusCounts.contradicted}
- Legacy internal unresolved claims: ${(card.claim_extraction?.internal_claims_unverified || []).length}
- Legacy zero-source external claims: ${zeroSourceClaims.length}
- Dangling source refs: ${danglingSourceRefs.length}

## Core-clean

- A reviewer still would not know which facts are safe for the dashboard without rerunning the full v2 process.
`;
}

function toFieldDecisionSeed(card) {
  const marketScope = card.product_summary?.market_scope || {};
  return {
    run_id: runId,
    product_code: card.product_code,
    field_decisions: [
      {
        field_id: "jurisdiction_scope",
        legacy_value: marketScope.country_scope || [],
        status: "pending_reverification",
        reason: "Legacy scope exists but has not been revalidated under v2 rules.",
      },
      {
        field_id: "target_audience_summary",
        legacy_value: card.product_summary?.target_user || null,
        status: "analyst_only_until_reverified",
        reason: "Target audience phrasing is informative but usually inferential.",
      },
      {
        field_id: "safe_dashboard_fields",
        legacy_value: null,
        status: "blocked_until_v2_claim_verification",
        reason: "No safe dashboard projection should be emitted from a bootstrap seed.",
      },
    ],
  };
}

async function main() {
  const files = (await readdir(CARDS_DIR)).filter((file) => file.endsWith(".json")).sort();
  const generatedAt = new Date().toISOString();
  const manifest = {
    schema_version: "research_v2_seed_run",
    run_id: runId,
    generated_at: generatedAt,
    source_dataset: "src/data/research/cards",
    product_count: files.length,
    products: [],
  };

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const file of files) {
    const raw = await readFile(path.join(CARDS_DIR, file), "utf8");
    const card = JSON.parse(raw);
    const slug = `${card.product_code}_${slugify(card.product_title)}`;
    const productDir = path.join(OUTPUT_DIR, slug);
    const statusCounts = getClaimStatusCounts(card);

    await mkdir(productDir, { recursive: true });

    await writeFile(path.join(productDir, "research-brief.md"), renderBrief(card));
    await writeFile(
      path.join(productDir, "claim-ledger.seed.json"),
      JSON.stringify(
        {
          schema_version: "claim_ledger_seed_v1",
          run_id: runId,
          product_code: card.product_code,
          product_title: card.product_title,
          claims: toClaimSeed(card),
        },
        null,
        2
      ) + "\n"
    );
    await writeFile(
      path.join(productDir, "source-ledger.seed.json"),
      JSON.stringify(
        {
          schema_version: "source_ledger_seed_v1",
          run_id: runId,
          product_code: card.product_code,
          sources: toSourceSeed(card),
        },
        null,
        2
      ) + "\n"
    );
    await writeFile(path.join(productDir, "manual-review.md"), renderManualReview(card));
    await writeFile(path.join(productDir, "post-step-audit.seed.md"), renderPostStepAudit(card));
    await writeFile(
      path.join(productDir, "field-decisions.seed.json"),
      JSON.stringify(toFieldDecisionSeed(card), null, 2) + "\n"
    );

    manifest.products.push({
      product_code: card.product_code,
      product_title: card.product_title,
      folder: path.relative(OUTPUT_DIR, productDir),
      rerun_priority: getPriority(card),
      sources: (card.sources || []).length,
      externally_checkable_claims: (card.claim_extraction?.externally_checkable_claims || []).length,
      verified_claims: statusCounts.verified,
      partially_verified_claims: statusCounts.partially_verified,
      unverified_claims: statusCounts.unverified,
      contradicted_claims: statusCounts.contradicted,
      internal_unresolved_claims: (card.claim_extraction?.internal_claims_unverified || []).length,
      claim_conflicts: (card.claim_conflicts || []).length,
      zero_source_external_claims: getZeroSourceExternalClaims(card).length,
      dangling_source_refs: getDanglingSourceRefs(card).length,
    });
  }

  const summaryLines = [
    `# Research v2 Seed Run - ${runId}`,
    "",
    `Generated at: ${generatedAt}`,
    `Products seeded: ${manifest.product_count}`,
    "",
    "## Product queue",
    "",
    ...manifest.products.map(
      (item, index) =>
      `${index + 1}. ${item.product_code} - ${item.product_title} - ${item.rerun_priority} - ` +
        `verified ${item.verified_claims}/${item.externally_checkable_claims}, contradicted ${item.contradicted_claims}, ` +
        `unverified ${item.unverified_claims}, internal unresolved ${item.internal_unresolved_claims}, ` +
        `zero-source ${item.zero_source_external_claims}, dangling-refs ${item.dangling_source_refs}`
    ),
    "",
    "## Notes",
    "",
    "- These artifacts are seed packs only.",
    "- They inherit legacy contradictions and must not be treated as verified output.",
    "- Use the v2 algorithm and self-audit prompt before promoting any field to dashboard-safe status.",
  ];

  await writeFile(path.join(OUTPUT_DIR, "dataset-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  await writeFile(path.join(OUTPUT_DIR, "run-summary.md"), `${summaryLines.join("\n")}\n`);

  console.log(`Seed run created at ${OUTPUT_DIR}`);
  console.log(`Products: ${manifest.product_count}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
