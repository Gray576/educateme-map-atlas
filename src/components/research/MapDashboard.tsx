"use client";

import { useEffect, useMemo } from "react";

import { ExplainabilityDrawer } from "@/components/research/ExplainabilityDrawer";
import { ResearchActiveFilters } from "@/components/research/ResearchActiveFilters";
import { ResearchScreenNav } from "@/components/research/ResearchScreenNav";
import { useResearchUrlState } from "@/components/research/useResearchUrlState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ARCHETYPE_OPTIONS, getArchetypeVisual } from "@/lib/research-metadata";
import {
  assignBands,
  applyFounderFilters,
  getActiveFilterChips,
  getDefaultFounderFilters,
  getUniqueOptions,
} from "@/lib/research-view";
import { cn } from "@/lib/utils";
import type { ConfidenceBand, ScoredProductRecord } from "@/types";

type PlotSegment = "B2B" | "B2C";

type QuadrantPoint = {
  code: string;
  title: string;
  releaseStatus: ScoredProductRecord["releaseStatus"];
  quadrantSegment: ScoredProductRecord["quadrantSegment"];
  archetype: ScoredProductRecord["archetype"];
  product: ScoredProductRecord;
  x: number;
  y: number;
  radius: number;
  velocityCoverage: number;
  pullCoverage: number;
  plotSegment: PlotSegment;
  missingSignals: string[];
};

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent outline-none"
      >
        <option value="all">all</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatAxis(value: number) {
  return value.toFixed(0);
}

function formatCoverage(value: number) {
  return `${Math.round(value * 100)}%`;
}

function ArchetypeLegendCard({
  item,
}: {
  item: (typeof ARCHETYPE_OPTIONS)[number];
}) {
  return (
    <div
      className="group relative flex min-w-[112px] items-center gap-2 rounded-md px-2 py-1.5"
      style={{ backgroundColor: item.fill }}
      tabIndex={0}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.text }} />
      <span className="text-[11px] font-semibold leading-4" style={{ color: item.text }}>
        {item.legendLines[0]}
        <br />
        {item.legendLines[1]}
      </span>

      <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-[260px] rounded-lg border border-border bg-popover px-3 py-2.5 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        <p className="text-xs leading-5 text-foreground">{item.guide.whatItIs}</p>
      </div>
    </div>
  );
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function confidenceBandTone(band: ConfidenceBand | "unknown") {
  if (band === "high") return "bg-emerald-100 text-emerald-800";
  if (band === "medium") return "bg-amber-100 text-amber-800";
  if (band === "low" || band === "blocked") return "bg-rose-100 text-rose-800";
  return "bg-muted text-muted-foreground";
}

