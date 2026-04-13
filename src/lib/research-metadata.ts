import type { PresetKey, ProductRecord, ProductScores } from "@/types";

export const PRESET_OPTIONS: Array<{ key: PresetKey; label: string }> = [
  { key: "founder", label: "Founder" },
  { key: "delivery", label: "Delivery" },
  { key: "claims", label: "Claims" },
  { key: "evidence", label: "Evidence" },
  { key: "expansion", label: "Expansion" },
];

export function getPresetLabel(preset: PresetKey) {
  return PRESET_OPTIONS.find((item) => item.key === preset)?.label ?? preset;
}

export const COMPOSITE_METRICS: Array<{
  key: keyof ProductScores;
  label: string;
  description: string;
}> = [
  {
    key: "founderRank",
    label: "Founder rank",
    description: "Composite score for founder-facing prioritization.",
  },
  {
    key: "buyerClarity",
    label: "Buyer clarity",
    description: "How clear the buyer, budget owner and influencer structure appears.",
  },
  {
    key: "deliveryEase",
    label: "Delivery ease",
    description: "How easy this card looks to deliver without heavy external dependencies.",
  },
  {
    key: "claimSafety",
    label: "Claim safety",
    description: "How safely the value proposition can be stated without overclaim.",
  },
  {
    key: "evidenceConfidence",
    label: "Evidence confidence",
    description: "How much trust the current card structure deserves as a ranking input.",
  },
  {
    key: "proofSimplicity",
    label: "Proof simplicity",
    description: "How quickly the product can produce convincing proof.",
  },
  {
    key: "expansionReadiness",
    label: "Expansion readiness",
    description: "How portable the product logic looks across adjacent markets or segments.",
  },
];

export const RAW_LOAD_FACTORS: Array<{
  key: keyof ProductRecord["rawFactors"];
  label: string;
  scale?: "/4";
}> = [
  { key: "legalClaimSeverity", label: "Legal claim severity", scale: "/4" },
  { key: "authorityForDelivery", label: "Delivery authority", scale: "/4" },
  { key: "authorityForClaims", label: "Claims authority", scale: "/4" },
  { key: "proofBurden", label: "Proof burden", scale: "/4" },
  { key: "dependencyCount", label: "Dependency count" },
  { key: "conflictCount", label: "Conflict count" },
];
