"use client";

import { useState, useMemo } from "react";
import { PRODUCTS } from "@/data/products";
import { FilterBar } from "@/components/FilterBar";
import { ProductTable } from "@/components/ProductTable";
import { StatsPanel } from "@/components/StatsPanel";
import type { Filters } from "@/types";

const DEFAULT_FILTERS: Filters = {
  market: "all",
  readiness: "all",
  bp: "all",
  search: "",
};

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    const s = filters.search.toLowerCase();
    return PRODUCTS.filter((p) => {
      if (filters.market !== "all" && p.market !== filters.market) return false;
      if (filters.readiness !== "all" && p.readiness !== filters.readiness) return false;
      if (filters.bp !== "all" && p.bp !== filters.bp) return false;
      if (s) {
        const haystack =
          `${p.code} ${p.title} ${p.tags.join(" ")} ${p.market} ${p.model}`.toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 pb-12">
      <header className="py-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Educateme{" "}
            <span className="text-muted-foreground font-normal">
              Product &amp; Market Map
            </span>{" "}
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full align-middle ml-1">
              2026
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {PRODUCTS.length} products · 3 markets · Updated Apr 2026
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
        <div>
          <FilterBar filters={filters} onChange={setFilters} />
          <ProductTable products={filtered} />
        </div>
        <StatsPanel products={filtered} total={PRODUCTS.length} />
      </div>
    </div>
  );
}
