"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  BottleneckAxis,
  Filters,
  Market,
  Model,
  Preset,
  SortPreset,
} from "@/types";

interface FilterBarProps {
  filters: Filters;
  preset: Preset;
  sortPreset: SortPreset;
  onChange: (next: Filters) => void;
  onPresetChange: (preset: Preset) => void;
  onSortPreset: (preset: SortPreset) => void;
}

const MARKETS: [Market | "all", string][] = [
  ["all", "All markets"],
  ["LUX", "LUX"],
  ["EU", "EU"],
  ["GCC", "GCC"],
];

const MODELS: [Model | "all", string][] = [
  ["all", "All models"],
  ["B2B", "B2B"],
  ["B2C", "B2C"],
  ["B2B2C", "B2B2C"],
];

const BOTTLENECKS: [BottleneckAxis | "all", string][] = [
  ["all", "Any bottleneck"],
  ["distribution", "Distribution"],
  ["teamFit", "Team fit"],
  ["studioLeverage", "Studio leverage"],
  ["tamCeiling", "TAM ceiling"],
  ["painMandate", "Pain × mandate"],
  ["manualEffort", "Manual effort"],
  ["wedge", "Wedge"],
  ["cacLtv", "CAC/LTV"],
  ["moatBuild", "Moat build"],
];

const PRESETS: [Preset, string, string][] = [
  ["venture", "Venture", "Platform upside first"],
  ["cashflow", "Cashflow", "Cash in 6 months"],
  ["balanced", "Balanced", "Universal winners"],
];

const SORT_PRESETS: [Exclude<SortPreset, null>, string, string][] = [
  ["ship60", "Ship next 60 days", "Time-to-ship ≤ 8 weeks, ranked for cash"],
  ["venture", "Venture bets", "Positive delta, venture-first sort"],
  ["quickwins", "Quick wins", "High leverage, low shipping friction"],
  ["dyingmandates", "Dying mandates", "Shortest half-life first"],
];

function Select({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      title={`${label}: ${description}`}
      aria-label={`${label}: ${description}`}
      className="h-9 rounded-full border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({
  filters,
  preset,
  sortPreset,
  onChange,
  onPresetChange,
  onSortPreset,
}: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <section className="rounded-[28px] border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              onClick={() => onPresetChange(value)}
              title={hint}
              aria-label={`${label}: ${hint}`}
              className={cn(
                "rounded-full border px-4 py-2 text-left transition",
                preset === value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              <span className="block text-sm font-semibold">{label}</span>
              <span
                className={cn(
                  "block text-xs",
                  preset === value ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {hint}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SORT_PRESETS.map(([value, label, hint]) => (
            <Button
              key={value}
              size="sm"
              variant={sortPreset === value ? "default" : "outline"}
              className="h-auto rounded-full px-3 py-2 text-left"
              onClick={() => onSortPreset(value)}
              title={hint}
              aria-label={`${label}: ${hint}`}
            >
              <span className="block text-xs font-semibold">{label}</span>
              <span
                className={cn(
                  "block text-[11px]",
                  sortPreset === value ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {hint}
              </span>
            </Button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
          <Input
            type="search"
            placeholder="Search code, product, blocker, action…"
            value={filters.search}
            onChange={(event) => set({ search: event.target.value })}
            title="Search across code, product name, market, blocker, next action, and dependencies."
            aria-label="Search across code, product name, market, blocker, next action, and dependencies."
            className="h-9 rounded-full"
          />

          <Select
            label="Market"
            description="Keep the market filter, but move Market out of its own table column."
            value={filters.market}
            onChange={(value) => set({ market: value as Filters["market"] })}
            options={MARKETS}
          />

          <Select
            label="Model"
            description="B2B, B2C, or B2B2C. Model belongs in filters and pills, not as a dedicated decision column."
            value={filters.model}
            onChange={(value) => set({ model: value as Filters["model"] })}
            options={MODELS}
          />

          <Select
            label="Bottleneck type"
            description="Show everything blocked by the same limiting axis, such as Distribution or Team fit."
            value={filters.bottleneckType}
            onChange={(value) =>
              set({ bottleneckType: value as Filters["bottleneckType"] })
            }
            options={BOTTLENECKS}
          />

          <Select
            label="Dependencies resolved"
            description="Filter between products that are ready to move and products still blocked by upstream dependencies."
            value={String(filters.dependenciesResolved)}
            onChange={(value) =>
              set({
                dependenciesResolved:
                  value === "all" ? "all" : value === "true",
              })
            }
            options={[
              ["all", "Dependencies: all"],
              ["true", "Dependencies clear"],
              ["false", "Blocked by dependency"],
            ]}
          />

          <Select
            label="Score metric"
            description="Switch the slider between Venture and Cashflow score ranges."
            value={filters.scoreMetric}
            onChange={(value) => set({ scoreMetric: value as Filters["scoreMetric"] })}
            options={[
              ["cashflow", "Slider: Cashflow"],
              ["venture", "Slider: Venture"],
            ]}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_auto_auto] lg:items-center">
          <div className="rounded-3xl border border-border bg-background px-4 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Minimum {filters.scoreMetric} score</span>
              <span className="font-semibold text-foreground">{filters.scoreMin.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filters.scoreMin}
              onChange={(event) => set({ scoreMin: Number(event.target.value) })}
              title="Minimum score threshold for the selected metric."
              aria-label="Minimum score threshold for the selected metric."
              className="mt-2 w-full accent-foreground"
            />
          </div>

          <Button
            size="sm"
            variant={filters.urgentOnly ? "default" : "outline"}
            className="rounded-full px-4"
            onClick={() => set({ urgentOnly: !filters.urgentOnly })}
            title="Urgent means half-life below 18 months, so the tailwind may disappear if we wait."
            aria-label="Urgent means half-life below 18 months, so the tailwind may disappear if we wait."
          >
            Half-life &lt; 18 mo
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full px-4"
            onClick={() =>
              onChange({
                ...filters,
                search: "",
                market: "all",
                model: "all",
                scoreMetric: "cashflow",
                scoreMin: 0,
                bottleneckType: "all",
                urgentOnly: false,
                dependenciesResolved: "all",
              })
            }
          >
            Reset filters
          </Button>
        </div>
      </div>
    </section>
  );
}
