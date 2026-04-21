import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { validateResearchCard } from "@/data/research/validate-card";
import { loadResearchCards } from "@/data/research/load-cards";
import type {
  ApprovalEntityType,
  ArchetypeAssignment,
  BudgetOwner,
  BuyerInfluencer,
  BuyerType,
  ClaimArea,
  ClaimStatus,
  CommercialValidationIndependentOperatorSummaryV1,
  CompetitorType,
  ConfidenceBand,
  DependencyType,
  FundingBodyType,
  FundingRelevance,
  LegalClaimSeverity,
  MarketRegulatoryContext,
  OperatorDifficulty,
  OperatorMatrixEntry,
  ProofBurden,
  ProofType,
  ReleaseStatus,
  DataFieldEntry,
  ResearchCard,
  ResearchCardNormalizationOverlay,
  RequirementStatus,
  RiskSeverity,
  RiskStatus,
  SourceType,
  SubsidyEligibilityStatus,
  SubsidyExists,
  V2Claim,
  V2Source,
  VarianceRisk,
} from "@/types";

const RESEARCH_RUNS_DIR = path.join(process.cwd(), "research-runs");
const VALIDATION_SUMMARY_FILE = "citation-verification-summary.md";

type DashboardFieldRecord = {
  value: unknown;
  confidence_band: ConfidenceBand;
  claim_refs?: string[];
  source_refs?: string[];
  last_verified_at?: string;
  omission_reason?: string;
};

type DashboardDoc = {
  schema_version: "dashboard_ingestion_v2";
  run_id: string;
  product_code: string;
  product_title: string;
  reviewed_at: string;
  release_status: ReleaseStatus;
  safe_fields: Record<string, DashboardFieldRecord>;
  analyst_only_fields?: Record<string, DashboardFieldRecord>;
  blocked_fields?: Record<string, DashboardFieldRecord>;
  verification_summary?: {
    verified_claim_count?: number;
    contradicted_claim_count?: number;
    blocked_question_count?: number;
  };
};

type ClaimLedgerDoc = {
  schema_version: string;
  run_id: string;
  product_code: string;
  product_title: string;
  analysis_timestamp: string;
  jurisdictions?: string[];
  claims: Array<
    V2Claim & {
      origin?: string;
      confidence_band?: ConfidenceBand | "unknown";
      notes?: string;
    }
  >;
};

type ContradictionIssue = {
  claim_id: string;
  claim_text: string;
  status?: string;
  issue_type?: string;
  resolution?: string;
  notes?: string;
  why_it_matters?: string;
  contradicting_source_ids?: string[];
};

type ContradictionLogDoc = {
  contradictions?: Array<
    ContradictionIssue & {
      contradiction_id?: string;
      contradicting_quote_ids?: string[];
    }
  >;
  open_issues?: ContradictionIssue[];
  summary?: {
    contradicted_count?: number;
    open_issue_count?: number;
    verified_claim_count?: number;
    unverified_claim_count?: number;
    unclear_claim_count?: number;
    checked_claim_count?: number;
  };
};

type CommercialValidationDoc = {
  quadrant_segment?: "B2B" | "B2C" | "B2B2C" | "mixed" | "unknown";
  validation_velocity?: {
    validation_model?: string;
    estimated_cost_to_signal_eur?: number | null;
    estimated_days_to_signal?: number | null;
    founder_independence_score_1_5?: number | null;
    testability_score_1_5?: number | null;
    time_to_first_euro_score_1_5?: number | null;
    confidence_band?: ConfidenceBand | "unknown";
  };
  demand_pull?: {
    demand_evidence_score_1_5?: number | null;
    wtp_score_1_5?: number | null;
    cac_reality_score_1_5?: number | null;
    retention_structure_score_1_5?: number | null;
    macro_trajectory_score_1_5?: number | null;
    channel_fit_score_1_5?: number | null;
    confidence_band?: ConfidenceBand | "unknown";
  };
  regulatory_context?: {
    regulatory_friction_inverse_score_1_5?: number | null;
  };
  collapsed_scores?: {
    validation_velocity_composite?: number | null;
    demand_pull_composite?: number | null;
    overall_confidence_band?: ConfidenceBand | "unknown";
  };
};

type V2DashboardLoadedCard = {
  card: ResearchCard;
  overlay: ResearchCardNormalizationOverlay;
};

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function readJsonMaybe<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

async function readJsonlMaybe<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function humanizeFieldKey(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFieldValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatFieldValue(item)).join(", ");
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entryValue]) => `${humanizeFieldKey(key)}: ${formatFieldValue(entryValue)}`)
      .join(" · ");
  }
  return String(value);
}

function confidenceToNumber(value: ConfidenceBand | "unknown" | undefined) {
  switch (value) {
    case "high":
      return 0.9;
    case "medium":
      return 0.72;
    case "low":
      return 0.46;
    case "blocked":
      return 0.18;
    default:
      return 0.4;
  }
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeOperatorClassification(value: unknown) {
  const normalized = value === "independent_operator" ||
    value === "private_school_or_academy" ||
    value === "official_or_institutional" ||
    value === "marketplace_or_directory" ||
    value === "social_community_only" ||
    value === "content_only" ||
    value === "unknown"
    ? value
    : "unknown";
  return normalized as CommercialValidationIndependentOperatorSummaryV1["independent_operator_examples"][number]["classification"];
}

function normalizeQuadrantSegment(value: unknown) {
  const normalized =
    value === "B2B" || value === "B2C" || value === "B2B2C" || value === "mixed"
      ? value
      : "unknown";
  return normalized as NonNullable<
    CommercialValidationIndependentOperatorSummaryV1["segment_weighting"]
  >["quadrant_segment"];
}

function normalizeRelevanceLevel(value: unknown, fallback: "low" | "medium" | "high") {
  const normalized = value === "low" || value === "medium" || value === "high" ? value : fallback;
  return normalized as NonNullable<
    CommercialValidationIndependentOperatorSummaryV1["segment_weighting"]
  >["operator_signal_relevance"];
}

function parseIndependentOperatorSummary(
  value: unknown
): CommercialValidationIndependentOperatorSummaryV1 | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  const signal =
    record.signal === "none" ||
    record.signal === "weak" ||
    record.signal === "medium" ||
    record.signal === "strong"
      ? record.signal
      : null;

  if (!signal) return null;

  const examples = Array.isArray(record.independent_operator_examples)
    ? record.independent_operator_examples
        .filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === "object" && !Array.isArray(item)
        )
        .map((item) => ({
          name: asString(item.name) ?? "Unknown",
          classification: normalizeOperatorClassification(item.classification),
          evidence: asString(item.evidence) ?? "",
        }))
        .filter((item) => item.evidence.length > 0)
    : [];

  return {
    signal,
    independent_operator_examples: examples,
    operator_types_seen: asArray(record.operator_types_seen),
    supporting_queries: asArray(record.supporting_queries),
    pricing_or_offer_proof: asArray(record.pricing_or_offer_proof),
    social_funnel_signal: asString(record.social_funnel_signal) ?? "",
    segment_weighting:
      record.segment_weighting && typeof record.segment_weighting === "object"
        ? {
            quadrant_segment:
              normalizeQuadrantSegment(
                (record.segment_weighting as Record<string, unknown>).quadrant_segment
              ),
            operator_signal_relevance:
              normalizeRelevanceLevel(
                (record.segment_weighting as Record<string, unknown>).operator_signal_relevance,
                "medium"
              ),
            social_funnel_relevance:
              normalizeRelevanceLevel(
                (record.segment_weighting as Record<string, unknown>).social_funnel_relevance,
                "low"
              ),
            weighted_score_1_5:
              typeof (record.segment_weighting as Record<string, unknown>).weighted_score_1_5 ===
              "number"
                ? Number(
                    (record.segment_weighting as Record<string, unknown>).weighted_score_1_5
                  )
                : null,
            score_adjustment:
              typeof (record.segment_weighting as Record<string, unknown>).score_adjustment ===
              "number"
                ? Number((record.segment_weighting as Record<string, unknown>).score_adjustment)
                : null,
            rationale:
              asString((record.segment_weighting as Record<string, unknown>).rationale) ?? "",
          }
        : null,
    takeaway: asString(record.takeaway) ?? "",
    why_not_stronger: asString(record.why_not_stronger) ?? "",
    synced_at: asString(record.synced_at) ?? "",
  };
}

