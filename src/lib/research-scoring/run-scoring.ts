import type { ProductRecord, ProductScores, ScoredProductRecord } from "@/types";
import {
  scoreBuyerClarity,
  scoreClaimSafety,
  scoreDeliveryEase,
  scoreEvidenceConfidence,
  scoreExpansionReadiness,
  scoreFounderRank,
  scoreProofSimplicity,
} from "@/lib/research-scoring/formulas";

export function scoreProduct(product: ProductRecord): ScoredProductRecord {
  const partial: Omit<ProductScores, "founderRank"> = {
    deliveryEase: scoreDeliveryEase(product),
    claimSafety: scoreClaimSafety(product),
    evidenceConfidence: scoreEvidenceConfidence(product),
    buyerClarity: scoreBuyerClarity(product),
    proofSimplicity: scoreProofSimplicity(product),
    expansionReadiness: scoreExpansionReadiness(product),
  };

  return {
    ...product,
    scores: {
      ...partial,
      founderRank: scoreFounderRank(product, partial),
    },
  };
}

export function scoreProducts(products: ProductRecord[]) {
  return products.map(scoreProduct);
}
