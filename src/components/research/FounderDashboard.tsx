"use client";

import { useEffect, useMemo } from "react";

import { ExplainabilityDrawer } from "@/components/research/ExplainabilityDrawer";
import { ResearchActiveFilters } from "@/components/research/ResearchActiveFilters";
import { ResearchScreenNav } from "@/components/research/ResearchScreenNav";
import { useResearchUrlState } from "@/components/research/useResearchUrlState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOperatorDifficultyLabel, getOperatorDifficultyTone, PRESET_OPTIONS } from "@/lib/research-metadata";
import { assignBands, applyFounderFilters, buildFounderSummary, getActiveFilterChips, getDefaultFounderFilters, getScoreForPreset, getUniqueOptions, sortProductsByPreset } from "@/lib/research-view";
import { cn } from "@/lib/utils";
import type { ScoredProductRecord } from "@/types";

function formatScore(value: number) {
  return value.toFixed(1);
}

function toneForScore(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-800";
  if (score >= 45) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

function toneForBand(band: "top" | "mid" | "low") {
  if (band === "top") return "bg-emerald-100 text-emerald-800";
  if (band === "mid") return "bg-amber-100 text-amber-800";
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

function LensButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="group relative">
      <Button
        variant={active ? "default" : "outline"}
        onClick={onClick}
        className="h-7 rounded-full px-2.5 text-xs"
        aria-label={`${label}. ${description}`}
      >
        {label}
      </Button>
      <div className="pointer-events-none absolute left-1/2 top-[calc(100%+0.45rem)] z-20 hidden w-52 -translate-x-1/2 rounded-xl border border-border/80 bg-popover px-3 py-2 text-xs leading-5 text-popover-foreground shadow-xl group-hover:block group-focus-within:block">
        {description}
      </div>
    </div>
  );
}

function ScorePill({ value }: { value: number }) {
  return (
    <span className={`inline-flex min-w-14 justify-center rounded-md px-2 py-1 text-xs font-semibold ${toneForScore(value)}`}>
      {formatScore(value)}
    </span>
  );
}

