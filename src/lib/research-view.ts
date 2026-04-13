import { getPresetLabel } from "@/lib/research-metadata";
import type { PresetKey, ScoredProductRecord } from "@/types";

export interface FounderFiltersState {
  market: string;
  buyer: string;
  claims: string;
  subsidy: string;
  dependencies: string;
}

export interface FounderRowRecord extends ScoredProductRecord {
  rankIndex: number;
  band: "top" | "mid" | "low";
}

export interface MapPointRecord extends FounderRowRecord {
  x: number;
  y: number;
  radius: number;
}

export function getDefaultFounderFilters(): FounderFiltersState {
  return {
    market: "all",
    buyer: "all",
    claims: "all",
    subsidy: "all",
    dependencies: "all",
  };
}

export function getActiveFilterChips(filters: FounderFiltersState) {
  const chips: Array<{ key: keyof FounderFiltersState; label: string; value: string }> = [];

  if (filters.market !== "all") chips.push({ key: "market", label: "Market", value: filters.market });
  if (filters.buyer !== "all") chips.push({ key: "buyer", label: "Buyer", value: filters.buyer });
  if (filters.claims !== "all") chips.push({ key: "claims", label: "Claims", value: filters.claims });
  if (filters.subsidy !== "all") chips.push({ key: "subsidy", label: "Subsidy", value: filters.subsidy });
  if (filters.dependencies !== "all") {
    chips.push({ key: "dependencies", label: "Dependencies", value: filters.dependencies });
  }

  return chips;
}

export function getScoreForPreset(product: ScoredProductRecord, preset: PresetKey) {
  switch (preset) {
    case "delivery":
      return product.scores.deliveryEase;
    case "claims":
      return product.scores.claimSafety;
    case "evidence":
      return product.scores.evidenceConfidence;
    case "expansion":
      return product.scores.expansionReadiness;
    case "founder":
    default:
      return product.scores.founderRank;
  }
}

function getTieBreakers(product: ScoredProductRecord) {
  return [
    product.scores.claimSafety,
    product.scores.deliveryEase,
    product.scores.evidenceConfidence,
    product.scores.proofSimplicity,
  ];
}

export function applyFounderFilters(
  products: ScoredProductRecord[],
  filters: FounderFiltersState
) {
  return products.filter((product) => {
    if (filters.market !== "all" && product.marketBadge !== filters.market) return false;
    if (filters.buyer !== "all" && product.buyerClusterBadge !== filters.buyer) return false;
    if (filters.claims !== "all" && !product.claimLabels.includes(filters.claims)) return false;
    if (filters.subsidy !== "all" && product.subsidyLabel !== filters.subsidy) return false;
    if (filters.dependencies !== "all" && !product.dependencyLabels.includes(filters.dependencies)) {
      return false;
    }
    return true;
  });
}

export function sortProductsByPreset(products: ScoredProductRecord[], preset: PresetKey) {
  return [...products].sort((left, right) => {
    const primary = getScoreForPreset(right, preset) - getScoreForPreset(left, preset);
    if (primary !== 0) return primary;

    const leftTieBreakers = getTieBreakers(left);
    const rightTieBreakers = getTieBreakers(right);

    for (let index = 0; index < leftTieBreakers.length; index += 1) {
      const delta = rightTieBreakers[index]! - leftTieBreakers[index]!;
      if (delta !== 0) return delta;
    }

    return left.code.localeCompare(right.code);
  });
}

export function assignBands(products: ScoredProductRecord[]): FounderRowRecord[] {
  const count = products.length;

  return products.map((product, index) => {
    let band: "top" | "mid" | "low";

    if (count <= 1) {
      band = "top";
    } else if (count === 2) {
      band = index === 0 ? "top" : "low";
    } else if (count === 3) {
      band = index === 0 ? "top" : index === 1 ? "mid" : "low";
    } else {
      const third = count / 3;
      if (index < third) band = "top";
      else if (index < third * 2) band = "mid";
      else band = "low";
    }

    return {
      ...product,
      rankIndex: index + 1,
      band,
    };
  });
}

