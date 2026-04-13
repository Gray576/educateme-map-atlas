import type {
  BuyerType,
  DependencyType,
  MarketRegulatoryContext,
  ProofType,
  ResearchCard,
  RiskSeverity,
  SubsidyEligibilityStatus,
  SubsidyExists,
  VarianceRisk,
} from "@/types/research-card";

export type MarketBucket = "LUX" | "EU" | "GCC";

export type BuyerCluster =
  | "HR/L&D"
  | "Healthcare"
  | "Compliance"
  | "Finance"
  | "Expat"
  | "Employer"
  | "Individual"
  | "Staffing"
  | "Language"
  | "Cross-border"
  | "General"
  | "Unknown";

export interface ProductRecord {
  code: string;
  title: string;
  sourceCard: ResearchCard;
  market: MarketBucket;
  marketBadge: MarketBucket;
  buyerType: BuyerType;
  buyerLabel: string;
  buyerClusterBadge: BuyerCluster;
  primaryRouteCountry: string | null;
  deliveryLanguage: string | null;
  regulatoryContextLabel: string | null;
  subsidyStateBadge: string | null;
  subsidyLabel: "yes" | "no" | "unclear";
  shortSummary: string;
  claimLabels: string[];
  dependencyLabels: string[];
  qualitySignals: {
    sourceCoverage: number;
    unverifiedClaimsCount: number;
    conflictCount: number;
    highConflictCount: number;
    mediumConflictCount: number;
    avgFieldConfidence: number;
  };
  scoreInputs: {
    primaryBuyerConfidence: number;
    budgetOwnerConfidence: number;
    avgInfluencerConfidence: number;
    legalSeverityLevel: number;
    deliveryAuthorityLevel: number;
    claimsAuthorityLevel: number;
    proofBurdenLevel: number;
    proofStackCount: number;
    dependencyCount: number;
    scopeVarianceLevel: number;
    expansionVarianceLevel: number;
    subsidyExists: SubsidyExists;
    subsidyEligibilityStatus: SubsidyEligibilityStatus;
    marketRegulatoryContext: MarketRegulatoryContext;
  };
  rawFactors: {
    legalClaimSeverity: number;
    authorityForDelivery: number;
    authorityForClaims: number;
    proofBurden: number;
    dependencyCount: number;
    conflictCount: number;
  };
  proofStack: ProofType[];
  dependencyTypes: DependencyType[];
  riskFlags: Array<{
    id: string;
    severity: RiskSeverity;
    reason: string;
  }>;
  scopeVarianceRisk: VarianceRisk;
  expansionVarianceRisk: VarianceRisk;
}

export interface ProductScores {
  founderRank: number;
  deliveryEase: number;
  claimSafety: number;
  evidenceConfidence: number;
  buyerClarity: number;
  proofSimplicity: number;
  expansionReadiness: number;
}

export interface ScoredProductRecord extends ProductRecord {
  scores: ProductScores;
}