function mapV2SourceType(value: string): SourceType {
  if (value.includes("regulator")) return "regulator";
  if (value.includes("government") || value.includes("official")) return "government";
  if (value.includes("exam")) return "exam_body";
  if (value.includes("company")) return "company";
  return "other";
}

function mapReliability(authorityTier: string) {
  if (authorityTier === "T1" || authorityTier === "T2") return "high" as const;
  if (authorityTier === "T3") return "medium" as const;
  return "low" as const;
}

function mapClaimCategory(category: string): ClaimArea {
  switch (category) {
    case "exam":
      return "exam";
    case "recognition":
      return "recognition";
    case "competitor":
    case "competitor_gap":
      return "competitor_gap";
    case "numeric_claim":
      return "numeric_claim";
    case "deadline":
      return "deadline";
    case "licensing":
      return "licensing";
    case "accreditation":
      return "accreditation";
    case "subsidy":
      return "subsidy";
    case "mandate":
      return "mandate";
    case "regulatory_requirement":
    case "compliance":
      return "compliance";
    default:
      return "other";
  }
}

function mapClaimStatus(status: string): ClaimStatus {
  switch (status) {
    case "verified":
      return "verified";
    case "partially_verified":
      return "partially_verified";
    case "contradicted":
      return "contradicted";
    case "unverified":
      return "unverified";
    default:
      return "unknown";
  }
}

function getMarketBucketFromJurisdictions(jurisdictions: string[]) {
  const normalized = jurisdictions.map((item) => item.toLowerCase());
  if (normalized.some((item) => item.includes("lux"))) return "LUX" as const;
  if (normalized.some((item) => item.includes("emirates") || item.includes("gcc"))) return "GCC" as const;
  return "EU" as const;
}

function inferProfessionScope(title: string, legacy?: ResearchCard) {
  if (legacy?.product_summary.market_scope.profession_scope?.length) {
    return legacy.product_summary.market_scope.profession_scope;
  }

  const normalized = title.toLowerCase();
  if (normalized.includes("nurse")) return ["nurses"];
  if (normalized.includes("doctor") || normalized.includes("medical")) return ["doctors"];
  if (normalized.includes("finance") || normalized.includes("mifid")) return ["financial staff"];
  if (normalized.includes("language")) return ["professionals"];
  return ["general"];
}

function inferPrimaryBuyer(
  title: string,
  segment: CommercialValidationDoc["quadrant_segment"],
  claimCategories: string[],
  dashboard: DashboardDoc,
  legacy?: ResearchCard
): { value: BuyerType; reason: string; confidence: number } {
  const text = [
    title,
    ...claimCategories,
    ...Object.keys(dashboard.safe_fields || {}),
    ...Object.keys(dashboard.blocked_fields || {}),
  ]
    .join(" ")
    .toLowerCase();

  if (/staffing|recruitment|placement|agency/.test(text)) {
    return {
      value: "staffing_agency",
      reason: "The v2 evidence and title both point to an agency-mediated staffing workflow.",
      confidence: 0.88,
    };
  }

  if (/white-label|licensing|license/.test(text)) {
    return {
      value: "partner",
      reason: "The offer is positioned as a partner or licensing product rather than a direct end-user sale.",
      confidence: 0.84,
    };
  }

  if (segment === "B2C") {
    return {
      value: "individual",
      reason: "Commercial validation marks this as a B2C product, so the end learner remains the primary buyer.",
      confidence: 0.82,
    };
  }

  if (/compliance|mifid|cssf|csrd|esg|audit/.test(text)) {
    return {
      value: "compliance",
      reason: "The validated route context is compliance-led and the buyer is most likely a regulated or compliance owner.",
      confidence: 0.78,
    };
  }

  if (/workshop|corporate|program|onboarding|integration|language|training/.test(text)) {
    return {
      value: "hr_ld",
      reason: "The surviving v2 framing looks like an employer or L&D-driven training purchase.",
      confidence: 0.74,
    };
  }

  if (segment === "B2B" || segment === "B2B2C") {
    return {
      value: "employer",
      reason: "Commercial validation points to an enterprise-mediated motion.",
      confidence: 0.64,
    };
  }

  return {
    value: legacy?.buyer_analysis.primary_buyer_type.value ?? "unknown",
    reason:
      legacy?.buyer_analysis.primary_buyer_type.reason ??
      "No strong v2 buyer signal survived; this remains unknown.",
    confidence: legacy?.buyer_analysis.primary_buyer_type.confidence ?? 0.35,
  };
}

function inferBudgetOwner(primaryBuyer: BuyerType, legacy?: ResearchCard): { value: BudgetOwner; reason: string; confidence: number } {
  if (primaryBuyer === "compliance") {
    return {
      value: "compliance",
      reason: "Compliance-oriented offers normally sit with compliance-led budget owners.",
      confidence: 0.78,
    };
  }

  if (primaryBuyer === "hr_ld" || primaryBuyer === "employer") {
    return {
      value: "hr_ld",
      reason: "Training and onboarding offers typically land in HR/L&D budgets first.",
      confidence: 0.72,
    };
  }

  if (primaryBuyer === "staffing_agency" || primaryBuyer === "partner") {
    return {
      value: "business_unit",
      reason: "Agency or partner-led products are usually owned by a revenue-bearing business unit.",
      confidence: 0.7,
    };
  }

  if (primaryBuyer === "individual") {
    return {
      value: "mixed",
      reason: "For B2C offers the learner pays directly, but sponsorship remains possible, so budget ownership stays mixed.",
      confidence: 0.66,
    };
  }

  return {
    value: legacy?.buyer_analysis.budget_owner.value ?? "unknown",
    reason:
      legacy?.buyer_analysis.budget_owner.reason ??
      "No strong v2 budget-owner signal survived; this remains unknown.",
    confidence: legacy?.buyer_analysis.budget_owner.confidence ?? 0.35,
  };
}