function releaseTone(status: ScoredProductRecord["releaseStatus"]) {
  if (status === "publish") return "bg-emerald-100 text-emerald-800";
  if (status === "review") return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

function normalizeOneToFive(value: number | null) {
  if (value === null) return null;
  return Math.max(0, Math.min(100, (value / 5) * 100));
}

function weightedAverage(
  entries: Array<{ scoreValue: number; observed: boolean; weight: number }>
): { score: number | null; coverage: number } {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const coveredWeight = entries
    .filter((entry) => entry.observed)
    .reduce((sum, entry) => sum + entry.weight, 0);

  if (entries.length === 0 || totalWeight === 0) {
    return { score: null, coverage: 0 };
  }

  const weightedScore =
    entries.reduce((sum, entry) => sum + entry.scoreValue * entry.weight, 0) / totalWeight;

  return {
    score: Math.max(0, Math.min(100, weightedScore)),
    coverage: clamp01(coveredWeight / totalWeight),
  };
}

function getPlotSegment(product: ScoredProductRecord): PlotSegment {
  return product.quadrantSegment === "B2C" ? "B2C" : "B2B";
}

function scoreOrBaseline(value: number | null, baseline = 1) {
  return normalizeOneToFive(value) ?? normalizeOneToFive(baseline) ?? 0;
}

function buildQuadrantPoint(product: ScoredProductRecord): QuadrantPoint {
  const velocityFromComposite = normalizeOneToFive(product.validationVelocityComposite);
  const pullFromComposite = normalizeOneToFive(product.demandPullComposite);

  const velocityParts = weightedAverage([
    {
      scoreValue: scoreOrBaseline(product.validationVelocityScore),
      observed: product.validationVelocityScore !== null,
      weight: 15,
    },
    {
      scoreValue: scoreOrBaseline(product.timeToFirstEuroScore),
      observed: product.timeToFirstEuroScore !== null,
      weight: 10,
    },
    {
      scoreValue: scoreOrBaseline(product.founderIndependenceScore),
      observed: product.founderIndependenceScore !== null,
      weight: 10,
    },
  ]);

  const effectiveVelocity = velocityFromComposite ?? velocityParts.score ?? 0;

  const effectiveCac =
    product.cacRealityScore !== null && product.channelFitScore !== null
      ? (product.cacRealityScore + product.channelFitScore) / 2
      : product.cacRealityScore ?? product.channelFitScore;

  const pullParts = weightedAverage([
    {
      scoreValue: scoreOrBaseline(product.demandEvidenceScore),
      observed: product.demandEvidenceScore !== null,
      weight: 20,
    },
    {
      scoreValue: scoreOrBaseline(product.willingnessToPayScore),
      observed: product.willingnessToPayScore !== null,
      weight: 15,
    },
    {
      scoreValue: scoreOrBaseline(effectiveCac),
      observed: effectiveCac !== null,
      weight: 15,
    },
    {
      scoreValue: scoreOrBaseline(product.retentionStructureScore),
      observed: product.retentionStructureScore !== null,
      weight: 10,
    },
    {
      scoreValue: scoreOrBaseline(product.macroTrajectoryScore),
      observed: product.macroTrajectoryScore !== null,
      weight: 5,
    },
  ]);

  const effectivePull = pullFromComposite ?? pullParts.score ?? 0;
  const safeRadius = 10 + Math.min(18, product.safeFieldCount * 1.4);

  const missingSignals: string[] = [];
  if (product.founderIndependenceScore === null) missingSignals.push("founder-independence");
  if (product.demandEvidenceScore === null) missingSignals.push("demand evidence");
  if (product.willingnessToPayScore === null) missingSignals.push("WTP");
  if (product.cacRealityScore === null && product.channelFitScore === null) missingSignals.push("CAC / channel fit");

  return {
    code: product.code,
    title: product.title,
    releaseStatus: product.releaseStatus,
    quadrantSegment: product.quadrantSegment,
    archetype: product.archetype,
    product,
    x: effectiveVelocity,
    y: effectivePull,
    radius: safeRadius,
    velocityCoverage: velocityParts.coverage,
    pullCoverage: pullParts.coverage,
    plotSegment: getPlotSegment(product),
    missingSignals,
  };
}

function sortQuadrantPoints(points: QuadrantPoint[]) {
  return [...points].sort((left, right) => {
    const rightScore = right.x + right.y;
    const leftScore = left.x + left.y;
    if (rightScore !== leftScore) return rightScore - leftScore;
    return left.code.localeCompare(right.code);
  });
}

function buildQuadrantReading(points: QuadrantPoint[]) {
  const ordered = sortQuadrantPoints(points);
  const firstWave = ordered[0] ?? null;
  const reformulate =
    [...points]
      .filter((point) => point.y >= 50)
      .sort((left, right) => left.x - right.x)[0] ?? null;
  const contrarian =
    [...points]
      .filter((point) => point.x >= 50)
      .sort((left, right) => right.x - right.y - (left.x - left.y))[0] ?? null;
  const kill =
    [...points].sort((left, right) => left.x + left.y - (right.x + right.y))[0] ?? null;
  const avgPullCoverage =
    points.length > 0 ? points.reduce((sum, point) => sum + point.pullCoverage, 0) / points.length : 0;

  return {
    firstWave,
    reformulate,
    contrarian,
    kill,
    avgPullCoverage,
    snapshot: [
      `${points.length} products in this plot`,
      `Average pull coverage: ${formatCoverage(avgPullCoverage)}`,
      `Release mix: ${[...new Set(points.map((point) => point.releaseStatus))].join(", ") || "none"}`,
      `Archetypes: ${[...new Set(points.map((point) => point.archetype.shortLabel))].slice(0, 3).join(", ") || "none"}`,
    ],
  };
}

function QuadrantPlot({
  label,
  description,
  points,
  onSelect,
}: {
  label: string;
  description: string;
  points: QuadrantPoint[];
  onSelect: (code: string) => void;
}) {
  const reading = buildQuadrantReading(points);

  return (
    <section className="rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
          pull coverage {formatCoverage(reading.avgPullCoverage)}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
          X: Validation Velocity
        </Badge>
        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
          Y: Demand Pull
        </Badge>
        <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
          Size: safe fields
        </Badge>
      </div>

      <div className="mt-4 rounded-md border border-border bg-background p-3">
        <svg viewBox="0 0 920 540" className="h-auto w-full">
          <rect x="40" y="28" width="820" height="440" fill="#fbfaf6" stroke="#d8d4c8" />
          <rect x="450" y="28" width="410" height="220" fill="#eef8f4" />
          <rect x="40" y="28" width="410" height="220" fill="#fdf7e8" />
          <rect x="450" y="248" width="410" height="220" fill="#eef5fb" />
          <rect x="40" y="248" width="410" height="220" fill="#fdf0f3" />

          {[25, 50, 75].map((tick) => (
            <g key={`tick-${tick}`}>
              <line x1={40 + tick * 8.2} y1={28} x2={40 + tick * 8.2} y2={468} stroke="#ddd7c8" />
              <line x1={40} y1={468 - tick * 4.4} x2={860} y2={468 - tick * 4.4} stroke="#ddd7c8" />
            </g>
          ))}

          <text x="52" y="44" fill="#5e7268" fontSize="14">Higher observable pull</text>
          <text x="708" y="500" fill="#5e7268" fontSize="14">Faster validation velocity</text>
          <text x="42" y="500" fill="#9a5363" fontSize="14">Harder / slower to validate</text>
          <text x="52" y="458" fill="#9a5363" fontSize="14">Weaker observed pull</text>
          <text x="500" y="64" fill="#126b56" fontSize="14" fontWeight="600">
            First wave: high pull, fast signal
          </text>
          <text x="70" y="64" fill="#9b5f0b" fontSize="14" fontWeight="600">
            Reformulate: high pull, slower test
          </text>
          <text x="500" y="430" fill="#295d9d" fontSize="14" fontWeight="600">
            Contrarian: fast test, weaker pull
          </text>
          <text x="70" y="430" fill="#aa4f62" fontSize="14" fontWeight="600">
            Kill or hold: low pull, slow signal
          </text>

          {points.map((point) => {
            const cx = 40 + point.x * 8.2;
            const cy = 468 - point.y * 4.4;
            const tone = getArchetypeVisual(point.archetype.id);
            const strokeWidth = 2 + (1 - point.pullCoverage) * 3;
            const dash = point.pullCoverage < 0.5 ? "6 4" : undefined;

            return (
              <g
                key={point.code}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(point.code)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(point.code);
                  }
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={point.radius}
                  fill={tone.fill}
                  stroke={point.releaseStatus === "blocked" ? "#b42318" : tone.text}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dash}
                />
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill={tone.text}
                  fontSize="14"
                  fontWeight="700"
                >
                  {point.code}
                </text>
                <text
                  x={cx}
                  y={cy + point.radius + 18}
                  textAnchor="middle"
                  fill="#65736f"
                  fontSize="11"
                >
                  {formatAxis(point.x)} · {formatAxis(point.y)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <section className="rounded-md border border-border bg-background px-3 py-2.5">
          <h3 className="text-sm font-semibold">Reading</h3>
          <div className="mt-3 space-y-3">
            {reading.firstWave ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">First wave</p>
                <p className="text-sm font-semibold">{reading.firstWave.code} {reading.firstWave.title}</p>
              </div>
            ) : null}
            {reading.reformulate ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Reformulate experiment</p>
                <p className="text-sm font-semibold">{reading.reformulate.code} {reading.reformulate.title}</p>
              </div>
            ) : null}
            {reading.contrarian ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Second wave / contrarian</p>
                <p className="text-sm font-semibold">{reading.contrarian.code} {reading.contrarian.title}</p>
              </div>
            ) : null}
            {reading.kill ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Kill / hold</p>
                <p className="text-sm font-semibold">{reading.kill.code} {reading.kill.title}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-md border border-border bg-background px-3 py-2.5">
          <h3 className="text-sm font-semibold">Snapshot</h3>
          <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
            {reading.snapshot.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export function MapDashboard({ products }: { products: ScoredProductRecord[] }) {
  const { filters, setFilters, selectedCode, setSelectedCode, buildHref } = useResearchUrlState();

  const options = useMemo(
    () => ({
      market: getUniqueOptions(products, "market"),
      release: getUniqueOptions(products, "release"),
      segment: getUniqueOptions(products, "segment"),
      buyer: getUniqueOptions(products, "buyer"),
      archetype: getUniqueOptions(products, "archetype"),
      claims: getUniqueOptions(products, "claims"),
      subsidy: getUniqueOptions(products, "subsidy"),
      dependencies: getUniqueOptions(products, "dependencies"),
    }),
    [products]
  );

  const filteredProducts = useMemo(() => applyFounderFilters(products, filters), [filters, products]);
  const activeFilterChips = useMemo(() => getActiveFilterChips(filters), [filters]);

  const orderedProducts = useMemo(
    () =>
      [...filteredProducts].sort((left, right) => {
        const rightVelocity = right.validationVelocityComposite ?? right.validationVelocityScore ?? 0;
        const leftVelocity = left.validationVelocityComposite ?? left.validationVelocityScore ?? 0;
        const rightPull = right.demandPullComposite ?? right.demandEvidenceScore ?? right.retentionStructureScore ?? 0;
        const leftPull = left.demandPullComposite ?? left.demandEvidenceScore ?? left.retentionStructureScore ?? 0;
        const rightRank = rightVelocity + rightPull;
        const leftRank = leftVelocity + leftPull;
        if (rightRank !== leftRank) return rightRank - leftRank;
        return left.code.localeCompare(right.code);
      }),
    [filteredProducts]
  );
  const orderedRows = useMemo(() => assignBands(orderedProducts), [orderedProducts]);

  const points = useMemo(() => orderedProducts.map(buildQuadrantPoint), [orderedProducts]);
  const b2bPoints = useMemo(() => points.filter((point) => point.plotSegment === "B2B"), [points]);
  const b2cPoints = useMemo(() => points.filter((point) => point.plotSegment === "B2C"), [points]);

  const selectedIndex = orderedRows.findIndex((item) => item.code === selectedCode);
  const selectedProduct = selectedIndex >= 0 ? orderedRows[selectedIndex] : null;

  useEffect(() => {
    if (selectedCode && !orderedRows.some((item) => item.code === selectedCode)) {
      setSelectedCode(null);
    }
  }, [orderedRows, selectedCode, setSelectedCode]);

  const selectedPoint = points.find((point) => point.code === selectedCode) ?? null;

  return (
    <main className="mx-auto max-w-[1540px] px-4 pb-6 pt-4 sm:px-5 lg:px-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-start">
        <div className="md:justify-self-start">
          <div className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-foreground">
            EducateMe
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Quadrant map · validation velocity × demand pull</p>
        </div>
        <div className="md:justify-self-center">
          <ResearchScreenNav active="map" buildHref={buildHref} />
        </div>
        <div aria-hidden="true" className="hidden md:block" />
      </div>

      <section className="mt-3 rounded-md border border-border bg-card px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          Quadrant protocol
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This map no longer uses delivery-ease or claim-safety coordinates. X is the current validation velocity composite.
          Y is demand pull from commercial validation. B2B and B2C are plotted separately. Dashed or heavier outlines mean the
          pull side is still only partially filled before SEMrush.
        </p>
      </section>

      <section className="mt-2 flex flex-wrap gap-2">
        <SelectControl label="Market" value={filters.market} options={options.market} onChange={(value) => setFilters((current) => ({ ...current, market: value }))} />
        <SelectControl label="Release" value={filters.release} options={options.release} onChange={(value) => setFilters((current) => ({ ...current, release: value }))} />
        <SelectControl label="Segment" value={filters.segment} options={options.segment} onChange={(value) => setFilters((current) => ({ ...current, segment: value }))} />
        <SelectControl label="Buyer" value={filters.buyer} options={options.buyer} onChange={(value) => setFilters((current) => ({ ...current, buyer: value }))} />
        <SelectControl label="Archetype" value={filters.archetype} options={options.archetype} onChange={(value) => setFilters((current) => ({ ...current, archetype: value }))} />
        <SelectControl label="Claims" value={filters.claims} options={options.claims} onChange={(value) => setFilters((current) => ({ ...current, claims: value }))} />
        <SelectControl label="Subsidy" value={filters.subsidy} options={options.subsidy} onChange={(value) => setFilters((current) => ({ ...current, subsidy: value }))} />
        <SelectControl label="Dependencies" value={filters.dependencies} options={options.dependencies} onChange={(value) => setFilters((current) => ({ ...current, dependencies: value }))} />
        <Button
          variant="ghost"
          onClick={() => setFilters(getDefaultFounderFilters())}
          className="h-7 rounded-md px-2.5 text-xs"
        >
          Reset filters
        </Button>
      </section>

      <ResearchActiveFilters count={filteredProducts.length} total={products.length} chips={activeFilterChips} />

      <section className="mt-3 rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
            Velocity = Testability + Time-to-first-€ + Founder-independence
          </Badge>
          <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
            Pull = Demand evidence + WTP + CAC reality + Retention
          </Badge>
          <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
            Regulatory friction stays as a penalty note, not a Y-axis input
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ARCHETYPE_OPTIONS.map((item) => (
            <ArchetypeLegendCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-3 space-y-3">
        {b2bPoints.length > 0 ? (
          <QuadrantPlot
            label="B2B quadrant"
            description="Enterprise, partner, and B2B2C motions are grouped here because the validation route starts with buyer conversations, pilots, or partner asks."
            points={b2bPoints}
            onSelect={setSelectedCode}
          />
        ) : null}

        {b2cPoints.length > 0 ? (
          <QuadrantPlot
            label="B2C quadrant"
            description="Direct learner motions are plotted separately because the validation mechanics are different from enterprise sales."
            points={b2cPoints}
            onSelect={setSelectedCode}
          />
        ) : null}

        {b2bPoints.length === 0 && b2cPoints.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-4 py-10 text-center text-muted-foreground">
            No products match the current filters.
          </div>
        ) : null}
      </section>

      {selectedPoint ? (
        <section className={cn("mt-3 rounded-md border border-border bg-card p-4", selectedProduct && "opacity-65")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Selected point: {selectedPoint.code} {selectedPoint.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Velocity {formatAxis(selectedPoint.x)} · Pull {formatAxis(selectedPoint.y)} · Velocity coverage {formatCoverage(selectedPoint.velocityCoverage)} · Pull coverage {formatCoverage(selectedPoint.pullCoverage)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge className={cn("rounded-md px-2.5 py-1 text-xs", releaseTone(selectedPoint.releaseStatus))}>
                {selectedPoint.releaseStatus}
              </Badge>
              <Badge variant="outline" className="rounded-md px-2.5 py-1 text-xs">
                {selectedPoint.quadrantSegment}
              </Badge>
              <Badge className={cn("rounded-md px-2.5 py-1 text-xs", confidenceBandTone(selectedPoint.product.demandPullConfidenceBand))}>
                pull confidence {selectedPoint.product.demandPullConfidenceBand}
              </Badge>
            </div>
          </div>

          {selectedPoint.missingSignals.length > 0 ? (
            <div className="mt-3 rounded-md border border-border bg-background px-3 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Missing signals</p>
              <p className="mt-1 text-sm">{selectedPoint.missingSignals.join(", ")}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <ExplainabilityDrawer
        product={selectedProduct}
        preset="founder"
        onClose={() => setSelectedCode(null)}
        onPrevious={
          selectedIndex > 0 ? () => setSelectedCode(orderedRows[selectedIndex - 1]!.code) : undefined
        }
        onNext={
          selectedIndex >= 0 && selectedIndex < orderedRows.length - 1
            ? () => setSelectedCode(orderedRows[selectedIndex + 1]!.code)
            : undefined
        }
      />
    </main>
  );
}
