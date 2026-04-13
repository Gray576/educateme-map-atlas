import type {
  BuyerCluster,
  BuyerType,
  MarketBucket,
  ProductRecord,
  ResearchCard,
  VarianceRisk,
} from "@/types";

const EU_COUNTRIES = new Set([
  "austria",
  "belgium",
  "bulgaria",
  "croatia",
  "cyprus",
  "czech republic",
  "czechia",
  "denmark",
  "estonia",
  "finland",
  "france",
  "germany",
  "greece",
  "hungary",
  "ireland",
  "italy",
  "latvia",
  "lithuania",
  "luxembourg",
  "malta",
  "netherlands",
  "poland",
  "portugal",
  "romania",
  "slovakia",
  "slovenia",
  "spain",
  "sweden",
  "european union",
  "eu",
]);

const GCC_COUNTRIES = new Set([
  "bahrain",
  "kuwait",
  "oman",
  "qatar",
  "saudi arabia",
  "united arab emirates",
  "uae",
  "gcc",
]);

function getMarketBucket(card: ResearchCard): MarketBucket {
  const primaryMarket = card.product_summary.market_scope.primary_market.toLowerCase();
  const countries = card.product_summary.market_scope.country_scope.map((country) => country.toLowerCase());

  const hasLuxembourg =
    primaryMarket.includes("lux") || countries.some((country) => country.includes("lux"));
  const hasGcc =
    primaryMarket.includes("gcc") ||
    countries.some((country) => GCC_COUNTRIES.has(country) || country.includes("emirates"));
  const hasEu =
    primaryMarket.includes("eu") ||
    primaryMarket.includes("europe") ||
    countries.some((country) => EU_COUNTRIES.has(country));

  if (hasLuxembourg) return "LUX";
  if (hasGcc) return "GCC";
  if (hasEu) return "EU";
  return "EU";
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBuyerLabel(value: BuyerType) {
  switch (value) {
    case "hr_ld":
      return "HR/L&D";
    case "staffing_agency":
      return "Staffing Agency";
    default:
      return toTitleCase(value);
  }
}

function getBuyerCluster(card: ResearchCard): BuyerCluster {
  const buyer = card.buyer_analysis.primary_buyer_type.value;
  const title = card.product_title.toLowerCase();
  const target = `${card.product_summary.target_user} ${card.product_summary.core_pain}`.toLowerCase();
  const professions = card.product_summary.market_scope.profession_scope.map((value) => value.toLowerCase());
  const healthcareProfessionCount = professions.filter((value) =>
    /(nurs|doctor|medical|health|clinic|hospital|care)/.test(value)
  ).length;

  if (
    title.includes("nurse") ||
    title.includes("medical") ||
    title.includes("healthcare") ||
    target.includes("nurse") ||
    target.includes("hospital") ||
    target.includes("clinic") ||
    target.includes("medical") ||
    target.includes("healthcare") ||
    (healthcareProfessionCount > 0 && professions.length <= 2)
  ) {
    return "Healthcare";
  }
  if (target.includes("expat") || target.includes("relocat")) return "Expat";
  if (buyer === "compliance") return "Compliance";
  if (target.includes("finance") || target.includes("bank")) return "Finance";
  if (buyer === "hr_ld") return "HR/L&D";
  if (buyer === "staffing_agency") return "Staffing";
  if (buyer === "employer") return "Employer";
  if (buyer === "individual") return "Individual";
  if (target.includes("language")) return "Language";
  if (card.product_summary.market_scope.country_scope.length > 1) return "Cross-border";
  return "General";
}

function getClaimLabels(card: ResearchCard) {
  return [...new Set(card.claim_extraction.externally_checkable_claims.map((claim) => claim.claim_area))];
}

function getDependencyLabels(card: ResearchCard) {
  return [...new Set(card.dashboard_enrichment.dependency_types.map((item) => item.value))];
}

function getAverage(numbers: number[]) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function getRiskCount(card: ResearchCard, severity: "high" | "medium") {
  return card.claim_conflicts.filter((item) => item.severity === severity).length;
}

function maybePrimaryRouteCountry(card: ResearchCard) {
  const countries = card.product_summary.market_scope.country_scope;
  if (countries.length === 1) return countries[0] ?? null;
  return null;
}

function maybeDeliveryLanguage(card: ResearchCard) {
  const title = card.product_title.toLowerCase();
  if (title.includes("german")) return "German";
  if (title.includes("french")) return "French";
  if (title.includes("luxembourgish")) return "Luxembourgish";
  if (title.includes("oet")) return "English";
  return null;
}

function regulatoryContextLabel(card: ResearchCard) {
  const context = card.dashboard_enrichment.market_regulatory_context.value;
  if (context === "strongly_regulated") return "Strongly regulated";
  if (context === "regulated_adjacent") return "Regulated adjacent";
  if (context === "lightly_regulated") return "Lightly regulated";
  return null;
}

function subsidyStateBadge(card: ResearchCard) {
  const exists = card.dashboard_enrichment.subsidy_exists.value;
  const eligibility = card.dashboard_enrichment.subsidy_eligibility_status.value;

  if (exists === "unclear" || eligibility === "unclear" || eligibility === "conflicted") {
    return "Subsidy unclear";
  }

  if (exists === "yes" && eligibility === "eligible") return "Subsidy eligible";
  return null;
}

function scoreLevel(risk: VarianceRisk) {
  switch (risk) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
  }
}