function inferBuyerInfluencers(
  primaryBuyer: BuyerType,
  claimCategories: string[],
  legacy?: ResearchCard
): Array<{ value: BuyerInfluencer; reason: string; confidence: number }> {
  const categories = new Set(claimCategories);
  const influencers: Array<{ value: BuyerInfluencer; reason: string; confidence: number }> = [];

  if (categories.has("compliance") || categories.has("recognition") || categories.has("licensing")) {
    influencers.push({
      value: "legal",
      reason: "The surviving claims still depend on route wording and regulator-safe positioning.",
      confidence: 0.72,
    });
  }

  if (primaryBuyer === "hr_ld" || primaryBuyer === "employer") {
    influencers.push({
      value: "team_manager",
      reason: "Managers influence adoption and cohort formation for training or onboarding offers.",
      confidence: 0.56,
    });
  }

  if (primaryBuyer === "staffing_agency" || primaryBuyer === "partner") {
    influencers.push({
      value: "finance",
      reason: "Agency and partner motions need unit economics or margin approval.",
      confidence: 0.58,
    });
  }

  if (influencers.length > 0) {
    return influencers;
  }

  return legacy?.buyer_analysis.buyer_influencers ?? [];
}

function buildOneSentenceSummary(
  title: string,
  dashboard: DashboardDoc,
  jurisdictions: string[],
  legacy?: ResearchCard
) {
  const regulatoryContext = asString(dashboard.safe_fields.regulatory_context?.value);
  const crossCountryContext = asString(dashboard.safe_fields.cross_country_regulatory_context?.value);
  const targetAudience = asString(dashboard.analyst_only_fields?.target_audience_summary?.value);
  const scopeLabel = jurisdictions.length > 0 ? ` in ${jurisdictions.join(", ")}` : "";

  if (crossCountryContext) {
    return `${title}: ${crossCountryContext}`;
  }

  if (regulatoryContext) {
    return `${title}: ${regulatoryContext}`;
  }

  if (targetAudience) {
    return `${title} for ${targetAudience}${scopeLabel}.`;
  }

  return (
    legacy?.product_summary.one_sentence_summary ??
    `${title} positioned only around the verified route and evidence that survived the v2 rerun${scopeLabel}.`
  );
}

function buildCorePain(
  title: string,
  dashboard: DashboardDoc,
  blockedFieldCount: number,
  legacy?: ResearchCard
) {
  if (blockedFieldCount > 0) {
    return `The offer needs a route-safe value proposition for ${title} without overclaiming on blocked fields or unverified outcomes.`;
  }

  return (
    legacy?.product_summary.core_pain ??
    `Users need a route-safe, evidence-backed way to solve the problem behind ${title}.`
  );
}

function buildClaimedOutcome(title: string, dashboard: DashboardDoc, legacy?: ResearchCard) {
  const verifiedRequirements = asArray(dashboard.safe_fields.verified_requirements?.value);
  if (verifiedRequirements.length > 0) {
    return `${title} should promise only route-relevant preparation or training anchored in verified public requirements.`;
  }

  return (
    legacy?.product_summary.claimed_outcome ??
    `${title} should only claim outcomes that are directly supported by the current dashboard ingestion payload.`
  );
}

function deriveRegulatoryContext(
  claimCategories: string[],
  dashboard: DashboardDoc,
  title: string,
  legacy?: ResearchCard
): MarketRegulatoryContext {
  const categories = new Set(claimCategories);
  const text = `${title} ${Object.keys(dashboard.safe_fields).join(" ")} ${Object.keys(dashboard.blocked_fields || {}).join(" ")}`.toLowerCase();

  if (
    categories.has("compliance") ||
    categories.has("licensing") ||
    categories.has("recognition") ||
    text.includes("verified_requirements") ||
    text.includes("approval_entities") ||
    /oet|mifid|cssf|csrd|ecfmg|registration|residency|regulated/.test(text)
  ) {
    return "strongly_regulated";
  }

  if (categories.has("subsidy") || categories.has("deadline") || /onboarding|integration|healthcare/.test(text)) {
    return "regulated_adjacent";
  }

  return legacy?.dashboard_enrichment.market_regulatory_context.value ?? "lightly_regulated";
}

function deriveSubsidyState(dashboard: DashboardDoc, legacy?: ResearchCard): { exists: SubsidyExists; eligibility: SubsidyEligibilityStatus; conflict: boolean } {
  const subsidyAnalyst = asString(dashboard.analyst_only_fields?.subsidy_eligibility?.value);
  const fieldNames = [
    ...Object.keys(dashboard.safe_fields || {}),
    ...Object.keys(dashboard.analyst_only_fields || {}),
    ...Object.keys(dashboard.blocked_fields || {}),
  ].join(" ");

  if (subsidyAnalyst === "conflicted") {
    return { exists: "unclear", eligibility: "conflicted", conflict: true };
  }

  if (/subsidy|training_support|cofunding|funding/.test(fieldNames.toLowerCase())) {
    return { exists: "yes", eligibility: "likely_eligible", conflict: false };
  }

  if (legacy) {
    return {
      exists: legacy.dashboard_enrichment.subsidy_exists.value,
      eligibility: legacy.dashboard_enrichment.subsidy_eligibility_status.value,
      conflict: legacy.dashboard_enrichment.subsidy_conflict_flag.value,
    };
  }

  return { exists: "no", eligibility: "not_applicable", conflict: false };
}

function deriveDependencyTypes(
  title: string,
  dashboard: DashboardDoc,
  claimCategories: string[]
): Array<{ value: DependencyType; reason: string; confidence: number }> {
  const dependencies = new Map<DependencyType, string>();
  const blockedKeys = Object.keys(dashboard.blocked_fields || {});
  const allText = `${title} ${claimCategories.join(" ")} ${blockedKeys.join(" ")}`.toLowerCase();

  for (const key of blockedKeys) {
    if (/accredit|certificate|acceptance/.test(key)) {
      dependencies.set("regulator_acceptance", "Certificate or route acceptance still depends on external authority confirmation.");
    }
    if (/partner|route|delivery_model/.test(key)) {
      dependencies.set("expert_partner", "The product still depends on a partner or route-owner decision.");
    }
    if (/benelux|country|gcc|scope|three_country|unified/.test(key)) {
      dependencies.set("country_localization", "Route wording or delivery logic changes materially by country.");
    }
    if (/subsidy|erasmus|funding/.test(key)) {
      dependencies.set("funding_eligibility", "Funding or subsidy wording still needs route-specific confirmation.");
    }
  }

  if (/staffing|recruitment|placement|agency/.test(allText)) {
    dependencies.set("staffing_partner", "The motion still depends on agency or placement channel cooperation.");
  }

  if (/course|training|program|prep|language/.test(allText)) {
    dependencies.set("teacher_supply", "Delivery still depends on instructor availability and route-consistent teaching capacity.");
  }

  return [...dependencies.entries()].map(([value, reason]) => ({
    value,
    reason,
    confidence: 0.7,
  }));
}

