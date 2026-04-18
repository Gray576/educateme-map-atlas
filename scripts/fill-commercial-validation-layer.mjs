#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);
const CARDS_DIR = path.join(ROOT, "src/data/research/cards");
const PRODUCTS_PATH = path.join(ROOT, "src/data/products.ts");

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readJsonMaybe(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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
      return {
        code: code.split("·")[0].trim(),
        title,
        market,
        model,
        price,
        revenue,
      };
    })
    .filter((item) => item.code && item.title);
}

function quadrantSegment(model) {
  const normalized = String(model || "").replace(/\s+/g, "");
  const hasB2B = normalized.includes("B2B");
  const hasB2C = normalized.includes("B2C");
  if (hasB2B && hasB2C) return "B2B2C";
  if (hasB2B) return "B2B";
  if (hasB2C) return "B2C";
  return "unknown";
}

function parsePricePoint(price) {
  const numbers = [...String(price || "").matchAll(/[\d,]+/g)]
    .map((match) => Number(match[0].replace(/,/g, "")))
    .filter(Number.isFinite);
  if (numbers.length === 0) return "unknown";
  const midpoint = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  if (midpoint < 500) return "low-ticket";
  if (midpoint < 1500) return "mid-ticket";
  if (midpoint < 5000) return "workshop-ticket";
  return "enterprise-ticket";
}

function inferDeliveryMode(title, card) {
  const text = `${title} ${card?.product_summary?.one_sentence_summary || ""}`.toLowerCase();
  if (text.includes("licens")) return "licensing";
  if (text.includes("platform")) return "platform";
  if (text.includes("embedded")) return "embedded training";
  if (text.includes("onboarding")) return "program";
  if (text.includes("bundle")) return "bundle";
  if (text.includes("audit")) return "audit / assessment";
  if (text.includes("prep") || text.includes("preparation")) return "prep course";
  if (text.includes("program")) return "program";
  if (text.includes("workshop") || text.includes("day")) return "workshop";
  return "training";
}

function inferPersona(card) {
  const target = card?.product_summary?.target_user || "";
  const buyerType = card?.buyer_analysis?.primary_buyer_type?.value || "";
  if (buyerType) return buyerType;
  return target.length > 120 ? `${target.slice(0, 117)}...` : target || "unknown";
}

function inferNiche(title, card) {
  const claimAreas = (card?.claim_extraction?.externally_checkable_claims || [])
    .map((claim) => claim.claim_area)
    .filter(Boolean);
  const dominantArea = claimAreas[0];
  return dominantArea ? `${title} / ${dominantArea}` : title;
}

function collectClaims(card, predicate) {
  return (card?.claim_extraction?.externally_checkable_claims || []).filter(predicate);
}

function collectClaimIdsByAreas(card, areas) {
  return (card?.claim_extraction?.externally_checkable_claims || [])
    .map((claim, index) => ({ claim, index }))
    .filter(({ claim }) => areas.has(claim.claim_area))
    .map(({ claim, index }) => claim.claim_id || `ext_${String(index + 1).padStart(3, "0")}`);
}

function collectSourceIdsByAreas(card, areas) {
  return [
    ...new Set(
      collectClaims(card, (claim) => areas.has(claim.claim_area))
        .flatMap((claim) => claim.source_ids || [])
        .filter(Boolean)
    ),
  ];
}

function regulatoryComplexity(card) {
  const regulatoryAreas = new Set([
    "mandate",
    "licensing",
    "accreditation",
    "subsidy",
    "reimbursement",
    "deadline",
    "exam",
    "recognition",
  ]);
  const relevantClaims = collectClaims(card, (claim) => regulatoryAreas.has(claim.claim_area));
  const confirmedRequirements = (card?.external_research?.regulatory_requirements || []).filter(
    (item) => item.status === "confirmed"
  ).length;
  const approvalRoutes = (card?.external_research?.approval_entities || []).length;
  const highRiskFlags = Object.values(card?.risk_map || {}).filter(
    (risk) => isRecord(risk) && risk.status === "present" && risk.severity === "high"
  ).length;
  return {
    relevantClaims,
    confirmedRequirements,
    approvalRoutes,
    highRiskFlags,
  };
}

