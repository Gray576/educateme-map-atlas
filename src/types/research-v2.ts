export type AuthorityTier = "T1" | "T2" | "T3" | "T4" | "T5";
export type ClaimVerificationStatus =
  | "verified"
  | "partially_verified"
  | "unverified"
  | "contradicted"
  | "unclear";
export type ConfidenceBand = "high" | "medium" | "low" | "blocked";
export type ReleaseStatus = "publish" | "review" | "blocked";

export interface V2Source {
  source_id: string;
  title: string;
  publisher: string;
  url: string;
  source_type: string;
  authority_tier: AuthorityTier;
  jurisdiction: string | null;
  published_at: string | null;
  accessed_at: string | null;
  language: string | null;
  archive_url: string | null;
}

export interface V2Quote {
  quote_id: string;
  source_id: string;
  quote_text: string | null;
  structured_data: unknown | null;
  page: string | number | null;
  section: string | null;
  anchor: string | null;
  captured_at: string | null;
}

export interface V2Claim {
  claim_id: string;
  category: string;
  claim_text: string;
  jurisdiction: string | null;
  status: ClaimVerificationStatus;
  supporting_source_ids: string[];
  contradicting_source_ids: string[];
  supporting_quote_ids: string[];
  contradicting_quote_ids: string[];
  notes: string;
}

export interface V2Requirement {
  requirement_id: string;
  requirement: string;
  applies_to: string;
  jurisdiction: string;
  status: "confirmed" | "likely" | "unclear";
  source_ids: string[];
  quote_ids: string[];
}

export interface V2Entity {
  entity_id: string;
  name: string;
  kind: string;
  jurisdiction: string | null;
  source_ids: string[];
}

export interface V2Competitor {
  competitor_id: string;
  name: string;
  kind: string;
  source_ids: string[];
  notes: string;
}

export interface V2OpenQuestion {
  question_id: string;
  question: string;
  reason: string;
  blocking: boolean;
}

export interface V2VerificationSummary {
  verified_claim_count: number;
  partially_verified_claim_count: number;
  unverified_claim_count: number;
  contradicted_claim_count: number;
  blocked_question_count: number;
  official_source_count: number;
  total_source_count: number;
}

export interface ResearchCardV2 {
  schema_version: "research_card_v2";
  run_id: string;
  product_code: string;
  product_title: string;
  analysis_timestamp: string;
  jurisdictions: string[];
  sources: V2Source[];
  claims: V2Claim[];
  requirements: V2Requirement[];
  entities: V2Entity[];
  competitors: V2Competitor[];
  open_questions: V2OpenQuestion[];
  verification_summary: V2VerificationSummary;
}

export interface DashboardFieldV2 {
  value: unknown;
  confidence_band: ConfidenceBand;
  claim_refs: string[];
  source_refs: string[];
  last_verified_at: string;
}

export interface DashboardFieldSuppressedV2 {
  value: unknown;
  confidence_band: Exclude<ConfidenceBand, "high">;
  omission_reason: string;
}

export interface DashboardIngestionV2 {
  schema_version: "dashboard_ingestion_v2";
  run_id: string;
  product_code: string;
  product_title: string;
  reviewed_at: string;
  release_status: ReleaseStatus;
  safe_fields: Record<string, DashboardFieldV2>;
  analyst_only_fields: Record<string, DashboardFieldSuppressedV2>;
  verification_summary: {
    verified_claim_count: number;
    contradicted_claim_count: number;
    blocked_question_count: number;
  };
}

export interface CommercialValidationEvidenceRefs {
  source_ids: string[];
  claim_ids: string[];
}

export interface CommercialValidationSection {
  confidence_band: ConfidenceBand | "unknown";
  notes: string;
  derivation_basis: string;
  evidence_refs: CommercialValidationEvidenceRefs;
}

export interface CommercialValidationIndependentOperatorExampleV1 {
  name: string;
  classification:
    | "independent_operator"
    | "private_school_or_academy"
    | "official_or_institutional"
    | "marketplace_or_directory"
    | "social_community_only"
    | "content_only"
    | "unknown";
  evidence: string;
}

export interface CommercialValidationIndependentOperatorSummaryV1 {
  signal: "none" | "weak" | "medium" | "strong";
  independent_operator_examples: CommercialValidationIndependentOperatorExampleV1[];
  operator_types_seen: string[];
  supporting_queries: string[];
  pricing_or_offer_proof: string[];
  social_funnel_signal: string;
  segment_weighting?: {
    quadrant_segment: "B2B" | "B2C" | "B2B2C" | "mixed" | "unknown";
    operator_signal_relevance: "low" | "medium" | "high";
    social_funnel_relevance: "low" | "medium" | "high";
    weighted_score_1_5: number | null;
    score_adjustment: number | null;
    rationale: string;
  } | null;
  takeaway: string;
  why_not_stronger: string;
  synced_at: string;
}

