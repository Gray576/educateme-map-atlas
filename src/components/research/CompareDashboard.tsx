"use client";

import { useEffect, useMemo } from "react";

import { ExplainabilityDrawer } from "@/components/research/ExplainabilityDrawer";
import { ResearchActiveFilters } from "@/components/research/ResearchActiveFilters";
import { ResearchScreenNav } from "@/components/research/ResearchScreenNav";
import { useResearchUrlState } from "@/components/research/useResearchUrlState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPOSITE_METRICS, PRESET_OPTIONS, RAW_LOAD_FACTORS } from "@/lib/research-metadata";
import {
  assignBands,
  applyFounderFilters,
  buildPresetLeaderboards,
  getActiveFilterChips,
  getCompareSelection,
  getDefaultFounderFilters,
  getScoreForPreset,
  getUniqueOptions,
  sortProductsByPreset,
} from "@/lib/research-view";
import { cn } from "@/lib/utils";
import type { ScoredProductRecord } from "@/types";

function formatScore(value: number) {
  return value.toFixed(1);
}

function scoreTone(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-800";
  if (score >= 45) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

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

export function CompareDashboard({ products }: { products: ScoredProductRecord[] }) {
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

  const filteredProducts = useMemo(
    () => applyFounderFilters(products, filters),
    [filters, products]
  );
  const activeFilterChips = useMemo(() => getActiveFilterChips(filters), [filters]);

  const rankedRows = useMemo(
    () => assignBands(sortProductsByPreset(filteredProducts, preset)),
    [filteredProducts, preset]
  );

  const compareProducts = useMemo(
    () => getCompareSelection(filteredProducts, preset, 3),
    [filteredProducts, preset]
  );

  const leaderboards = useMemo(
    () => buildPresetLeaderboards(filteredProducts),
    [filteredProducts]
  );

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
          <p className="mt-2 text-2xl text-muted-foreground">Lens compare · score matrix</p>
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
        <ResearchScreenNav active="compare" buildHref={buildHref} />
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

      <ResearchActiveFilters count={filteredProducts.length} total={products.length} chips={activeFilterChips} />

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={cn(
          "rounded-[30px] border border-border bg-card p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] transition-opacity",
          selectedProduct && "opacity-65"
        )}>
          <p className="text-xl text-muted-foreground">
            Green = easier / safer. Red = heavier / riskier.
          </p>

          {compareProducts.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[220px_repeat(3,minmax(0,1fr))] gap-4">
                  <div />
                  {compareProducts.map((product) => (
                    <button
                      type="button"
                      key={product.code}
                      onClick={() => setSelectedCode(product.code)}
                      className="rounded-2xl border border-border bg-background px-4 py-4 text-left"
                    >
                      <p className="text-4xl font-semibold">{product.code}</p>
                      <p className="mt-2 truncate text-lg text-muted-foreground">{product.title}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <h2 className="text-3xl font-semibold">Composite scores</h2>
                  <div className="mt-4 space-y-3">
                    {COMPOSITE_METRICS.map((row) => (
                      <div key={row.key} className="grid grid-cols-[220px_repeat(3,minmax(0,1fr))] gap-4 items-center">
                        <div>
                          <p className="text-base font-medium">{row.label}</p>
                          <p className="text-sm text-muted-foreground">{row.description}</p>
                        </div>
                        {compareProducts.map((product) => {
                          const value = product.scores[row.key];
                          return (
                            <div
                              key={`${product.code}-${row.key}`}
                              className={cn("rounded-2xl px-4 py-4 text-center text-2xl font-semibold", scoreTone(value))}
                            >
                              {formatScore(value)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10">
                  <h2 className="text-3xl font-semibold">Raw load factors</h2>
                  <div className="mt-4 space-y-3">
                    {RAW_LOAD_FACTORS.map((row) => (
                      <div key={row.key} className="grid grid-cols-[220px_repeat(3,minmax(0,1fr))] gap-4 items-center">
                        <div className="text-base font-medium">{row.label}</div>
                        {compareProducts.map((product) => {
                          const value = product.rawFactors[row.key];
                          return (
                            <div
                              key={`${product.code}-${row.key}`}
                              className="rounded-2xl border border-border bg-background px-4 py-4 text-center text-xl font-semibold text-muted-foreground"
                            >
                              {value}
                              {"scale" in row ? row.scale : ""}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
              No products match the current filters.
            </div>
          )}
        </div>

        <aside className={cn(
          "rounded-[30px] border border-border bg-card p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] transition-opacity",
          selectedProduct && "opacity-65"
        )}>
          <h2 className="text-4xl font-semibold">Preset leaderboards</h2>
          <p className="mt-3 text-lg leading-7 text-muted-foreground">
            Each preset uses the same card data, but changes the ranking lens.
          </p>

          <div className="mt-8 space-y-4">
            {leaderboards.map((leaderboard) => (
              <section key={leaderboard.preset} className="rounded-2xl border border-border bg-background px-4 py-4">
                <h3 className="text-2xl font-semibold">{leaderboard.label}</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {leaderboard.items.map((product, index) => (
                    <button
                      type="button"
                      key={`${leaderboard.preset}-${product.code}`}
                      onClick={() => setSelectedCode(product.code)}
                      className={cn("inline-flex rounded-2xl px-4 py-2 text-base font-semibold", scoreTone(getScoreForPreset(product, leaderboard.preset)))}
                    >
                      {index + 1} {product.code}
                    </button>
                  ))}
                </div>
              </section>
            ))}
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
