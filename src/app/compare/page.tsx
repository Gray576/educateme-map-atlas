import { CompareDashboard } from "@/components/research/CompareDashboard";
import { buildResearchDataset } from "@/data/research";

export const dynamic = "force-static";

export default async function ComparePage() {
  const products = await buildResearchDataset();

  return <CompareDashboard products={products} />;
}