export interface CommercialValidationMarketEvidenceV1 {
  confidence_band: ConfidenceBand | "unknown";
  derivation_basis: string;
  evidence_refs: CommercialValidationEvidenceRefs;
  market_track: string;
  scope_class: string;
  scope_fit: string;
  evidence_database: string | null;
  lane_group: string | null;
  semrush_priority: string | null;
  provisional_market_score_v1: number | null;
  anchor_focus: string[];
  anchor_focus_count: number | null;
  anchor_capture_count: number | null;
  anchor_capture_coverage: number | null;
  anchor_query_volume_sum: number | null;
  anchor_max_volume: number | null;
  anchor_global_volume_sum: number | null;
  local_lane_keyword_count: number | null;
  local_lane_p1_count: number | null;
  local_lane_watch_domains: string[];
  top_follow_up_keywords: Array<{
    keyword: string;
    follow_up_tier: string;
    category: string;
    max_volume_lu: number;
    source_count: number;
  }>;
  top_questions: Array<{
    keyword: string;
    follow_up_tier: string;
    category: string;
    max_volume_lu: number;
    source_count: number;
  }>;
  independent_operator_summary?: CommercialValidationIndependentOperatorSummaryV1 | null;
  operator_segment_weighted_score_1_5?: number | null;
  operator_segment_score_adjustment?: number | null;
  cross_border_luxembourg_intent_keywords: Array<{
    keyword: string;
    follow_up_tier: string;
    max_volume_lu: number;
    use_for: string[];
  }>;
  next_research_step: string;
  synced_from_scorecard_at: string;
  notes: string;
}

export interface CommercialValidationV1 {
  schema_version: "commercial_validation_v1";
  run_id: string;
  product_code: string;
  product_title: string;
  quadrant_segment: "B2B" | "B2C" | "B2B2C" | "mixed" | "unknown";
  market_evidence_scope_class?: string;
  market_evidence?: CommercialValidationMarketEvidenceV1;
  validation_velocity: CommercialValidationSection & {
    validation_model: string;
    binary_pass_signal: string;
    binary_kill_signal: string;
    estimated_cost_to_signal_eur: number | null;
    estimated_days_to_signal: number | null;
    estimated_days_to_first_euro: number | null;
    founder_independence_score_1_5: number | null;
    testability_score_1_5: number | null;
    time_to_first_euro_score_1_5: number | null;
  };
  demand_pull: CommercialValidationSection & {
    demand_evidence_score_1_5: number | null;
    wtp_score_1_5: number | null;
    cac_reality_score_1_5: number | null;
    retention_structure_score_1_5: number | null;
    macro_trajectory_score_1_5: number | null;
    channel_fit_score_1_5: number | null;
  };
  regulatory_context: CommercialValidationSection & {
    regulatory_friction_inverse_score_1_5: number | null;
  };
  semrush_snapshot: {
    market: string;
    database: string;
    language: string;
    keyword_buckets: {
      head_terms: string[];
      commercial_modifiers: string[];
      problem_intent: string[];
      competitor_route: string[];
    };
    metrics: {
      keyword_count_total: number | null;
      keyword_count_commercial: number | null;
      volume_sum: number | null;
      volume_sum_commercial: number | null;
      avg_cpc: number | null;
      max_cpc: number | null;
      avg_competitive_density: number | null;
      high_intent_keyword_count: number | null;
      paid_competitor_count: number | null;
    };
    top_paid_competitors: string[];
    observed_price_points: string[];
    serp_feature_notes: string;
    traffic_analytics_notes: string;
  };
  portfolio_tags: {
    niche: string;
    persona: string;
    channel_primary: string;
    channel_secondary: string;
    price_point: string;
    delivery_mode: string;
  };
  collapsed_scores: {
    validation_velocity_composite: number | null;
    demand_pull_composite: number | null;
    overall_confidence_band: ConfidenceBand | "unknown";
    confidence_reason: string;
  };
}

export interface SeedClaim {
  claim_id: string;
  origin: "legacy_external_claim" | "legacy_internal_claim";
  category: string;
  claim_text: string;
  legacy_status: string;
  supporting_source_ids: string[];
  contradiction_flag: boolean;
  notes: string;
  next_action: string;
}

export interface SeedClaimLedger {
  schema_version: string;
  run_id: string;
  product_code: string;
  product_title: string;
  claims: SeedClaim[];
}

export interface SeedSource {
  source_id: string;
  title: string;
  publisher: string;
  url: string;
  source_type: string;
  reliability_legacy: string;
  authority_tier_seed: AuthorityTier;
  accessed_at: string | null;
  published_at: string | null;
  notes: string;
}

export interface SeedSourceLedger {
  schema_version: string;
  run_id: string;
  product_code: string;
  sources: SeedSource[];
}
