"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { ProductTable } from "@/components/ProductTable";
import { StatsPanel } from "@/components/StatsPanel";
import { PRODUCTS } from "@/data/products";
import {
  applyFilters,
  applyPresetHeuristic,
  applySort,
  applySortPreset,
  enrichProducts,
  getDefaultFilters,
  getDefaultSortState,
} from "@/lib/decision";
import type { Filters, Preset, SortPreset, SortState } from "@/types";

const DEFAULT_PRESET: Preset = "balanced";

export default function Home() {
  const [preset, setPreset] = useState<Preset>(DEFAULT_PRESET);
  const [filters, setFilters] = useState<Filters>(getDefaultFilters());
  const [sortState, setSortState] = useState<SortState>(getDefaultSortState(DEFAULT_PRESET));
  const [activeSortPreset, setActiveSortPreset] = useState<SortPreset>(null);

  const enriched = useMemo(() => enrichProducts(PRODUCTS), []);

  const filtered = useMemo(() => {
    const base = applyFilters(enriched, filters, preset);
    const withPresetRules = activeSortPreset ? applyPresetHeuristic(base, activeSortPreset) : base;
    return applySort(withPresetRules, sortState);
  }, [activeSortPreset, enriched, filters, preset, sortState]);

  const handlePresetChange = (nextPreset: Preset) => {
    setPreset(nextPreset);
    setSortState(getDefaultSortState(nextPreset));
    setActiveSortPreset(null);
  };

  const handleSortPreset = (nextSortPreset: SortPreset) => {
    if (nextSortPreset === activeSortPreset) {
      setActiveSortPreset(null);
      setSortState(getDefaultSortState(preset));
      return;
    }

    const next = applySortPreset(nextSortPreset, filters, preset);
    setActiveSortPreset(nextSortPreset);
    setPreset(next.preset);
    setFilters(next.filters);
    setSortState(next.sort);
  };

  return (
    <div className="mx-auto max-w-[1520px] px-4 pb-8 pt-4 sm:px-5 lg:px-6">
      <header className="mb-3 flex flex-col gap-3 rounded-[26px] border border-border/70 bg-card/80 px-4 py-3 shadow-[0_14px_36px_-28px_rgba(14,37,33,0.45)] backdrop-blur sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Educateme Decision Dashboard
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Product choices, compressed for actual decisions
              </h1>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {PRODUCTS.length} products
              </span>
            </div>
          </div>
          <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[11px] text-muted-foreground">
            Venture, cashflow, urgency, blockers
          </div>
        </div>
        <p className="max-w-5xl text-[13px] leading-5 text-muted-foreground">
          Use the preset first, then scan delta, contribution, and bottleneck. The table starts sooner, fits more rows, and keeps the operational next step visible.
        </p>
      </header>

      <div className="space-y-3">
        <StatsPanel
          preset={preset}
          products={filtered}
          total={PRODUCTS.length}
        />
        <FilterBar
          filters={filters}
          preset={preset}
          sortPreset={activeSortPreset}
          onChange={setFilters}
          onPresetChange={handlePresetChange}
          onSortPreset={handleSortPreset}
        />
        <ProductTable
          preset={preset}
          products={filtered}
          sortState={sortState}
          onSortChange={setSortState}
        />
      </div>
    </div>
  );
}
