import type { ProductRecord, ProductScores } from "@/types";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

function getAuthorityDependencyPenalty(level: number) {
  if (level >= 4) return 10;
  if (level === 3) return 6;
  if (level === 2) return 2;
  return 0;
}

function getSubsidyConflictPenalty(product: ProductRecord) {
  return product.sourceCard.dashboard_enrichment.subsidy_conflict_flag.value ? 8 : 0;
}

function getClaimConflictPenalty(product: ProductRecord) {
  return product.qualitySignals.highConflictCount * 8 + product.qualitySignals.mediumConflictCount * 4;
}

function getSelectedRiskPenalty(product: ProductRecord) {
  const risks = [
    product.sourceCard.risk_map.claim_language_risk,
    product.sourceCard.risk_map.authority_dependency_risk,
    product.sourceCard.risk_map.numeric_claim_risk,
    product.sourceCard.risk_map.positioning_risk,
  ];

  return risks.reduce((sum, risk) => {
    if (risk.status !== "present") return sum;
    if (risk.severity === "high") return sum + 6;
    if (risk.severity === "medium") return sum + 3;
    return sum + 1;
  }, 0);
}

function getBuyerMotionPenalty(product: ProductRecord) {
  const buyerPenalty =
    product.buyerType === "partner"
      ? 10
      : product.buyerType === "mixed"
        ? 8
        : product.buyerType === "staffing_agency"
          ? 6
          : 0;

  const budgetOwner = product.sourceCard.buyer_analysis.budget_owner.value;
  const budgetPenalty = budgetOwner === "unknown" ? 10 : budgetOwner === "mixed" ? 6 : 0;

  return buyerPenalty + budgetPenalty;
}

export function scoreEvidenceConfidence(product: ProductRecord) {
  const base =
    100 * (0.6 * product.qualitySignals.sourceCoverage + 0.4 * product.qualitySignals.avgFieldConfidence);

  return clampScore(
    base -
      4 * product.qualitySignals.unverifiedClaimsCount -
      4 * product.qualitySignals.highConflictCount -
      2 * product.qualitySignals.mediumConflictCount
  );
}

export function scoreBuyerClarity(product: ProductRecord) {
  return clampScore(
    100 *
      (0.5 * product.scoreInputs.primaryBuyerConfidence +
        0.3 * product.scoreInputs.budgetOwnerConfidence +
        0.2 * product.scoreInputs.avgInfluencerConfidence) -
      getBuyerMotionPenalty(product)
  );
}

export function scoreDeliveryEase(product: ProductRecord) {
  return clampScore(
    100 -
      14 * (product.scoreInputs.deliveryAuthorityLevel - 1) -
      8 * (product.scoreInputs.scopeVarianceLevel - 1) -
      4 * product.scoreInputs.dependencyCount -
      getAuthorityDependencyPenalty(product.scoreInputs.deliveryAuthorityLevel)
  );
}

export function scoreClaimSafety(product: ProductRecord) {
  return clampScore(
    100 -
      8 * Math.max(0, product.scoreInputs.legalSeverityLevel - 1) -
      6 * Math.max(0, product.scoreInputs.claimsAuthorityLevel - 1) -
      getSubsidyConflictPenalty(product) -
      getClaimConflictPenalty(product) -
      getSelectedRiskPenalty(product)
  );
}

export function scoreProofSimplicity(product: ProductRecord) {
  return clampScore(
    100 -
      20 * (product.scoreInputs.proofBurdenLevel - 1) -
      5 * Math.max(0, product.scoreInputs.proofStackCount - 2)
  );
}

export function scoreExpansionReadiness(product: ProductRecord) {
  return clampScore(
    100 -
      12 * (product.scoreInputs.scopeVarianceLevel - 1) -
      16 * (product.scoreInputs.expansionVarianceLevel - 1) -
      4 * product.scoreInputs.dependencyCount -
      6 * Math.max(0, product.scoreInputs.claimsAuthorityLevel - 1)
  );
}

export function scoreFounderRank(product: ProductRecord, partial: Omit<ProductScores, "founderRank">) {
  return clampScore(
    0.3 * partial.deliveryEase +
      0.25 * partial.claimSafety +
      0.2 * partial.buyerClarity +
      0.15 * partial.evidenceConfidence +
      0.1 * partial.proofSimplicity
  );
}
