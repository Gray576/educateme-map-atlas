import type { ArchetypeId, OperatorDifficulty, PresetKey, ProductRecord, ProductScores } from "@/types";

export const PRESET_OPTIONS: Array<{ key: PresetKey; label: string; description: string }> = [
  {
    key: "founder",
    label: "Founder",
    description: "Balanced founder lens: favors products that look more launchable, clearer and safer overall.",
  },
  {
    key: "delivery",
    label: "Delivery",
    description: "Delivery lens: surfaces products that look easier to ship with fewer setup dependencies.",
  },
  {
    key: "claims",
    label: "Claims",
    description: "Claims lens: prioritizes safer messaging and lower legal or authority burden.",
  },
  {
    key: "evidence",
    label: "Evidence",
    description: "Evidence lens: rewards stronger source coverage, cleaner support and fewer weak claims.",
  },
  {
    key: "expansion",
    label: "Expansion",
    description: "Expansion lens: highlights products that look more portable across adjacent markets or segments.",
  },
];

export const ARCHETYPE_OPTIONS: Array<{
  id: ArchetypeId;
  label: string;
  legendLines: [string, string];
  fill: string;
  text: string;
}> = [
  {
    id: "core_language_programs",
    label: "Core Language Programs",
    legendLines: ["Core Language", "Programs"],
    fill: "#d9efe4",
    text: "#16624f",
  },
  {
    id: "compliance_ai_training",
    label: "Compliance & AI Training",
    legendLines: ["Compliance & AI", "Training"],
    fill: "#dbe9fb",
    text: "#295d9d",
  },
  {
    id: "integration_onboarding",
    label: "Integration & Onboarding",
    legendLines: ["Integration &", "Onboarding"],
    fill: "#ede2fb",
    text: "#6f46a5",
  },
  {
    id: "diagnostics_capability_audit",
    label: "Diagnostics & Capability Audit",
    legendLines: ["Diagnostics &", "Capability Audit"],
    fill: "#fce6cf",
    text: "#9b5f0b",
  },
  {
    id: "regulated_workforce_pathways_exam_prep",
    label: "Regulated Workforce Pathways & Exam Prep",
    legendLines: ["Regulated", "Pathways"],
    fill: "#fde0e6",
    text: "#a34b63",
  },
  {
    id: "channel_licensing_placement",
    label: "Channel, Licensing & Placement",
    legendLines: ["Channel /", "Placement"],
    fill: "#e2f1ee",
    text: "#2e7066",
  },
];

export function getPresetLabel(preset: PresetKey) {
  return PRESET_OPTIONS.find((item) => item.key === preset)?.label ?? preset;
}

export function getArchetypeVisual(archetypeId: ArchetypeId) {
  return ARCHETYPE_OPTIONS.find((item) => item.id === archetypeId) ?? ARCHETYPE_OPTIONS[0]!;
}

export function getOperatorDifficultyLabel(level: OperatorDifficulty) {
  if (level === "easy") return "Easy";
  if (level === "hard") return "Hard";
  return "Medium";
}

export function getOperatorDifficultyTone(level: OperatorDifficulty) {
  if (level === "easy") return "bg-emerald-100 text-emerald-800";
  if (level === "hard") return "bg-orange-100 text-orange-800";
  return "bg-amber-100 text-amber-800";
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