function deriveRegulatoryFrictionScore(card) {
  const complexity = regulatoryComplexity(card);
  let score = 5;

  if (complexity.relevantClaims.length > 0) score = 3;
  if (complexity.confirmedRequirements >= 2) score = 2;
  if (complexity.approvalRoutes > 0) score = Math.min(score, 2);
  if (complexity.approvalRoutes > 0 && complexity.relevantClaims.length >= 2) score = 1;
  if (complexity.highRiskFlags >= 3) score = Math.min(score, 2);

  const notes = [];
  if (complexity.confirmedRequirements > 0) {
    notes.push(`${complexity.confirmedRequirements} confirmed regulatory requirements in current card`);
  }
  if (complexity.approvalRoutes > 0) {
    notes.push(`${complexity.approvalRoutes} approval or accepted-provider routes already shape delivery claims`);
  }
  if (complexity.highRiskFlags > 0) {
    notes.push(`${complexity.highRiskFlags} high-severity risk flags remain in the current card`);
  }

  return {
    score,
    notes: notes.join("; ") || "No confirmed approval-route friction detected in current evidence.",
  };
}

function deriveRetentionScore(title, card) {
  const deliveryMode = inferDeliveryMode(title, card);
  if (["platform", "embedded training", "licensing"].includes(deliveryMode)) return 4;
  if (["program", "bundle"].includes(deliveryMode)) return 3;
  if (["prep course", "training"].includes(deliveryMode)) return 2;
  if (deliveryMode === "audit / assessment") return 2;
  if (deliveryMode === "workshop") return 1;
  return 2;
}

function deriveValidationModel(segment, title, card) {
  const buyerType = card?.buyer_analysis?.primary_buyer_type?.value || "";
  const complexity = regulatoryComplexity(card);
  const partnerMotion = buyerType === "partner" || /licens|embedded|bundle/i.test(title);
  const regulatedMotion = complexity.confirmedRequirements > 0 || complexity.approvalRoutes > 0;

  if (segment === "B2C") {
    return {
      validation_model: "Landing page + pre-sale + 10 customer interviews + 1 paid cohort test",
      binary_pass_signal:
        "At least 5 qualified leads reach checkout or paid deposit intent and at least 2 commit within the test window.",
      binary_kill_signal:
        "Paid traffic and outreach fail to produce at least 2 qualified checkout or deposit signals in the test window.",
      partnerMotion,
      regulatedMotion,
    };
  }

  if (partnerMotion && regulatedMotion) {
    return {
      validation_model: "10 custdev interviews + 3 partner-route calls + 2 pilot asks + route validation",
      binary_pass_signal:
        "At least 2 qualified buyers accept a paid or structured pilot conversation and 1 credible partner or route owner agrees to proceed.",
      binary_kill_signal:
        "No qualified buyer accepts a pilot conversation and no credible partner or route owner agrees to proceed.",
      partnerMotion,
      regulatedMotion,
    };
  }

  if (regulatedMotion) {
    return {
      validation_model: "10 custdev interviews + 2 pilot asks + authority-route validation",
      binary_pass_signal:
        "At least 2 qualified buyers accept a paid or structured pilot conversation and the required route or authority constraint appears workable.",
      binary_kill_signal:
        "No qualified buyer accepts a pilot conversation or the required route constraint blocks delivery economics.",
      partnerMotion,
      regulatedMotion,
    };
  }

  if (partnerMotion) {
    return {
      validation_model: "10 custdev interviews + 5 partner calls + 1 paid pilot ask",
      binary_pass_signal:
        "At least 1 credible partner agrees to pilot or license discussions and 1 buyer accepts a structured commercial next step.",
      binary_kill_signal:
        "No partner accepts follow-up and no buyer agrees to a structured next step.",
      partnerMotion,
      regulatedMotion,
    };
  }

  return {
    validation_model: "10 custdev interviews + 2 pilot asks + 1 paid pilot proposal",
    binary_pass_signal:
      "At least 2 qualified buyers accept a paid or structured pilot conversation within the test window.",
    binary_kill_signal:
      "No qualified buyer accepts a pilot conversation or pilot proposal within the test window.",
    partnerMotion,
    regulatedMotion,
  };
}

