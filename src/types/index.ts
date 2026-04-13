export type Market = "LUX" | "EU" | "GCC";
export type Readiness = "green" | "yellow" | "red";
export type BusinessPhase = "live" | "piloting" | "ready" | "hypothesis";
export type Stage = BusinessPhase;
export type Model = "B2B" | "B2C" | "B2B2C";
export type Preset = "venture" | "cashflow" | "balanced";
export type ScoreMetric = "venture" | "cashflow";
export type SortPreset = "ship60" | "venture" | "quickwins" | "dyingmandates" | null;

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

export interface Axes {
  timeToShip: number;
  studioLeverage: number;
  distribution: number;
  tamCeiling: number;
  painMandate: number;
  halfLife: number;
  teamFit: number;
  manualEffort: number;
  wedge: number;
  grossMargin: number;
  cacLtv: number;
  moatBuild: number;
}

export type BottleneckAxis =
  | "distribution"
  | "teamFit"
  | "studioLeverage"
  | "tamCeiling"
  | "painMandate"
  | "manualEffort"
  | "wedge"
  | "cacLtv"
  | "moatBuild";

export interface ProductStrategyMeta {
  axes: Axes;
  y1RevenueMidpoint: number;
  costToLaunch: number;
  nextAction: string;
  dependencies: string[];
  cannibalizationCluster: string | null;
  deadline?: string;
}

export interface Bottleneck {
  key: BottleneckAxis;
  label: string;
  value: number;
}

export interface EnrichedProduct extends Product {
  key: string;
  shortCode: string;
  stage: Stage;
  stageLabel: string;
  stageOrder: number;
  modelList: Model[];
  axes: Axes;
  ventureScore: number;
  cashflowScore: number;
  balancedScore: number;
  delta: number;
  y1Contribution: number;
  costToLaunch: number;
  nextAction: string;
  dependencies: string[];
  dependenciesResolved: boolean;
  cannibalizationCluster: string | null;
  bottleneck: Bottleneck;
  halfLifeMonths: number;
  halfLifeCountdownMonths: number;
  urgencyLabel: string;
  quickWinScore: number;
  deadline?: string;
}

export interface Filters {
  market: Market | "all";
  model: Model | "all";
  scoreMetric: ScoreMetric;
  scoreMin: number;
  bottleneckType: BottleneckAxis | "all";
  urgentOnly: boolean;
  dependenciesResolved: boolean | "all";
  search: string;
}

export interface SortState {
  column:
    | "code"
    | "product"
    | "stage"
    | "timeToShip"
    | "quickWin"
    | "venture"
    | "cashflow"
    | "delta"
    | "y1Contribution"
    | "bottleneck"
    | "halfLife"
    | null;
  direction: "asc" | "desc";
}