function deriveProofStack(
  title: string,
  primaryBuyer: BuyerType,
  claimCategories: string[],
  releaseStatus: ReleaseStatus
): Array<{ value: ProofType; reason: string; confidence: number }> {
  const stack = new Map<ProofType, string>();
  const text = `${title} ${claimCategories.join(" ")}`.toLowerCase();

  if (primaryBuyer === "individual") {
    stack.set("learning_progress", "B2C prep offers need visible learner progress or route clarity proof.");
  } else {
    stack.set("buyer_acceptance", "B2B motions still need explicit buyer acceptance proof.");
  }

  if (/oet|exam|registration|residency/.test(text) || claimCategories.includes("exam")) {
    stack.set("exam_pass", "Route-prep products need exam or threshold progress proof.");
  }

  if (/compliance|cssf|mifid|csrd|esg|audit/.test(text) || claimCategories.includes("compliance")) {
    stack.set("audit_defensibility", "Compliance-skewed products need defensible route and wording evidence.");
  }

  if (/recruitment|staffing|placement/.test(text)) {
    stack.set("placement_outcome", "Placement products need downstream hiring or onboarding proof.");
  }

  if (releaseStatus === "blocked" || primaryBuyer !== "individual") {
    stack.set("paid_pilot", "The current release state still requires a real paid or pilot proof step.");
  }

  return [...stack.entries()].map(([value, reason]) => ({
    value,
    reason,
    confidence: 0.72,
  }));
}

function deriveScopeVariance(jurisdictions: string[], dashboard: DashboardDoc): VarianceRisk {
  const blockedKeys = Object.keys(dashboard.blocked_fields || {}).join(" ").toLowerCase();
  if (jurisdictions.length >= 3 || /three_country|unified|gcc_scope|benelux|cross_country/.test(blockedKeys)) {
    return "high";
  }
  if (jurisdictions.length >= 2) return "medium";
  return "low";
}

function deriveExpansionVariance(jurisdictions: string[], regulatoryContext: MarketRegulatoryContext): VarianceRisk {
  if (jurisdictions.length >= 3 || regulatoryContext === "strongly_regulated") return "high";
  if (jurisdictions.length >= 2 || regulatoryContext === "regulated_adjacent") return "medium";
  return "low";
}

function deriveAuthorityForDelivery(
  dashboard: DashboardDoc,
  dependencies: Array<{ value: DependencyType }>
): 0 | 1 | 2 | 3 | 4 {
  const blockedKeys = Object.keys(dashboard.blocked_fields || {}).join(" ").toLowerCase();
  if (/certificate|acceptance|partner|accredit|delivery_model/.test(blockedKeys)) return 4;
  if (dependencies.some((item) => item.value === "expert_partner" || item.value === "regulator_acceptance")) return 3;
  if (Object.keys(dashboard.safe_fields).length >= 4) return 2;
  return 1;
}

function deriveAuthorityForClaims(dashboard: DashboardDoc, contradictionLog: ContradictionLogDoc): 0 | 1 | 2 | 3 | 4 {
  const contradictedCount = contradictionLog.summary?.contradicted_count ?? 0;
  const blockedCount = Object.keys(dashboard.blocked_fields || {}).length;
  if (contradictedCount >= 2 || blockedCount >= 5) return 4;
  if (contradictedCount >= 1 || blockedCount >= 3) return 3;
  if (blockedCount >= 1) return 2;
  return 1;
}

function deriveLegalClaimSeverity(
  dashboard: DashboardDoc,
  contradictionLog: ContradictionLogDoc,
  regulatoryContext: MarketRegulatoryContext
): LegalClaimSeverity {
  const contradictedCount = contradictionLog.summary?.contradicted_count ?? 0;
  const blockedCount = Object.keys(dashboard.blocked_fields || {}).length;
  if (regulatoryContext === "strongly_regulated" && (dashboard.release_status === "blocked" || contradictedCount > 0)) {
    return 4;
  }
  if (blockedCount >= 4 || contradictedCount >= 2) return 4;
  if (blockedCount >= 2 || contradictedCount >= 1) return 3;
  if (blockedCount >= 1) return 2;
  return 1;
}

function deriveProofBurden(
  proofStackCount: number,
  releaseStatus: ReleaseStatus,
  regulatoryContext: MarketRegulatoryContext
): ProofBurden {
  if (releaseStatus === "blocked" || (regulatoryContext === "strongly_regulated" && proofStackCount >= 3)) return 4;
  if (proofStackCount >= 3) return 3;
  if (proofStackCount >= 2) return 2;
  return 1;
}

function deriveRiskSeverity(weight: number): RiskSeverity {
  if (weight >= 3) return "high";
  if (weight >= 2) return "medium";
  return "low";
}

function issueSeverityFromCategory(area: ClaimArea): RiskSeverity {
  if (area === "licensing" || area === "accreditation" || area === "recognition" || area === "compliance") {
    return "high";
  }
  if (area === "numeric_claim" || area === "deadline" || area === "competitor_gap") {
    return "medium";
  }
  return "medium";
}

function deriveRiskMap(
  dashboard: DashboardDoc,
  contradictionLog: ContradictionLogDoc,
  claimCategories: string[],
  subsidyConflict: boolean
): ResearchCard["risk_map"] {
  const blockedKeys = Object.keys(dashboard.blocked_fields || {});
  const contradictedCount = contradictionLog.summary?.contradicted_count ?? 0;
  const hasMarketGap = blockedKeys.includes("market_gap_claim") || claimCategories.includes("competitor_gap");
  const hasNumeric = blockedKeys.some((key) => key.includes("number") || key.includes("pricing") || key.includes("market_size")) || claimCategories.includes("numeric_claim");
  const hasAuthority = blockedKeys.some((key) => /certificate|acceptance|partner|route|accredit/.test(key));
  const hasPositioning = blockedKeys.some((key) => /pricing_fit|commercial_model|doctor_premium_positioning|market_gap_claim/.test(key));

  return {
    claim_language_risk: {
      status: blockedKeys.length > 0 || contradictedCount > 0 ? ("present" as RiskStatus) : ("absent" as RiskStatus),
      severity: deriveRiskSeverity(contradictedCount > 0 ? 3 : blockedKeys.length >= 3 ? 2 : blockedKeys.length > 0 ? 1 : 0),
      reason: blockedKeys.length > 0 ? "Some customer-facing claims remain blocked or narrowly scoped in the v2 ingestion payload." : "No claim-language blocker currently surfaced.",
      source_ids: [],
    },
    authority_dependency_risk: {
      status: hasAuthority ? ("present" as RiskStatus) : ("absent" as RiskStatus),
      severity: hasAuthority ? "high" : "low",
      reason: hasAuthority ? "Route validity still depends on external authority, acceptance, or partner confirmation." : "No heavy authority dependency surfaced in current safe fields.",
      source_ids: [],
    },
    competitive_gap_risk: {
      status: hasMarketGap ? ("present" as RiskStatus) : ("absent" as RiskStatus),
      severity: hasMarketGap ? "medium" : "low",
      reason: hasMarketGap ? "Competitive or market-gap wording remains incomplete or blocked." : "No active competitor-gap blocker in the current payload.",
      source_ids: [],
    },
    numeric_claim_risk: {
      status: hasNumeric ? ("present" as RiskStatus) : ("absent" as RiskStatus),
      severity: hasNumeric ? "medium" : "low",
      reason: hasNumeric ? "Numeric claims still contain blocked, weak, or missing primary-source support." : "No active numeric-claim blocker in the current payload.",
      source_ids: [],
    },
    subsidy_conflict_risk: {
      status: subsidyConflict ? ("present" as RiskStatus) : ("absent" as RiskStatus),
      severity: subsidyConflict ? "high" : "low",
      reason: subsidyConflict ? "Subsidy or funding language remains conflicted in the current payload." : "No active subsidy conflict surfaced.",
      source_ids: [],
    },
    positioning_risk: {
      status: hasPositioning ? ("present" as RiskStatus) : ("absent" as RiskStatus),
      severity: hasPositioning ? "medium" : "low",
      reason: hasPositioning ? "Commercial packaging or positioning is still only partially validated." : "Positioning risk is currently limited to ordinary execution uncertainty.",
      source_ids: [],
    },
  };
}

