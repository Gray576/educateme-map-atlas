export type BuyerType =
  | "individual"
  | "hr_ld"
  | "compliance"
  | "employer"
  | "staffing_agency"
  | "partner"
  | "mixed"
  | "unknown";

export type BudgetOwner =
  | "hr_ld"
  | "compliance"
  | "founder_ceo"
  | "business_unit"
  | "innovation"
  | "mixed"
  | "unknown";

export type BuyerInfluencer =
  | "hr_ld"
  | "compliance"
  | "legal"
  | "security"
  | "innovation"
  | "founder_ceo"
  | "team_manager"
  | "finance"
  | "unknown";

export type ClaimArea =
  | "mandate"
  | "licensing"
  | "accreditation"
  | "compliance"
  | "subsidy"
  | "reimbursement"
  | "exam"
  | "recognition"
  | "competitor_gap"
  | "numeric_claim"
  | "deadline"
  | "other";

export type ClaimStatus =
  | "verified"
  | "partially_verified"
  | "unverified"
  | "contradicted"
  | "unknown";

export type EntityType =
  | "regulator"
  | "ministry"
  | "licensing_body"
  | "exam_body"
  | "professional_body"
  | "other";

export type FrameworkType = "law" | "directive" | "circular" | "guidance" | "standard" | "other";
export type FundingBodyType =
  | "training_fund"
  | "subsidy_body"
  | "reimbursement_body"
  | "other";
export type ApprovalEntityType =
  | "listing_body"
  | "accrediting_body"
  | "accepted_provider_route"
  | "partner_route"
  | "other";

export type RequirementStatus = "confirmed" | "likely" | "unclear";
export type FundingRelevance = "direct" | "indirect" | "possible" | "unclear";
export type CompetitorType = "direct" | "indirect" | "substitute";

export type LegalClaimSeverity = 0 | 1 | 2 | 3 | 4;
export type AuthorityNeeded = 0 | 1 | 2 | 3 | 4;
export type ProofType =
  | "buyer_acceptance"
  | "paid_pilot"
  | "exam_pass"
  | "learning_progress"
  | "roi_case_study"
  | "audit_defensibility"
  | "regulator_listing_or_partner_route"
  | "placement_outcome"
  | "unknown";
export type ProofBurden = 1 | 2 | 3 | 4;
export type DependencyType =
  | "expert_partner"
  | "accreditation"
  | "licensing_path"
  | "regulator_acceptance"
  | "staffing_partner"
  | "teacher_supply"
  | "data_privacy_review"
  | "country_localization"
  | "funding_eligibility"
  | "unknown";
export type VarianceRisk = "low" | "medium" | "high";
export type SubsidyExists = "yes" | "no" | "unclear";
export type SubsidyEligibilityStatus =
  | "eligible"
  | "likely_eligible"
  | "conflicted"
  | "unclear"
  | "not_applicable";
export type MarketRegulatoryContext =
  | "unregulated"
  | "lightly_regulated"
  | "regulated_adjacent"
  | "strongly_regulated";

export type RiskStatus = "present" | "absent" | "unknown";
export type RiskSeverity = "low" | "medium" | "high";
export type ConflictType = "internal" | "external" | "ambiguity";
export type SourceType = "official" | "regulator" | "government" | "exam_body" | "company" | "other";
export type Reliability = "high" | "medium" | "low";

export interface ProductSummary {
  one_sentence_summary: string;
  target_user: string;
  core_pain: string;
  claimed_outcome: string;
  market_scope: {
    primary_market: string;
    country_scope: string[];
    profession_scope: string[];
  };
}

export interface BuyerAnalysis {
  primary_buyer_type: {
    value: BuyerType;
    reason: string;
    confidence: number;
  };
  secondary_buyer_types: Array<{
    value: BuyerType;
    reason: string;
    confidence: number;
  }>;
  budget_owner: {
    value: BudgetOwner;
    reason: string;
    confidence: number;
  };
  buyer_influencers: Array<{
    value: BuyerInfluencer;
    reason: string;
    confidence: number;
  }>;
}