export function normalizeResearchCard(card: ResearchCard): ProductRecord {
  const fieldConfidence = Object.values(card.quality_signals.field_confidence);
  const highConflictCount = getRiskCount(card, "high");
  const mediumConflictCount = getRiskCount(card, "medium");

  return {
    code: card.product_code,
    title: card.product_title,
    sourceCard: card,
    market: getMarketBucket(card),
    marketBadge: getMarketBucket(card),
    buyerType: card.buyer_analysis.primary_buyer_type.value,
    buyerLabel: getBuyerLabel(card.buyer_analysis.primary_buyer_type.value),
    buyerClusterBadge: getBuyerCluster(card),
    primaryRouteCountry: maybePrimaryRouteCountry(card),
    deliveryLanguage: maybeDeliveryLanguage(card),
    regulatoryContextLabel: regulatoryContextLabel(card),
    subsidyStateBadge: subsidyStateBadge(card),
    subsidyLabel: card.dashboard_enrichment.subsidy_exists.value,
    shortSummary: card.product_summary.one_sentence_summary,
    claimLabels: getClaimLabels(card),
    dependencyLabels: getDependencyLabels(card),
    qualitySignals: {
      sourceCoverage: card.quality_signals.source_coverage_score,
      unverifiedClaimsCount: card.quality_signals.unverified_claims_count,
      conflictCount: highConflictCount + mediumConflictCount,
      highConflictCount,
      mediumConflictCount,
      avgFieldConfidence: getAverage(fieldConfidence),
    },
    scoreInputs: {
      primaryBuyerConfidence: card.buyer_analysis.primary_buyer_type.confidence,
      budgetOwnerConfidence: card.buyer_analysis.budget_owner.confidence,
      avgInfluencerConfidence: getAverage(
        card.buyer_analysis.buyer_influencers.map((item) => item.confidence)
      ),
      legalSeverityLevel: card.dashboard_enrichment.legal_claim_severity.value,
      deliveryAuthorityLevel: card.dashboard_enrichment.authority_needed_for_delivery.value,
      claimsAuthorityLevel: card.dashboard_enrichment.authority_needed_for_claims.value,
      proofBurdenLevel: card.dashboard_enrichment.proof_burden.value,
      proofStackCount: card.dashboard_enrichment.proof_stack.length,
      dependencyCount: card.dashboard_enrichment.dependency_types.length,
      scopeVarianceLevel: scoreLevel(card.dashboard_enrichment.scope_variance_risk.value),
      expansionVarianceLevel: scoreLevel(card.dashboard_enrichment.expansion_variance_risk.value),
      subsidyExists: card.dashboard_enrichment.subsidy_exists.value,
      subsidyEligibilityStatus: card.dashboard_enrichment.subsidy_eligibility_status.value,
      marketRegulatoryContext: card.dashboard_enrichment.market_regulatory_context.value,
    },
    rawFactors: {
      legalClaimSeverity: card.dashboard_enrichment.legal_claim_severity.value,
      authorityForDelivery: card.dashboard_enrichment.authority_needed_for_delivery.value,
      authorityForClaims: card.dashboard_enrichment.authority_needed_for_claims.value,
      proofBurden: card.dashboard_enrichment.proof_burden.value,
      dependencyCount: card.dashboard_enrichment.dependency_types.length,
      conflictCount: highConflictCount + mediumConflictCount,
    },
    proofStack: card.dashboard_enrichment.proof_stack.map((item) => item.value),
    dependencyTypes: card.dashboard_enrichment.dependency_types.map((item) => item.value),
    riskFlags: [
      {
        id: "claim_language",
        severity: card.risk_map.claim_language_risk.severity,
        reason: card.risk_map.claim_language_risk.reason,
      },
      {
        id: "authority_dependency",
        severity: card.risk_map.authority_dependency_risk.severity,
        reason: card.risk_map.authority_dependency_risk.reason,
      },
      {
        id: "positioning",
        severity: card.risk_map.positioning_risk.severity,
        reason: card.risk_map.positioning_risk.reason,
      },
    ],
    scopeVarianceRisk: card.dashboard_enrichment.scope_variance_risk.value,
    expansionVarianceRisk: card.dashboard_enrichment.expansion_variance_risk.value,
  };
}