function deriveClaimConflicts(claimLedger: ClaimLedgerDoc, contradictionLog: ContradictionLogDoc) {
  const claimById = new Map(claimLedger.claims.map((claim) => [claim.claim_id, claim]));
  const contradictions = contradictionLog.contradictions ?? [];
  const issues = contradictionLog.open_issues ?? [];

  return [
    ...contradictions.map((item) => {
      const claim = claimById.get(item.claim_id);
      const area = claim ? mapClaimCategory(claim.category) : "other";
      return {
        claim_area: area,
        claim_text: item.claim_text,
        conflict_type: "external" as const,
        severity: issueSeverityFromCategory(area),
        what_is_wrong: item.why_it_matters ?? item.resolution ?? item.notes ?? "Contradicted by reviewed sources.",
        source_ids: item.contradicting_source_ids ?? [],
      };
    }),
    ...issues
      .filter((item) => item.resolution === "blocked" || item.status === "contradicted")
      .map((item) => {
        const claim = claimById.get(item.claim_id);
        const area = claim ? mapClaimCategory(claim.category) : "other";
        return {
          claim_area: area,
          claim_text: item.claim_text,
          conflict_type: "ambiguity" as const,
          severity: issueSeverityFromCategory(area),
          what_is_wrong: item.notes ?? item.why_it_matters ?? "The claim remains unresolved or too broad for release.",
          source_ids: item.contradicting_source_ids ?? [],
        };
      }),
  ];
}

function deriveRecommendedManualReview(dashboard: DashboardDoc, contradictionLog: ContradictionLogDoc) {
  const blockedEntries = Object.entries(dashboard.blocked_fields || {});
  const blocked = blockedEntries.map(([field, value]) => ({
    field,
    reason: value.omission_reason ?? "Field remains blocked in the current payload.",
  }));
  const issues = (contradictionLog.open_issues ?? []).slice(0, 4).map((item) => ({
    field: item.claim_id,
    reason: item.notes ?? item.why_it_matters ?? "Open issue still requires manual resolution.",
  }));

  return [...blocked, ...issues];
}

function deriveFieldConfidence(
  primaryBuyerConfidence: number,
  budgetOwnerConfidence: number,
  legalClaimSeverity: number,
  authorityForDelivery: number,
  authorityForClaims: number,
  proofBurden: number,
  scopeVarianceRisk: VarianceRisk,
  expansionVarianceRisk: VarianceRisk,
  subsidyExists: SubsidyExists,
  subsidyEligibilityStatus: SubsidyEligibilityStatus,
  marketRegulatoryContext: MarketRegulatoryContext
) {
  return {
    primary_buyer_type: primaryBuyerConfidence,
    budget_owner: budgetOwnerConfidence,
    legal_claim_severity: clamp(0, 1 - (legalClaimSeverity - 1) * 0.18, 1),
    authority_needed_for_delivery: clamp(0, 1 - (authorityForDelivery - 1) * 0.18, 1),
    authority_needed_for_claims: clamp(0, 1 - (authorityForClaims - 1) * 0.18, 1),
    proof_burden: clamp(0, 1 - (proofBurden - 1) * 0.18, 1),
    scope_variance_risk: scopeVarianceRisk === "low" ? 0.9 : scopeVarianceRisk === "medium" ? 0.65 : 0.4,
    expansion_variance_risk: expansionVarianceRisk === "low" ? 0.88 : expansionVarianceRisk === "medium" ? 0.62 : 0.38,
    subsidy_exists: subsidyExists === "yes" ? 0.82 : subsidyExists === "unclear" ? 0.45 : 0.74,
    subsidy_eligibility_status:
      subsidyEligibilityStatus === "eligible"
        ? 0.86
        : subsidyEligibilityStatus === "likely_eligible"
          ? 0.7
          : subsidyEligibilityStatus === "conflicted"
            ? 0.24
            : subsidyEligibilityStatus === "unclear"
              ? 0.4
              : 0.76,
    market_regulatory_context:
      marketRegulatoryContext === "strongly_regulated"
        ? 0.78
        : marketRegulatoryContext === "regulated_adjacent"
          ? 0.72
          : marketRegulatoryContext === "lightly_regulated"
            ? 0.8
            : 0.85,
  };
}

