import type { ResearchCard } from "@/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateResearchCard(card: ResearchCard): ResearchCard {
  assert(card.product_code, "Missing product_code");
  assert(card.product_title, `Missing product_title for ${card.product_code}`);
  assert(card.product_summary?.one_sentence_summary, `Missing product_summary for ${card.product_code}`);
  assert(card.buyer_analysis?.primary_buyer_type?.value, `Missing buyer_analysis for ${card.product_code}`);
  assert(card.claim_extraction?.externally_checkable_claims, `Missing claim_extraction for ${card.product_code}`);
  assert(card.dashboard_enrichment?.legal_claim_severity, `Missing dashboard_enrichment for ${card.product_code}`);
  assert(card.risk_map?.claim_language_risk, `Missing risk_map for ${card.product_code}`);
  assert(card.quality_signals?.field_confidence, `Missing quality_signals for ${card.product_code}`);

  return card;
}
