import { FounderDashboard } from "@/components/research/FounderDashboard";
import { buildResearchDataset } from "@/data/research";

export const dynamic = "force-static";

export default async function Home() {
  const products = await buildResearchDataset();

  return <FounderDashboard products={products} />;
}
