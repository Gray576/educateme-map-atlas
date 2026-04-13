import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import type { ResearchCard } from "@/types";
import { validateResearchCard } from "@/data/research/validate-card";

const CARDS_DIR = path.resolve("/Users/sergey/Desktop/product growth/plan/cards");

export async function loadResearchCards(): Promise<ResearchCard[]> {
  const files = (await readdir(CARDS_DIR))
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const cards = await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(path.join(CARDS_DIR, file), "utf8");
      const parsed = JSON.parse(contents) as ResearchCard;
      return validateResearchCard(parsed);
    })
  );

  return cards.sort((a, b) => a.product_code.localeCompare(b.product_code));
}
