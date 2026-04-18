#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const runArg = process.argv[2] || "research-runs/2026-04-18-all-24";
const RUN_DIR = path.isAbsolute(runArg) ? runArg : path.join(ROOT, runArg);
const BENCHMARK_DIR = path.join(RUN_DIR, "benchmark");

const STATUS_PRIORITY = {
  contradicted: 0,
  unverified: 1,
  partially_verified: 2,
  verified: 3,
  unclear: 4,
  internal_unverified: 5,
};

const CATEGORY_PRIORITY = {
  mandate: 0,
  licensing: 0,
  accreditation: 0,
  compliance: 0,
  subsidy: 1,
  reimbursement: 1,
  deadline: 1,
  numeric_claim: 2,
  competitor_gap: 2,
  exam: 2,
  recognition: 2,
  other: 3,
};

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function tierRequirementForCategory(category) {
  if (["mandate", "licensing", "accreditation", "subsidy", "reimbursement", "deadline"].includes(category)) {
    return "T1_or_T2_required";
  }
  if (category === "numeric_claim") return "primary_statistical_source_required";
  if (category === "competitor_gap") return "explicit_market_scan_required";
  return "standard_multi_source";
}

function minimumSourceCountForCategory(category) {
  if (["mandate", "licensing", "accreditation", "subsidy", "reimbursement", "deadline"].includes(category)) {
    return 2;
  }
  if (category === "numeric_claim") return 1;
  if (category === "competitor_gap") return 2;
  return 1;
}

function normalizeVerdict(status) {
  if (status === "verified" || status === "partially_verified") return "supported";
  if (status === "contradicted") return "contradicted";
  return "insufficient_evidence";
}

function createTask(productCode, productTitle, claim, sourceCount, artifactStage) {
  const claimId = claim.claim_id || "claim_unknown";
  const category = claim.category || "other";
  const legacyStatus = claim.status || claim.legacy_status || "unknown";
  const expectedVerdict = normalizeVerdict(legacyStatus);
  const sourceIds = Array.isArray(claim.supporting_source_ids) ? claim.supporting_source_ids : claim.source_ids || [];

  return {
    task_id: `${productCode}_${claimId}`,
    product_code: productCode,
    product_title: productTitle,
    task_type: "claim_verification",
    artifact_stage: artifactStage,
    claim_id: claimId,
    claim_category: category,
    claim_text: claim.claim_text || "",
    legacy_status_prior: legacyStatus,
    expected_verdict_seed_prior: expectedVerdict,
    adjudication_required: true,
    source_ids_hint: sourceIds,
    source_count_in_product: sourceCount,
    required_source_tier: tierRequirementForCategory(category),
    minimum_source_count: minimumSourceCountForCategory(category),
    benchmark_prompt:
      `Using only verifiable public sources, determine whether the following claim about product ${productCode} (${productTitle}) is supported, contradicted, or unsupported by current evidence: ` +
      `"${claim.claim_text || ""}". Return a verdict, short reasoning, confidence band, and direct citations with quote text.`,
    response_contract: {
      required_fields: ["task_id", "system_id", "verdict", "answer_text", "confidence_band", "citations"],
      allowed_verdicts: ["supported", "contradicted", "insufficient_evidence"],
      citation_requirements: ["source_id_or_url", "quote_text", "location", "is_official_source"],
    },
    evaluation_axes: [
      "verdict_correctness",
      "citation_precision",
      "quote_grounding",
      "source_tier_compliance",
      "answer_completeness",
      "confidence_calibration",
    ],
    notes:
      "Seed prior is not gold truth. Final quantitative scoring requires independent adjudication before using aggregate metrics.",
  };
}