function deriveArchetypeAssignment(
  title: string,
  claimCategories: string[],
  blockedKeys: string[],
  primaryBuyer: BuyerType
): ArchetypeAssignment {
  const text = `${title} ${claimCategories.join(" ")} ${blockedKeys.join(" ")} ${primaryBuyer}`.toLowerCase();
  const sourceSignals: Array<{ field: string; value: string }> = [];
  const matchedKeywords: string[] = [];

  const recordSignal = (field: string, value: string) => {
    sourceSignals.push({ field, value });
  };

  let id: ArchetypeAssignment["id"] = "core_language_programs";
  let label = "Core Language Programs";
  let shortLabel = "Core Language";
  let confidence = 0.68;
  let operatorDifficulty: OperatorDifficulty = "medium";
  let ruleApplied = "Fallback language/service archetype because no stronger v2 pattern dominated.";

  if (/audit|assessment|diagnostic|proficiency/.test(text)) {
    id = "diagnostics_capability_audit";
    label = "Diagnostics & Capability Audit";
    shortLabel = "Audit";
    confidence = 0.92;
    operatorDifficulty = "medium";
    ruleApplied = "V2 evidence points to an assessment or audit motion.";
    matchedKeywords.push("audit", "assessment");
  } else if (/white-label|licens|placement|recruitment|staffing|pipeline/.test(text)) {
    id = "channel_licensing_placement";
    label = "Channel, Licensing & Placement";
    shortLabel = "Channel / Placement";
    confidence = 0.9;
    operatorDifficulty = "hard";
    ruleApplied = "V2 evidence points to a channel, licensing, staffing, or placement motion.";
    matchedKeywords.push("channel", "placement");
  } else if (/onboarding|integration|relocation|expat|bundle/.test(text)) {
    id = "integration_onboarding";
    label = "Integration & Onboarding";
    shortLabel = "Integration";
    confidence = 0.88;
    operatorDifficulty = "medium";
    ruleApplied = "V2 evidence points to onboarding, integration, or relocation support.";
    matchedKeywords.push("integration", "onboarding");
  } else if (/oet|nurse|doctor|medical|recognition|registration|residency|regulated|ecfmg/.test(text)) {
    id = "regulated_workforce_pathways_exam_prep";
    label = "Regulated Workforce Pathways & Exam Prep";
    shortLabel = "Regulated Pathways";
    confidence = 0.94;
    operatorDifficulty = "hard";
    ruleApplied = "V2 evidence points to exam-prep or regulated workforce route mechanics.";
    matchedKeywords.push("pathway", "exam");
  } else if (/ai|compliance|mifid|cssf|csrd|esg|finance|literacy|prompt|governance/.test(text)) {
    id = "compliance_ai_training";
    label = "Compliance & AI Training";
    shortLabel = "Compliance / AI";
    confidence = 0.9;
    operatorDifficulty = "medium";
    ruleApplied = "V2 evidence points to AI, governance, or compliance-led training.";
    matchedKeywords.push("compliance", "ai");
  } else if (/french|german|luxembourgish|language|corporate|work/.test(text)) {
    matchedKeywords.push("language");
    confidence = 0.78;
    operatorDifficulty = "easy";
    ruleApplied = "V2 evidence points to a core language or workplace-language offer.";
  }

  recordSignal("title", title);
  if (claimCategories.length > 0) {
    recordSignal("claim_categories", claimCategories.join(", "));
  }
  if (blockedKeys.length > 0) {
    recordSignal("blocked_fields", blockedKeys.join(", "));
  }

  return {
    id,
    label,
    shortLabel,
    confidence,
    ruleApplied,
    matchedKeywords,
    sourceSignals,
    operatorDifficulty,
    operatorDifficultySourceLabel: titleCase(operatorDifficulty),
  };
}

function deriveOperatorMatrix(
  market: "LUX" | "EU" | "GCC",
  releaseStatus: ReleaseStatus,
  archetype: ArchetypeAssignment,
  validationModel: string | null,
  estimatedDaysToSignal: number | null,
  validationVelocityScore: number | null,
  blockedFieldCount: number
): OperatorMatrixEntry {
  const stage =
    releaseStatus === "blocked"
      ? "Hypothesis"
      : validationVelocityScore !== null && validationVelocityScore >= 4
        ? "Ready"
        : validationVelocityScore !== null && validationVelocityScore >= 3
          ? "Piloting"
          : "Ready";

  const timeToSignal =
    estimatedDaysToSignal === null
      ? "Unknown"
      : estimatedDaysToSignal <= 21
        ? "Short"
        : estimatedDaysToSignal <= 45
          ? "Short-medium"
          : estimatedDaysToSignal <= 90
            ? "Medium"
            : "Medium-long";

  const firstLaunchFit =
    releaseStatus === "blocked"
      ? "No"
      : blockedFieldCount === 0 && (validationVelocityScore ?? 0) >= 4
        ? "Yes"
        : blockedFieldCount <= 2
          ? "Selective"
          : "Probably not";

  const rationaleParts = [
    releaseStatus === "blocked"
      ? "Current v2 release gate is still blocked."
      : "Current v2 payload is review-safe.",
    validationModel ? `Validation model: ${validationModel}.` : null,
    blockedFieldCount > 0 ? `${blockedFieldCount} blocked dashboard field(s) still remain outside released copy.` : null,
  ].filter(Boolean);

  return {
    market,
    stage,
    archetype: archetype.label,
    operatorDifficulty: titleCase(archetype.operatorDifficulty),
    timeToSignal,
    firstLaunchFit,
    rationale: rationaleParts.join(" "),
  };
}

function buildDataFieldEntries(
  fieldMap: Record<string, DashboardFieldRecord>,
  status: DataFieldEntry["status"]
): DataFieldEntry[] {
  return Object.entries(fieldMap).map(([key, field]) => ({
    key,
    label: humanizeFieldKey(key),
    value: formatFieldValue(field.value),
    status,
    confidenceBand: field.confidence_band ?? "unknown",
    claimRefCount: field.claim_refs?.length ?? 0,
    sourceRefCount: field.source_refs?.length ?? 0,
    omissionReason: field.omission_reason ?? null,
  }));
}

async function resolveLatestRunDir() {
  const entries = await readdir(RESEARCH_RUNS_DIR, { withFileTypes: true });
  const runDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(RESEARCH_RUNS_DIR, entry.name));

  const candidates: string[] = [];
  for (const runDir of runDirs) {
    try {
      await readFile(path.join(runDir, VALIDATION_SUMMARY_FILE), "utf8");
      candidates.push(runDir);
    } catch {
      continue;
    }
  }

  candidates.sort((left, right) => right.localeCompare(left));
  return candidates[0] ?? null;
}