function deriveTestability(segment, card, modelInfo) {
  let score = segment === "B2C" ? 4 : segment === "B2B2C" ? 3 : 3;
  if (modelInfo.partnerMotion) score -= 1;
  if (modelInfo.regulatedMotion) score -= 1;
  if ((card?.recommended_manual_review || []).length >= 3) score -= 1;
  return clamp(score, 1, 5);
}

function deriveTimeToFirstEuroScore(segment, modelInfo) {
  let score = segment === "B2C" ? 4 : segment === "B2B2C" ? 3 : 3;
  if (modelInfo.partnerMotion) score -= 1;
  if (modelInfo.regulatedMotion) score -= 1;
  return clamp(score, 1, 5);
}

function scoreToDays(score) {
  return {
    5: 10,
    4: 14,
    3: 30,
    2: 45,
    1: 60,
  }[score] || null;
}

function deriveCostToSignal(segment, modelInfo, testabilityScore) {
  let cost = segment === "B2C" ? 1200 : segment === "B2B2C" ? 2200 : 3000;
  if (modelInfo.partnerMotion) cost += 800;
  if (modelInfo.regulatedMotion) cost += 800;
  if (testabilityScore <= 2) cost += 500;
  return Math.round(cost / 100) * 100;
}

function keywordize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+ ]+/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function buildKeywordBuckets(title, card, product) {
  const headTerms = [];
  const commercial = [];
  const problem = [];
  const competitorRoute = [];

  const lowerTitle = title.toLowerCase();
  headTerms.push(title, `${title} ${product.market}`);

  if (lowerTitle.includes("ai")) {
    commercial.push("ai training", "ai workshop", "ai course");
    problem.push("ai literacy compliance", "ai act training");
  }
  if (lowerTitle.includes("mifid")) {
    commercial.push("mifid training", "mifid certification");
    problem.push("cssf training", "mifid compliance training");
  }
  if (lowerTitle.includes("oet")) {
    commercial.push("oet preparation course", "oet prep");
    problem.push("nursing oet preparation", "doctor oet preparation");
  }
  if (lowerTitle.includes("luxembourgish") || lowerTitle.includes("sproochtest")) {
    commercial.push("luxembourgish course", "sproochtest preparation");
    problem.push("luxembourg language exam", "luxembourg integration language");
  }
  if (lowerTitle.includes("french") || lowerTitle.includes("german")) {
    commercial.push("business language training", "professional language course");
    problem.push("workplace language training", "sector language course");
  }
  if (lowerTitle.includes("licens")) {
    commercial.push("white label curriculum", "course licensing");
    problem.push("language curriculum license", "training content license");
  }

  const competitors = card?.external_research?.competitors_or_substitutes || [];
  const approval = card?.external_research?.approval_entities || [];
  for (const item of [...competitors, ...approval].slice(0, 4)) {
    competitorRoute.push(item.name);
  }

  return {
    head_terms: unique(headTerms).slice(0, 6),
    commercial_modifiers: unique([...commercial, "luxembourg", product.model.toLowerCase()]).slice(0, 6),
    problem_intent: unique([...problem, keywordize(card?.product_summary?.core_pain).slice(0, 4).join(" ")]).filter(Boolean).slice(0, 6),
    competitor_route: unique(competitorRoute).slice(0, 6),
  };
}