function rankClaims(claims) {
  return claims
    .slice()
    .sort((left, right) => {
      const leftStatus = STATUS_PRIORITY[left.status || left.legacy_status] ?? 99;
      const rightStatus = STATUS_PRIORITY[right.status || right.legacy_status] ?? 99;
      if (leftStatus !== rightStatus) return leftStatus - rightStatus;

      const leftCategory = CATEGORY_PRIORITY[left.category || left.claim_area] ?? 99;
      const rightCategory = CATEGORY_PRIORITY[right.category || right.claim_area] ?? 99;
      if (leftCategory !== rightCategory) return leftCategory - rightCategory;

      return String(left.claim_id || "").localeCompare(String(right.claim_id || ""));
    });
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function loadProductArtifacts(productDir) {
  const finalClaimPath = path.join(productDir, "claim-ledger.json");
  const seedClaimPath = path.join(productDir, "claim-ledger.seed.json");
  const finalSourcePath = path.join(productDir, "source-ledger.json");
  const seedSourcePath = path.join(productDir, "source-ledger.seed.json");

  let claimDoc = null;
  let artifactStage = "seed";
  try {
    claimDoc = await readJson(finalClaimPath);
    artifactStage = "final";
  } catch {
    claimDoc = await readJson(seedClaimPath);
  }

  let sourceDoc = null;
  try {
    sourceDoc = await readJson(finalSourcePath);
  } catch {
    sourceDoc = await readJson(seedSourcePath);
  }

  return {
    artifactStage,
    claims: Array.isArray(claimDoc?.claims) ? claimDoc.claims : [],
    sourceCount: Array.isArray(sourceDoc?.sources) ? sourceDoc.sources.length : 0,
    productCode: claimDoc?.product_code || path.basename(productDir).split("_")[0],
    productTitle: claimDoc?.product_title || path.basename(productDir),
  };
}

async function main() {
  await mkdir(BENCHMARK_DIR, { recursive: true });

  const entries = await readdir(RUN_DIR, { withFileTypes: true });
  const productDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== "benchmark")
    .map((entry) => path.join(RUN_DIR, entry.name))
    .sort();

  const tasks = [];
  const perProductLimit = 4;

  for (const productDir of productDirs) {
    const { artifactStage, claims, sourceCount, productCode, productTitle } = await loadProductArtifacts(productDir);
    const ranked = rankClaims(claims);
    for (const claim of ranked.slice(0, perProductLimit)) {
      tasks.push(createTask(productCode, productTitle, claim, sourceCount, artifactStage));
    }
  }

  const manifest = {
    schema_version: "research_v2_benchmark_manifest_v1",
    run_id: path.basename(RUN_DIR),
    generated_at: new Date().toISOString(),
    task_count: tasks.length,
    products: productDirs.length,
    task_type_breakdown: {
      claim_verification: tasks.length,
    },
    status_breakdown: tasks.reduce((acc, task) => {
      const key = task.legacy_status_prior || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  };

  const tasksJsonPath = path.join(BENCHMARK_DIR, "tasks.json");
  const tasksJsonlPath = path.join(BENCHMARK_DIR, "tasks.jsonl");
  const manifestPath = path.join(BENCHMARK_DIR, "benchmark-manifest.json");
  const responsesTemplatePath = path.join(BENCHMARK_DIR, "responses.template.jsonl");
  const adjudicationTemplatePath = path.join(BENCHMARK_DIR, "adjudication.template.csv");
  const readmePath = path.join(BENCHMARK_DIR, "README.md");

  const responseTemplate = {
    task_id: tasks[0]?.task_id || "A1_ext_001",
    system_id: "system_under_test",
    verdict: "supported",
    answer_text: "Short answer grounded in cited evidence.",
    confidence_band: "medium",
    citations: [
      {
        source_id_or_url: tasks[0]?.source_ids_hint?.[0] || "https://example.com/source",
        quote_text: "Exact supporting quote or exact structured fact.",
        location: "page / section / anchor",
        is_official_source: true,
      },
    ],
  };

  const adjudicationHeaders = [
    "task_id",
    "product_code",
    "system_id",
    "verdict_correct_0_1",
    "citation_precision_0_1",
    "quote_grounding_0_1",
    "source_tier_ok_0_1",
    "answer_complete_0_1",
    "confidence_calibration_0_1",
    "notes",
  ];

  const adjudicationRows = [
    adjudicationHeaders,
    ...tasks.map((task) => [
      task.task_id,
      task.product_code,
      "system_under_test",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]),
  ];

  const readme = `# Benchmark Package - ${manifest.run_id}

- Tasks: ${manifest.task_count}
- Products covered: ${manifest.products}
- Build time: ${manifest.generated_at}

## Files

- \`benchmark-manifest.json\`
- \`tasks.json\`
- \`tasks.jsonl\`
- \`responses.template.jsonl\`
- \`adjudication.template.csv\`

## How to use

1. Give \`tasks.jsonl\` and the response contract to the system under test.
2. Collect raw responses in JSONL format.
3. Fill \`adjudication.template.csv\` after independent review.
4. Run:

\`\`\`bash
npm run research:v2:score-benchmark
\`\`\`

The scorer will report structural coverage immediately. Accuracy-style metrics only become meaningful after adjudication rows are filled.
`;

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(tasksJsonPath, `${JSON.stringify({ tasks }, null, 2)}\n`);
  await writeFile(tasksJsonlPath, `${tasks.map((task) => JSON.stringify(task)).join("\n")}\n`);
  await writeFile(responsesTemplatePath, `${JSON.stringify(responseTemplate)}\n`);
  await writeFile(
    adjudicationTemplatePath,
    `${adjudicationRows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`
  );
  await writeFile(readmePath, `${readme}\n`);

  console.log(`Benchmark manifest written to ${manifestPath}`);
  console.log(`Benchmark tasks written to ${tasksJsonPath}`);
  console.log(`Benchmark tasks JSONL written to ${tasksJsonlPath}`);
  console.log(`Adjudication template written to ${adjudicationTemplatePath}`);
  console.log(`Response template written to ${responsesTemplatePath}`);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