export interface ResearchCard {
  product_code: string;
  product_title: string;
  analysis_timestamp: string;
  product_summary: ProductSummary;
  buyer_analysis: BuyerAnalysis;
  claim_extraction: {
    externally_checkable_claims: Array<{
      claim_area: ClaimArea;
      claim_text: string;
      status: ClaimStatus;
      notes: string;
      source_ids: string[];
    }>;
    internal_claims_unverified: Array<{
      claim_area: ClaimArea;
      claim_text: string;
      reason_unverified: string;
    }>;
  };
  external_research: {
    regulator_entities: Array<{
      name: string;
      type: EntityType;
      relevance: string;
      source_ids: string[];
    }>;
    framework_entities: Array<{
      name: string;
      type: FrameworkType;
      relevance: string;
      source_ids: string[];
    }>;
    funding_bodies: Array<{
      name: string;
      type: FundingBodyType;
      relevance: string;
      source_ids: string[];
    }>;
    approval_entities: Array<{
      name: string;
      type: ApprovalEntityType;
      relevance: string;
      source_ids: string[];
    }>;
    regulatory_requirements: Array<{
      requirement: string;
      applies_to: string;
      jurisdiction: string;
      status: RequirementStatus;
      source_ids: string[];
    }>;
    subsidies_or_funding: Array<{
      name: string;
      jurisdiction: string;
      relevance: FundingRelevance;
      eligibility_notes: string;
      source_ids: string[];
    }>;
    competitors_or_substitutes: Array<{
      name: string;
      type: CompetitorType;
      notes: string;
      source_ids: string[];
    }>;
  };
  dashboard_enrichment: {
    legal_claim_severity: {
      value: LegalClaimSeverity;
      reason: string;
      confidence: number;
    };
    authority_needed_for_delivery: {
      value: AuthorityNeeded;
      reason: string;
      confidence: number;
    };
    authority_needed_for_claims: {
      value: AuthorityNeeded;
      reason: string;
      confidence: number;
    };
    proof_stack: Array<{
      value: ProofType;
      reason: string;
      confidence: number;
    }>;
    proof_burden: {
      value: ProofBurden;
      reason: string;
      confidence: number;
    };
    dependency_types: Array<{
      value: DependencyType;
      reason: string;
      confidence: number;
    }>;
    scope_variance_risk: {
      value: VarianceRisk;
      reason: string;
      confidence: number;
    };
    expansion_variance_risk: {
      value: VarianceRisk;
      reason: string;
      confidence: number;
    };
    subsidy_exists: {
      value: SubsidyExists;
      reason: string;
      confidence: number;
    };
    subsidy_eligibility_status: {
      value: SubsidyEligibilityStatus;
      reason: string;
      confidence: number;
    };
    subsidy_conflict_flag: {
      value: boolean;
      reason: string;
      confidence: number;
    };
    market_regulatory_context: {
      value: MarketRegulatoryContext;
      reason: string;
      confidence: number;
    };
  };
  risk_map: {
    claim_language_risk: {
      status: RiskStatus;
      severity: RiskSeverity;
      reason: string;
      source_ids: string[];
    };
    authority_dependency_risk: {
      status: RiskStatus;
      severity: RiskSeverity;
      reason: string;
      source_ids: string[];
    };
    competitive_gap_risk: {
      status: RiskStatus;
      severity: RiskSeverity;
      reason: string;
      source_ids: string[];
    };
    numeric_claim_risk: {
      status: RiskStatus;
      severity: RiskSeverity;
      reason: string;
      source_ids: string[];
    };
    subsidy_conflict_risk: {
      status: RiskStatus;
      severity: RiskSeverity;
      reason: string;
      source_ids: string[];
    };
    positioning_risk: {
      status: RiskStatus;
      severity: RiskSeverity;
      reason: string;
      source_ids: string[];
    };
  };
  claim_conflicts: Array<{
    claim_area: ClaimArea;
    claim_text: string;
    conflict_type: ConflictType;
    severity: RiskSeverity;
    what_is_wrong: string;
    source_ids: string[];
  }>;
  recommended_manual_review: Array<{
    field: string;
    reason: string;
  }>;
  sources: Array<{
    source_id: string;
    title: string;
    publisher: string;
    url: string;
    source_type: SourceType;
    reliability: Reliability;
  }>;
  quality_signals: {
    source_coverage_score: number;
    unverified_claims_count: number;
    field_confidence: {
      primary_buyer_type: number;
      budget_owner: number;
      legal_claim_severity: number;
      authority_needed_for_delivery: number;
      authority_needed_for_claims: number;
      proof_burden: number;
      scope_variance_risk: number;
      expansion_variance_risk: number;
      subsidy_exists: number;
      subsidy_eligibility_status: number;
      market_regulatory_context: number;
    };
  };
}