function confidenceFromReports(validationItem, citationItem, base = "medium") {
  if (citationItem?.status === "invalid") return "low";
  if ((validationItem?.warnings || 0) > 0 || citationItem?.status === "seed_only") {
    return base === "medium" ? "medium" : "low";
  }
  return base;
}

function averageAvailable(values) {
  const usable = values.filter((value) => typeof value === "number");
  if (usable.length === 0) return null;
  return Number((usable.reduce((sum, value) => sum + value, 0) / usable.length).toFixed(2));
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function main() {
  const productsSource = await readFile(PRODUCTS_PATH, "utf8");
  const products = parseProductsTs(productsSource);
  const productMap = new Map(products.map((product) => [product.code, product]));
  const runEntries = await readdir(RUN_DIR, { withFileTypes: true });
  const runProductFolders = runEntries
    .filter((entry) => entry.isDirectory() && entry.name !== "benchmark")
    .map((entry) => entry.name)
    .sort();
  const runFolderByProductCode = new Map();
  for (const folderName of runProductFolders) {
    const productCode = folderName.split("_")[0];
    if (!runFolderByProductCode.has(productCode)) {
      runFolderByProductCode.set(productCode, folderName);
    }
  }

  const validationReport = await readJsonMaybe(path.join(RUN_DIR, "validation-report.json"));
  const citationReport = await readJsonMaybe(path.join(RUN_DIR, "citation-verification-report.json"));

  const validationByFolder = new Map(
    (validationReport?.product_reports || []).map((item) => [item.productFolder, item])
  );
  const validationByProductCode = new Map(
    [...validationByFolder.entries()].map(([folder, item]) => [folder.split("_")[0], item])
  );
  const validationQueueByFolder = new Map(
    (validationReport?.rerun_queue || []).map((item) => [item.productFolder, item])
  );
  const validationQueueByProductCode = new Map(
    [...validationQueueByFolder.entries()].map(([folder, item]) => [folder.split("_")[0], item])
  );
  const citationByFolder = new Map(
    (citationReport?.product_reports || []).map((item) => [item.productFolder, item])
  );
  const citationByProductCode = new Map(
    [...citationByFolder.entries()].map(([folder, item]) => [folder.split("_")[0], item])
  );

  const cardFiles = (await readdir(CARDS_DIR)).filter((file) => file.endsWith(".json")).sort();
  const overviewRows = [];

  for (const fileName of cardFiles) {
    const card = await readJson(path.join(CARDS_DIR, fileName));
    const product = productMap.get(card.product_code);
    if (!product) continue;

    const productDirName =
      runFolderByProductCode.get(card.product_code) || fileName.replace(/\.json$/, "");
    const outputDir = path.join(RUN_DIR, productDirName);
    await mkdir(outputDir, { recursive: true });

    const validationItem =
      validationQueueByFolder.get(productDirName) ||
      validationQueueByProductCode.get(card.product_code) ||
      validationByFolder.get(productDirName) ||
      validationByProductCode.get(card.product_code) ||
      null;
    const citationItem =
      citationByFolder.get(productDirName) ||
      citationByProductCode.get(card.product_code) ||
      null;
    const dashboardDoc = await readJsonMaybe(path.join(outputDir, "dashboard-ingestion.json"));
    const safeFieldCount = dashboardDoc?.safe_fields && typeof dashboardDoc.safe_fields === "object"
      ? Object.keys(dashboardDoc.safe_fields).length
      : 0;
    const dashboardReleaseStatus = dashboardDoc?.release_status || "";

    const segment = quadrantSegment(product.model);
    const modelInfo = deriveValidationModel(segment, product.title, card);
    const testabilityScore = deriveTestability(segment, card, modelInfo);
    const timeToFirstEuroScore = deriveTimeToFirstEuroScore(segment, modelInfo);
    const retentionScore = deriveRetentionScore(product.title, card);
    const regulatory = deriveRegulatoryFrictionScore(card);
    const keywordBuckets = buildKeywordBuckets(product.title, card, product);
    const validationEvidenceAreas = new Set(["mandate", "licensing", "accreditation", "subsidy", "deadline"]);
    const demandEvidenceAreas = new Set(["numeric_claim", "competitor_gap"]);

    const validationSourceIds = collectSourceIdsByAreas(card, validationEvidenceAreas);
    const validationClaimIds = collectClaimIdsByAreas(card, validationEvidenceAreas);
    const demandSourceIds = collectSourceIdsByAreas(card, demandEvidenceAreas);
    const demandClaimIds = collectClaimIdsByAreas(card, demandEvidenceAreas);

    const validationConfidence = confidenceFromReports(validationItem, citationItem, "medium");
    const demandConfidence = "low";
    const regulatoryConfidence = confidenceFromReports(validationItem, citationItem, "medium");

    const commercialValidation = {
      schema_version: "commercial_validation_v1",
      run_id: path.basename(RUN_DIR),
      product_code: card.product_code,
      product_title: card.product_title,
      quadrant_segment: segment,
      validation_velocity: {
        validation_model: modelInfo.validation_model,
        binary_pass_signal: modelInfo.binary_pass_signal,
        binary_kill_signal: modelInfo.binary_kill_signal,
        estimated_cost_to_signal_eur: deriveCostToSignal(segment, modelInfo, testabilityScore),
        estimated_days_to_signal: scoreToDays(testabilityScore),
        estimated_days_to_first_euro: scoreToDays(timeToFirstEuroScore),
        founder_independence_score_1_5: null,
        testability_score_1_5: testabilityScore,
        time_to_first_euro_score_1_5: timeToFirstEuroScore,
        confidence_band: validationConfidence,
        derivation_basis:
          "Protocol-derived from segment, approval-route complexity, buyer motion, and current validation/citation gaps.",
        evidence_refs: {
          source_ids: validationSourceIds,
          claim_ids: validationClaimIds,
        },
        notes: [
          validationItem ? `validation queue severity ${validationItem.severityScore || 0}` : null,
          citationItem ? `citation status ${citationItem.status}` : "citation verifier not run yet",
          modelInfo.partnerMotion ? "partner motion present" : null,
          modelInfo.regulatedMotion ? "regulatory route present" : null,
        ]
          .filter(Boolean)
          .join("; "),
      },
      demand_pull: {
        demand_evidence_score_1_5: null,
        wtp_score_1_5: null,
        cac_reality_score_1_5: null,
        retention_structure_score_1_5: retentionScore,
        macro_trajectory_score_1_5: null,
        channel_fit_score_1_5: null,
        confidence_band: demandConfidence,
        derivation_basis:
          "Only offer structure and currently sourced competitor/numeric claims are available. SEMrush, paid search, and traffic observables are intentionally missing.",
        evidence_refs: {
          source_ids: demandSourceIds,
          claim_ids: demandClaimIds,
        },
        notes:
          "Retention structure is filled from the product format. Demand, WTP, CAC, macro, and channel-fit remain unfilled until SEMrush and distribution evidence are collected.",
      },
      regulatory_context: {
        regulatory_friction_inverse_score_1_5: regulatory.score,
        confidence_band: regulatoryConfidence,
        derivation_basis:
          "Derived from confirmed regulatory requirements, approval entities, and current contradiction/risk density in the evidence-backed card.",
        evidence_refs: {
          source_ids: validationSourceIds,
          claim_ids: validationClaimIds,
        },
        notes: regulatory.notes,
      },
      semrush_snapshot: {
        market: product.market,
        database: "",
        language: "",
        keyword_buckets: keywordBuckets,
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
      },
      portfolio_tags: {
        niche: inferNiche(product.title, card),
        persona: inferPersona(card),
        channel_primary: "",
        channel_secondary: "",
        price_point: parsePricePoint(product.price),
        delivery_mode: inferDeliveryMode(product.title, card),
      },
      collapsed_scores: {
        validation_velocity_composite: averageAvailable([
          testabilityScore,
          timeToFirstEuroScore,
        ]),
        demand_pull_composite: null,
        overall_confidence_band: "low",
        confidence_reason:
          "Validation velocity is partially populated, but founder-independence, demand observables, and SEMrush-backed pull metrics are still missing.",
      },
    };

    const outputPath = path.join(outputDir, "commercial-validation.json");
    await writeFile(outputPath, `${JSON.stringify(commercialValidation, null, 2)}\n`);

    overviewRows.push([
      card.product_code,
      card.product_title,
      segment,
      commercialValidation.validation_velocity.testability_score_1_5,
      commercialValidation.validation_velocity.time_to_first_euro_score_1_5,
      commercialValidation.regulatory_context.regulatory_friction_inverse_score_1_5,
      commercialValidation.demand_pull.retention_structure_score_1_5,
      commercialValidation.validation_velocity.estimated_cost_to_signal_eur,
      commercialValidation.validation_velocity.estimated_days_to_signal,
      commercialValidation.validation_velocity.confidence_band,
      commercialValidation.demand_pull.confidence_band,
      commercialValidation.regulatory_context.confidence_band,
      validationItem?.severityScore || "",
      citationItem?.status || "",
      dashboardReleaseStatus,
      safeFieldCount,
      outputPath,
    ]);
  }

  const csvHeaders = [
    "product_code",
    "product_title",
    "quadrant_segment",
    "testability_score_1_5",
    "time_to_first_euro_score_1_5",
    "regulatory_friction_inverse_score_1_5",
    "retention_structure_score_1_5",
    "estimated_cost_to_signal_eur",
    "estimated_days_to_signal",
    "validation_confidence_band",
    "demand_confidence_band",
    "regulatory_confidence_band",
    "validation_severity_seed",
    "citation_status",
    "dashboard_release_status",
    "safe_field_count",
    "artifact_path",
  ];

  const overviewCsvPath = path.join(RUN_DIR, "commercial-validation-overview.csv");
  const summaryPath = path.join(RUN_DIR, "commercial-validation-summary.md");

  await writeFile(
    overviewCsvPath,
    `${[csvHeaders, ...overviewRows].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`
  );

  const summaryLines = [
    `# Commercial Validation Summary - ${path.basename(RUN_DIR)}`,
    "",
    "## What is filled now",
    "",
    "- quadrant segment",
    "- validation model and binary pass/kill signal",
    "- estimated cost and time to signal",
    "- testability score",
    "- time-to-first-euro score",
    "- retention structure score",
    "- regulatory friction inverse score",
    "- keyword buckets for later SEMrush collection",
    "",
    "## What is intentionally still blank",
    "",
    "- SEMrush metrics",
    "- demand evidence score",
    "- willingness to pay score",
    "- CAC reality score",
    "- macro trajectory score",
    "- channel fit score",
    "- founder-independence score",
    "",
    "## Reason",
    "",
    "Those fields either require SEMrush, real channel data, or internal operating evidence that is not source-backed yet. They were left null on purpose.",
    "",
    "## Aggregate",
    "",
    `- Products written: ${overviewRows.length}`,
    `- Output CSV: ${overviewCsvPath}`,
    "",
    "## Notes",
    "",
    "- `commercial-validation.json` was written under each product folder.",
    "- Confidence was lowered automatically when validation or citation reports already show unresolved structural problems.",
  ];

  await writeFile(summaryPath, `${summaryLines.join("\n")}\n`);

  console.log(`Commercial validation overview written to ${overviewCsvPath}`);
  console.log(`Commercial validation summary written to ${summaryPath}`);
  console.log(`Products written: ${overviewRows.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