export function FounderDashboard({ products }: { products: ScoredProductRecord[] }) {
  const { preset, setPreset, filters, setFilters, selectedCode, setSelectedCode, buildHref } =
    useResearchUrlState();

  const options = useMemo(
    () => ({
      market: getUniqueOptions(products, "market"),
      buyer: getUniqueOptions(products, "buyer"),
      archetype: getUniqueOptions(products, "archetype"),
      claims: getUniqueOptions(products, "claims"),
      subsidy: getUniqueOptions(products, "subsidy"),
      dependencies: getUniqueOptions(products, "dependencies"),
    }),
    [products]
  );

  const rows = useMemo(() => {
    const filtered = applyFounderFilters(products, filters);
    const sorted = sortProductsByPreset(filtered, preset);
    return assignBands(sorted);
  }, [filters, preset, products]);
  const activeFilterChips = useMemo(() => getActiveFilterChips(filters), [filters]);

  const summary = useMemo(() => buildFounderSummary(rows, preset), [rows, preset]);
  const selectedIndex = rows.findIndex((item) => item.code === selectedCode);
  const selectedProduct = selectedIndex >= 0 ? rows[selectedIndex] : null;

  useEffect(() => {
    if (selectedCode && !rows.some((item) => item.code === selectedCode)) {
      setSelectedCode(null);
    }
  }, [rows, selectedCode, setSelectedCode]);

  return (
    <main className="mx-auto max-w-[1540px] px-4 pb-6 pt-4 sm:px-5 lg:px-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-start">
        <div className="md:justify-self-start">
          <div className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-foreground">
            EducateMe
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Founder view · ranked table</p>
        </div>
        <div className="md:justify-self-center">
          <ResearchScreenNav active="founder" buildHref={buildHref} />
        </div>
        <div aria-hidden="true" className="hidden md:block" />
      </div>

      <section className="mt-3">
        <div className="space-y-2">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              Ranking lens
            </p>
            <p className="text-xs text-muted-foreground">
              Same cards, different ranking formula depending on the decision goal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_OPTIONS.map((item) => (
              <LensButton
                key={item.key}
                label={item.label}
                description={item.description}
                active={preset === item.key}
                onClick={() => setPreset(item.key)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-2 flex flex-wrap gap-2">
        <SelectControl
          label="Market"
          value={filters.market}
          options={options.market}
          onChange={(value) => setFilters((current) => ({ ...current, market: value }))}
        />
        <SelectControl
          label="Buyer"
          value={filters.buyer}
          options={options.buyer}
          onChange={(value) => setFilters((current) => ({ ...current, buyer: value }))}
        />
        <SelectControl
          label="Archetype"
          value={filters.archetype}
          options={options.archetype}
          onChange={(value) => setFilters((current) => ({ ...current, archetype: value }))}
        />
        <SelectControl
          label="Claims"
          value={filters.claims}
          options={options.claims}
          onChange={(value) => setFilters((current) => ({ ...current, claims: value }))}
        />
        <SelectControl
          label="Subsidy"
          value={filters.subsidy}
          options={options.subsidy}
          onChange={(value) => setFilters((current) => ({ ...current, subsidy: value }))}
        />
        <SelectControl
          label="Dependencies"
          value={filters.dependencies}
          options={options.dependencies}
          onChange={(value) => setFilters((current) => ({ ...current, dependencies: value }))}
        />
        <Button
          variant="ghost"
          onClick={() => setFilters(getDefaultFounderFilters())}
          className="h-7 rounded-md px-2.5 text-xs"
        >
          Reset filters
        </Button>
      </section>

      <ResearchActiveFilters count={rows.length} total={products.length} chips={activeFilterChips} />

      <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className={cn(
          "overflow-hidden rounded-md border border-border bg-card transition-opacity",
          selectedProduct && "opacity-65"
        )}>
          <div className="grid grid-cols-[64px_minmax(0,1fr)_78px_78px_78px_78px_78px] gap-2 bg-muted/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            <div>Band</div>
            <div>Product</div>
            <div className="text-right">Founder</div>
            <div className="text-right">Delivery</div>
            <div className="text-right">Claims</div>
            <div className="text-right">Evidence</div>
            <div className="text-right">Proof</div>
          </div>

          <div className="space-y-0">
            {rows.map((product) => (
              <article
                key={product.code}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCode(product.code)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedCode(product.code);
                  }
                }}
                className="grid grid-cols-[64px_minmax(0,1fr)_78px_78px_78px_78px_78px] gap-2 border-t border-border px-3 py-3 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-center">
                  <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${toneForBand(product.band)}`}>
                    {product.band[0]!.toUpperCase() + product.band.slice(1)}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-medium">
                      {product.code} {product.title}
                    </h2>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="rounded-[10px] border px-2.5 py-0.5 text-[11px] font-medium">
                      {product.marketBadge}
                    </Badge>
                    <Badge variant="secondary" className="rounded-[10px] border px-2.5 py-0.5 text-[11px] font-medium">
                      {product.buyerClusterBadge}
                    </Badge>
                    {product.subsidyStateBadge ? (
                      <Badge variant="outline" className="rounded-[10px] px-2.5 py-0.5 text-[11px]">
                        {product.subsidyStateBadge}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      title={product.archetype.label}
                      className="rounded-[10px] px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {product.archetype.shortLabel}
                    </Badge>
                    <span
                      title={`Operator guide: ${product.archetype.operatorDifficultySourceLabel}`}
                      className={cn(
                        "inline-flex rounded-[10px] px-2.5 py-0.5 text-[11px] font-medium",
                        getOperatorDifficultyTone(product.archetype.operatorDifficulty)
                      )}
                    >
                      {getOperatorDifficultyLabel(product.archetype.operatorDifficulty)}
                    </span>
                  </div>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
                    {product.shortSummary}
                  </p>
                </div>

                <div className="flex items-start justify-end">
                  <ScorePill value={product.scores.founderRank} />
                </div>
                <div className="flex items-start justify-end">
                  <ScorePill value={product.scores.deliveryEase} />
                </div>
                <div className="flex items-start justify-end">
                  <ScorePill value={product.scores.claimSafety} />
                </div>
                <div className="flex items-start justify-end">
                  <ScorePill value={product.scores.evidenceConfidence} />
                </div>
                <div className="flex items-start justify-end">
                  <ScorePill value={product.scores.proofSimplicity} />
                </div>
              </article>
            ))}

            {rows.length === 0 ? (
              <div className="border-t border-dashed border-border px-4 py-10 text-center text-muted-foreground">
                No products match the current filters.
              </div>
            ) : null}
          </div>
        </div>

        <aside className={cn(
          "rounded-md border border-border bg-card p-4 transition-opacity",
          selectedProduct && "opacity-65"
        )}>
          <h2 className="text-lg font-semibold">{summary.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary.description}</p>

          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">Top of current view</h3>
            <div className="mt-3 space-y-3">
              {summary.topThree.map((product) => (
                <div key={product.code} className="rounded-md border border-border bg-background px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {product.rankIndex} {product.code}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{product.title}</p>
                    </div>
                    <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${toneForBand(product.band)}`}>
                      {getScoreForPreset(product, preset).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">Snapshot</h3>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
              {summary.snapshot.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">Current reading</h3>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
              {summary.reading.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">Banding logic</h3>
            <div className="mt-3 space-y-2">
              <div className="inline-flex rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                Top band
              </div>
              <div className="inline-flex rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                Middle band
              </div>
              <div className="inline-flex rounded-md bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-800">
                Lower band
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Band is rendered from the current sorted results only. It is not stored in card data.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <ExplainabilityDrawer
        product={selectedProduct}
        preset={preset}
        onClose={() => setSelectedCode(null)}
        onPrevious={
          selectedIndex > 0 ? () => setSelectedCode(rows[selectedIndex - 1]!.code) : undefined
        }
        onNext={
          selectedIndex >= 0 && selectedIndex < rows.length - 1
            ? () => setSelectedCode(rows[selectedIndex + 1]!.code)
            : undefined
        }
      />
    </main>
  );
}
