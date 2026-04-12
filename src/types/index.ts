export type Market = "LUX" | "EU" | "GCC";
export type Readiness = "green" | "yellow" | "red";
export type BusinessPhase = "live" | "piloting" | "ready" | "hypothesis";

export interface ProductGrid {
  Format: string;
  "Group Size": string;
  Languages: string;
  Subsidy: string;
}

export interface ProductDetails {
  targetAudience: string;
  jtbd: string;
  curriculum: string[];
  grid: ProductGrid;
  priceFull: string;
  deliverables: string;
  competitive: string;
  whyItWorks: string;
  readinessDetail: string;
}

export interface Product {
  code: string;
  title: string;
  market: Market;
  readiness: Readiness;
  /** Comma-separated: "B2B" | "B2C" | "B2B,B2C" | "B2B2C" */
  model: string;
  bp: BusinessPhase;
  discoveryStatus: string;
  price: string;
  revenue: string;
  confidence: number;
  tags: string[];
  upsell: string;
  details: ProductDetails;
}

export interface Filters {
  market: Market | "all";
  readiness: Readiness | "all";
  bp: BusinessPhase | "all";
  search: string;
}