export function getUniqueOptions(
  products: ScoredProductRecord[],
  key: "market" | "buyer" | "claims" | "dependencies" | "subsidy"
) {
  const values =
    key === "market"
      ? products.map((product) => product.marketBadge)
      : key === "buyer"
        ? products.map((product) => product.buyerClusterBadge)
        : key === "claims"
          ? products.flatMap((product) => product.claimLabels)
          : key === "dependencies"
            ? products.flatMap((product) => product.dependencyLabels)
            : products.map((product) => product.subsidyLabel);

  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function buildFounderSummary(rows: FounderRowRecord[], preset: PresetKey) {
  const topThree = rows.slice(0, 3);
  const visibleMarkets = [...new Set(rows.map((item) => item.marketBadge))];
  const visibleBuyers = [...new Set(rows.map((item) => item.buyerClusterBadge))];
  const topAverage =
    topThree.length > 0
      ? topThree.reduce((sum, item) => sum + getScoreForPreset(item, preset), 0) / topThree.length
      : 0;

  const dragBuckets = rows.reduce(
    (acc, row) => {
      if (row.rawFactors.authorityForClaims >= 3) acc.claims += 1;
      if (row.rawFactors.authorityForDelivery >= 3 || row.rawFactors.dependencyCount >= 4) {
        acc.delivery += 1;
      }
      if (row.qualitySignals.conflictCount >= 2) acc.conflicts += 1;
      return acc;
    },
    { claims: 0, delivery: 0, conflicts: 0 }
  );

  const dominantDrag = Object.entries(dragBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";

  return {
    title:
      preset === "founder"
        ? "Current order"
        : `${getPresetLabel(preset)} lens`,
    description:
      preset === "founder"
        ? "Founder preset sorts by the composite rank from the current card dataset only."
        : `Sorted by ${preset} score from the current card dataset only.`,
    topThree,
    snapshot: [
      `${rows.length} products in view`,
      `Markets represented: ${visibleMarkets.join(", ") || "none"}`,
      `Dominant buyer clusters: ${visibleBuyers.slice(0, 3).join(", ") || "none"}`,
    ],
    reading: [
      topThree[0]
        ? `${topThree[0].code} currently leads this view with ${getScoreForPreset(topThree[0], preset).toFixed(1)}`
        : "No visible leader in current view",
      `Average top-3 score: ${topAverage.toFixed(1)}`,
      `Main drag factor in this slice: ${dominantDrag}`,
    ],
  };
}

export function buildDrawerReasoning(product: ScoredProductRecord, preset: PresetKey) {
  const reasons: string[] = [];

  if (product.rawFactors.authorityForClaims >= 3) {
    reasons.push("claim authority remains heavy in the current card");
  }

  if (product.rawFactors.authorityForDelivery >= 3 || product.rawFactors.dependencyCount >= 4) {
    reasons.push("delivery depends on heavier route or partner complexity");
  }

  if (product.qualitySignals.conflictCount >= 2) {
    reasons.push("multiple claim conflicts lower confidence in the surface");
  }

  if (product.scores.buyerClarity >= 70) {
    reasons.push("buyer clarity is still relatively strong");
  }

  if (product.scores.evidenceConfidence >= 65) {
    reasons.push("evidence confidence is not the main weakness here");
  }

  return {
    title:
      preset === "founder"
        ? "Why it sits where it does in the current founder sort"
        : `Why it sits where it does in the current ${preset} sort`,
    bullets:
      reasons.length > 0
        ? reasons
        : ["this card is currently carried more by moderate scores than by one clear strength"],
  };
}

export function getCompareSelection(
  products: ScoredProductRecord[],
  preset: PresetKey,
  limit = 3
) {
  return sortProductsByPreset(products, preset).slice(0, limit);
}

export function buildPresetLeaderboards(products: ScoredProductRecord[]) {
  const presets: PresetKey[] = ["founder", "delivery", "claims", "evidence", "expansion"];

  return presets.map((preset) => ({
    preset,
    label: getPresetLabel(preset),
    items: getCompareSelection(products, preset, 3),
  }));
}

export function buildMapPoints(rows: FounderRowRecord[]): MapPointRecord[] {
  return rows.map((row) => ({
    ...row,
    x: row.scores.deliveryEase,
    y: row.scores.claimSafety,
    radius: 16 + (row.scores.buyerClarity / 100) * 28,
  }));
}

export function buildMapReading(points: MapPointRecord[]) {
  const sortedByOpportunity = [...points].sort(
    (left, right) =>
      right.scores.deliveryEase +
      right.scores.claimSafety -
      (left.scores.deliveryEase + left.scores.claimSafety)
  );

  const topRight = sortedByOpportunity[0] ?? null;
  const bottomLeft = [...points].sort(
    (left, right) =>
      left.scores.deliveryEase +
      left.scores.claimSafety -
      (right.scores.deliveryEase + right.scores.claimSafety)
  )[0] ?? null;

  const interesting =
    [...points]
      .filter((point) => point.code !== topRight?.code && point.code !== bottomLeft?.code)
      .sort((left, right) => right.scores.buyerClarity - left.scores.buyerClarity)[0] ?? null;

  const markets = [...new Set(points.map((point) => point.marketBadge))];
  const buyers = [...new Set(points.map((point) => point.buyerClusterBadge))];

  return {
    snapshot: [
      `${points.length} products in view`,
      `Markets represented: ${markets.join(", ") || "none"}`,
      `Dominant buyer clusters: ${buyers.slice(0, 3).join(", ") || "none"}`,
    ],
    topRight,
    interesting,
    bottomLeft,
  };
}
