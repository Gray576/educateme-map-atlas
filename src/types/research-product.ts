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
import type { ConfidenceBand, ReleaseStatus } from "@/types/research-v2";

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

export type ArchetypeId =
  | "compliance_ai_training"
  | "integration_onboarding"
  | "core_language_programs"
  | "diagnostics_capability_audit"
  | "regulated_workforce_pathways_exam_prep"
  | "channel_licensing_placement";

export type OperatorDifficulty = "easy" | "medium" | "hard";

export interface ArchetypeSignal {
  field: string;
  value: string;
}

export interface ArchetypeAssignment {
  id: ArchetypeId;
  label: string;
  shortLabel: string;
  confidence: number;
  ruleApplied: string;
  matchedKeywords: string[];
  sourceSignals: ArchetypeSignal[];
  operatorDifficulty: OperatorDifficulty;
  operatorDifficultySourceLabel: string;
}

export interface OperatorMatrixEntry {
  market: string;
  stage: string;
  archetype: string;
  operatorDifficulty: string;
  timeToSignal: string;
  firstLaunchFit: string;
  rationale: string;
}

export interface ArchetypeGuideEntry {
  whatItIs: string;
  typicalFunnel: string;
  earlySuccess: string[];
  keyMetrics: string[];
}

export type DataFieldStatus = "verified" | "analyst" | "manual";

export interface DataFieldEntry {
  key: string;
  label: string;
  value: string;
  status: DataFieldStatus;
  confidenceBand: ConfidenceBand | "unknown";
  claimRefCount: number;
  sourceRefCount: number;
  omissionReason: string | null;
}

export interface ProductRecord {
  code: string;
  title: string;
  sourceCard: ResearchCard;
  dataSource: "legacy_card" | "research_v2_ingestion";
  releaseStatus: ReleaseStatus;
  safeFieldCount: number;
  blockedFieldCount: number;
  analystFieldCount: number;
  quadrantSegment: "B2B" | "B2C" | "B2B2C" | "mixed" | "unknown";
  validationModel: string | null;
  estimatedCostToSignalEur: number | null;
  estimatedDaysToSignal: number | null;
  validationVelocityScore: number | null;
  timeToFirstEuroScore: number | null;
  founderIndependenceScore: number | null;
  regulatoryFrictionInverseScore: number | null;
  retentionStructureScore: number | null;
  demandEvidenceScore: number | null;
  willingnessToPayScore: number | null;
  cacRealityScore: number | null;
  macroTrajectoryScore: number | null;
  channelFitScore: number | null;
  validationVelocityComposite: number | null;
  demandPullComposite: number | null;
  validationConfidenceBand: ConfidenceBand | "unknown";
  demandPullConfidenceBand: ConfidenceBand | "unknown";
  overallConfidenceBand: ConfidenceBand | "unknown";
  artifactFolder: string | null;
  safeFieldEntries: DataFieldEntry[];
  analystFieldEntries: DataFieldEntry[];
  blockedFieldEntries: DataFieldEntry[];
  market: MarketBucket;
  marketBadge: MarketBucket;
  buyerType: BuyerType;
  buyerLabel: string;
  buyerClusterBadge: BuyerCluster;
  archetype: ArchetypeAssignment;
  operatorMatrix: OperatorMatrixEntry;
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

export interface ResearchCardNormalizationOverlay {
  sourceCard?: ResearchCard;
  archetype?: ArchetypeAssignment;
  operatorMatrix?: OperatorMatrixEntry;
  productMeta?: Partial<
    Pick<
      ProductRecord,
      | "dataSource"
      | "releaseStatus"
      | "safeFieldCount"
      | "blockedFieldCount"
      | "analystFieldCount"
      | "quadrantSegment"
      | "validationModel"
      | "estimatedCostToSignalEur"
      | "estimatedDaysToSignal"
      | "validationVelocityScore"
      | "timeToFirstEuroScore"
      | "founderIndependenceScore"
      | "regulatoryFrictionInverseScore"
      | "retentionStructureScore"
      | "demandEvidenceScore"
      | "willingnessToPayScore"
      | "cacRealityScore"
      | "macroTrajectoryScore"
      | "channelFitScore"
      | "validationVelocityComposite"
      | "demandPullComposite"
      | "validationConfidenceBand"
      | "demandPullConfidenceBand"
      | "overallConfidenceBand"
      | "artifactFolder"
      | "safeFieldEntries"
      | "analystFieldEntries"
      | "blockedFieldEntries"
    >
  >;
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
