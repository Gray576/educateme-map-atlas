import type {
  Axes,
  Bottleneck,
  BottleneckAxis,
  EnrichedProduct,
  Filters,
  Preset,
  Product,
  ProductStrategyMeta,
  SortPreset,
  SortState,
  Stage,
} from "@/types";

const NOW = new Date("2026-04-13T00:00:00Z");

const STAGE_LABELS: Record<Stage, string> = {
  hypothesis: "Hypothesis",
  ready: "Ready",
  piloting: "Piloting",
  live: "Live",
};

const STAGE_ORDER: Record<Stage, number> = {
  hypothesis: 0,
  ready: 1,
  piloting: 2,
  live: 3,
};

const AXIS_LABELS: Record<BottleneckAxis | keyof Axes, string> = {
  timeToShip: "Time-to-ship",
  studioLeverage: "Studio leverage",
  distribution: "Distribution",
  tamCeiling: "TAM ceiling",
  painMandate: "Pain × Mandate",
  halfLife: "Half-life",
  teamFit: "Team fit",
  manualEffort: "Manual effort",
  wedge: "Wedge",
  grossMargin: "Gross margin",
  cacLtv: "CAC/LTV",
  moatBuild: "Moat build",
};

const VENTURE_WEIGHTS: Partial<Record<keyof Axes, number>> = {
  tamCeiling: 0.22,
  wedge: 0.18,
  moatBuild: 0.16,
  distribution: 0.14,
  painMandate: 0.12,
  cacLtv: 0.1,
  studioLeverage: 0.05,
  teamFit: 0.03,
};

const CASHFLOW_WEIGHTS: Partial<Record<keyof Axes, number>> = {
  painMandate: 0.2,
  studioLeverage: 0.18,
  distribution: 0.16,
  manualEffort: 0.14,
  grossMargin: 0.12,
  teamFit: 0.1,
  cacLtv: 0.07,
  tamCeiling: 0.03,
};

const BALANCED_WEIGHTS: Partial<Record<keyof Axes, number>> = {
  painMandate: 0.17,
  distribution: 0.15,
  studioLeverage: 0.12,
  tamCeiling: 0.12,
  wedge: 0.11,
  moatBuild: 0.1,
  teamFit: 0.08,
  manualEffort: 0.08,
  cacLtv: 0.07,
};

