import { MapDashboard } from "@/components/research/MapDashboard";
import { buildResearchDataset } from "@/data/research";

export const dynamic = "force-static";

export default async function MapPage() {
  const products = await buildResearchDataset();

  return <MapDashboard products={products} />;
}
