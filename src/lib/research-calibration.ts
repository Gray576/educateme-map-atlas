import type { ScoredProductRecord } from "@/types";

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

function getDeliveryLoad(product: ScoredProductRecord) {
  return (
    product.rawFactors.authorityForDelivery * 12 +
    product.rawFactors.dependencyCount * 6 +
    (product.scopeVarianceRisk === "high" ? 12 : product.scopeVarianceRisk === "medium" ? 6 : 0)
  );
}

function getClaimsLoad(product: ScoredProductRecord) {
  return (
    product.rawFactors.legalClaimSeverity * 12 +
    product.rawFactors.authorityForClaims * 10 +
    product.qualitySignals.conflictCount * 8
  );
}

function getProofLoad(product: ScoredProductRecord) {
  return product.rawFactors.proofBurden * 15 + Math.max(0, product.proofStack.length - 1) * 8;
}

function getRecoveryCandidateScore(product: ScoredProductRecord) {
  return product.scores.evidenceConfidence + product.scores.buyerClarity - product.scores.founderRank;
}

function getWatchlistFlags(product: ScoredProductRecord) {
  const flags: string[] = [];

  if (
    product.scores.founderRank >= 65 &&
    (product.rawFactors.authorityForClaims >= 3 ||
      product.rawFactors.proofBurden >= 4 ||
      product.qualitySignals.conflictCount >= 3)
  ) {
    flags.push("High founder score despite heavy claims or proof burden");
  }

  if (
    product.scores.founderRank >= 65 &&
    (product.rawFactors.authorityForDelivery >= 3 || product.rawFactors.dependencyCount >= 4)
  ) {
    flags.push("High founder score despite heavier delivery setup");
  }

  if (
    product.scores.founderRank <= 55 &&
    product.scores.evidenceConfidence >= 60 &&
    product.scores.buyerClarity >= 70
  ) {
    flags.push("Potentially under-ranked despite strong evidence and buyer clarity");
  }

  if (
    product.scores.evidenceConfidence >= 62 &&
    product.qualitySignals.conflictCount >= 3
  ) {
    flags.push("Strong evidence score but conflict count remains high");
  }

  return flags;
}

function groupCounts(values: string[]) {
  return Object.entries(
    values.reduce<Record<string, number>>((acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

export function buildCalibrationReport(products: ScoredProductRecord[]) {
  const founderSorted = [...products].sort((left, right) => right.scores.founderRank - left.scores.founderRank);
  const evidenceSorted = [...products].sort((left, right) => right.scores.evidenceConfidence - left.scores.evidenceConfidence);
  const deliveryLoadSorted = [...products].sort((left, right) => getDeliveryLoad(right) - getDeliveryLoad(left));
  const claimsLoadSorted = [...products].sort((left, right) => getClaimsLoad(right) - getClaimsLoad(left));
  const proofLoadSorted = [...products].sort((left, right) => getProofLoad(right) - getProofLoad(left));
  const recoverySorted = [...products].sort(
    (left, right) => getRecoveryCandidateScore(right) - getRecoveryCandidateScore(left)
  );

  const avgFounder = average(products.map((product) => product.scores.founderRank));
  const avgEvidence = average(products.map((product) => product.scores.evidenceConfidence));
  const avgConflictCount = average(products.map((product) => product.qualitySignals.conflictCount));
  const avgDependencyCount = average(products.map((product) => product.rawFactors.dependencyCount));

  return {
    stats: {
      productCount: products.length,
      avgFounder,
      avgEvidence,
      avgConflictCount,
      avgDependencyCount,
    },
    topFounder: founderSorted.slice(0, 5),
    bottomFounder: founderSorted.slice(-5).reverse(),
    strongestEvidence: evidenceSorted.slice(0, 5),
    heaviestDelivery: deliveryLoadSorted.slice(0, 5).map((product) => ({
      product,
      load: getDeliveryLoad(product),
    })),
    heaviestClaims: claimsLoadSorted.slice(0, 5).map((product) => ({
      product,
      load: getClaimsLoad(product),
    })),
    heaviestProof: proofLoadSorted.slice(0, 5).map((product) => ({
      product,
      load: getProofLoad(product),
    })),
    recoveryCandidates: recoverySorted.slice(0, 5).map((product) => ({
      product,
      delta: getRecoveryCandidateScore(product),
    })),
    watchlist: products
      .map((product) => ({
        product,
        flags: getWatchlistFlags(product),
      }))
      .filter((item) => item.flags.length > 0)
      .sort(
        (left, right) =>
          right.flags.length - left.flags.length ||
          right.product.scores.founderRank - left.product.scores.founderRank
      )
      .slice(0, 8),
    marketDistribution: groupCounts(products.map((product) => product.marketBadge)),
    buyerDistribution: groupCounts(products.map((product) => product.buyerClusterBadge)),
    conflictDistribution: groupCounts(
      products.map((product) => {
        if (product.qualitySignals.conflictCount >= 3) return "3+ conflicts";
        if (product.qualitySignals.conflictCount >= 1) return "1-2 conflicts";
        return "0 conflicts";
      })
    ),
  };
}
