"use client";

import { useEffect, useMemo } from "react";

import { ExplainabilityDrawer } from "@/components/research/ExplainabilityDrawer";
import { ResearchActiveFilters } from "@/components/research/ResearchActiveFilters";
import { ResearchScreenNav } from "@/components/research/ResearchScreenNav";
import { useResearchUrlState } from "@/components/research/useResearchUrlState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRESET_OPTIONS } from "@/lib/research-metadata";
import {
  assignBands,
  applyFounderFilters,
  buildMapPoints,
  buildMapReading,
  getActiveFilterChips,
  getDefaultFounderFilters,
  getUniqueOptions,
  sortProductsByPreset,
} from "@/lib/research-view";
import { cn } from "@/lib/utils";
import type { ScoredProductRecord } from "@/types";

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
    <label className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm">
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

function pointTone(band: "top" | "mid" | "low") {
  if (band === "top") return { fill: "#d7efe5", stroke: "#126b56", text: "#126b56" };
  if (band === "mid") return { fill: "#f8e7c0", stroke: "#a76300", text: "#a76300" };
  return { fill: "#f5d7df", stroke: "#aa4f62", text: "#aa4f62" };
}

function formatScore(value: number) {
  return value.toFixed(0);
}

export function MapDashboard({ products }: { products: ScoredProductRecord[] }) {
  const { preset, setPreset, filters, setFilters, selectedCode, setSelectedCode, buildHref } =
    useResearchUrlState();

  const options = useMemo(
    () => ({
      market: getUniqueOptions(products, "market"),
      buyer: getUniqueOptions(products, "buyer"),
      claims: getUniqueOptions(products, "claims"),
      subsidy: getUniqueOptions(products, "subsidy"),
      dependencies: getUniqueOptions(products, "dependencies"),
    }),
    [products]
  );

  const rankedRows = useMemo(() => {
    const filtered = applyFounderFilters(products, filters);
    const sorted = sortProductsByPreset(filtered, preset);
    return assignBands(sorted);
  }, [filters, preset, products]);
  const activeFilterChips = useMemo(() => getActiveFilterChips(filters), [filters]);

  const points = useMemo(() => buildMapPoints(rankedRows), [rankedRows]);
  const reading = useMemo(() => buildMapReading(points), [points]);

  const selectedIndex = rankedRows.findIndex((item) => item.code === selectedCode);
  const selectedProduct = selectedIndex >= 0 ? rankedRows[selectedIndex] : null;

  useEffect(() => {
    if (selectedCode && !rankedRows.some((item) => item.code === selectedCode)) {
      setSelectedCode(null);
    }
  }, [rankedRows, selectedCode, setSelectedCode]);

  return (
    <main className="mx-auto max-w-[1540px] px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight">EducateMe · Hypothesis Sorting</h1>
          <p className="mt-2 text-2xl text-muted-foreground">Portfolio map · delivery × claim safety</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-2xl px-4 py-2 text-sm">
            Card data only
          </Badge>
          <Badge variant="outline" className="rounded-2xl px-4 py-2 text-sm">
            v1
          </Badge>
        </div>
      </div>

      <section className="mt-6">
        <ResearchScreenNav active="map" buildHref={buildHref} />
      </section>

      <section className="mt-4 flex flex-wrap items-center gap-3">
        {PRESET_OPTIONS.map((item) => (
          <Button
            key={item.key}
            variant={preset === item.key ? "default" : "outline"}
            size="lg"
            onClick={() => setPreset(item.key)}
            className="rounded-2xl px-6"
          >
            {item.label}
          </Button>
        ))}
      </section>

      <section className="mt-5 flex flex-wrap gap-3">
        <SelectControl label="Market" value={filters.market} options={options.market} onChange={(value) => setFilters((current) => ({ ...current, market: value }))} />
        <SelectControl label="Buyer" value={filters.buyer} options={options.buyer} onChange={(value) => setFilters((current) => ({ ...current, buyer: value }))} />
        <SelectControl label="Claims" value={filters.claims} options={options.claims} onChange={(value) => setFilters((current) => ({ ...current, claims: value }))} />
        <SelectControl label="Subsidy" value={filters.subsidy} options={options.subsidy} onChange={(value) => setFilters((current) => ({ ...current, subsidy: value }))} />
        <SelectControl label="Dependencies" value={filters.dependencies} options={options.dependencies} onChange={(value) => setFilters((current) => ({ ...current, dependencies: value }))} />
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setFilters(getDefaultFounderFilters())}
          className="rounded-2xl px-5"
        >
          Reset filters
        </Button>
      </section>

      <ResearchActiveFilters count={rankedRows.length} total={products.length} chips={activeFilterChips} />

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={cn(
          "rounded-[30px] border border-border bg-card p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] transition-opacity",
          selectedProduct && "opacity-65"
        )}>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="rounded-2xl px-4 py-2 text-base">X: Delivery ease</Badge>
            <Badge variant="outline" className="rounded-2xl px-4 py-2 text-base">Y: Claim safety</Badge>
            <Badge variant="outline" className="rounded-2xl px-4 py-2 text-base">Size: Buyer clarity</Badge>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[860px] rounded-[28px] border border-border bg-background p-4">
              <svg viewBox="0 0 920 620" className="h-auto w-full">
                <rect x="40" y="30" width="820" height="520" fill="#fbfaf6" stroke="#d8d4c8" />
                <rect x="450" y="30" width="410" height="260" fill="#eef8f4" />
                <rect x="40" y="290" width="410" height="260" fill="#fdf0f3" />

                {[25, 50, 75].map((tick) => (
                  <g key={`v-${tick}`}>
                    <line x1={40 + tick * 8.2} y1={30} x2={40 + tick * 8.2} y2={550} stroke="#ddd7c8" />
                    <line x1={40} y1={550 - tick * 5.2} x2={860} y2={550 - tick * 5.2} stroke="#ddd7c8" />
                  </g>
                ))}

                <text x="52" y="45" fill="#5e7268" fontSize="18">Safer claims</text>
                <text x="770" y="585" fill="#5e7268" fontSize="18">Easier to ship</text>
                <text x="52" y="545" fill="#9a5363" fontSize="18">Riskier claims</text>
                <text x="42" y="585" fill="#9a5363" fontSize="18">Harder to ship</text>
                <text x="460" y="70" fill="#126b56" fontSize="18" fontWeight="600">
                  Top-right: easiest to ship with safer claims
                </text>
                <text x="60" y="515" fill="#aa4f62" fontSize="18" fontWeight="600">
                  Bottom-left: heavy setup and risky messaging
                </text>

                {points.map((point) => {
                  const cx = 40 + point.x * 8.2;
                  const cy = 550 - point.y * 5.2;
                  const tone = pointTone(point.band);

                  return (
                    <g
                      key={point.code}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedCode(point.code)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedCode(point.code);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={point.radius}
                        fill={tone.fill}
                        stroke={tone.stroke}
                        strokeWidth="2.5"
                      />
                      <text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        fill={tone.text}
                        fontSize="22"
                        fontWeight="700"
                      >
                        {point.code}
                      </text>
                      <text
                        x={cx}
                        y={cy + point.radius + 24}
                        textAnchor="middle"
                        fill="#65736f"
                        fontSize="14"
                      >
                        {formatScore(point.scores.deliveryEase)} · {formatScore(point.scores.claimSafety)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        <aside className={cn(
          "rounded-[30px] border border-border bg-card p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] transition-opacity",
          selectedProduct && "opacity-65"
        )}>
          <h2 className="text-4xl font-semibold">Current sample reading</h2>
          <p className="mt-3 text-lg leading-7 text-muted-foreground">
            Same data, different angle: the map helps spot ship-now ideas versus heavier bets.
          </p>

          <div className="mt-8 space-y-4">
            {reading.topRight ? (
              <section className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="rounded-xl px-3 py-1 text-sm">
                    {reading.topRight.code}
                  </Badge>
                  <div>
                    <h3 className="text-2xl font-semibold">Closest to “ship now”</h3>
                    <p className="mt-1 text-base leading-7 text-muted-foreground">
                      High delivery ease and safer claim surface put this card nearest the top-right zone.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            {reading.interesting ? (
              <section className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="rounded-xl px-3 py-1 text-sm">
                    {reading.interesting.code}
                  </Badge>
                  <div>
                    <h3 className="text-2xl font-semibold">Interesting but heavier</h3>
                    <p className="mt-1 text-base leading-7 text-muted-foreground">
                      Stronger buyer clarity is visible here, but delivery or claims still add friction.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            {reading.bottomLeft ? (
              <section className="rounded-2xl border border-border bg-background px-4 py-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="rounded-xl px-3 py-1 text-sm">
                    {reading.bottomLeft.code}
                  </Badge>
                  <div>
                    <h3 className="text-2xl font-semibold">Complex route logic</h3>
                    <p className="mt-1 text-base leading-7 text-muted-foreground">
                      Lower delivery and claim scores pull this card toward the heavier bottom-left zone.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-semibold">Snapshot</h3>
            <ul className="mt-4 space-y-2 text-base leading-7 text-muted-foreground">
              {reading.snapshot.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <ExplainabilityDrawer
        product={selectedProduct}
        preset={preset}
        onClose={() => setSelectedCode(null)}
        onPrevious={
          selectedIndex > 0 ? () => setSelectedCode(rankedRows[selectedIndex - 1]!.code) : undefined
        }
        onNext={
          selectedIndex >= 0 && selectedIndex < rankedRows.length - 1
            ? () => setSelectedCode(rankedRows[selectedIndex + 1]!.code)
            : undefined
        }
      />
    </main>
  );
}