const PRODUCT_META: Record<string, ProductStrategyMeta> = {
  A1: {
    y1RevenueMidpoint: 90000,
    costToLaunch: 2000,
    nextAction: "Close 1 pilot via existing B2B client referral",
    dependencies: [],
    cannibalizationCluster: "ai-workshops",
    deadline: "2027-02-01",
    axes: {
      timeToShip: 1,
      studioLeverage: 4,
      distribution: 3,
      tamCeiling: 4,
      painMandate: 5,
      halfLife: 10,
      teamFit: 4,
      manualEffort: 3,
      wedge: 4,
      grossMargin: 75,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  A2: {
    y1RevenueMidpoint: 75000,
    costToLaunch: 1500,
    nextAction: "Run 1 pilot with existing B2B client on real tasks",
    dependencies: [],
    cannibalizationCluster: "ai-workshops",
    axes: {
      timeToShip: 1,
      studioLeverage: 4,
      distribution: 3,
      tamCeiling: 3,
      painMandate: 4,
      halfLife: 18,
      teamFit: 4,
      manualEffort: 2,
      wedge: 4,
      grossMargin: 80,
      cacLtv: 4,
      moatBuild: 3,
    },
  },
  A3: {
    y1RevenueMidpoint: 60000,
    costToLaunch: 1000,
    nextAction: "Validate 'Prompt Audit' lead magnet with 3 prospects",
    dependencies: [],
    cannibalizationCluster: "ai-workshops",
    axes: {
      timeToShip: 1,
      studioLeverage: 4,
      distribution: 3,
      tamCeiling: 3,
      painMandate: 3,
      halfLife: 24,
      teamFit: 5,
      manualEffort: 3,
      wedge: 3,
      grossMargin: 80,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  A4: {
    y1RevenueMidpoint: 115000,
    costToLaunch: 15000,
    nextAction: "Hire or partner with a finance domain expert",
    dependencies: [],
    cannibalizationCluster: null,
    deadline: "2027-02-01",
    axes: {
      timeToShip: 3,
      studioLeverage: 3,
      distribution: 4,
      tamCeiling: 5,
      painMandate: 5,
      halfLife: 10,
      teamFit: 2,
      manualEffort: 3,
      wedge: 5,
      grossMargin: 65,
      cacLtv: 4,
      moatBuild: 4,
    },
  },
  A5: {
    y1RevenueMidpoint: 100000,
    costToLaunch: 25000,
    nextAction: "Find CSSF-accredited content partner and apply for accreditation",
    dependencies: ["A4"],
    cannibalizationCluster: null,
    deadline: "2026-06-30",
    axes: {
      timeToShip: 12,
      studioLeverage: 2,
      distribution: 3,
      tamCeiling: 5,
      painMandate: 5,
      halfLife: 3,
      teamFit: 1,
      manualEffort: 2,
      wedge: 4,
      grossMargin: 50,
      cacLtv: 3,
      moatBuild: 3,
    },
  },
  A6: {
    y1RevenueMidpoint: 162000,
    costToLaunch: 5000,
    nextAction: "Run 5 validation calls with HR managers at Big 4 and funds",
    dependencies: [],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 6,
      studioLeverage: 4,
      distribution: 2,
      tamCeiling: 4,
      painMandate: 3,
      halfLife: 36,
      teamFit: 4,
      manualEffort: 2,
      wedge: 4,
      grossMargin: 65,
      cacLtv: 4,
      moatBuild: 3,
    },
  },
  A7: {
    y1RevenueMidpoint: 77000,
    costToLaunch: 2000,
    nextAction: "Pilot the finance-French variant with an existing B2B client",
    dependencies: [],
    cannibalizationCluster: "language-corporate",
    axes: {
      timeToShip: 3,
      studioLeverage: 5,
      distribution: 4,
      tamCeiling: 3,
      painMandate: 3,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 3,
      wedge: 3,
      grossMargin: 70,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  A8: {
    y1RevenueMidpoint: 82000,
    costToLaunch: 8000,
    nextAction: "Build a CEFR mini-audit and run it with 3 companies for free",
    dependencies: [],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 8,
      studioLeverage: 2,
      distribution: 3,
      tamCeiling: 3,
      painMandate: 3,
      halfLife: 36,
      teamFit: 3,
      manualEffort: 2,
      wedge: 5,
      grossMargin: 72,
      cacLtv: 4,
      moatBuild: 3,
    },
  },
  A9: {
    y1RevenueMidpoint: 55000,
    costToLaunch: 2000,
    nextAction: "Add integration modules into the Sproochtest LMS",
    dependencies: ["L1"],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 2,
      studioLeverage: 5,
      distribution: 5,
      tamCeiling: 2,
      painMandate: 3,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 4,
      wedge: 3,
      grossMargin: 80,
      cacLtv: 4,
      moatBuild: 2,
    },
  },
  A10: {
    y1RevenueMidpoint: 34000,
    costToLaunch: 20000,
    nextAction: "Find an ESG consultancy partner on a rev-share basis",
    dependencies: [],
    cannibalizationCluster: null,
    deadline: "2026-12-31",
    axes: {
      timeToShip: 16,
      studioLeverage: 1,
      distribution: 3,
      tamCeiling: 3,
      painMandate: 4,
      halfLife: 8,
      teamFit: 1,
      manualEffort: 2,
      wedge: 2,
      grossMargin: 40,
      cacLtv: 2,
      moatBuild: 2,
    },
  },
  L1: {
    y1RevenueMidpoint: 180000,
    costToLaunch: 0,
    nextAction: "Package the next upsell into every Sproochtest cohort",
    dependencies: [],
    cannibalizationCluster: "luxembourgish-b2c",
    axes: {
      timeToShip: 1,
      studioLeverage: 5,
      distribution: 5,
      tamCeiling: 3,
      painMandate: 5,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 4,
      wedge: 4,
      grossMargin: 78,
      cacLtv: 4,
      moatBuild: 4,
    },
  },
  L2: {
    y1RevenueMidpoint: 95000,
    costToLaunch: 5000,
    nextAction: "Convert the medical pilot into a signed hospital cohort",
    dependencies: [],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 4,
      studioLeverage: 3,
      distribution: 3,
      tamCeiling: 3,
      painMandate: 4,
      halfLife: 36,
      teamFit: 4,
      manualEffort: 3,
      wedge: 4,
      grossMargin: 68,
      cacLtv: 3,
      moatBuild: 5,
    },
  },
  L3: {
    y1RevenueMidpoint: 70000,
    costToLaunch: 2500,
    nextAction: "Finalize the finance-French variant and close 1 pilot",
    dependencies: [],
    cannibalizationCluster: "language-corporate",
    axes: {
      timeToShip: 3,
      studioLeverage: 4,
      distribution: 4,
      tamCeiling: 4,
      painMandate: 3,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 3,
      wedge: 3,
      grossMargin: 70,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  L4: {
    y1RevenueMidpoint: 140000,
    costToLaunch: 0,
    nextAction: "Turn the active client base into packaged upsell offers",
    dependencies: [],
    cannibalizationCluster: "language-corporate",
    axes: {
      timeToShip: 1,
      studioLeverage: 5,
      distribution: 5,
      tamCeiling: 4,
      painMandate: 4,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 4,
      wedge: 4,
      grossMargin: 68,
      cacLtv: 4,
      moatBuild: 3,
    },
  },
  L5: {
    y1RevenueMidpoint: 85000,
    costToLaunch: 1000,
    nextAction: "Bundle Luxembourgish for Business into HR onboarding offers",
    dependencies: [],
    cannibalizationCluster: "luxembourgish-b2c",
    axes: {
      timeToShip: 2,
      studioLeverage: 4,
      distribution: 4,
      tamCeiling: 3,
      painMandate: 3,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 3,
      wedge: 3,
      grossMargin: 70,
      cacLtv: 3,
      moatBuild: 3,
    },
  },
  B1: {
    y1RevenueMidpoint: 90000,
    costToLaunch: 12000,
    nextAction: "Ship the curriculum and secure 2 German agency partners",
    dependencies: [],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 12,
      studioLeverage: 2,
      distribution: 2,
      tamCeiling: 4,
      painMandate: 4,
      halfLife: 36,
      teamFit: 3,
      manualEffort: 3,
      wedge: 4,
      grossMargin: 58,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  B2: {
    y1RevenueMidpoint: 50000,
    costToLaunch: 10000,
    nextAction: "Wait for B1 validation, then clone the playbook for French",
    dependencies: ["B1"],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 16,
      studioLeverage: 2,
      distribution: 2,
      tamCeiling: 4,
      painMandate: 4,
      halfLife: 36,
      teamFit: 3,
      manualEffort: 3,
      wedge: 4,
      grossMargin: 58,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  B3: {
    y1RevenueMidpoint: 45000,
    costToLaunch: 1000,
    nextAction: "Launch EU outreach on LinkedIn and through Benelux partners",
    dependencies: ["A1"],
    cannibalizationCluster: "ai-workshops",
    deadline: "2027-02-01",
    axes: {
      timeToShip: 2,
      studioLeverage: 5,
      distribution: 2,
      tamCeiling: 5,
      painMandate: 5,
      halfLife: 10,
      teamFit: 4,
      manualEffort: 4,
      wedge: 3,
      grossMargin: 78,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  B4: {
    y1RevenueMidpoint: 87000,
    costToLaunch: 5000,
    nextAction: "Package the top 3 courses and create the licensing template",
    dependencies: ["L1", "L2", "L3"],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 8,
      studioLeverage: 5,
      distribution: 2,
      tamCeiling: 3,
      painMandate: 2,
      halfLife: 36,
      teamFit: 4,
      manualEffort: 5,
      wedge: 4,
      grossMargin: 85,
      cacLtv: 4,
      moatBuild: 4,
    },
  },
  B5: {
    y1RevenueMidpoint: 170000,
    costToLaunch: 30000,
    nextAction: "Find a recruitment agency partner before building the full pipeline",
    dependencies: ["B1", "B2"],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 24,
      studioLeverage: 2,
      distribution: 1,
      tamCeiling: 5,
      painMandate: 4,
      halfLife: 36,
      teamFit: 2,
      manualEffort: 2,
      wedge: 5,
      grossMargin: 45,
      cacLtv: 4,
      moatBuild: 4,
    },
  },
  B6: {
    y1RevenueMidpoint: 65000,
    costToLaunch: 5000,
    nextAction: "Pitch 2 staffing agencies on a bundled pilot",
    dependencies: [],
    cannibalizationCluster: null,
    axes: {
      timeToShip: 8,
      studioLeverage: 4,
      distribution: 2,
      tamCeiling: 3,
      painMandate: 3,
      halfLife: 36,
      teamFit: 4,
      manualEffort: 3,
      wedge: 3,
      grossMargin: 60,
      cacLtv: 3,
      moatBuild: 2,
    },
  },
  C1: {
    y1RevenueMidpoint: 22000,
    costToLaunch: 0,
    nextAction: "Reprice and re-engage the 94 existing leads by email",
    dependencies: [],
    cannibalizationCluster: "oet",
    axes: {
      timeToShip: 1,
      studioLeverage: 5,
      distribution: 3,
      tamCeiling: 2,
      painMandate: 4,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 3,
      wedge: 3,
      grossMargin: 72,
      cacLtv: 2,
      moatBuild: 2,
    },
  },
  L6: {
    y1RevenueMidpoint: 60000,
    costToLaunch: 0,
    nextAction: "Scale cohort recruitment in Filipino and Indian nurse communities",
    dependencies: [],
    cannibalizationCluster: "oet",
    axes: {
      timeToShip: 1,
      studioLeverage: 5,
      distribution: 3,
      tamCeiling: 3,
      painMandate: 4,
      halfLife: 36,
      teamFit: 5,
      manualEffort: 3,
      wedge: 3,
      grossMargin: 72,
      cacLtv: 3,
      moatBuild: 3,
    },
  },
  L7: {
    y1RevenueMidpoint: 80000,
    costToLaunch: 0,
    nextAction: "Target ECFMG-seeking doctors via LinkedIn and UAE associations",
    dependencies: [],
    cannibalizationCluster: "oet",
    axes: {
      timeToShip: 1,
      studioLeverage: 4,
      distribution: 3,
      tamCeiling: 3,
      painMandate: 4,
      halfLife: 36,
      teamFit: 4,
      manualEffort: 2,
      wedge: 4,
      grossMargin: 75,
      cacLtv: 4,
      moatBuild: 3,
    },
  },
};

function computeScore(
  axes: Axes,
  weights: Partial<Record<keyof Axes, number>>,
  confidence: number
) {
  let raw = 0;
  for (const [key, weight] of Object.entries(weights) as [keyof Axes, number][]) {
    const value = key === "grossMargin" ? axes[key] / 20 : axes[key];
    raw += value * weight;
  }
  return Number((raw * (confidence / 100)).toFixed(2));
}

function getProductKey(product: Product) {
  return product.code.split("·")[0]?.trim() ?? product.code;
}

function getBottleneck(axes: Axes): Bottleneck {
  const candidates: [BottleneckAxis, number][] = [
    ["distribution", axes.distribution],
    ["teamFit", axes.teamFit],
    ["studioLeverage", axes.studioLeverage],
    ["tamCeiling", axes.tamCeiling],
    ["painMandate", axes.painMandate],
    ["manualEffort", axes.manualEffort],
    ["wedge", axes.wedge],
    ["cacLtv", axes.cacLtv],
    ["moatBuild", axes.moatBuild],
  ];
  const [key, value] = [...candidates].sort((a, b) => a[1] - b[1])[0];
  return {
    key,
    value,
    label: AXIS_LABELS[key],
  };
}

function monthsUntil(dateString: string) {
  const target = new Date(`${dateString}T00:00:00Z`);
  const months =
    (target.getUTCFullYear() - NOW.getUTCFullYear()) * 12 +
    (target.getUTCMonth() - NOW.getUTCMonth());
  return Math.max(months, 0);
}

function getUrgencyLabel(meta: ProductStrategyMeta) {
  const remaining = meta.deadline ? monthsUntil(meta.deadline) : meta.axes.halfLife;
  return remaining === 0 ? "Now" : `${remaining} mo`;
}

function compareNumbers(a: number, b: number, direction: "asc" | "desc") {
  return direction === "asc" ? a - b : b - a;
}

function compareText(a: string, b: string, direction: "asc" | "desc") {
  return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
}

export function getAxisLabel(key: keyof Axes | BottleneckAxis) {
  return AXIS_LABELS[key];
}

export function getScoreForPreset(product: EnrichedProduct, preset: Preset) {
  if (preset === "venture") return product.ventureScore;
  if (preset === "cashflow") return product.cashflowScore;
  return product.balancedScore;
}

export function getDefaultFilters(): Filters {
  return {
    market: "all",
    model: "all",
    scoreMetric: "cashflow",
    scoreMin: 0,
    bottleneckType: "all",
    urgentOnly: false,
    dependenciesResolved: "all",
    search: "",
  };
}

export function getDefaultSortState(preset: Preset): SortState {
  if (preset === "venture") {
    return { column: "venture", direction: "desc" };
  }
  if (preset === "cashflow") {
    return { column: "cashflow", direction: "desc" };
  }
  return { column: "delta", direction: "asc" };
}

export function enrichProducts(products: Product[]): EnrichedProduct[] {
  return products.map((product) => {
    const shortCode = getProductKey(product);
    const meta = PRODUCT_META[shortCode];
    if (!meta) {
      throw new Error(`Missing decision metadata for ${shortCode}`);
    }

    const ventureScore = computeScore(productMeta(shortCode).axes, VENTURE_WEIGHTS, product.confidence);
    const cashflowScore = computeScore(productMeta(shortCode).axes, CASHFLOW_WEIGHTS, product.confidence);
    const balancedScore = computeScore(productMeta(shortCode).axes, BALANCED_WEIGHTS, product.confidence);
    const bottleneck = getBottleneck(meta.axes);
    const modelList = product.model.split(",").map((entry) => entry.trim()) as EnrichedProduct["modelList"];
    const halfLifeCountdownMonths = meta.deadline ? monthsUntil(meta.deadline) : meta.axes.halfLife;

    return {
      ...product,
      key: shortCode,
      shortCode,
      stage: product.bp,
      stageLabel: STAGE_LABELS[product.bp],
      stageOrder: STAGE_ORDER[product.bp],
      modelList,
      axes: meta.axes,
      ventureScore,
      cashflowScore,
      balancedScore,
      delta: Number((ventureScore - cashflowScore).toFixed(2)),
      y1Contribution: Math.round(meta.y1RevenueMidpoint * (meta.axes.grossMargin / 100)),
      costToLaunch: meta.costToLaunch,
      nextAction: meta.nextAction,
      dependencies: meta.dependencies,
      dependenciesResolved: meta.dependencies.length === 0,
      cannibalizationCluster: meta.cannibalizationCluster,
      bottleneck,
      halfLifeMonths: meta.axes.halfLife,
      halfLifeCountdownMonths,
      urgencyLabel: getUrgencyLabel(meta),
      quickWinScore: Number(((meta.axes.studioLeverage * 10) / meta.axes.timeToShip).toFixed(2)),
      deadline: meta.deadline,
    };
  });
}

function productMeta(key: string) {
  const meta = PRODUCT_META[key];
  if (!meta) {
    throw new Error(`Missing decision metadata for ${key}`);
  }
  return meta;
}

export function applyFilters(
  products: EnrichedProduct[],
  filters: Filters,
  preset: Preset
) {
  const search = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.market !== "all" && product.market !== filters.market) return false;
    if (filters.model !== "all" && !product.modelList.includes(filters.model)) return false;
    if (filters.bottleneckType !== "all" && product.bottleneck.key !== filters.bottleneckType) {
      return false;
    }
    if (filters.urgentOnly && product.halfLifeCountdownMonths >= 18) return false;
    if (
      filters.dependenciesResolved !== "all" &&
      product.dependenciesResolved !== filters.dependenciesResolved
    ) {
      return false;
    }

    const score =
      filters.scoreMetric === "venture" ? product.ventureScore : product.cashflowScore;
    if (score < filters.scoreMin) return false;

    if (preset === "venture" && filters.scoreMetric === "cashflow" && product.ventureScore < 0) {
      return false;
    }

    if (!search) return true;

    const haystack = [
      product.shortCode,
      product.title,
      product.market,
      product.model,
      product.stageLabel,
      product.tags.join(" "),
      product.bottleneck.label,
      product.nextAction,
      product.dependencies.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function applySort(products: EnrichedProduct[], sort: SortState): EnrichedProduct[] {
  if (!sort.column) return products;

  const next = [...products];
  next.sort((a, b) => {
    switch (sort.column) {
      case "code":
        return compareText(a.shortCode, b.shortCode, sort.direction);
      case "product":
        return compareText(a.title, b.title, sort.direction);
      case "stage":
        return compareNumbers(a.stageOrder, b.stageOrder, sort.direction);
      case "timeToShip":
        return compareNumbers(a.axes.timeToShip, b.axes.timeToShip, sort.direction);
      case "quickWin":
        return compareNumbers(a.quickWinScore, b.quickWinScore, sort.direction);
      case "venture":
        return compareNumbers(a.ventureScore, b.ventureScore, sort.direction);
      case "cashflow":
        return compareNumbers(a.cashflowScore, b.cashflowScore, sort.direction);
      case "delta":
        return compareNumbers(a.delta, b.delta, sort.direction);
      case "y1Contribution":
        return compareNumbers(a.y1Contribution, b.y1Contribution, sort.direction);
      case "bottleneck":
        return compareNumbers(a.bottleneck.value, b.bottleneck.value, sort.direction);
      case "halfLife":
        return compareNumbers(a.halfLifeCountdownMonths, b.halfLifeCountdownMonths, sort.direction);
      default:
        return 0;
    }
  });
  return next;
}

export function applySortPreset(
  preset: SortPreset,
  currentFilters: Filters,
  currentPreset: Preset
): {
  filters: Filters;
  preset: Preset;
  sort: SortState;
} {
  if (preset === "ship60") {
    return {
      preset: "cashflow",
      filters: {
        ...currentFilters,
        scoreMetric: "cashflow",
        urgentOnly: false,
      },
      sort: { column: "cashflow", direction: "desc" },
    };
  }

  if (preset === "venture") {
    return {
      preset: "venture",
      filters: {
        ...currentFilters,
        scoreMetric: "venture",
      },
      sort: { column: "venture", direction: "desc" },
    };
  }

  if (preset === "quickwins") {
    return {
      preset: currentPreset,
      filters: currentFilters,
      sort: { column: "quickWin", direction: "desc" },
    };
  }

  return {
    preset: currentPreset,
    filters: {
      ...currentFilters,
      urgentOnly: true,
    },
    sort: { column: "halfLife", direction: "asc" },
  };
}

export function applyPresetHeuristic(
  products: EnrichedProduct[],
  preset: SortPreset
): EnrichedProduct[] {
  if (preset === "ship60") {
    return products.filter((product) => product.axes.timeToShip <= 8);
  }

  if (preset === "venture") {
    return products.filter((product) => product.delta > 0);
  }

  return products;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 100000 ? "compact" : "standard",
    maximumFractionDigits: value >= 100000 ? 1 : 0,
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatScore(value: number) {
  return value.toFixed(2);
}

export function formatHalfLife(product: EnrichedProduct) {
  return `${product.urgencyLabel} left`;
}

export function confidenceBreakdown(product: EnrichedProduct, preset: Preset) {
  const raw =
    preset === "venture"
      ? computeScore(product.axes, VENTURE_WEIGHTS, 100)
      : preset === "cashflow"
      ? computeScore(product.axes, CASHFLOW_WEIGHTS, 100)
      : computeScore(product.axes, BALANCED_WEIGHTS, 100);

  return {
    raw: Number(raw.toFixed(2)),
    confidenceMultiplier: Number((product.confidence / 100).toFixed(2)),
    adjusted: getScoreForPreset(product, preset),
  };
}