function buildResearchCardFromArtifacts({
  dashboard,
  claimLedger,
  contradictionLog,
  sources,
  commercial,
  folderName,
  legacy,
}: {
  dashboard: DashboardDoc;
  claimLedger: ClaimLedgerDoc;
  contradictionLog: ContradictionLogDoc;
  sources: V2Source[];
  commercial: CommercialValidationDoc | null;
  folderName: string;
  legacy?: ResearchCard;
}): V2DashboardLoadedCard {
  const dashboardJurisdictions = asArray(dashboard.safe_fields.jurisdiction_scope?.value);
  const jurisdictions =
    dashboardJurisdictions.length > 0
      ? dashboardJurisdictions
      : claimLedger.jurisdictions && claimLedger.jurisdictions.length > 0
        ? claimLedger.jurisdictions
        : legacy?.product_summary.market_scope.country_scope ?? [];
  const claimCategories = [...new Set(claimLedger.claims.map((claim) => mapClaimCategory(claim.category)))];
  const blockedKeys = Object.keys(dashboard.blocked_fields || {});
  const analystKeys = Object.keys(dashboard.analyst_only_fields || {});
  const segment = commercial?.quadrant_segment ?? "unknown";

  const primaryBuyer = inferPrimaryBuyer(dashboard.product_title, segment, claimCategories, dashboard, legacy);
  const budgetOwner = inferBudgetOwner(primaryBuyer.value, legacy);
  const buyerInfluencers = inferBuyerInfluencers(primaryBuyer.value, claimCategories, legacy);
  const proofStack = deriveProofStack(
    dashboard.product_title,
    primaryBuyer.value,
    claimCategories,
    dashboard.release_status
  );
  const dependencies = deriveDependencyTypes(dashboard.product_title, dashboard, claimCategories);
  const regulatoryContext = deriveRegulatoryContext(claimCategories, dashboard, dashboard.product_title, legacy);
  const subsidyState = deriveSubsidyState(dashboard, legacy);
  const scopeVarianceRisk = deriveScopeVariance(jurisdictions, dashboard);
  const expansionVarianceRisk = deriveExpansionVariance(jurisdictions, regulatoryContext);
  const authorityForDelivery = deriveAuthorityForDelivery(dashboard, dependencies);
  const authorityForClaims = deriveAuthorityForClaims(dashboard, contradictionLog);
  const legalClaimSeverity = deriveLegalClaimSeverity(dashboard, contradictionLog, regulatoryContext);
  const proofBurden = deriveProofBurden(proofStack.length, dashboard.release_status, regulatoryContext);
  const fieldConfidence = deriveFieldConfidence(
    primaryBuyer.confidence,
    budgetOwner.confidence,
    legalClaimSeverity,
    authorityForDelivery,
    authorityForClaims,
    proofBurden,
    scopeVarianceRisk,
    expansionVarianceRisk,
    subsidyState.exists,
    subsidyState.eligibility,
    regulatoryContext
  );
  const sourceCoverageScore = clamp(
    0,
    claimLedger.claims.filter((claim) =>
      claim.supporting_source_ids.length > 0 || claim.contradicting_source_ids.length > 0
    ).length / Math.max(1, claimLedger.claims.length),
    1
  );
  const unverifiedClaimsCount = claimLedger.claims.filter((claim) =>
    claim.status === "unverified" || claim.status === "unclear"
  ).length;
  const claimConflicts = deriveClaimConflicts(claimLedger, contradictionLog);
  const recommendedManualReview = deriveRecommendedManualReview(dashboard, contradictionLog);
  const archetype = deriveArchetypeAssignment(
    dashboard.product_title,
    claimCategories,
    blockedKeys,
    primaryBuyer.value
  );
  const market = getMarketBucketFromJurisdictions(jurisdictions);
  const operatorMatrix = deriveOperatorMatrix(
    market,
    dashboard.release_status,
    archetype,
    commercial?.validation_velocity?.validation_model ?? null,
    commercial?.validation_velocity?.estimated_days_to_signal ?? null,
    commercial?.validation_velocity?.testability_score_1_5 ?? null,
    blockedKeys.length
  );

  const syntheticCard: ResearchCard = {
    product_code: dashboard.product_code,
    product_title: dashboard.product_title,
    analysis_timestamp: dashboard.reviewed_at,
    product_summary: {
      one_sentence_summary: buildOneSentenceSummary(
        dashboard.product_title,
        dashboard,
        jurisdictions,
        legacy
      ),
      target_user:
        asString(dashboard.analyst_only_fields?.target_audience_summary?.value) ??
        legacy?.product_summary.target_user ??
        "Users or buyers visible in the surviving v2 route context.",
      core_pain: buildCorePain(dashboard.product_title, dashboard, blockedKeys.length, legacy),
      claimed_outcome: buildClaimedOutcome(dashboard.product_title, dashboard, legacy),
      market_scope: {
        primary_market: market,
        country_scope: jurisdictions.length > 0 ? jurisdictions : legacy?.product_summary.market_scope.country_scope ?? [],
        profession_scope: inferProfessionScope(dashboard.product_title, legacy),
      },
    },
    buyer_analysis: {
      primary_buyer_type: primaryBuyer,
      secondary_buyer_types: legacy?.buyer_analysis.secondary_buyer_types ?? [],
      budget_owner: budgetOwner,
      buyer_influencers: buyerInfluencers,
    },
    claim_extraction: {
      externally_checkable_claims: claimLedger.claims.map((claim) => ({
        claim_area: mapClaimCategory(claim.category),
        claim_text: claim.claim_text,
        status: mapClaimStatus(claim.status),
        notes: claim.notes ?? "",
        source_ids: [...claim.supporting_source_ids, ...claim.contradicting_source_ids],
      })),
      internal_claims_unverified: claimLedger.claims
        .filter(
          (claim) =>
            claim.origin?.includes("internal") ||
            (claim.status !== "verified" && claim.status !== "partially_verified")
        )
        .map((claim) => ({
          claim_area: mapClaimCategory(claim.category),
          claim_text: claim.claim_text,
          reason_unverified: claim.notes ?? "Claim remains blocked or unresolved in the current rerun.",
        })),
    },
    external_research: {
      regulator_entities: sources
        .filter((source) => source.source_type.includes("regulator") || source.source_type.includes("government"))
        .slice(0, 8)
        .map((source) => ({
          name: source.publisher,
          type: source.source_type.includes("regulator") ? "regulator" : "other",
          relevance: source.title,
          source_ids: [source.source_id],
        })),
      framework_entities: asArray(dashboard.safe_fields.regulatory_framework?.value).map((name) => ({
        name,
        type: "guidance",
        relevance: "Verified framework surfaced in dashboard ingestion.",
        source_ids: dashboard.safe_fields.regulatory_framework?.source_refs ?? [],
      })),
      funding_bodies: subsidyState.exists === "yes"
        ? [
            {
              name: "Training support route",
              type: "training_fund" as FundingBodyType,
              relevance: "Some funding or co-funding context exists in the current payload.",
              source_ids: dashboard.safe_fields.training_support_route?.source_refs ?? [],
            },
          ]
        : [],
      approval_entities: [
        ...asArray(dashboard.safe_fields.approval_entities?.value).map((name) => ({
          name,
          type: "accrediting_body" as ApprovalEntityType,
          relevance: "Approval or listing entity retained in safe fields.",
          source_ids: dashboard.safe_fields.approval_entities?.source_refs ?? [],
        })),
        ...asArray(dashboard.safe_fields.verified_entities?.value).slice(0, 4).map((name) => ({
          name,
          type: "other" as ApprovalEntityType,
          relevance: "Verified entity retained in safe fields.",
          source_ids: dashboard.safe_fields.verified_entities?.source_refs ?? [],
        })),
      ],
      regulatory_requirements: asArray(dashboard.safe_fields.verified_requirements?.value).map((requirement) => ({
        requirement,
        applies_to: asString(dashboard.analyst_only_fields?.target_audience_summary?.value) ?? "Target route participants",
        jurisdiction: jurisdictions.join(", ") || "Unknown",
        status: "confirmed" as RequirementStatus,
        source_ids: dashboard.safe_fields.verified_requirements?.source_refs ?? [],
      })),
      subsidies_or_funding:
        subsidyState.exists === "yes" || subsidyState.eligibility === "conflicted"
          ? [
              {
                name: "Training support route",
                jurisdiction: jurisdictions[0] ?? market,
                relevance: subsidyState.conflict ? ("unclear" as FundingRelevance) : ("possible" as FundingRelevance),
                eligibility_notes:
                  asString(dashboard.analyst_only_fields?.subsidy_eligibility?.omission_reason) ??
                  "Funding context exists but may remain conditional.",
                source_ids: dashboard.safe_fields.training_support_route?.source_refs ?? [],
              },
            ]
          : [],
      competitors_or_substitutes: [
        ...asArray(dashboard.safe_fields.verified_competitors?.value).map((name) => ({
          name,
          type: "direct" as CompetitorType,
          notes: "Verified competitor retained in dashboard safe fields.",
          source_ids: dashboard.safe_fields.verified_competitors?.source_refs ?? [],
        })),
        ...claimLedger.claims
          .filter((claim) => claim.category === "competitor")
          .map((claim) => ({
            name: claim.claim_text,
            type: "substitute" as CompetitorType,
            notes: claim.notes ?? "Competitor or substitute retained in the v2 claim ledger.",
            source_ids: claim.supporting_source_ids,
          })),
      ],
    },
    dashboard_enrichment: {
      legal_claim_severity: {
        value: legalClaimSeverity,
        reason: "Derived from blocked fields, contradictions, and regulatory context in the v2 ingestion payload.",
        confidence: average([
          confidenceToNumber(commercial?.collapsed_scores?.overall_confidence_band),
          confidenceToNumber("high"),
        ]),
      },
      authority_needed_for_delivery: {
        value: authorityForDelivery,
        reason: "Derived from route-owner, certificate, and partner dependencies still visible in the current payload.",
        confidence: 0.72,
      },
      authority_needed_for_claims: {
        value: authorityForClaims,
        reason: "Derived from blocked fields and contradiction density in the current payload.",
        confidence: 0.76,
      },
      proof_stack: proofStack,
      proof_burden: {
        value: proofBurden,
        reason: "Derived from proof stack size, release status, and regulatory context.",
        confidence: 0.74,
      },
      dependency_types: dependencies,
      scope_variance_risk: {
        value: scopeVarianceRisk,
        reason: "Derived from jurisdiction count and blocked scope or route-split fields.",
        confidence: 0.74,
      },
      expansion_variance_risk: {
        value: expansionVarianceRisk,
        reason: "Derived from regulatory intensity and country expansion complexity.",
        confidence: 0.72,
      },
      subsidy_exists: {
        value: subsidyState.exists,
        reason: "Derived from funding-related safe and analyst-only fields.",
        confidence: 0.64,
      },
      subsidy_eligibility_status: {
        value: subsidyState.eligibility,
        reason: "Derived from current v2 funding wording and conflicts.",
        confidence: 0.62,
      },
      subsidy_conflict_flag: {
        value: subsidyState.conflict,
        reason: "Marked true only when the v2 payload explicitly retains a funding conflict.",
        confidence: 0.82,
      },
      market_regulatory_context: {
        value: regulatoryContext,
        reason: "Derived from verified requirements, route entities, and claim categories.",
        confidence: 0.78,
      },
    },
    risk_map: deriveRiskMap(dashboard, contradictionLog, claimCategories, subsidyState.conflict),
    claim_conflicts: claimConflicts,
    recommended_manual_review: recommendedManualReview,
    sources: sources.map((source) => ({
      source_id: source.source_id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      source_type: mapV2SourceType(source.source_type),
      reliability: mapReliability(source.authority_tier),
    })),
    quality_signals: {
      source_coverage_score: sourceCoverageScore,
      unverified_claims_count: unverifiedClaimsCount,
      field_confidence: fieldConfidence,
    },
  };

  return {
    card: validateResearchCard(syntheticCard),
    overlay: {
      sourceCard: syntheticCard,
      archetype,
      operatorMatrix,
      productMeta: {
        dataSource: "research_v2_ingestion",
        releaseStatus: dashboard.release_status,
        safeFieldCount: Object.keys(dashboard.safe_fields || {}).length,
        blockedFieldCount: blockedKeys.length,
        analystFieldCount: analystKeys.length,
        quadrantSegment: segment,
        validationModel: commercial?.validation_velocity?.validation_model ?? null,
        estimatedCostToSignalEur: commercial?.validation_velocity?.estimated_cost_to_signal_eur ?? null,
        estimatedDaysToSignal: commercial?.validation_velocity?.estimated_days_to_signal ?? null,
        validationVelocityScore: commercial?.validation_velocity?.testability_score_1_5 ?? null,
        timeToFirstEuroScore: commercial?.validation_velocity?.time_to_first_euro_score_1_5 ?? null,
        founderIndependenceScore: commercial?.validation_velocity?.founder_independence_score_1_5 ?? null,
        regulatoryFrictionInverseScore: commercial?.regulatory_context?.regulatory_friction_inverse_score_1_5 ?? null,
        retentionStructureScore: commercial?.demand_pull?.retention_structure_score_1_5 ?? null,
        demandEvidenceScore: commercial?.demand_pull?.demand_evidence_score_1_5 ?? null,
        willingnessToPayScore: commercial?.demand_pull?.wtp_score_1_5 ?? null,
        cacRealityScore: commercial?.demand_pull?.cac_reality_score_1_5 ?? null,
        macroTrajectoryScore: commercial?.demand_pull?.macro_trajectory_score_1_5 ?? null,
        channelFitScore: commercial?.demand_pull?.channel_fit_score_1_5 ?? null,
        validationVelocityComposite: commercial?.collapsed_scores?.validation_velocity_composite ?? null,
        demandPullComposite: commercial?.collapsed_scores?.demand_pull_composite ?? null,
        validationConfidenceBand: commercial?.validation_velocity?.confidence_band ?? "unknown",
        demandPullConfidenceBand: commercial?.demand_pull?.confidence_band ?? "unknown",
        overallConfidenceBand: commercial?.collapsed_scores?.overall_confidence_band ?? "unknown",
        artifactFolder: folderName,
        independentOperatorSummary: parseIndependentOperatorSummary(
          dashboard.analyst_only_fields?.independent_operator_summary?.value
        ),
        safeFieldEntries: buildDataFieldEntries(dashboard.safe_fields || {}, "verified"),
        analystFieldEntries: buildDataFieldEntries(dashboard.analyst_only_fields || {}, "analyst"),
        blockedFieldEntries: buildDataFieldEntries(dashboard.blocked_fields || {}, "manual"),
      },
    },
  };
}

