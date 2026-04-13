"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { ProductTable } from "@/components/ProductTable";
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
      <div className="space-y-2">
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
