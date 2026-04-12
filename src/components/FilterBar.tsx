"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Filters, Market, Readiness, BusinessPhase } from "@/types";

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
}

const MARKETS: [Market | "all", string][] = [
  ["all", "All Markets"],
  ["LUX", "🇱🇺 LUX"],
  ["EU", "🇪🇺 EU"],
  ["GCC", "🌍 GCC"],
];

const READINESS: [Readiness | "all", string][] = [
  ["all", "All Readiness"],
  ["green", "🟢 Ready"],
  ["yellow", "🟡 2–4 wk"],
  ["red", "🔴 2+ mo"],
];

const PHASES: [BusinessPhase | "all", string][] = [
  ["all", "All Status"],
  ["live", "✅ Live"],
  ["piloting", "🔄 Piloting"],
  ["ready", "📋 Ready"],
  ["hypothesis", "💡 Hypothesis"],
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
      {MARKETS.map(([v, label]) => (
        <Button
          key={v}
          size="sm"
          variant={filters.market === v ? "default" : "outline"}
          className="h-7 rounded-full text-xs px-3"
          onClick={() => set({ market: v })}
        >
          {label}
        </Button>
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      {READINESS.map(([v, label]) => (
        <Button
          key={v}
          size="sm"
          variant={filters.readiness === v ? "default" : "outline"}
          className="h-7 rounded-full text-xs px-3"
          onClick={() => set({ readiness: v })}
        >
          {label}
        </Button>
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      {PHASES.map(([v, label]) => (
        <Button
          key={v}
          size="sm"
          variant={filters.bp === v ? "default" : "outline"}
          className="h-7 rounded-full text-xs px-3"
          onClick={() => set({ bp: v })}
        >
          {label}
        </Button>
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      <Input
        type="search"
        placeholder="Search…"
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
        className="h-7 w-48 rounded-full text-xs px-3"
      />
    </div>
  );
}
