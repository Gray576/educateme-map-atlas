import type { ScoredProductRecord } from "@/types";
import { loadResearchCards } from "@/data/research/load-cards";
import { normalizeResearchCard } from "@/data/research/normalize-card";
import { scoreProducts } from "@/lib/research-scoring";

export async function buildResearchDataset(): Promise<ScoredProductRecord[]> {
  const cards = await loadResearchCards();
  return scoreProducts(cards.map(normalizeResearchCard));
}
