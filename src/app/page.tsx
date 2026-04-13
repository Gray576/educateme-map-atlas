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
    <div className="mx-auto max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 py-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Educateme Decision Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Ship the right product, not the loudest one.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            One table for venture bets, cashflow winners, urgent mandates, and blockers.
            Each row answers what to launch, what is blocked, and what to do next.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card/80 px-5 py-4 text-sm shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Scope
          </p>
          <p className="mt-1 text-2xl font-semibold">{PRODUCTS.length}</p>
          <p className="text-muted-foreground">products across 3 markets</p>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
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
        <StatsPanel
          preset={preset}
          products={filtered}
          total={PRODUCTS.length}
        />
      </div>
    </div>
  );
}
