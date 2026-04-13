export type PresetKey = "founder" | "delivery" | "claims" | "evidence" | "expansion";

export interface GlobalFilters {
  market: string[];
  buyer: string[];
  claims: string[];
  subsidy: Array<"yes" | "no" | "unclear">;
  dependencies: string[];
}