export async function loadResearchV2DashboardCards(): Promise<V2DashboardLoadedCard[]> {
  const runDir = await resolveLatestRunDir();
  if (!runDir) return [];

  const legacyCards = await loadResearchCards();
  const legacyByCode = new Map(legacyCards.map((card) => [card.product_code, card]));
  const entries = await readdir(runDir, { withFileTypes: true });

  const productDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const loaded = await Promise.all(
    productDirs.map(async (folderName) => {
      const productDir = path.join(runDir, folderName);
      const dashboard = await readJsonMaybe<DashboardDoc>(path.join(productDir, "dashboard-ingestion.json"));
      if (!dashboard) return null;

      const claimLedger = await readJson<ClaimLedgerDoc>(path.join(productDir, "claim-ledger.json"));
      const contradictionLog =
        (await readJsonMaybe<ContradictionLogDoc>(path.join(productDir, "contradiction-log.json"))) ?? {};
      const sourceRows = await readJsonlMaybe<V2Source>(path.join(productDir, "source-ledger.jsonl"));
      const commercial =
        await readJsonMaybe<CommercialValidationDoc>(path.join(productDir, "commercial-validation.json"));
      const legacy = legacyByCode.get(dashboard.product_code);

      return buildResearchCardFromArtifacts({
        dashboard,
        claimLedger,
        contradictionLog,
        sources: sourceRows,
        commercial,
        folderName,
        legacy,
      });
    })
  );

  return loaded.filter((item): item is V2DashboardLoadedCard => item !== null);
}
