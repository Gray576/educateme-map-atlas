import type { ScoredProductRecord } from "@/types";
import { loadResearchCards } from "@/data/research/load-cards";
import { loadResearchV2DashboardCards } from "@/data/research/load-v2-dashboard-cards";
import { normalizeResearchCard } from "@/data/research/normalize-card";
import { scoreProducts } from "@/lib/research-scoring";

export async function buildResearchDataset(): Promise<ScoredProductRecord[]> {
  const v2Cards = await loadResearchV2DashboardCards();
  if (v2Cards.length > 0) {
    return scoreProducts(v2Cards.map(({ card, overlay }) => normalizeResearchCard(card, overlay)));
  }

  const cards = await loadResearchCards();
  return scoreProducts(cards.map((card) => normalizeResearchCard(card)));
}
